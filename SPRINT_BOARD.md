# Sprint Board

CommerceOS AI development roadmap. Each sprint delivers a cohesive, tagged milestone.

---

## Sprint 1 — Monorepo Foundation ✅

| Task   | Status | Deliverable                                                                                               |
| ------ | ------ | --------------------------------------------------------------------------------------------------------- |
| Task 1 | ✅     | Monorepo foundation — workspace layout, Turborepo, tooling, package scaffolds                             |
| Task 2 | ✅     | Configuration schema — JSON Schema contracts, generated TypeScript and Zod (`@ai-commerce/config-schema`) |
| Task 3 | ✅     | Configuration runtime — load, resolve, validate, cache (`@ai-commerce/config-runtime`)                    |

**Tags:** `sprint1-task2`, `sprint1-task3`

---

## Sprint 2 — Theme Engine

| Task   | Status | Deliverable                                                                                       |
| ------ | ------ | ------------------------------------------------------------------------------------------------- |
| Task 1 | ✅     | Theme schema updates, presets, ThemeResolver, ModeResolver, Live Preview, plugin extension points |
| Task 2 | ✅     | TokenNormalizer, emitters, ThemeCompiler, ThemeCache                                              |
| Task 3 | ✅     | ThemeProvider facade, integration tests, docs                                                     |

**Tag:** `sprint2-task1` (on Task 1 completion)

All Sprint 2 code lives in `@ai-commerce/theme-engine` only. Theme service deferred to a later sprint.

---

## Sprint 3 — White Label Engine

| Task   | Status | Deliverable                                                                                           |
| ------ | ------ | ----------------------------------------------------------------------------------------------------- |
| Task 1 | ✅     | BrandResolver, platform/vertical defaults, Config Runtime mapping (`@ai-commerce/white-label-engine`) |
| Task 2 | ✅     | Asset pipeline — logo, favicon, app icon, splash, fonts, BrandCompiler, cache                         |
| Task 3 | ✅     | WhiteLabelProvider facade, integration tests, docs                                                    |

**Tags:** `sprint3-task1`, `sprint3-task2`, `sprint3-task3`

All Sprint 3 code lives in `@ai-commerce/white-label-engine` only. The HTTP service (`@ai-commerce/white-label-engine-service`) remains deferred.

---

## Sprint 4 — Tenant Provisioning ✅

| Task   | Status | Deliverable                                                                                    |
| ------ | ------ | ---------------------------------------------------------------------------------------------- |
| Task 1 | ✅     | Tenant identity validation, config builder, repository port, in-memory adapter, request schema |
| Task 2 | ✅     | Vertical onboarding seeds, environment initialization, extended config builder pipeline        |
| Task 3 | ✅     | TenantProvisioner facade, activation workflow, Config Runtime integration tests, result schema |

**Tags:** `sprint4-task1`, `sprint4-task2`, `sprint4-task3`

All Sprint 4 code lives in `@ai-commerce/tenant-provisioner` (`platform/tenant-provisioner`). HTTP service deferred.

---

## Sprint 5 — Plugin Engine ✅

| Task   | Status | Deliverable                                                                                          |
| ------ | ------ | ---------------------------------------------------------------------------------------------------- |
| Task 1 | ✅     | Plugin manifest schema, hook point catalog, ManifestValidator, CatalogService                        |
| Task 2 | ✅     | Discovery, install, dependency resolution, lifecycle, ConfigProvider gates                           |
| Task 3 | ✅     | Handler activation, HookDispatcher, PluginRegistry facade, `createPluginRegistry`, architecture docs |

**Tags:** `sprint5-task1`, `sprint5-task2`, `sprint5-task3`

All Sprint 5 code lives in `@ai-commerce/plugin-registry` (`platform/plugin-registry`). HTTP service deferred.

---

## Sprint 6 — Authentication

| Task   | Status | Deliverable                                                                                         |
| ------ | ------ | --------------------------------------------------------------------------------------------------- |
| Task 1 | ✅     | Auth policy validator/resolver, provider ports, Config Runtime mapping (`@ai-commerce/auth-client`) |
| Task 2 | ✅     | OAuth/PKCE, magic link, SSO adapters, token refresh, secure storage                                 |
| Task 3 | ✅     | `AuthClient` facade, `createAuthClient`, multi-surface helpers, integration docs                    |

**Tags:** `sprint6-task1`, `sprint6-task2`, `sprint6-task3`

All Sprint 6 code lives in `@ai-commerce/auth-client` (`packages/auth-client`). Authentication JSON Schema remains owned by Sprint 1 `config-schema`.

---

## Sprint 7 — API Gateway

| Task   | Status | Deliverable                                                                                  |
| ------ | ------ | -------------------------------------------------------------------------------------------- |
| Task 1 | ✅     | Tenant routing, route matching, rate limiting, config injection (`@ai-commerce/api-gateway`) |
| Task 2 | ✅     | Auth middleware via `@ai-commerce/auth-client`                                               |
| Task 3 | ✅     | `createApiGateway` facade, Node HTTP adapter, integration docs                               |

---

## Sprint 8 — Dashboard

| Task   | Status | Deliverable                                                                               |
| ------ | ------ | ----------------------------------------------------------------------------------------- |
| Task 1 | ✅     | Shell foundation — nav, feature flags, branding, widgets (`@ai-commerce/admin-dashboard`) |
| Task 2 | ✅     | Screen registry + React admin layout shell                                                |
| Task 3 | ✅     | `createAdminDashboard` facade, app entry, integration docs                                |

---

## Sprint 9 — Mobile App

| Task   | Status | Deliverable                                                                   |
| ------ | ------ | ----------------------------------------------------------------------------- |
| Task 1 | ✅     | Shell foundation — nav, flags, branding, identity (`@ai-commerce/mobile-app`) |
| Task 2 | ✅     | Screen registry + React Native bottom-bar layout                              |
| Task 3 | ✅     | `createMobileApp` facade, app entry helpers, integration docs                 |

---

## Sprint 10 — AI Commerce Engine

| Task   | Status | Deliverable                                                                     |
| ------ | ------ | ------------------------------------------------------------------------------- |
| Task 1 | ✅     | Guardrails + schema-bound proposals foundation (`@ai-commerce/ai-orchestrator`) |
| Task 2 | ✅     | Generation adapters (config / theme / catalog) via `AiProvider`                 |
| Task 3 | ✅     | `AiOrchestrator` / `createAiOrchestrator` facade, docs                          |

All Sprint 10 code lives in `@ai-commerce/ai-orchestrator` (`platform/ai-orchestrator`). HTTP service deferred.

**Tags:** `sprint10-task1`, `sprint10-task2`, `sprint10-task3`

---

## Sprint 11 — Web Store

| Task   | Status | Deliverable                                                                    |
| ------ | ------ | ------------------------------------------------------------------------------ |
| Task 1 | ✅     | Shell foundation — nav, flags, branding, domain/SEO (`@ai-commerce/web-store`) |
| Task 2 | ✅     | Screen registry + React storefront layout                                      |
| Task 3 | ✅     | `createWebStore` facade, app entry helpers, integration docs                   |

All Sprint 11 code lives in `@ai-commerce/web-store` (`apps/web-store`). Dedicated host app deferred.

**Tags:** `sprint11-task1`, `sprint11-task2`, `sprint11-task3`

---

## Sprint 12 — Build Orchestrator

| Task   | Status | Deliverable                                                  |
| ------ | ------ | ------------------------------------------------------------ |
| Task 1 | ✅     | Domain model, planner, status machine, in-memory job store   |
| Task 2 | ✅     | In-process executor + artifact descriptors                   |
| Task 3 | ✅     | `BuildOrchestrator` / `createBuildOrchestrator` facade, docs |

All Sprint 12 code lives in `@ai-commerce/build-orchestrator` (`platform/build-orchestrator`). HTTP / worker / CI deferred.

**Tags:** `sprint12-task1`, `sprint12-task2`, `sprint12-task3`

---

## Sprint Conventions

- Each sprint task is committed with a Conventional Commit referencing the sprint and task number
- Completed sprint tasks receive a git tag (`sprint{N}-task{M}`)
- Sprint deliverables must not be modified without approval (see [ARCHITECTURE_RULES.md](./ARCHITECTURE_RULES.md))
- Sprint status is tracked in [PROJECT_STATUS.md](./PROJECT_STATUS.md)
