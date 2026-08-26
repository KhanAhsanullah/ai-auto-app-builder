# Web Store Architecture

Config-driven consumer web storefront surface for CommerceOS AI.

## Overview

`@ai-commerce/web-store` resolves tenant configuration into a shell model, maps `store.*` routes through `WebScreenRegistry`, and exposes a React app via `createWebStore` → `WebStoreApp` / `mountWebStore`.

## Boundaries

```
Tenant config (ConfigProvider.resolve)
        ↓
createWebStore()
        ├── WebStoreShellResolver
        └── WebScreenRegistry (defaults + extras)
        ↓
WebStore facade (getViewModel / registerScreen)
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

## Deferred

- Dedicated Next.js / Vite host app
- Live catalog / cart / checkout module wiring
- Full theme compile at render time
- CDN / edge caching policies beyond `rendering.cacheTtlSeconds`
