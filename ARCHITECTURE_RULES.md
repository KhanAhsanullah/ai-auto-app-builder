# Architecture Rules

Permanent architectural rules for CommerceOS AI. These rules apply to all contributors — human and AI — for the lifetime of the project.

---

## 1. Never Regenerate Architecture

The platform architecture was approved in Sprint 0 and established in Sprint 1. Do not redesign, restructure, or regenerate the monorepo layout, control-plane vs data-plane separation, or module composition model without explicit stakeholder approval and a formal ADR.

**Approved layout:**

```
apps/       → Deployable applications
packages/   → Shared libraries
modules/    → Domain feature modules (core + verticals)
platform/   → Control-plane services
schemas/    → JSON Schema contracts
tooling/    → CLI, generators, lint utilities
infra/      → Infrastructure as Code
docs/       → Documentation
```

## 2. Never Modify Completed Sprint Without Approval

Work tagged and committed as part of a completed sprint task must not be modified without explicit approval. Completed sprint deliverables are stable contracts for downstream sprints.

- Do not refactor, rename, or remove Sprint 1 foundation code unless a new sprint task explicitly covers it
- Do not alter JSON Schema contracts in `schemas/` without a versioning and migration plan
- Tag boundaries (`sprint1-task2`, `sprint1-task3`, etc.) mark immutable checkpoints

## 3. Configuration-First Architecture

Runtime behavior is driven by tenant configuration, not hardcoded logic.

- All tenant-specific behavior flows from the configuration contract in `schemas/tenant-config/`
- Resolution order: **platform defaults → vertical preset → tenant override → environment**
- Use `@ai-commerce/config-schema` for validation and `@ai-commerce/config-runtime` for resolution
- New features must declare their config surface in JSON Schema before implementation

## 4. Modular Architecture

Features are composed from isolated, reusable modules — not monolithic applications.

- **Core modules** (`modules/core/`) — catalog, cart, checkout, order, payment, customer, inventory, etc.
- **Vertical modules** (`modules/verticals/`) — grocery, pharmacy, restaurant, fashion, electronics, ecommerce
- Each module exposes a manifest, clean boundaries, and its own README
- Modules must not depend on apps; apps depend on modules and packages

## 5. SOLID Principles

All module and service code must follow SOLID:

- **S** — Single Responsibility: one reason to change per class/module
- **O** — Open/Closed: extend via config, plugins, and composition — not modification of core
- **L** — Liskov Substitution: interfaces and abstractions must be substitutable
- **I** — Interface Segregation: small, focused interfaces over fat ones
- **D** — Dependency Inversion: depend on abstractions; infrastructure implements domain contracts

## 6. Clean Architecture

Modules follow Domain → Application → Infrastructure separation:

- **Domain** — entities, value objects, domain services (no framework imports)
- **Application** — use cases, orchestration, ports
- **Infrastructure** — adapters, persistence, external APIs

Dependencies point inward. Domain never imports from infrastructure.

## 7. No Hardcoded Values

Nothing tenant-specific, environment-specific, or business-rule-specific may be hardcoded.

- Branding, feature flags, payment providers, auth methods, navigation, and theme tokens come from config
- Platform-wide defaults live in `@ai-commerce/config-runtime` defaults — not inline in app code
- Constants that are truly universal (HTTP status codes, schema version identifiers) are acceptable; business values are not

## 8. Everything Tenant-Aware

Every runtime path must account for multi-tenancy:

- Requests carry tenant context (ID, slug, or domain)
- Data access is scoped to the active tenant
- Config resolution is per-tenant with vertical inheritance
- Caching keys include tenant identity
- Events and logs include tenant metadata

## 9. Everything Configurable

If a behavior can vary between tenants or verticals, it must be configurable:

- Declare the config surface in JSON Schema first
- Generate types and validators via `@ai-commerce/config-schema`
- Resolve at runtime via `@ai-commerce/config-runtime`
- Document the config key in the module README and schema examples

No "we'll make it configurable later." Configurability is a requirement at feature design time.

---

## Enforcement

- Architecture rules are referenced in [AGENTS.md](./AGENTS.md) for AI assistants
- Significant violations require an ADR in `docs/adr/` before proceeding
- Code review must verify compliance with these rules before merge
