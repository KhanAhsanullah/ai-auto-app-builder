# Architecture

System architecture reference for the AI White-Label Commerce Platform.

## Approved Architecture

The platform architecture was approved in Sprint 0. It defines:

- Multi-tenant, configuration-driven commerce SaaS
- Four generated surfaces: Admin Dashboard, Web Store, Mobile App, API Backend
- Core + vertical module composition
- Control plane (config, theme, AI, white-label) + data plane separation
- Plugin extensibility and event-driven integration

## Feature Architecture

| Document                             | Scope                                                                   |
| ------------------------------------ | ----------------------------------------------------------------------- |
| [theme-engine.md](./theme-engine.md) | Theme Engine — presets, resolver, live preview, plugin extension points |

## Monorepo Layout

```
apps/       → Deployable applications
packages/   → Shared libraries
modules/    → Domain feature modules
platform/   → Control-plane services
schemas/    → JSON Schema contracts
tooling/    → CLI and generators
infra/      → Infrastructure as Code
docs/       → Documentation
```

## Principles

1. Configuration over code
2. Clean Architecture in modules
3. Feature-first organization
4. SOLID principles
5. Production-ready, reusable modules

## ADRs

Significant decisions are recorded in [../adr/](../adr/).

## Status

Sprint 2 Task 1 — theme engine foundation established. Feature documentation added per sprint.
