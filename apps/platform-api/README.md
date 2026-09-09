# Platform API

Control-plane HTTP API for Boom tenant provisioning and platform administration.

## Package

`@ai-commerce/platform-api`

## Status

Sprint 26 Task 1 — runnable Node HTTP server.
Sprint 26 Task 2 — durable JSON tenant store (survives restarts).

Routes:

- `POST /v1/boom/launch` — business name + vertical (+ optional logo) → provision + activate
- `GET /v1/tenants/:id` — fetch provisioned tenant summary
- `GET /health` — liveness

## Run

```bash
pnpm --filter @ai-commerce/platform-api start
# default http://127.0.0.1:8787
# default store: .data/tenants.json (override with TENANT_STORE_PATH)
```

Example:

```bash
curl -s -X POST http://127.0.0.1:8787/v1/boom/launch \
  -H 'content-type: application/json' \
  -d '{"businessName":"Spice Route","vertical":"restaurant"}'
```

## Scripts

```bash
pnpm --filter @ai-commerce/platform-api test
pnpm --filter @ai-commerce/platform-api typecheck
pnpm --filter @ai-commerce/platform-api lint
```
