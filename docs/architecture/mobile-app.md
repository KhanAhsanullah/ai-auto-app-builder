# Mobile App Architecture

Config-driven consumer mobile surface for CommerceOS AI (React Native).

## Overview

`@ai-commerce/mobile-app` resolves tenant configuration into a shell model, maps `store.*` routes through `MobileScreenRegistry`, and renders a React Native layout with header + bottom tab bar.

## Boundaries

```
Tenant config (ConfigProvider.resolve)
        ↓
toResolveMobileAppShellInput
        ↓
MobileAppShellResolver
        ↓
MobileScreenRegistry + buildMobileShellViewModel
        ↓
MobileShellLayout (RN) — header / content / bottom bar
        ↓
(Task 3) createMobileApp facade
```

| Concern                          | Owner                             |
| -------------------------------- | --------------------------------- |
| Navigation / flags schema        | Sprint 1 `config-schema`          |
| Config merge / validation        | `@ai-commerce/config-runtime`     |
| RN theme tokens                  | `@ai-commerce/theme-engine`       |
| Mobile brand assets              | `@ai-commerce/white-label-engine` |
| Shell + screen registry + layout | `@ai-commerce/mobile-app`         |
| App facade                       | Sprint 9 Task 3                   |

## Sprint 9 Task Breakdown

| Task   | Deliverable                                                   |
| ------ | ------------------------------------------------------------- |
| Task 1 | Shell foundation — nav, feature flags, branding, identity     |
| Task 2 | Screen registry + React Native bottom-bar layout shell        |
| Task 3 | `createMobileApp` facade, app entry helpers, integration docs |

## Deferred

- Expo / RN CLI host project (`createMobileApp` Task 3)
- Native store builds
- Push notification provider wiring
- Live IdP session binding
