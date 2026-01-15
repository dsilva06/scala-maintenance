# Architecture & Conventions

This document defines the project structure and coding standards as we scale.

## API versioning

- The backend serves both `/api` (legacy) and `/api/v1` (versioned).
- Frontend can opt into versioned APIs via `VITE_API_VERSION=v1`.
- Keep `/api` available during migrations, then deprecate when all clients move.

## Error responses

All API errors return a consistent envelope:

```json
{
  "error": {
    "message": "Validation failed.",
    "code": 422,
    "details": {}
  }
}
```

## Rate limiting

- `throttle:api` for general authenticated endpoints.
- `throttle:auth` for authentication routes.
- `throttle:ai` for AI message endpoints.
- `throttle:mcp` for MCP tool endpoints.

## Async processing

- Use queued jobs for heavy work (alerts, ETA recompute, reports, imports).
- Horizon monitors queue health and throughput.

## Observability

- Structured JSON logs (stderr) with `request_id`.
- Sentry captures errors and performance traces when `SENTRY_DSN` is set.
- OpenTelemetry tracing/metrics enabled via `OTEL_ENABLED=true`.

## Frontend structure

Use feature-based modules to keep domains isolated as the app grows.

```
frontend/src/
  features/
    trips/
      api/
      components/
      hooks/
    vehicles/
      ...
  components/
    ui/         # shared UI primitives (EmptyState, PageHeader)
  hooks/        # shared hooks (useErrorToast)
  lib/          # shared utils (errors, queryClient)
  pages/        # thin wrappers, route-level composition only
```

Guidelines:
- Pages orchestrate; features own business logic and UI.
- Shared UI components live in `components/ui`.
- API calls live in `features/<domain>/api` or `api/` when reused across features.
- Standardize error messages with `getErrorMessage` and surface them via `useErrorToast`.
- Use TanStack Query hooks per feature and invalidate via feature query keys.

## Backend structure

Adopt a thin-controller, layered approach for scale and testability.

```
backend/app/
  Actions/        # write operations (CreateTrip, UpdateVehicle, etc.)
  Queries/        # read operations and filters (TripIndexQuery, ...)
  Http/Resources/ # response shaping and versioning
  Http/Requests/  # validation (FormRequest classes)
  Models/         # persistence (Eloquent)
```

Guidelines:
- Controllers should delegate to Actions/Queries and return Resources.
- Keep validation in FormRequests.
- Avoid business logic in controllers or models beyond relationships/casts.

## Environment & secrets

- Never commit `.env` files; use `.env.example` templates instead.
- Frontend uses `VITE_API_BASE_URL` and `VITE_API_VERSION`.
- Backend uses `backend/.env.example` as the base template.
