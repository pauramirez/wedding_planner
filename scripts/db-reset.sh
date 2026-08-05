#!/usr/bin/env bash
# Reset the LOCAL D1 database and apply all migrations + seed data.
# Safe: only touches --local, never remote.

set -euo pipefail
cd "$(dirname "$0")/../backend"

DB_NAME="wedding-planner"

echo "==> resetting local D1: $DB_NAME"
rm -rf .wrangler/state/v3/d1

echo "==> applying migrations"
npx wrangler d1 migrations apply "$DB_NAME" --local

echo "==> seeding"
npx wrangler d1 execute "$DB_NAME" --local --file=../db/seed.sql

echo "==> done"
