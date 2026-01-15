# Runbooks

## Health checks

- Backend health: `GET /api/health` (public).
- Laravel health: `GET /up` (framework default).
- If health fails: check deploy status, database connectivity, and queue workers.

## High error rate (5xx)

1) Check Sentry for recent spikes and top exceptions.
2) Inspect logs for `request_id` and trace IDs to identify failing routes.
3) Verify database and Redis are reachable.
4) If a recent deploy happened, consider rollback.

## Queue backlog / stalled jobs

1) Check Horizon dashboard (`/horizon`).
2) If workers are down, restart `php artisan horizon`.
3) If queue backlog is growing, increase workers or move heavy jobs to off-peak.
4) Review failed jobs: `php artisan horizon:failed`.

## Slow requests / latency spikes

1) Inspect OpenTelemetry traces for top slow routes.
2) Check database slow queries and N+1 patterns.
3) Verify cache hit rate and Redis health.
4) If needed, add temporary rate limits or scale workers.

## Database connection errors

1) Confirm DB credentials in `.env`.
2) Check DB host availability and disk space.
3) Validate migrations status.
4) If read timeouts, consider connection pool tuning.

## Redis / cache issues

1) Confirm `REDIS_HOST` and Redis availability.
2) Horizon relies on Redis for state; if down, queue visibility will degrade.
3) Restart Redis and verify Horizon reconnects.

## Sentry noise / alert storm

1) Group or ignore noisy errors in Sentry.
2) Add sampling (`SENTRY_TRACES_SAMPLE_RATE`) or filters.
3) Verify new deploy didn't introduce a high-frequency error.
