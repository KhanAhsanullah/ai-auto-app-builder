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
| Task 3 | ⬜     | `AuthClient` facade, multi-surface helpers, integration docs                                        |

All Sprint 6 code lives in `@ai-commerce/auth-client` (`packages/auth-client`). Authentication JSON Schema remains owned by Sprint 1 `config-schema`.

---

## Sprint 7 — API Gateway

- Unified API entry point with tenant routing
- Rate limiting, auth middleware, config injection
- `@ai-commerce/apps/api-gateway`

---

## Sprint 8 — Dashboard

- Admin Dashboard implementation
- Config-driven navigation, feature flags, and branding
- Merchant and operator workflows
- `@ai-commerce/apps/admin-dashboard`

---

## Sprint 9 — Mobile App

- Mobile commerce surface
- Config-driven screens, theme, and navigation
- `@ai-commerce/apps/mobile-app`, `@ai-commerce/ui-mobile`

---

## Sprint 10 — AI Commerce Engine

- AI config generation and theme creation
- Catalog enrichment and admin copilot
- Guarded AI actions with schema validation
- `@ai-commerce/ai-orchestrator`

---

## Sprint Conventions

- Each sprint task is committed with a Conventional Commit referencing the sprint and task number
- Completed sprint tasks receive a git tag (`sprint{N}-task{M}`)
- Sprint deliverables must not be modified without approval (see [ARCHITECTURE_RULES.md](./ARCHITECTURE_RULES.md))
- Sprint status is tracked in [PROJECT_STATUS.md](./PROJECT_STATUS.md)
