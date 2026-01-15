#!/usr/bin/env bash
set -euo pipefail

if [[ -z "${PREVIEW_DEPLOY_PROVIDER:-}" || -z "${PREVIEW_DEPLOY_TOKEN:-}" ]]; then
  echo "Missing PREVIEW_DEPLOY_PROVIDER or PREVIEW_DEPLOY_TOKEN."
  exit 1
fi

case "$PREVIEW_DEPLOY_PROVIDER" in
  fly)
    echo "TODO: Deploy preview to Fly.io for ${PREVIEW_REF:-unknown} (${PREVIEW_SHA:-unknown})."
    ;;
  vercel)
    echo "TODO: Deploy preview to Vercel for ${PREVIEW_REF:-unknown} (${PREVIEW_SHA:-unknown})."
    ;;
  render)
    echo "TODO: Deploy preview to Render for ${PREVIEW_REF:-unknown} (${PREVIEW_SHA:-unknown})."
    ;;
  *)
    echo "Unsupported PREVIEW_DEPLOY_PROVIDER: ${PREVIEW_DEPLOY_PROVIDER}"
    exit 1
    ;;
esac
