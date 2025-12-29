./vendor/bin/sail up -d mysql<!--
Guidance for AI coding assistants working on FLOTA (scala-maintenance).
Keep this file short and concrete. Focus on repository conventions, common commands,
and code locations where an agent is likely to make changes.
-->

# FLOTA — AI assistant quick guide

This repository is a Vite + React frontend paired with a Laravel 11 backend.
The goal of this file is to give an AI coding agent the minimum, high-value
context needed to make safe, useful changes.

Key facts
- Frontend: `frontend/` — Vite + React. Entry: `frontend/src/main.jsx`, app root: `frontend/src/App.jsx`.
- Backend: `backend/` — Laravel 11. App code: `backend/app/`. Routes: `backend/routes/*.php`.
- Docker-friendly Makefile wrappers live at the repository root (`Makefile`) and are the recommended way
  to run Composer/Artisan if PHP/Composer aren't installed locally.

Quick developer workflows (concrete)
- Start frontend dev server:
  - cd frontend && npm install && npm run dev
- Backend (recommended, Docker wrappers):
  - make backend-composer cmd="install"
  - make backend-key
  - make backend-serve  # serves at http://localhost:8000
  - make backend-test   # runs Laravel tests via Docker
- Backend (native PHP):
  - cd backend
  - composer install
  - php artisan key:generate
  - php artisan migrate
  - php artisan serve --host=127.0.0.1 --port=8000

Project-specific conventions and patterns
- Authorization by ownership: controllers often check resources against `request->user()->id`.
  Example: `backend/app/Http/Controllers/VehicleController.php` uses `authorizeVehicle()`.
- Query options helper: many controllers use the `HandlesQueryOptions` trait
  (`backend/app/Http/Controllers/Concerns/HandlesQueryOptions.php`) to implement `sort`, `search`,
  `limit`, and `status` query params. Prefer reusing that trait for list endpoints.
- Request validation: Form requests are used for validation and authorization. See
  `backend/app/Http/Requests/*` (e.g. `VehicleStoreRequest.php`).
- Normalization: controllers often normalize payloads before creating/updating models
  (see `normalizePayload()` in `VehicleController.php` for string trimming and uppercasing plates).
- Resources: JSON responses use `JsonResource` wrappers for consistent response shapes.

Important files to reference when making changes
- Backend entrypoints and routing: `backend/routes/api.php`, `backend/routes/web.php`.
- A canonical controller: `backend/app/Http/Controllers/VehicleController.php` (CRUD, normalization,
  ownership checks, trait usage).
- Query helper: `backend/app/Http/Controllers/Concerns/HandlesQueryOptions.php`.
- Models & casts/fillables: `backend/app/Models/` (e.g. `Vehicle.php` shows `fillable` and `casts`).
- Frontend entry: `frontend/src/main.jsx`, top-level app: `frontend/src/App.jsx`.
- Database: migrations in `backend/database/migrations/` and factories in `backend/database/factories/`.

Integration & external dependencies
- The project defaults to SQLite locally (see `.env` and `backend/database/database.sqlite`).
- Mail is configured to `log` driver in `.env` for local development.
- No external third-party services are required to run locally; if you change drivers (queues, DB), update docs.

Safe change guidelines for AI agents
- Prefer small, well-scoped changes with tests. Backend tests live in `backend/tests/`.
- When editing API endpoints, update `backend/tests/Feature` where applicable.
- Preserve existing validation/request classes; modify them if the API surface needs to change.
- When adding composer packages, prefer the Makefile wrapper: `make backend-composer cmd="require vendor/package"`.

Examples of actionable edits
- Add a `status` filter to an index endpoint: reuse `HandlesQueryOptions` which already supports `status`.
- Normalize incoming `plate` values: follow `VehicleController::normalizePayload` pattern (trim & upper).
- Add a JSON resource wrapper for a model: use `Illuminate\Http\Resources\Json\JsonResource` like other controllers.

If you need more context
- Read `README.md` and `docs/BACKEND.md` for setup and common make targets.
- Inspect `backend/app/Http/Requests/` to understand validation rules before changing controllers.

If anything below is unclear or missing (auth flows, external integrations you expect), ask the repository owner and
I'll iterate on these instructions.
