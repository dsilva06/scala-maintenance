# CI/CD

This project ships with GitHub Actions workflows for tests, preview deploys, production deploys, and rollbacks.

## Workflows

- `CI` (`.github/workflows/ci.yml`): runs backend + frontend tests on every PR and on main.
- `Deploy Preview` (`.github/workflows/deploy-preview.yml`): triggers on PRs when preview deploy secrets are configured.
- `Deploy Production` (`.github/workflows/deploy-production.yml`): triggers on main pushes or manual dispatch.
- `Rollback` (`.github/workflows/rollback.yml`): manual rollback to a specified release id.

## Required secrets

Set these in your GitHub repository settings:

- `PREVIEW_DEPLOY_PROVIDER`: one of `fly`, `vercel`, `render` (or add your own in scripts).
- `PREVIEW_DEPLOY_TOKEN`: provider token for preview deployments.
- `PROD_DEPLOY_PROVIDER`: one of `fly`, `vercel`, `render` (or add your own).
- `PROD_DEPLOY_TOKEN`: provider token for production deployments.

## Deploy scripts

Provider specific logic lives in:

- `scripts/deploy-preview.sh`
- `scripts/deploy-production.sh`
- `scripts/rollback.sh`

These scripts include TODO placeholders. Update them with your provider commands before enabling the secrets above.

## Rollback flow

1) Identify the provider release id (image tag, deployment id, or version) for the rollback target.
2) Trigger the `Rollback` workflow and pass `release_id`.
3) Confirm service health, then annotate the rollback in your release notes.
