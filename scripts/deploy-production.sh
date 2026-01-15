#!/usr/bin/env bash
set -euo pipefail

if [[ -z "${PROD_DEPLOY_PROVIDER:-}" || -z "${PROD_DEPLOY_TOKEN:-}" ]]; then
  echo "Missing PROD_DEPLOY_PROVIDER or PROD_DEPLOY_TOKEN."
  exit 1
fi

case "$PROD_DEPLOY_PROVIDER" in
  fly)
    echo "TODO: Deploy production to Fly.io for ${RELEASE_SHA:-unknown}."
    ;;
  vercel)
    echo "TODO: Deploy production to Vercel for ${RELEASE_SHA:-unknown}."
    ;;
  render)
    echo "TODO: Deploy production to Render for ${RELEASE_SHA:-unknown}."
    ;;
  *)
    echo "Unsupported PROD_DEPLOY_PROVIDER: ${PROD_DEPLOY_PROVIDER}"
    exit 1
    ;;
esac
