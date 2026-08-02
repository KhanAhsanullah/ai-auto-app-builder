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

| Task   | Status  | Deliverable                                                                                       |
| ------ | ------- | ------------------------------------------------------------------------------------------------- |
| Task 1 | ✅      | Theme schema updates, presets, ThemeResolver, ModeResolver, Live Preview, plugin extension points |
| Task 2 | ✅      | TokenNormalizer, emitters, ThemeCompiler, ThemeCache                                              |
| Task 3 | Planned | ThemeProvider facade, integration tests, docs                                                     |

**Tag:** `sprint2-task1` (on Task 1 completion)

All Sprint 2 code lives in `@ai-commerce/theme-engine` only. Theme service deferred to a later sprint.

---

## Sprint 3 — White Label Engine

- Custom domain management and SSL provisioning
- App identity (bundle IDs, store listings)
- Branded legal and communications templates
- `@ai-commerce/white-label-engine`

---

## Sprint 4 — Tenant Provisioning

- Tenant onboarding workflows
- Seed data and vertical preset application
- Environment and namespace provisioning
- `@ai-commerce/tenant-provisioner`

---

## Sprint 5 — Plugin Engine

- Plugin manifest schema and registry
- Plugin discovery, installation, and lifecycle
- Event-driven plugin hooks
- `@ai-commerce/plugin-registry`

---

## Sprint 6 — Authentication

- Tenant-scoped authentication configuration
- Auth provider abstraction (OAuth, SSO, magic link)
- `@ai-commerce/auth-client` integration across surfaces

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
