# Admin Dashboard Architecture

Config-driven merchant admin surface for CommerceOS AI.

## Overview

`@ai-commerce/admin-dashboard` resolves tenant configuration into a shell model, maps routes through `AdminScreenRegistry`, and exposes a React app via `createAdminDashboard` → `AdminDashboardApp` / `mountAdminDashboard`.

## Boundaries

```
Tenant config (ConfigProvider.resolve)
        ↓
createAdminDashboard()
        ├── AdminDashboardShellResolver
        └── AdminScreenRegistry (defaults + extras)
        ↓
AdminDashboard facade (getViewModel / registerScreen)
        ↓
AdminDashboardApp / mountAdminDashboard
        └── AdminShellLayout (sidebar / header / content)
```

| Concern                          | Owner                             |
| -------------------------------- | --------------------------------- |
| Navigation / feature flag schema | Sprint 1 `config-schema`          |
| Config merge / validation        | `@ai-commerce/config-runtime`     |
| Theme tokens (admin-dashboard)   | `@ai-commerce/theme-engine`       |
| Brand assets                     | `@ai-commerce/white-label-engine` |
| Shell + facade + React app       | `@ai-commerce/admin-dashboard`    |

## Sprint 8 Task Breakdown

| Task   | Deliverable                                                              |
| ------ | ------------------------------------------------------------------------ |
| Task 1 | Shell foundation — nav, feature flags, branding, widgets, Config mapping |
| Task 2 | Screen registry + React admin layout shell (sidebar / landing)           |
| Task 3 | `createAdminDashboard` facade, `AdminDashboardApp`, mount helper, docs   |

## Feature flag keys on nav items

- `flags` map key — e.g. `grocery.substitutions`
- `modules.<name>` — e.g. `modules.catalog`
- bare module name — e.g. `catalog`

Unknown keys evaluate to disabled (item hidden).

## Deferred

- Dedicated Vite/Next host app (embed via `mountAdminDashboard`)
- Live IdP session binding (consume auth-client)
- Full white-label / theme compile at render time
