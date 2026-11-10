# Admin Host

Vite browser host for merchant admin. Boots tenant list + catalog from `@ai-commerce/platform-api`.

## Package

`@ai-commerce/admin-host`

## Status

Sprint 29 Task 2 — platform-api tenants + catalog → `createAdminDashboard` with catalog module.

## Run

```bash
# Terminal 1 — control plane (required)
pnpm --filter @ai-commerce/platform-api start

# Terminal 2 — admin host
pnpm admin
# http://localhost:5174
```

Flow: pick a Boom tenant → admin opens on Catalog with platform-owned products.

## Scripts

```bash
pnpm --filter @ai-commerce/admin-host test
pnpm --filter @ai-commerce/admin-host typecheck
pnpm --filter @ai-commerce/admin-host lint
```
