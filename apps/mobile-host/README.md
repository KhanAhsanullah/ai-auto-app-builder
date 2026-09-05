# Mobile Host (Expo)

Runnable Expo shell for `@ai-commerce/mobile-app` — the RN developer entry point to see the buy path on a device/simulator.

## Package

`@ai-commerce/mobile-host`

## Status

Sprint 21 complete — Expo host, deep links/session, EAS profiles + `expo prebuild` release path.

## Why Expo (not bare React Native CLI)?

Expo **is** React Native. The host uses the same `react-native` runtime and our `@ai-commerce/mobile-app` screens.

|                      | Expo (this host)                                  | Bare RN CLI                                     |
| -------------------- | ------------------------------------------------- | ----------------------------------------------- |
| Day-1 run            | Expo Go / simulator, fast                         | Needs Xcode/Android Studio native project first |
| Native modules       | Expo SDK + config plugins                         | Manual linking / native code                    |
| Later native control | `pnpm prebuild` → ios/android folders (CLI-style) | Already bare                                    |

Store / TestFlight / Play binaries: see [RELEASE.md](./RELEASE.md) (EAS profiles + checklist).

## Run (dev)

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

Guest `sessionId` is stored in AsyncStorage so the same cart identity is reused.

### Durable demo data (Sprint 22)

Catalog, cart, checkout, orders, and payments are snapshotted after each write.

**Storage backend (Task 3):** prefers **SQLite** (`expo-sqlite`, `ai-commerce-demo.db` `kv` table). On first launch, migrates snapshot + guest session from AsyncStorage. Falls back to AsyncStorage if SQLite cannot open. Toolbar shows `SQLite` or `AsyncStorage`.

Toolbar controls:

- **Reset demo** — clears snapshot + guest session, reseeds catalog
- **Export** — summarizes the snapshot and prints JSON to Metro logs

## Native / EAS (Task 3)

```bash
# Generate ios/ + android/ locally (gitignored)
pnpm --filter @ai-commerce/mobile-host prebuild

# Cloud builds (requires eas login + project link — see RELEASE.md)
pnpm --filter @ai-commerce/mobile-host eas:build:preview
```

Profiles in `eas.json`: `development` (dev client), `preview` (internal), `production` (store).

## Notes

- In-memory modules only (no real DB / gateway yet)
- Metro watches the monorepo workspace so `@ai-commerce/*` resolves from source
- Node `crypto` imports are shimmed for RN bundling
- `ios/` and `android/` are gitignored — regenerate with `prebuild`
