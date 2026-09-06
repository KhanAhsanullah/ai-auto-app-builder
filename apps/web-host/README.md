# Web Host (Vite)

Runnable browser shell for `@ai-commerce/web-store` — open the buy path in a desktop browser.

## Package

`@ai-commerce/web-host`

## Status

Sprint 23 Task 2 — localStorage guest session + durable commerce snapshot, reset/export toolbar.

## Run

```bash
pnpm web
# or
pnpm --filter @ai-commerce/web-host start
```

Opens Vite at http://localhost:5173.

Demo flow: **Shop → Add → Cart → Checkout → Payment → Orders**.

### Durable demo data

Catalog, cart, checkout, orders, and payments are snapshotted to **localStorage** after each write. Reload restores the last buy-path state.

Toolbar:

- **Reset demo** — clears snapshot + guest session, reseeds catalog
- **Export** — summarizes the snapshot and prints JSON to the console

## Notes

- Durability via `localStorage` (Task 2); URL deep links are Task 3
- Workspace packages resolve from source via pnpm + Vite
- Vite shims `node:fs` / `node:crypto` for browser bundles (ConfigProvider / modules)
- Mobile equivalent: `pnpm mobile` (`@ai-commerce/mobile-host`)
