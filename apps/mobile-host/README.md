# Mobile Host (Expo)

Runnable Expo shell for `@ai-commerce/mobile-app` — the RN developer entry point to see the buy path on a device/simulator.

## Package

`@ai-commerce/mobile-host`

## Status

Sprint 24 Task 3 — Boom launch wizard on Expo (name + logo + any app type).
Sprint 25 Task 3 — wizard UI tinted by selected vertical brand accent.
Sprint 26 Task 3 — Boom calls `platform-api` then seeds the local demo.

Sprint 21–22 — Expo host, deep links/session, EAS/prebuild, SQLite durability.

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
# Terminal 1 — control plane (required for Boom)
pnpm --filter @ai-commerce/platform-api start

# Terminal 2 — Expo
pnpm mobile
```

Optional: `EXPO_PUBLIC_PLATFORM_API_URL=http://127.0.0.1:8787` (default). On a physical device, point this at your machine’s LAN IP.

1. Enter **business name**, optional logo, pick **app type**
2. **Boom — launch app** (provisions via platform-api, then seeds local demo)
3. Demo flow: **Shop → Add → Cart → Checkout → Payment → Orders**

Toolbar: **New app** / **Reset demo** / **Export**.

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
