#!/usr/bin/env bash
# Production deploy: apply migrations to remote D1, deploy the Worker,
# build and publish the Pages frontend. Expects wrangler creds in env.

set -euo pipefail
cd "$(dirname "$0")/.."

DB_NAME="wedding-planner"
PAGES_PROJECT="${PAGES_PROJECT:-wedding-planner}"

echo "==> applying migrations (remote)"
(cd backend && npx wrangler d1 migrations apply "$DB_NAME" --remote)

echo "==> deploying Worker"
(cd backend && npx wrangler deploy)

echo "==> building frontend"
(cd frontend && npm run build)

echo "==> deploying Pages"
(cd frontend && npx wrangler pages deploy dist --project-name "$PAGES_PROJECT" --branch main)

echo "==> done"
