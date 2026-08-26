# Web Store Architecture

Config-driven consumer web storefront surface for CommerceOS AI (SSR-oriented shell).

## Overview

`@ai-commerce/web-store` resolves tenant configuration into a shell model, maps `store.*` routes through `WebScreenRegistry`, and renders a React layout via `WebShellLayout`. Task 3 adds the `createWebStore` facade.

## Boundaries

```
Tenant config (ConfigProvider.resolve)
        ↓
toResolveWebStoreShellInput()
        ↓
WebStoreShellResolver
        ├── WebNavigationResolver (flag-gated)
        └── WebBrandingResolver
        ↓
buildWebShellViewModel(shell, WebScreenRegistry)
        ↓
WebShellLayout (header / top nav / content / footer)
```

| Concern                   | Owner                             |
| ------------------------- | --------------------------------- |
| Navigation / flags schema | Sprint 1 `config-schema`          |
| Config merge / validation | `@ai-commerce/config-runtime`     |
| Theme tokens              | `@ai-commerce/theme-engine`       |
| Brand assets              | `@ai-commerce/white-label-engine` |
| Shell + React layout      | `@ai-commerce/web-store`          |

## Sprint 11 Task Breakdown

| Task   | Deliverable                                                           |
| ------ | --------------------------------------------------------------------- |
| Task 1 | Shell foundation — nav, feature flags, branding, domain/SEO/rendering |
| Task 2 | Screen registry + React storefront layout shell                       |
| Task 3 | `createWebStore` facade, app entry helpers, integration docs          |

## Deferred

- Dedicated Next.js / Vite host app
- Live catalog / cart / checkout module wiring
- Full theme compile at render time
- CDN / edge caching policies beyond `rendering.cacheTtlSeconds`
