#!/usr/bin/env bash
# Install npm deps for backend + frontend.
set -euo pipefail
cd "$(dirname "$0")/.."

echo "==> installing backend deps"
(cd backend && npm install)

echo "==> installing frontend deps"
(cd frontend && npm install)

echo "==> done"
