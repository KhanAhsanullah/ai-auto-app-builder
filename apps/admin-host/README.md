# Admin Host

Vite browser host for merchant admin. Boots tenant list + catalog from `@ai-commerce/platform-api`.

## Package

`@ai-commerce/admin-host`

## Status

Sprint 29 Task 2 — platform-api tenants + catalog → `createAdminDashboard` with catalog module.
Sprint 29 Task 3 — Catalog create / edit amount / delete via platform-api; storefront refresh sees changes.

## Run

```bash
# Terminal 1 — control plane (required)
pnpm --filter @ai-commerce/platform-api start

# Terminal 2 — web store (Boom + /t/:slug)
pnpm web
# http://localhost:5173

# Terminal 3 — admin host
pnpm admin
# http://localhost:5174
```

Flow: Boom on web → open admin → pick tenant → add/edit/delete products → open `/t/:slug` to verify storefront.

## Scripts

```bash
pnpm --filter @ai-commerce/admin-host test
pnpm --filter @ai-commerce/admin-host typecheck
pnpm --filter @ai-commerce/admin-host lint
```
