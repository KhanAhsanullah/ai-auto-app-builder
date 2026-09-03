# Web Store

Config-driven consumer web storefront for CommerceOS AI — resolve tenant config into a branded shell, map screens, and mount a React top-bar experience from one facade call.

## Package

`@ai-commerce/web-store`

## Status

Sprint 11 complete — facade + shell. Sprint 20 Task 2 — cart/checkout screens via `cartSurface` / `checkoutSurface`.

## Modules

| Module                      | Purpose                                           |
| --------------------------- | ------------------------------------------------- |
| `createWebStore`            | Config → shell + registry facade                  |
| `WebStore`                  | `getViewModel`, screen registration               |
| `WebStoreApp` (`./react`)   | Stateful React entry with branded default screens |
| `mountWebStore` (`./react`) | DOM mount helper for SPA / embed hosts            |
| `WebScreenRegistry`         | Route → screen map                                |
| `WebShellLayout`            | Header + top nav + content + footer               |

## Usage

```ts
import { createWebStore } from '@ai-commerce/web-store';
import { WebStoreApp, mountWebStore } from '@ai-commerce/web-store/react';
import { ConfigProvider } from '@ai-commerce/config-runtime';

const result = new ConfigProvider({ cache: false }).resolve({ tenantConfig });
const store = createWebStore({ config: result });

// React tree
<WebStoreApp store={store} />

// Or mount into a host element
mountWebStore({ store, container: '#root' });
```

Navigation, branding, SEO, and domain all come from tenant config — change config, not forks.

## Scripts

```bash
pnpm --filter @ai-commerce/web-store test
pnpm --filter @ai-commerce/web-store typecheck
pnpm --filter @ai-commerce/web-store lint
pnpm --filter @ai-commerce/web-store build
```

## Out of scope

- Dedicated Next.js / Vite host project (embed `WebStoreApp` / `mountWebStore`)
- Live catalog / cart / checkout module wiring
- Runtime Theme Engine token injection

## Architecture

See [docs/architecture/web-store.md](../../docs/architecture/web-store.md).
