# Scala Maintenance App

A Vite + React frontend paired with a Laravel 11 backend.

## Frontend

```bash
cd frontend
npm install
npm run dev
```

Build for production with `npm run build`.

## Backend (Laravel)

The Laravel application already lives in `backend/`. Install dependencies and
start the dev server with either Docker (via the Makefile wrappers) or your
local PHP toolchain.

### Docker-driven workflow

```bash
make backend-composer cmd="install"  # install composer dependencies
make backend-key                       # generate APP_KEY
make backend-serve                     # serve at http://localhost:8000
```

### Native PHP workflow

```bash
cd backend
composer install
php artisan key:generate
php artisan serve
```

More backend usage details live in `docs/BACKEND.md`.

## Testing

- Frontend: no test runner configured yet.
- Backend: `make backend-test` (Docker) or `php artisan test` (native).

Feel free to add your preferred testing tools.
