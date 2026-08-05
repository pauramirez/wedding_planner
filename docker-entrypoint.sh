#!/usr/bin/env sh
# Docker entrypoint — supports running the backend or frontend from one image.
# Usage:
#   docker run wedding-planner backend    # start wrangler dev on :8787
#   docker run wedding-planner frontend   # start vite on :5173
#   docker run wedding-planner migrate    # apply pending migrations to local D1
#
# We only really deploy through Cloudflare (Workers + Pages) but this makes
# local reproducibility easy for anyone who prefers containers.

set -eu

CMD="${1:-backend}"

case "$CMD" in
  backend)
    cd /app/backend
    exec npm run dev
    ;;
  frontend)
    cd /app/frontend
    exec npm run dev -- --host 0.0.0.0
    ;;
  migrate)
    cd /app/backend
    exec npx wrangler d1 migrations apply wedding-planner --local
    ;;
  seed)
    cd /app/backend
    exec npx wrangler d1 execute wedding-planner --local --file=../db/seed.sql
    ;;
  *)
    echo "unknown command: $CMD"
    echo "try: backend | frontend | migrate | seed"
    exit 1
    ;;
esac
