# Mobile Host (Expo)

Runnable Expo shell for `@ai-commerce/mobile-app` — the RN developer entry point to see the buy path on a device/simulator.

## Package

`@ai-commerce/mobile-host`

## Status

Sprint 21 Task 2 — guest session persistence + deep links (`aicommerce://…`).

## Why Expo (not bare React Native CLI)?

Expo **is** React Native. The host uses the same `react-native` runtime and our `@ai-commerce/mobile-app` screens.

|                      | Expo (this host)                                      | Bare RN CLI                                     |
| -------------------- | ----------------------------------------------------- | ----------------------------------------------- |
| Day-1 run            | Expo Go / simulator, fast                             | Needs Xcode/Android Studio native project first |
| Native modules       | Expo SDK + config plugins                             | Manual linking / native code                    |
| Later native control | `npx expo prebuild` → ios/android folders (CLI-style) | Already bare                                    |

We start Expo so you can run the buy path now. When we need custom native code or store binaries, we add EAS/`prebuild` (Sprint 21 Task 3) — not a rewrite.

## Run

```bash
pnpm mobile
# or
pnpm --filter @ai-commerce/mobile-host start
```

Demo flow: **Shop → Add → Cart → Checkout → Payment → Orders**.

### Deep links

Scheme: `aicommerce`

Examples:

- `aicommerce://cart`
- `aicommerce://store/orders`
- Expo Go: open a path like `/--/store/cart` against the dev server

### Session

Guest `sessionId` is stored in AsyncStorage so cart survives app reloads (in-memory commerce data still resets until a real backend exists).

## Notes

- In-memory modules only (no real DB / gateway yet)
- Metro watches the monorepo workspace so `@ai-commerce/*` resolves from source
- Node `crypto` imports are shimmed for RN bundling
