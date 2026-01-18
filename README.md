# FLOTA Fleet Maintenance Platform

FLOTA is a Vite + React frontend paired with a Laravel 11 backend for managing fleet maintenance operations.

Architecture and coding conventions live in `docs/ARCHITECTURE.md`.
Operations guides live in `docs/RUNBOOKS.md` and `docs/ONCALL.md`.
CI/CD workflow notes live in `docs/CI_CD.md`.

## English

### Prerequisites

- Node.js 20+ and npm
- PHP 8.2+ and Composer (for native workflow) OR Docker + Docker Compose (Sail)
- MySQL + Redis if running natively (Sail brings both)

### Quick Start (Docker + Sail)

1) Backend environment
   ```bash
   cp backend/.env.example backend/.env
   ```
   Update `backend/.env` if you want different ports or DB credentials.

2) Start backend containers
   ```bash
   cd backend
   ./vendor/bin/sail up -d
   ```
   If `./vendor/bin/sail` does not exist yet, run:
   ```bash
   docker run --rm \
     -u "$(id -u):$(id -g)" \
     -v "$(pwd):/var/www/html" \
     -w /var/www/html \
     laravelsail/php84-composer:latest \
     composer install
   ./vendor/bin/sail up -d
   ```

3) Backend setup (first time only)
   ```bash
   ./vendor/bin/sail artisan key:generate
   ./vendor/bin/sail artisan migrate
   ```

4) Frontend environment + dev server
   ```bash
   cd ../frontend
   cp .env.example .env.local
   npm install
   npm run dev
   ```

5) Open the app
   - API: `http://localhost:8000`
   - Frontend: Vite prints the URL (default `http://localhost:5174`)

### Native PHP workflow (no Docker)

1) Backend environment
   ```bash
   cp backend/.env.example backend/.env
   ```
   Update DB settings in `backend/.env` to match your local MySQL/Redis.
   If you prefer SQLite, set `DB_CONNECTION=sqlite` and create `backend/database/database.sqlite`.

2) Backend install + run
   ```bash
   cd backend
   composer install
   php artisan key:generate
   php artisan migrate
   php artisan serve --host=127.0.0.1 --port=8000
   ```

3) Frontend environment + dev server
   ```bash
   cd ../frontend
   cp .env.example .env.local
   npm install
   npm run dev
   ```

### Frontend environment notes

- `VITE_API_BASE_URL` should point to your backend (e.g. `http://localhost:8000`).
- Set `VITE_API_VERSION=v1` to use the versioned API routes.

### Queue workers / Horizon (optional)

- Database queue (default):
  ```bash
  cd backend
  php artisan queue:work
  ```
- Horizon (requires Redis + `QUEUE_CONNECTION=redis`):
  ```bash
  cd backend
  php artisan horizon
  ```

### Useful Makefile commands (Docker/Sail)

```bash
make up             # start backend containers
make down           # stop containers
make artisan cmd=…  # run artisan commands
make migrate        # run migrations
```

More backend usage details live in `docs/BACKEND.md`.

### Testing

- Frontend: `npm run test` (Vitest) or `npm run test:watch`.
- Backend: `make backend-test` (Docker) or `php artisan test` (native).

## Español

### Requisitos previos

- Node.js 20+ y npm
- PHP 8.2+ y Composer (flujo nativo) O Docker + Docker Compose (Sail)
- MySQL + Redis si corres nativo (Sail trae ambos)

### Inicio rapido (Docker + Sail)

1) Entorno del backend
   ```bash
   cp backend/.env.example backend/.env
   ```
   Ajusta `backend/.env` si quieres otros puertos o credenciales.

2) Levanta los contenedores
   ```bash
   cd backend
   ./vendor/bin/sail up -d
   ```
   Si `./vendor/bin/sail` no existe aun, ejecuta:
   ```bash
   docker run --rm \
     -u "$(id -u):$(id -g)" \
     -v "$(pwd):/var/www/html" \
     -w /var/www/html \
     laravelsail/php84-composer:latest \
     composer install
   ./vendor/bin/sail up -d
   ```

3) Setup del backend (solo una vez)
   ```bash
   ./vendor/bin/sail artisan key:generate
   ./vendor/bin/sail artisan migrate
   ```

4) Entorno del frontend + servidor de desarrollo
   ```bash
   cd ../frontend
   cp .env.example .env.local
   npm install
   npm run dev
   ```

5) Abre la app
   - API: `http://localhost:8000`
   - Frontend: Vite imprime la URL (por defecto `http://localhost:5174`)

### Flujo nativo de PHP (sin Docker)

1) Entorno del backend
   ```bash
   cp backend/.env.example backend/.env
   ```
   Ajusta DB en `backend/.env` segun tu MySQL/Redis local.
   Si prefieres SQLite, usa `DB_CONNECTION=sqlite` y crea `backend/database/database.sqlite`.

2) Instala y corre el backend
   ```bash
   cd backend
   composer install
   php artisan key:generate
   php artisan migrate
   php artisan serve --host=127.0.0.1 --port=8000
   ```

3) Entorno del frontend + servidor de desarrollo
   ```bash
   cd ../frontend
   cp .env.example .env.local
   npm install
   npm run dev
   ```

### Notas del entorno frontend

- `VITE_API_BASE_URL` debe apuntar al backend (ej. `http://localhost:8000`).
- Define `VITE_API_VERSION=v1` para usar las rutas versionadas.

### Workers de cola / Horizon (opcional)

- Cola en DB (por defecto):
  ```bash
  cd backend
  php artisan queue:work
  ```
- Horizon (requiere Redis + `QUEUE_CONNECTION=redis`):
  ```bash
  cd backend
  php artisan horizon
  ```

### Comandos utiles del Makefile (Docker/Sail)

```bash
make up             # inicia contenedores del backend
make down           # detiene contenedores
make artisan cmd=…  # ejecuta comandos artisan
make migrate        # corre migraciones
```

Mas detalles del backend en `docs/BACKEND.md`.

### Pruebas

- Frontend: `npm run test` (Vitest) o `npm run test:watch`.
- Backend: `make backend-test` (Docker) o `php artisan test` (nativo).
