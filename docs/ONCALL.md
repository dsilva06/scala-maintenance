# On-call & Alerting

## Severity levels

- **SEV1**: Complete outage or data loss.
- **SEV2**: Major feature broken, degraded performance.
- **SEV3**: Minor issue, workaround available.

## Response targets

- SEV1: acknowledge < 10 min, mitigate < 1 hr.
- SEV2: acknowledge < 30 min, mitigate < 4 hrs.
- SEV3: acknowledge < 1 business day.

## Alert rules (baseline)

- 5xx error rate > 2% for 5 min.
- p95 latency > 2s for 10 min.
- Queue depth > 1,000 jobs for 10 min.
- Horizon down or no active workers for 5 min.
- DB connection failures > 1% for 5 min.

## Escalation

- If SEV1 not mitigated in 30 min, escalate to owner.
- If SEV2 persists > 4 hrs, schedule hotfix or rollback.

## Primary signals

- Sentry error alerts.
- Horizon health and failed jobs.
- OpenTelemetry traces/metrics (latency, error rate).
