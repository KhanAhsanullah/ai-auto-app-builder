# Mobile App Architecture

Config-driven consumer mobile surface for CommerceOS AI (React Native).

## Overview

`@ai-commerce/mobile-app` resolves tenant configuration into a shell model, maps `store.*` routes through `MobileScreenRegistry`, and exposes a React Native app via `createMobileApp` → `MobileAppRoot`.

## Boundaries

```
Tenant config (ConfigProvider.resolve)
        ↓
createMobileApp({ config, catalog? })
        ├── MobileAppShellResolver
        ├── MobileScreenRegistry (defaults + extras)
        └── optional CatalogModule → catalogSurface
        ↓
MobileApp facade (getViewModel / registerScreen / catalogSurface)
        ↓
MobileAppRoot
        └── MobileShellLayout (header / content / bottom bar)
```

| Concern                   | Owner                             |
| ------------------------- | --------------------------------- |
| Navigation / flags schema | Sprint 1 `config-schema`          |
| Config merge / validation | `@ai-commerce/config-runtime`     |
| RN theme tokens           | `@ai-commerce/theme-engine`       |
| Mobile brand assets       | `@ai-commerce/white-label-engine` |
| Shell + facade + RN app   | `@ai-commerce/mobile-app`         |

## Sprint 9 Task Breakdown

| Task   | Deliverable                                                 |
| ------ | ----------------------------------------------------------- |
| Task 1 | Shell foundation — nav, feature flags, branding, identity   |
| Task 2 | Screen registry + React Native bottom-bar layout shell      |
| Task 3 | `createMobileApp` facade, `MobileAppRoot`, integration docs |

## Catalog wiring (Sprint 19 Task 1)

```ts
const app = createMobileApp({ config, catalog: createCatalogModule() });
const products = await app.catalogSurface.listActiveProducts();
```

Gated by `modules.catalog`. Tenant id from shell.

## Cart + checkout wiring (Sprint 19 Task 2)

```ts
const app = createMobileApp({ config, catalog, cart, checkout });
await app.cartSurface.getOrCreateBySession({ sessionId });
await app.checkoutSurface.startCheckout(cartId);
```

Use `adaptCatalogProductLookup` / `adaptCartLookup` from `@ai-commerce/mobile-app`.

## Order + payment wiring (Sprint 19 Task 3)

```ts
const app = createMobileApp({ config, catalog, cart, checkout, orders, payments });
const order = await app.orderSurface.createOrderFromCheckout(checkoutId);
await app.paymentSurface.capturePaymentIntent(intentId);
```

React Native shell (`MobileAppRoot` / `MobileShellLayout`) — commerce via `*Surface` APIs.

When modules are wired and no custom `renderScreen` is provided (Sprint 20):

- `store.catalog` → `MobileCatalogScreen`
- `store.cart` → `MobileCartScreen`
- `store.checkout` → `MobileCheckoutScreen`
- `store.payment` → `MobilePaymentConfirmScreen`
- `store.orders` → `MobileOrdersScreen`

Guest session defaults to `mobile-guest` via `MobileAppRoot` `sessionId` prop.

## Expo host (Sprint 21)

Runnable shell: `@ai-commerce/mobile-host` (Expo = React Native managed workflow).

```bash
pnpm --filter @ai-commerce/mobile-host start
```

- Task 1: `createDemoMobileApp()` + `MobileAppRoot`
- Task 2: persisted guest session (AsyncStorage) + deep links (`aicommerce://cart`, `/store/orders`, …)
- Task 3: `eas.json` profiles + `expo prebuild` / [RELEASE.md](../../apps/mobile-host/RELEASE.md) checklist

Durable demo (Sprint 22): `createDemoMobileApp({ snapshotStore })` persists commerce state across restarts.

Bare RN CLI workflow = `pnpm --filter @ai-commerce/mobile-host prebuild` (generates `ios/` / `android/`).

## Deferred

- Push notification provider wiring
- Live IdP session binding
- Full theme compile at render time
- Real DB / payment gateways behind the demo host
