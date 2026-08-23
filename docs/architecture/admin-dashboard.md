# Admin Dashboard Architecture

Config-driven merchant admin surface for CommerceOS AI.

## Overview

`@ai-commerce/admin-dashboard` turns tenant configuration into a resolved shell model, maps navigation routes through an `AdminScreenRegistry`, and renders a React layout (`AdminShellLayout`) with sidebar, header, and content.

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
AdminScreenRegistry + buildAdminShellViewModel
        ↓
AdminShellLayout (React) — sidebar / header / content
        ↓
(Task 3) createAdminDashboard facade + app entry
```

| Concern                          | Owner                                |
| -------------------------------- | ------------------------------------ |
| Navigation / feature flag schema | Sprint 1 `config-schema`             |
| Config merge / validation        | `@ai-commerce/config-runtime`        |
| Theme tokens (admin-dashboard)   | `@ai-commerce/theme-engine`          |
| Brand assets                     | `@ai-commerce/white-label-engine`    |
| Shell + screen registry          | `@ai-commerce/admin-dashboard`       |
| React layout                     | `@ai-commerce/admin-dashboard/react` |
| App hosting facade               | Sprint 8 Task 3                      |

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

- Vite / Next.js app entry (`createAdminDashboard`) — Task 3
- Live IdP session binding (consume auth-client in later tasks)
- Full white-label / theme compile at render time
