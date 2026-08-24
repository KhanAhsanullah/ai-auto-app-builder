# Mobile App Architecture

Config-driven consumer mobile surface for CommerceOS AI (React Native).

## Overview

`@ai-commerce/mobile-app` turns tenant configuration (`navigation.mobile`, `featureFlags`, `branding`, `mobileApp`) into a resolved shell model. React Native presentation is deferred to Sprint 9 Task 2–3.

## Boundaries

```
Tenant config (ConfigProvider.resolve)
        ↓
toResolveMobileAppShellInput
        ↓
MobileAppShellResolver
        ├── FeatureFlagEvaluator
        ├── MobileNavigationResolver
        └── MobileBrandingResolver
        ↓
ResolvedMobileAppShell
        ↓
(Task 2) Screen registry + RN bottom-bar layout
(Task 3) createMobileApp facade
```

| Concern                          | Owner                             |
| -------------------------------- | --------------------------------- |
| Navigation / flags schema        | Sprint 1 `config-schema`          |
| Config merge / validation        | `@ai-commerce/config-runtime`     |
| RN theme tokens                  | `@ai-commerce/theme-engine`       |
| Mobile brand assets              | `@ai-commerce/white-label-engine` |
| Shell resolution                 | `@ai-commerce/mobile-app`         |
| RN UI / `@ai-commerce/ui-mobile` | Sprint 9 Task 2–3                 |

## Sprint 9 Task Breakdown

| Task   | Deliverable                                                       |
| ------ | ----------------------------------------------------------------- |
| Task 1 | Shell foundation — nav, feature flags, branding, identity/runtime |
| Task 2 | Screen registry + React Native bottom-bar layout shell            |
| Task 3 | `createMobileApp` facade, app entry helpers, integration docs     |

## Deferred

- Expo / RN CLI host project
- Native store builds
- Push notification provider wiring
- Live IdP session binding
