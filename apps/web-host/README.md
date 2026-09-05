# Web Host (Vite)

Runnable browser shell for `@ai-commerce/web-store` — open the buy path in a desktop browser.

## Package

`@ai-commerce/web-host`

## Status

Sprint 23 Task 1 — Vite host + `createDemoWebStore` seeded grocery demo.

## Run

```bash
pnpm web
# or
pnpm --filter @ai-commerce/web-host start
```

Opens Vite at http://localhost:5173.

Demo flow: **Shop → Add → Cart → Checkout → Payment → Orders**.

## Notes

- In-memory modules only (no localStorage durability yet — Task 2)
- Workspace packages resolve from source via pnpm + Vite
- Vite shims `node:fs` / `node:crypto` for browser bundles (ConfigProvider / modules)
- Mobile equivalent: `pnpm mobile` (`@ai-commerce/mobile-host`)
