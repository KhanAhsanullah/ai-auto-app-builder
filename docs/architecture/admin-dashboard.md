# Admin Dashboard Architecture

Config-driven merchant admin surface for CommerceOS AI.

## Overview

`@ai-commerce/admin-dashboard` turns tenant configuration (navigation, feature flags, branding, `adminDashboard` settings) into a resolved shell model. React presentation and HTTP/app hosting are deferred to later Sprint 8 tasks.

## Boundaries

```
Tenant config (ConfigProvider.resolve)
        ↓
toResolveAdminDashboardShellInput
        ↓
AdminDashboardShellResolver
        ├── FeatureFlagEvaluator
        ├── AdminNavigationResolver
        ├── AdminBrandingResolver
        └── Widget / layout preferences
        ↓
ResolvedAdminDashboardShell
        ↓
(Task 2) Screen registry + React layout
(Task 3) createAdminDashboard facade
```

| Concern                          | Owner                             |
| -------------------------------- | --------------------------------- |
| Navigation / feature flag schema | Sprint 1 `config-schema`          |
| Config merge / validation        | `@ai-commerce/config-runtime`     |
| Theme tokens (admin-dashboard)   | `@ai-commerce/theme-engine`       |
| Brand assets                     | `@ai-commerce/white-label-engine` |
| Shell resolution                 | `@ai-commerce/admin-dashboard`    |
| React UI                         | Sprint 8 Task 2–3                 |

## Sprint 8 Task Breakdown

| Task   | Deliverable                                                              |
| ------ | ------------------------------------------------------------------------ |
| Task 1 | Shell foundation — nav, feature flags, branding, widgets, Config mapping |
| Task 2 | Screen registry + React admin layout shell (sidebar / landing)           |
| Task 3 | `createAdminDashboard` facade, app entry, integration docs               |

## Feature flag keys on nav items

- `flags` map key — e.g. `grocery.substitutions`
- `modules.<name>` — e.g. `modules.catalog`
- bare module name — e.g. `catalog`

Unknown keys evaluate to disabled (item hidden).

## Deferred

- React components / Vite or Next.js hosting
- Live IdP session binding (consume auth-client in later tasks)
- Full white-label compile at render time
