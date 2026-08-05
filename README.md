# Wedding Planner

Multi-user wedding planner for a two-ceremony wedding (Vancouver civil + Colombia catholic). Shared data — every logged-in user sees the same wedding, with an audit trail of who changed what.

## Stack

- **Frontend:** React (JSX) + Vite, bundled as static assets served by the Worker
- **Backend:** Cloudflare Workers (Node ESM, `nodejs_compat`) — serves both `/api/*` and the SPA on one origin (single URL, first-party cookies)
- **Database:** Cloudflare D1 (SQLite at the edge) — raw SQL, no ORM, versioned migrations
- **Observability:** Datadog RUM (frontend) + Workers Logpush → Datadog (backend)
- **CI:** GitHub Actions

## Repo layout

```
backend/          # Cloudflare Worker
frontend/         # Vite + React
db/migrations/    # NNNN_*.sql — applied in order
scripts/          # bash helpers: dev, migrate, seed, deploy
.github/workflows # ci.yml (lint+test), deploy.yml
docker-entrypoint.sh
```

## Local setup

1. Install Node 20+ and `wrangler`:
   ```
   npm i -g wrangler
   ```
2. Copy env template:
   ```
   cp .env.example .env
   ```
3. Install deps:
   ```
   ./scripts/install.sh
   ```
4. Create the local D1 db + run migrations + seed:
   ```
   ./scripts/db-reset.sh
   ```
5. Run dev servers (backend on :8787, frontend on :5173):
   ```
   ./scripts/dev.sh
   ```

Open http://localhost:5173, register a user, sign in.

## Deploying

- **First time:** create the D1 db and Cloudflare Pages project in the Cloudflare dashboard. Wire secrets in GitHub (`CF_API_TOKEN`, `CF_ACCOUNT_ID`, `DD_API_KEY`, `SESSION_SECRET`).
- **Every push to `main`** runs `.github/workflows/deploy.yml` which applies pending D1 migrations, deploys the Worker, and publishes Pages.

See `scripts/deploy.sh` for what the CI runs.

## Data model

Six resources, all shared across users:

- `tasks` — per ceremony (`vancouver` / `colombia` / `shared`), with owner, due date, cost, status, notes
- `guests` — name, side, event, plus-one, table, RSVP, meal, contact
- `vendors` — category, name, event, contact, price, status, notes
- `gifts` — recipient, role, idea, budget, status, notes
- `palette` — hex + name (color palette for stationery, florists, etc.)
- `timeline` — day-of schedule, one row per activity per day (`van` / `col`)
- `settings` — key/value store; used for `wedding_date_van`, `wedding_date_col`

Plus:

- `users` + `sessions` — auth
- `activity_log` — every write is logged with user + before/after JSON

## Datadog

Not required to run locally. When you're ready:

1. Sign up at datadoghq.com
2. Create an API key and a RUM application
3. Set `DD_API_KEY`, `DD_RUM_APP_ID`, `DD_RUM_CLIENT_TOKEN` in `.env` (local) and GitHub secrets (deploy)

Backend sends structured logs the Datadog worker plugin ships to DD. Frontend loads the DD RUM browser SDK.

## Notes on infra

The requirements list mentioned Helm — Cloudflare isn't Kubernetes, so there's no Helm chart here. If we ever move off Cloudflare to a k8s cluster, add a `deploy/helm/` chart at that point.
