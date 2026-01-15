#!/usr/bin/env bash
set -euo pipefail

if [[ -z "${PROD_DEPLOY_PROVIDER:-}" || -z "${PROD_DEPLOY_TOKEN:-}" ]]; then
  echo "Missing PROD_DEPLOY_PROVIDER or PROD_DEPLOY_TOKEN."
  exit 1
fi

if [[ -z "${RELEASE_ID:-}" ]]; then
  echo "Missing RELEASE_ID."
  exit 1
fi

case "$PROD_DEPLOY_PROVIDER" in
  fly)
    echo "TODO: Roll back Fly.io to ${RELEASE_ID}."
    ;;
  vercel)
    echo "TODO: Roll back Vercel to ${RELEASE_ID}."
    ;;
  render)
    echo "TODO: Roll back Render to ${RELEASE_ID}."
    ;;
  *)
    echo "Unsupported PROD_DEPLOY_PROVIDER: ${PROD_DEPLOY_PROVIDER}"
    exit 1
    ;;
esac
