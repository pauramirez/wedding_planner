#!/usr/bin/env bash
# Apply pending migrations. Pass --remote to hit the production D1.
set -euo pipefail
cd "$(dirname "$0")/../backend"

TARGET="${1:---local}"
DB_NAME="wedding-planner"

echo "==> applying migrations to D1 ($TARGET)"
npx wrangler d1 migrations apply "$DB_NAME" "$TARGET"
