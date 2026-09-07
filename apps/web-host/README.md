# Web Host (Vite)

Runnable browser shell for `@ai-commerce/web-store` — launch any vertical storefront from a Boom wizard.

## Package

`@ai-commerce/web-host`

## Status

Sprint 24 Task 1 — launch wizard (name + logo + app type) → durable demo store.

## Run

```bash
pnpm web
# or
pnpm --filter @ai-commerce/web-host start
```

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
