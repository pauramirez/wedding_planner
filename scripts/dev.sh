#!/usr/bin/env bash
# Run backend + frontend in parallel for local dev.
# Backend on :8787, frontend on :5173.

set -euo pipefail
cd "$(dirname "$0")/.."

# Trap SIGINT so both children die together.
pids=()
cleanup() { echo; echo "==> stopping"; for pid in "${pids[@]}"; do kill "$pid" 2>/dev/null || true; done; wait 2>/dev/null || true; }
trap cleanup INT TERM EXIT

(cd backend && npm run dev) &
pids+=($!)

(cd frontend && npm run dev) &
pids+=($!)

wait
