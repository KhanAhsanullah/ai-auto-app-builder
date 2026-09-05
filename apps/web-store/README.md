# Web Store

Config-driven consumer web storefront for CommerceOS AI — resolve tenant config into a branded shell, map screens, and mount a React top-bar experience from one facade call.

## Package

`@ai-commerce/web-store`

## Status

Sprint 11 complete — facade + shell. Sprint 20 complete — catalog/cart/checkout/payment/orders screens.
Sprint 23 Task 1 — `createDemoWebStore` + runnable `@ai-commerce/web-host` (Vite).

## Modules

| Module                      | Purpose                                           |
| --------------------------- | ------------------------------------------------- |
| `createWebStore`            | Config → shell + registry facade                  |
| `createDemoWebStore`        | Seeded grocery demo (host / tests)                |
| `WebStore`                  | `getViewModel`, screen registration               |
| `WebStoreApp` (`./react`)   | Stateful React entry with branded default screens |
| `mountWebStore` (`./react`) | DOM mount helper for SPA / embed hosts            |
| `WebScreenRegistry`         | Route → screen map                                |
| `WebShellLayout`            | Header + top nav + content + footer               |

## Usage

```ts
import { createWebStore, createDemoWebStore } from '@ai-commerce/web-store';
import { WebStoreApp, mountWebStore } from '@ai-commerce/web-store/react';

const { store, sessionId } = await createDemoWebStore();
<WebStoreApp store={store} sessionId={sessionId} />
```

Runnable host:

```bash
pnpm web
```

## Scripts

```bash
pnpm --filter @ai-commerce/web-store test
pnpm --filter @ai-commerce/web-store typecheck
pnpm --filter @ai-commerce/web-store lint
pnpm --filter @ai-commerce/web-store build
```

## Out of scope

- localStorage durability (Sprint 23 Task 2)
- URL deep links (Sprint 23 Task 3)
- Live DB / payment gateways

## Architecture

See [docs/architecture/web-store.md](../../docs/architecture/web-store.md).
