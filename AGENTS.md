# AGENTS.md

Guidelines for AI assistants working on CommerceOS AI. Read this file before making any changes to the repository.

---

## Project Overview

**CommerceOS AI** (`ai-commerce-platform`) is a configuration-driven, multi-tenant white-label commerce SaaS platform. It enables agencies, enterprises, and vertical operators to launch branded commerce experiences — Admin Dashboard, Web Store, Mobile App, and API Backend — from a single JSON Schema configuration contract.

**Current state:** Sprints 1–6 complete (through Authentication / AuthClient facade). Next sprint: API Gateway (Sprint 7).

**Key packages (Sprint 1 deliverables):**

- `@ai-commerce/config-schema` — JSON Schema → TypeScript + Zod
- `@ai-commerce/config-runtime` — load, resolve, validate, cache tenant config

---

## Architecture Overview

```
apps/       → Deployable applications (admin-dashboard, web-store, mobile-app, api-gateway, platform-api, worker)
packages/   → Shared libraries (config-schema, config-runtime, ui-*, sdk-*, auth-client, theme-engine, etc.)
modules/    → Domain modules
              core/      → catalog, cart, checkout, order, payment, customer, inventory, tenant, media, notification
              verticals/ → grocery, pharmacy, restaurant, fashion, electronics, ecommerce
platform/   → Control-plane services (config-engine, theme-engine-service, white-label-engine, ai-orchestrator, plugin-registry, tenant-provisioner, build-orchestrator)
schemas/    → Canonical JSON Schema definitions (tenant-config, theme, navigation, plugin-manifest, feature-manifest)
tooling/    → CLI, generators, config-linter
infra/      → Docker, Kubernetes, Terraform
docs/       → Architecture docs, ADRs, vertical guides
```

**Control plane vs data plane:**

- **Platform services** manage tenants, config, themes, builds, and AI
- **Apps + modules** serve end-user and merchant runtime requests
- Config publish events trigger rebuilds across all generated surfaces

**Configuration inheritance:**

```
Platform Defaults → Vertical Defaults → Tenant Configuration → Environment Overrides
```

---

## Coding Rules

1. **Configuration-first** — Runtime behavior from tenant config, never hardcoded business values
2. **Clean Architecture** — Domain → Application → Infrastructure in modules; dependencies point inward
3. **SOLID** — Single responsibility, open/closed via config and plugins, dependency inversion
4. **Modular** — Features in isolated modules with manifests and READMEs
5. **Tenant-aware** — Every runtime path scoped to active tenant
6. **Type-safe** — Strict TypeScript; use generated types from `@ai-commerce/config-schema`
7. **Tested** — Unit tests for all new logic in packages and platform services
8. **Documented** — Module README before merge; ADR for significant decisions

Full rules: [ARCHITECTURE_RULES.md](./ARCHITECTURE_RULES.md)

---

## Things AI Must Never Change

### Architecture

- **Never regenerate or restructure the monorepo layout** — the approved architecture is fixed
- **Never move packages between `apps/`, `packages/`, `modules/`, `platform/`** without explicit approval and ADR
- **Never introduce a new top-level directory** without approval

### Completed Sprint Work

- **Never modify Sprint 1 deliverables** without explicit user approval:
  - `@ai-commerce/config-schema` and all files in `schemas/tenant-config/v1/`
  - `@ai-commerce/config-runtime` and its test suite
  - Monorepo foundation tooling (turbo, eslint, prettier, husky, commitlint configs)
- **Never alter JSON Schema contracts** without a versioning and migration plan
- **Never remove or rename git tags** (`sprint1-task2`, `sprint1-task3`)

### Configuration Contract

- **Never hardcode tenant-specific values** (branding, feature flags, payment providers, auth methods, theme tokens)
- **Never bypass config resolution** — always use `@ai-commerce/config-runtime` for tenant config
- **Never skip schema validation** — always validate against `@ai-commerce/config-schema`

### Process

- **Never commit unless explicitly asked** by the user
- **Never force push to main/master**
- **Never skip pre-commit hooks** unless explicitly requested
- **Never modify git config**

---

## Development Workflow

### Before Starting Work

1. Read [PROJECT_STATUS.md](./PROJECT_STATUS.md) for current sprint and task
2. Read [SPRINT_BOARD.md](./SPRINT_BOARD.md) for scope of the active sprint
3. Read [ARCHITECTURE_RULES.md](./ARCHITECTURE_RULES.md) for constraints
4. Check which sprint tasks are complete — do not modify completed deliverables

### During Development

1. Work within the scope of the current sprint task only
2. Declare config surfaces in JSON Schema before implementing features
3. Generate types: `pnpm --filter @ai-commerce/config-schema generate`
4. Match existing code conventions — read surrounding files before writing
5. Minimize scope — smallest correct diff; no unrelated changes
6. Add tests for new logic; run `pnpm test` before finishing

### After Completing Work

1. Verify: `pnpm typecheck && pnpm lint && pnpm test && pnpm format:check`
2. Update module README with status and usage
3. Update [PROJECT_STATUS.md](./PROJECT_STATUS.md) and [SPRINT_BOARD.md](./SPRINT_BOARD.md)
4. Update [CHANGELOG.md](./CHANGELOG.md) for notable changes
5. Do **not** commit unless the user explicitly requests it

---

## Git Workflow

### Commits

- Use Conventional Commits: `type(scope): subject`
- Reference sprint and task: `feat(config-runtime): complete configuration runtime (Sprint 1 Task 3)`
- Allowed types: feat, fix, docs, style, refactor, perf, test, build, ci, chore, revert
- Header max 100 characters; subject not in Start/Pascal/UPPER case

### Tags

- Tag completed sprint tasks: `sprint{N}-task{M}`
- Do not retag or delete existing sprint tags

### Branches

- Sprint work: `sprint/{N}/{task}`
- Features: `feat/{description}`
- Fixes: `fix/{description}`

---

## Sprint Workflow

Sprints are sequential and tagged. Each sprint delivers a cohesive milestone.

| Sprint | Theme               | Status      |
| ------ | ------------------- | ----------- |
| 1      | Monorepo Foundation | ✅ Complete |
| 2      | Theme Engine        | ✅ Complete |
| 3      | White Label Engine  | ✅ Complete |
| 4      | Tenant Provisioning | ✅ Complete |
| 5      | Plugin Engine       | ✅ Complete |
| 6      | Authentication      | ✅ Complete |
| 7      | API Gateway         | Next        |
| 8      | Dashboard           | Planned     |
| 9      | Mobile App          | Planned     |
| 10     | AI Commerce Engine  | Planned     |

### Sprint Task Checklist

- [ ] Scoped to current sprint task only
- [ ] Follows architecture rules
- [ ] Tests pass
- [ ] Module README updated
- [ ] Conventional commit with sprint reference
- [ ] Git tag applied
- [ ] Status docs updated

---

## Testing Workflow

### Commands

```bash
pnpm test                          # All workspaces
pnpm --filter @ai-commerce/config-runtime test   # Single package
```

### Framework

- **Vitest** for unit tests
- Test files in `tests/` directory or `*.test.ts` co-located with source

### Requirements

- New logic in `packages/` and `platform/` must have unit tests
- Config schema changes need validation test cases (valid + invalid inputs)
- Test config resolution inheritance, merge behavior, cache, and provider facade
- Do not test generated schema output directly — test generator inputs and runtime usage

### Before Marking Done

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm format:check
```

All four must pass.

---

## Quick Reference

| Document                                                     | Purpose                          |
| ------------------------------------------------------------ | -------------------------------- |
| [PROJECT_STATUS.md](./PROJECT_STATUS.md)                     | Current sprint, progress, health |
| [PRODUCT_VISION.md](./PRODUCT_VISION.md)                     | Vision, mission, roadmap         |
| [ARCHITECTURE_RULES.md](./ARCHITECTURE_RULES.md)             | Permanent architectural rules    |
| [SPRINT_BOARD.md](./SPRINT_BOARD.md)                         | Sprint roadmap                   |
| [CONTRIBUTING.md](./CONTRIBUTING.md)                         | Setup, standards, DoD            |
| [CHANGELOG.md](./CHANGELOG.md)                               | Version history                  |
| [docs/architecture/README.md](./docs/architecture/README.md) | System architecture              |

**Latest commit:** `34b02a4`
**Latest tag:** `sprint6-task2`
**Schema version:** v1 (`SCHEMA_VERSION`)
