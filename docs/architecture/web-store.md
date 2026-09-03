# Web Store Architecture

Config-driven consumer web storefront surface for CommerceOS AI.

## Overview

`@ai-commerce/web-store` resolves tenant configuration into a shell model, maps `store.*` routes through `WebScreenRegistry`, and exposes a React app via `createWebStore` → `WebStoreApp` / `mountWebStore`.

## Boundaries

```
Tenant config (ConfigProvider.resolve)
        ↓
createWebStore({ config, catalog? })
        ├── WebStoreShellResolver
        ├── WebScreenRegistry (defaults + extras)
        └── optional CatalogModule → catalogSurface
        ↓
WebStore facade (getViewModel / registerScreen / catalogSurface)
        ↓
WebStoreApp / mountWebStore
        └── WebShellLayout (header / top nav / content / footer)
```

| Concern                   | Owner                             |
| ------------------------- | --------------------------------- |
| Navigation / flags schema | Sprint 1 `config-schema`          |
| Config merge / validation | `@ai-commerce/config-runtime`     |
| Theme tokens              | `@ai-commerce/theme-engine`       |
| Brand assets              | `@ai-commerce/white-label-engine` |
| Shell + facade + React    | `@ai-commerce/web-store`          |

## Sprint 11 Task Breakdown

| Task   | Deliverable                                                           |
| ------ | --------------------------------------------------------------------- |
| Task 1 | Shell foundation — nav, feature flags, branding, domain/SEO/rendering |
| Task 2 | Screen registry + React storefront layout shell                       |
| Task 3 | `createWebStore` facade, `WebStoreApp`, `mountWebStore`, docs         |

## Catalog wiring (Sprint 19 Task 1)

Inject `@ai-commerce/module-catalog` when creating the store:

```ts
import { createCatalogModule } from '@ai-commerce/module-catalog';
import { createWebStore } from '@ai-commerce/web-store';

const catalog = createCatalogModule();
const store = createWebStore({ config: resolvedConfig, catalog });

if (store.isCatalogAvailable()) {
  const products = await store.catalogSurface.listActiveProducts();
}
```

Gated by tenant `featureFlags.modules.catalog`. Tenant id comes from the resolved shell.

## Deferred

- Dedicated Next.js / Vite host app
- Cart / checkout / order / payment surface wiring (Sprint 19 Tasks 2–3)
- Full theme compile at render time
- CDN / edge caching policies beyond `rendering.cacheTtlSeconds`
- Rich catalog React screen components (hosts use `catalogSurface` + `renderScreen`)
