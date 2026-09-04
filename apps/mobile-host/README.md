# Mobile Host (Expo)

Runnable Expo shell for `@ai-commerce/mobile-app` — the RN developer entry point to see the buy path on a device/simulator.

## Package

`@ai-commerce/mobile-host`

## Status

Sprint 21 Task 1 — Expo host boots `createDemoMobileApp()` and mounts `MobileAppRoot`.

## Run

From repo root (after `pnpm install`):

```bash
pnpm --filter @ai-commerce/mobile-host start
```

Then press `i` (iOS simulator), `a` (Android), or scan the QR with Expo Go.

Demo flow: **Shop → Add → Cart → Checkout → Payment → Orders**.

## Notes

- In-memory modules only (no real DB / gateway yet)
- Metro watches the monorepo workspace so `@ai-commerce/*` resolves from source
- Node `crypto` imports are shimmed for RN bundling
