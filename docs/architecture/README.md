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

| Document                                           | Scope                                                                                                                    |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| [catalog.md](./catalog.md)                         | Catalog — products, variants, categories; `CatalogService`                                                               |
| [theme-engine.md](./theme-engine.md)               | Theme Engine — presets, resolver, live preview, plugin extension points                                                  |
| [white-label-engine.md](./white-label-engine.md)   | White-Label Engine — BrandResolver, asset pipeline, WhiteLabelProvider, web/mobile/admin surfaces; HTTP service deferred |
| [tenant-provisioning.md](./tenant-provisioning.md) | Tenant Provisioning — onboarding workflow, activation, Config Runtime validation boundary                                |
| [plugin-engine.md](./plugin-engine.md)             | Plugin Engine — catalog, install/lifecycle, handler activation, hook dispatch, PluginRegistry facade                     |
| [authentication.md](./authentication.md)           | Authentication — auth policy resolution, provider ports, Config Runtime mapping; OAuth adapters deferred to Task 2+      |
| [api-gateway.md](./api-gateway.md)                 | API Gateway — tenant routing, rate limiting, config injection, auth middleware, Node HTTP facade                         |
| [admin-dashboard.md](./admin-dashboard.md)         | Admin Dashboard — shell, screen registry, React app facade                                                               |
| [mobile-app.md](./mobile-app.md)                   | Mobile App — shell, screen registry, React Native app facade                                                             |
| [web-store.md](./web-store.md)                     | Web Store — shell, screen registry, React storefront facade                                                              |
| [ai-orchestrator.md](./ai-orchestrator.md)         | AI Orchestrator — guardrails, generation adapters, facade                                                                |
| [build-orchestrator.md](./build-orchestrator.md)   | Build Orchestrator — publish-triggered rebuild plans and job tracking                                                    |
| [config-engine.md](./config-engine.md)             | Config Engine — versioned drafts, validation, publish events                                                             |

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

Sprint 3 complete — White-Label Engine library deliverables in `@ai-commerce/white-label-engine`: BrandResolver, asset pipeline (AssetNormalizer, BrandCompiler, BrandCache), surface emitters (web, mobile, admin-dashboard), and WhiteLabelProvider facade with Config Runtime integration. Control-plane HTTP service (`platform/white-label-engine` / `@ai-commerce/white-label-engine-service`) remains intentionally deferred.
