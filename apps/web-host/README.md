# Web Host (Vite)

Runnable browser shell for `@ai-commerce/web-store` — launch any vertical storefront from a Boom wizard.

## Package

`@ai-commerce/web-host`

## Status

Sprint 24 Task 1 — launch wizard (name + logo + app type) → durable demo store.
Sprint 25 Task 3 — wizard UI tinted by selected vertical brand accent.
Sprint 26 Task 3 — Boom calls `platform-api` (`POST /v1/boom/launch`) then seeds the local demo.
Sprint 27 Task 3 — Boot storefront from `GET /v1/tenants/:id/config` (platform-owned branding).

## Run

```bash
# Terminal 1 — control plane (required for Boom)
pnpm --filter @ai-commerce/platform-api start

# Terminal 2 — storefront
pnpm web
```

Optional: `VITE_PLATFORM_API_URL=http://127.0.0.1:8787` (default).

Opens Vite at http://localhost:5173.

1. Enter **business name**, optional **logo URL**, pick an **app type**
2. Click **Boom — launch app**
3. Shop → Cart → Checkout → Payment → Orders

### App types

Grocery, Restaurant, Pharmacy/Clinic, Ecommerce, Fashion, Electronics — each gets its own branding colors, nav labels, and seeded catalog.

Toolbar:

- **New app** — back to wizard (clears current demo)
- **Reset demo** — clear cart/orders, keep this app
- **Export** — snapshot JSON to console

## Notes

- Durability via `localStorage`
- Workspace packages resolve from source via pnpm + Vite
- Vite shims `node:fs` / `node:crypto` for browser bundles
- Mobile equivalent: `pnpm mobile` (wizard wiring = Sprint 24 Task 3)
