# Platform API

Control-plane HTTP API for Boom tenant provisioning and platform administration.

## Package

`@ai-commerce/platform-api`

## Status

Sprint 26 Task 1 — runnable Node HTTP server:

- `POST /v1/boom/launch` — business name + vertical (+ optional logo) → provision + activate
- `GET /v1/tenants/:id` — fetch provisioned tenant summary
- `GET /health` — liveness

Uses in-memory `@ai-commerce/tenant-provisioner` (durable store in Task 2).

## Run

```bash
pnpm --filter @ai-commerce/platform-api start
# default http://127.0.0.1:8787
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
