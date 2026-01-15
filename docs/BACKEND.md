# Laravel Backend

The Laravel application is already checked into `backend/`. It ships with the
stock Laravel 11 skeleton plus a few project defaults:

- `.env` is pre-populated for local development and defaults to SQLite.
- `database/database.sqlite` is ignored so you can create the database locally
  without committing it.
- The root `Makefile` exposes wrappers for Composer, Artisan, and the dev
  server using Docker images (handy if you do not have PHP/Composer installed).

## First-time setup

Pick the workflow that matches your tooling.

### Option A: Docker-based tooling (recommended)

Requirements: Docker Desktop (or compatible engine) and `make`.

```bash
make backend-composer cmd="install"  # install PHP dependencies
make backend-key                       # generate APP_KEY in .env
```

You can now run Artisan, tests, or the dev server entirely through make:

```bash
make backend-serve                # serve at http://localhost:8000
make backend-artisan cmd="migrate"  # run database migrations
make backend-test                 # run PHPUnit feature/unit tests
```

### Option B: Native tooling

Requirements: PHP 8.2+, Composer 2, and Node 20+ for the Vite build step.

```bash
cd backend
composer install
php artisan key:generate
php artisan migrate
php artisan serve --host=127.0.0.1 --port=8000
```

## Configuration notes

- The `.env` file defaults to SQLite and stores sessions/queues in the database.
  If you prefer MySQL/PostgreSQL, update the DB section and remove the
  `database/database.sqlite` file locally.
- Mail uses the `log` driver out of the box so no SMTP setup is required for
  local development.
- `SESSION_DRIVER` and `QUEUE_CONNECTION` are set to `database`. Run
  `php artisan queue:table` and `php artisan session:table` followed by
  `php artisan migrate` if you plan to use queues/sessions right away.

## API versioning

- Legacy routes live under `/api`.
- Versioned routes live under `/api/v1` for stable client contracts.
- Use `VITE_API_VERSION=v1` in the frontend to switch over.
- OpenAPI contract lives at `docs/openapi.yaml`.

## Queues & Horizon

- Horizon is installed for queue monitoring.
- Start workers with `php artisan horizon`.
- For local dev, ensure `QUEUE_CONNECTION=database` and run migrations:
  `php artisan queue:table && php artisan migrate`.
- Horizon requires Redis for metrics/state; configure `REDIS_HOST` for non-Docker setups.

## Async jobs

- Queue reports: `php artisan reports:generate {userId} --type=fleet-summary`
- Queue imports: `php artisan imports:process {userId} {path}`
- Queue alert processing: `php artisan alerts:process {alertId}`
- Queue ETA recompute: `php artisan trips:recompute-eta {tripId}`

## Observability

- Logs default to JSON on stderr (`LOG_STACK=stderr`, `LOG_STDERR_FORMATTER=Monolog\\Formatter\\JsonFormatter`).
- Sentry: set `SENTRY_DSN`, and optionally `SENTRY_TRACES_SAMPLE_RATE`.
- To send log events to Sentry, add `sentry` to `LOG_STACK`.
- OpenTelemetry: set `OTEL_ENABLED=true` and configure `OTEL_EXPORTER_OTLP_ENDPOINT`.

## Tenancy & RBAC

- All domain tables include `company_id` and queries are scoped by company.
- Roles supported: `admin`, `manager`, `employee`, `driver`.
- Drivers are read-only and can only access their own records; other roles can manage company data.
- Audit logs are stored in `audit_logs` and capture create/update/delete actions with before/after snapshots.

## Telemetry & Realtime

- GPS positions are stored in `gps_positions` and indexed by company/trip/vehicle/time.
- Ingest telemetry at `POST /api/telemetry/ingest` (queued for background processing).
- Subscribe to realtime GPS updates via `GET /api/telemetry/stream` (SSE).
- Tunables (in `.env`): `FLEET_TELEMETRY_MAX_POINTS`, `FLEET_POSITION_HISTORY_LIMIT`,
  `FLEET_TELEMETRY_STREAM_SLEEP_MS`, `FLEET_TELEMETRY_STREAM_TIMEOUT_SECONDS`.

## Analytics & BI

- Usage events are ingested via `POST /api/analytics/events` (queued).
- Event summaries: `GET /api/analytics/events/summary` (admin/manager).
- Operational metrics: `GET /api/analytics/metrics` (cost per mile, downtime, ETA accuracy).
- Tunables (in `.env`): `ANALYTICS_ENABLED`, `ANALYTICS_MAX_EVENTS`, `ANALYTICS_DEFAULT_RANGE_DAYS`.
- ETA accuracy relies on `trips.metadata.actual_arrival` or `trips.metadata.actual_arrival_at`.


## Project structure

```
backend/
  app/            # Application code (controllers, models, jobs, etc.)
  bootstrap/      # Framework bootstrap files
  config/         # Configuration files
  database/       # Factories, migrations, seeders (plus local SQLite DB)
  public/         # Front controller and public assets
  resources/      # Blade views, language files, frontend assets
  routes/         # API & web routes
  storage/        # Logs, cache, compiled files (gitignored)
  tests/          # Feature & unit tests
```

## Common tasks

- Run a custom Artisan command:
  - Docker: `make backend-artisan cmd="your:command"`
  - Native: `php artisan your:command`
- Install additional Composer packages:
  - Docker: `make backend-composer cmd="require laravel/pint --dev"`
  - Native: `composer require laravel/pint --dev`
- Run the Pest test suite (`php artisan test`) instead of PHPUnit.

## AI agent scaffold

- Endpoints (auth required):
  - `POST /api/ai/conversations` crea una conversación (opcional `title`).
  - `GET /api/ai/conversations` lista las últimas conversaciones (dueño actual).
  - `GET /api/ai/conversations/{id}` devuelve la conversación con sus mensajes recientes.
  - `POST /api/ai/conversations/{id}/messages` envía un mensaje (`message` requerido, `context` opcional) y devuelve un borrador (stub) más el mensaje del usuario.
- Configuration placeholders live in `config/services.php` under `ai_agent` with env vars `AI_AGENT_PROVIDER`, `AI_AGENT_API_KEY`, `AI_AGENT_BASE_URL`, `AI_AGENT_MODEL`, `AI_AGENT_TIMEOUT`.
- Planes seeded (DatabaseSeeder): `free` (gpt-4.1-mini, 50 mensajes/mes), `pro` (gpt-4.1, 500 mensajes/mes), `enterprise` (gpt-4.1, 5000 mensajes/mes). Al enviar mensajes se crea una suscripción Free por defecto y se valida el límite mensual por usuario.

## Troubleshooting

- **`composer install` fails**: ensure Docker is running (if using the make
  targets) or that PHP/Composer are installed locally.
- **Database errors when using SQLite**: make sure the
  `database/database.sqlite` file exists and is writable by your user.
- **Port 8000 already in use**: stop the conflicting process or pass a
  different port, e.g. `make backend-artisan cmd="serve --host=0.0.0.0 --port=8001"`.

Happy building!
