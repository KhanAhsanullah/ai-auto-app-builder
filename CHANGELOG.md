# Changelog

All notable changes to CommerceOS AI are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- **Orders + payment screens** (Sprint 20 Task 3) — Web Store / Mobile (React Native) + Admin
  - Auto-render on `store.payment` / `store.orders` when order (+ payment) wired; Admin `admin.orders`
  - `WebPaymentConfirmScreen`, `WebOrdersScreen`, `MobilePaymentConfirmScreen`, `MobileOrdersScreen`, `AdminOrdersScreen`

- **Cart + checkout screens** (Sprint 20 Task 2) — Web Store / Mobile (React Native) + Admin inspect
  - Auto-render on `store.cart` / `store.checkout` when cart/checkout wired; Admin `admin.carts`
  - `WebCartScreen`, `WebCheckoutScreen`, `MobileCartScreen`, `MobileCheckoutScreen`, `AdminCartsScreen`
  - Catalog Add-to-cart when cart + session id present (Web)

- **Catalog screens** (Sprint 20 Task 1) — Web Store / Admin / Mobile (React Native)
  - Auto-render product lists on `store.catalog` / `admin.catalog` when catalog is wired
  - `WebCatalogScreen`, `AdminCatalogScreen`, `MobileCatalogScreen`

- **Surface order/payment wiring** (Sprint 19 Task 3) — Web / Admin / Mobile
  - Optional `orders` / `payments` on create facades; `orderSurface` / `paymentSurface`
  - `adaptCheckoutLookup` / `adaptOrderLookup` helpers
  - End-to-end buy-path tests (catalog → cart → checkout → order → capture)

- **Surface cart/checkout wiring** (Sprint 19 Task 2) — Web / Admin / Mobile
  - Optional `cart` / `checkout` on create facades; `cartSurface` / `checkoutSurface`
  - `adaptCatalogProductLookup` / `adaptCartLookup` helpers
  - Store/Mobile: getOrCreate, add from catalog, start checkout; Admin: list/get inspect

- **Surface catalog wiring** (Sprint 19 Task 1) — Web Store / Admin Dashboard / Mobile App
  - Optional `catalog` on `createWebStore` / `createAdminDashboard` / `createMobileApp`
  - `catalogSurface` — feature-flag gated (`modules.catalog`), tenant-scoped product access
  - Store/Mobile: list active / search / by slug; Admin: CRUD

- **Core payment facade** (Sprint 18 Task 3) — `@ai-commerce/module-payment`
  - `PaymentModule` / `createPaymentModule` — unified create/status/list entrypoints
  - Surface wiring guidance (Web / Admin / Mobile) in architecture docs

- **Core payment helpers** (Sprint 18 Task 2) — `@ai-commerce/module-payment`
  - `authorizePaymentIntent` / `capturePaymentIntent` / `failPaymentIntent` / `cancelPaymentIntent`
  - Optional `PaymentGatewayPort` for provider adapters
  - Capture strategy rules (`immediate` vs `authorize_then_capture`)

- **Core payment intents** (Sprint 18 Task 1) — `@ai-commerce/module-payment`
  - `PaymentService` — create intent from payable order (idempotent), get, list
  - `OrderLookup` port + `InMemoryPaymentRepository`
  - Status model: pending → authorized → captured (transitions in Task 2)

- **Core order facade** (Sprint 17 Task 3) — `@ai-commerce/module-order`
  - `OrderModule` / `createOrderModule` — unified create/status/list entrypoints
  - Surface wiring guidance (Web / Admin / Mobile) in architecture docs

- **Core order helpers** (Sprint 17 Task 2) — `@ai-commerce/module-order`
  - `confirmOrder` / `fulfillOrder` status transitions
  - `listOrdersByCart` / `listOrdersByCustomer` + filtered `listOrders`
  - Optional `customerId` on order / checkout snapshot

- **Core order foundation** (Sprint 17 Task 1) — `@ai-commerce/module-order`
  - `OrderService` — create from completed checkout, get, list, cancel
  - `CheckoutLookup` port + `OrderRepository` / `InMemoryOrderRepository`
  - Architecture doc — `docs/architecture/order.md`

- **Core checkout facade** (Sprint 16 Task 3) — `@ai-commerce/module-checkout`
  - `CheckoutModule` / `createCheckoutModule` — unified cart → complete entrypoints
  - Surface wiring guidance (Web / Mobile + cart adapter) in architecture docs

- **Core checkout helpers** (Sprint 16 Task 2) — `@ai-commerce/module-checkout`
  - `getActiveCheckoutByCart` + repository `findActiveByCartId`
  - Optional `ShippingMethodCatalog` + `listShippingMethods` / `selectShippingMethodById`
  - Catalog price validation on inline `selectShippingMethod` when configured

- **Core checkout foundation** (Sprint 16 Task 1) — `@ai-commerce/module-checkout`
  - `CheckoutService` — start from cart, address, shipping, complete/cancel
  - `CartLookup` port + `CheckoutRepository` / `InMemoryCheckoutRepository`
  - Architecture doc — `docs/architecture/checkout.md`

- **Core cart facade** (Sprint 15 Task 3) — `@ai-commerce/module-cart`
  - `CartModule` / `createCartModule` — unified getOrCreate + line item entrypoints
  - Surface wiring guidance (Web / Mobile + catalog adapter) in architecture docs

- **Core cart helpers** (Sprint 15 Task 2) — `@ai-commerce/module-cart`
  - `getOrCreateBySession` / `getOrCreateByCustomer`
  - Optional `CatalogProductLookup` + `addItemFromCatalog` / price validation on `addItem`

- **Core cart foundation** (Sprint 15 Task 1) — `@ai-commerce/module-cart`
  - `CartService` — create cart, add/merge lines, set quantity, clear
  - `CartRepository` + `InMemoryCartRepository`
  - Architecture doc — `docs/architecture/cart.md`

- **Core catalog facade** (Sprint 14 Task 3) — `@ai-commerce/module-catalog`
  - `CatalogModule` / `createCatalogModule` — unified CRUD + query entrypoints
  - Surface wiring guidance (Web / Admin / Mobile) in architecture docs

- **Core catalog queries** (Sprint 14 Task 2) — `@ai-commerce/module-catalog`
  - `listProducts` filters: category, status / activeOnly, search
  - `listProductsByCategory`, `listActiveProducts`, `searchProducts`, `getCategoryBySlug`

- **Core catalog foundation** (Sprint 14 Task 1) — `@ai-commerce/module-catalog`
  - `CatalogService` — tenant-scoped category + product CRUD (variants, slugs, SKUs)
  - `CatalogRepository` + `InMemoryCatalogRepository`
  - Architecture doc — `docs/architecture/catalog.md`

- **Config engine facade** (Sprint 13 Task 3) — `@ai-commerce/config-engine`
  - `ConfigEngine` / `createConfigEngine` — unified draft + publish entrypoints
  - Optional `onPublish` listeners for Build Orchestrator wiring

- **Config engine publish workflow** (Sprint 13 Task 2) — `@ai-commerce/config-engine`
  - `PublishConfigService` — draft → published, stamp `meta.configVersion`
  - `ConfigPublishEvent` + `InMemoryConfigPublishEmitter` (Build Orchestrator–aligned)
  - Repository `update` + latest draft/published lookups

- **Config engine draft foundation** (Sprint 13 Task 1) — `@ai-commerce/config-engine`
  - `ConfigValidationService` — validate via `@ai-commerce/config-runtime` ConfigProvider
  - `DraftConfigService` — monotonic draft revisions (save / get / list)
  - `ConfigRepository` + `InMemoryConfigRepository`
  - Architecture doc — `docs/architecture/config-engine.md`

- **Build orchestrator facade** (Sprint 12 Task 3) — `@ai-commerce/build-orchestrator`
  - `BuildOrchestrator` / `createBuildOrchestrator` — enqueue, execute, `onConfigPublish`
  - Config publish event contract + facade unit tests

- **Build orchestrator executor** (Sprint 12 Task 2) — `@ai-commerce/build-orchestrator`
  - `BuildExecutor` — queued job → plan → simulated steps → terminal status
  - `BuildArtifactRef` + `ArtifactStore` / `InMemoryArtifactStore`
  - Job fields `completedStepIds` / `artifactIds`

- **Build orchestrator foundation** (Sprint 12 Task 1) — `@ai-commerce/build-orchestrator`
  - `BuildPlanner` — config publish request → multi-surface plan
  - Build job status machine (`queued` → `planning` → `running` → terminal)
  - `BuildJobRepository` port + `InMemoryBuildJobRepository`
  - Architecture doc — `docs/architecture/build-orchestrator.md`

- **Web store facade + app entry** (Sprint 11 Task 3) — `@ai-commerce/web-store`
  - `WebStore` / `createWebStore` — config → shell + registry facade
  - `WebStoreApp` — stateful React entry with branded default screens
  - `mountWebStore` — DOM mount helper for SPA / embed hosts
  - Facade + app unit/integration tests

- **Web store screen registry + React layout** (Sprint 11 Task 2) — `@ai-commerce/web-store`
  - `WebScreenRegistry` / `createDefaultWebScreenRegistry` — `store.*` route map
  - `buildWebShellViewModel` — shell + registry view-model for layout
  - React shell — `WebShellLayout`, `WebHeader`, `WebTopNav`, `WebFooter` via `./react`
  - Vitest coverage with jsdom + Testing Library

- **Web store shell foundation** (Sprint 11 Task 1) — `@ai-commerce/web-store`
  - `FeatureFlagEvaluator` — `flags.*` and `modules.*` evaluation
  - `WebNavigationResolver` — visibility + feature-flag gated web nav
  - `WebBrandingResolver` — branding / favicon / OG slice
  - `WebStoreShellResolver` — composed shell (nav, domain, SEO, rendering, landing route)
  - Config Runtime mapping — `toResolveWebStoreShellInput`
  - Architecture doc — `docs/architecture/web-store.md`

- **AI orchestrator facade** (Sprint 10 Task 3) — `@ai-commerce/ai-orchestrator`
  - `AiOrchestrator` / `createAiOrchestrator` — unified generation + copilot entrypoint
  - Facade unit tests and architecture docs update

- **AI generation adapters** (Sprint 10 Task 2) — `@ai-commerce/ai-orchestrator`
  - `ConfigGenerationAdapter` / `ThemeGenerationAdapter` / `CatalogGenerationAdapter`
  - `createGenerationAdapters` — brief → `AiProvider` → schema-validated `AiProposal`
  - Prompt builders, `parseProviderJson`, `inferTouchedFields`

- **AI orchestrator guardrails + proposals** (Sprint 10 Task 1) — `@ai-commerce/ai-orchestrator`
  - `AiGuardPolicyResolver` / `AiActionGuard` — tenant AI policy, locked fields, copilot gates
  - `AiOutputValidator` — schema-bound validation via `@ai-commerce/config-schema`
  - `AiProposalFactory` / `createAiGuardContext` — guarded, reviewable proposals
  - `AiProvider` port + `StubAiProvider`; `toAiSettings` Config Runtime mapping
  - Architecture doc — `docs/architecture/ai-orchestrator.md`

- **Mobile app facade + RN app entry** (Sprint 9 Task 3) — `@ai-commerce/mobile-app`
  - `MobileApp` / `createMobileApp` — config → shell + registry facade
  - `MobileAppRoot` — stateful React Native entry with branded default screens
  - Facade + root unit/integration tests

- **Mobile app screen registry + RN layout** (Sprint 9 Task 2) — `@ai-commerce/mobile-app`
  - `MobileScreenRegistry` / `createDefaultMobileScreenRegistry` — `store.*` route map
  - `buildMobileShellViewModel` — shell + registry view-model for layout
  - React Native shell — `MobileShellLayout`, `MobileBottomBar`, `MobileHeader` via `./native`
  - Vitest coverage with RN host mocks

- **Mobile app shell foundation** (Sprint 9 Task 1) — `@ai-commerce/mobile-app`
  - `FeatureFlagEvaluator` — `flags.*` and `modules.*` evaluation
  - `MobileNavigationResolver` — visibility + feature-flag gated mobile nav
  - `MobileBrandingResolver` — branding / splash / app icon slice
  - `MobileAppShellResolver` — composed shell (nav, identity, runtime, landing route)
  - Config Runtime mapping — `toResolveMobileAppShellInput`
  - Architecture doc — `docs/architecture/mobile-app.md`
  - Unit + Config Runtime integration tests

- **Admin dashboard facade + app entry** (Sprint 8 Task 3) — `@ai-commerce/admin-dashboard`
  - `AdminDashboard` / `createAdminDashboard` — config → shell + registry facade
  - `AdminDashboardApp` — stateful React entry with branded default screens
  - `mountAdminDashboard` — DOM mount helper for SPA / embed hosts
  - Facade + app unit/integration tests

- **Admin dashboard screen registry + React layout** (Sprint 8 Task 2) — `@ai-commerce/admin-dashboard`
  - `AdminScreenRegistry` / `createDefaultAdminScreenRegistry` — route → screen map
  - `buildAdminShellViewModel` — shell + registry view-model for layout
  - React shell — `AdminShellLayout`, `AdminSidebar`, `AdminHeader` via `./react`
  - Vitest + Testing Library coverage for registry and layout

- **Admin dashboard shell foundation** (Sprint 8 Task 1) — `@ai-commerce/admin-dashboard`
  - `FeatureFlagEvaluator` — `flags.*` and `modules.*` evaluation
  - `AdminNavigationResolver` — visibility + feature-flag gated admin nav
  - `AdminBrandingResolver` — branding slice for the admin shell
  - `AdminDashboardShellResolver` — composed shell (nav, layout, widgets, preferences)
  - Config Runtime mapping — `toResolveAdminDashboardShellInput`
  - Architecture doc — `docs/architecture/admin-dashboard.md`
  - Unit + Config Runtime integration tests

- **API Gateway facade + Node HTTP adapter** (Sprint 7 Task 3) — `@ai-commerce/api-gateway`
  - `ApiGateway` / `createApiGateway` — public facade for pipeline + listen
  - `createNodeHttpServer` — Node `IncomingMessage` ↔ `GatewayRequest` / `GatewayResponse`
  - JSON body + query parsing; optional `trustProxy` for `x-forwarded-for`
  - Facade + adapter unit/integration tests (ephemeral port listen)

- **API Gateway auth middleware** (Sprint 7 Task 2) — `@ai-commerce/api-gateway`
  - `createAuthMiddleware` — Bearer / session / API-key validation via `@ai-commerce/auth-client` policy resolution
  - `GatewayCredentialValidator` port + `InMemoryCredentialValidator` for tests
  - Route opt-in — `requireAuth` / `authSurface` on `GatewayRoute`
  - Credential extraction — Authorization Bearer/ApiKey, `x-api-key`, `cos_session` cookie, `x-session-token`
  - 401 mapping with `WWW-Authenticate: Bearer`
  - Unit + pipeline auth coverage

- **API Gateway foundation** (Sprint 7 Task 1) — `@ai-commerce/api-gateway`
  - `TenantResolver` — header / subdomain tenant identity resolution
  - `RouteMatcher` — method + `:param` path matching
  - `InMemoryRateLimiter` — fixed-window rate limiting
  - `ConfigInjector` — Config Runtime validation gate into request context
  - `createGatewayPipeline` — core middleware stack with HTTP-like error mapping
  - Architecture doc — `docs/architecture/api-gateway.md`
  - Unit + integration tests

- **AuthClient facade** (Sprint 6 Task 3) — `@ai-commerce/auth-client`
  - `AuthClient` / `createAuthClient` — public facade for policy, OAuth, magic link, SSO, sessions
  - Multi-surface helpers — `resolveAllSurfacePolicies`, `listEnabledMethodsBySurface`, `sessionStorageKey`
  - `./internal` export for advanced modules
  - Facade unit + Config Runtime integration coverage
  - Admin sessions without refresh remain usable until absolute expiry

- **Auth flow adapters** (Sprint 6 Task 2) — `@ai-commerce/auth-client`
  - PKCE helpers — verifier, S256 challenge, state, authorization URL builder
  - `OAuthPkceProvider` — authorization-code + PKCE with injectable HTTP client
  - `MagicLinkProvider` — email magic-link start/complete via delivery port
  - `SsoChallengeProvider` — admin OIDC (PKCE) and SAML challenge flows
  - `TokenRefreshService` — refresh-token grant + TokenStore persistence
  - `PrefixedSecureTokenStore` / `InMemoryKeyValueStore` — localStorage-compatible storage
  - Unit tests for PKCE, OAuth, magic link, SSO, refresh, and storage

- **Auth policy foundation** (Sprint 6 Task 1) — `@ai-commerce/auth-client`
  - `AuthPolicyValidator` — semantic cross-field authentication config validation
  - `AuthPolicyResolver` — surface-scoped policies (customer / admin / api)
  - `AuthProvider` / `TokenStore` / `AuthChallengePort` — provider ports
  - `AuthProviderRegistry`, `StubAuthProvider`, `InMemoryTokenStore`
  - Config Runtime mapping — `authConfigSourceFromProviderResult`, `toResolveAuthPolicyInput`
  - Architecture doc — `docs/architecture/authentication.md`
  - Unit + Config Runtime integration tests

- **PluginRegistry facade and hook dispatch** (Sprint 5 Task 3) — `@ai-commerce/plugin-registry`
  - `PluginRegistry` / `createPluginRegistry` — public facade for catalog, install, lifecycle, handlers, dispatch
  - `PluginHandlerRegistry` — global in-process handler registration keyed by `(pluginId, handlerId)`
  - `PluginActivationService` + `TenantHandlerActivationStore` — enable activates; disable/uninstall deactivate
  - `HookDispatcher` — tenant-scoped, priority-ordered, fail-fast sync dispatch (async handlers awaited)
  - `./internal` export for advanced modules
  - Architecture doc — `docs/architecture/plugin-engine.md`
  - Unit and integration tests for handler registry, activation, dispatch, and facade E2E

- **TenantProvisioner facade** (Sprint 4 Task 3) — `@ai-commerce/tenant-provisioner`
  - `TenantProvisioner` — public facade for provision + activate workflows
  - `createTenantProvisioner` — factory with default repository and ConfigProvider wiring
  - `ProvisioningService` / `LifecycleService` — internal orchestration via `./internal`
  - `provisioning-result.schema.json` — summary output contract with generated types/Zod
  - `TenantRepository.update()` — activation persistence with immutable id/slug
  - Idempotency — explicit-id retry support; D6 duplicate detection
  - Integration tests — ConfigProvider validation gate; optional Theme/WhiteLabel consumability
  - Architecture doc — `docs/architecture/tenant-provisioning.md`

- **Vertical onboarding seeds and environment initialization** (Sprint 4 Task 2) — `@ai-commerce/tenant-provisioner`
  - Vertical seed templates at `modules/verticals/{vertical}/seeds/onboarding.template.json`
  - `VerticalSeedLoader` — static import map with seed sanitization (internal)
  - `EnvironmentBuilder` — slug-derived environment targets (internal)
  - Extended `ConfigBuilder` pipeline — base → seed → overrides → environment → identity enforcement

- **Tenant identity and repository foundation** (Sprint 4 Task 1) — `@ai-commerce/tenant-provisioner`
  - `IdentityValidator`, `ConfigBuilder`, `TenantRepository`, `InMemoryTenantRepository`
  - `provisioning-request.schema.json` with generated `ProvisioningRequest` type
  - `computeRequestFingerprint` for idempotency preparation

- **WhiteLabelProvider facade** (Sprint 3 Task 3) — `@ai-commerce/white-label-engine`
  - `WhiteLabelProvider` — public facade for resolve + compile pipeline
  - `createWhiteLabelProvider` — factory with default resolver, compiler, cache, and emitters
  - Provider types — `ProvideBrandInput`, `ProvideBrandFromConfigInput`, `WhiteLabelProviderResult`
  - `compileFromResolvedWithMeta()` — cache-hit metadata on `BrandCompiler`
  - Integration tests — ConfigProvider → WhiteLabelProvider, cache, multi-tenant, surface selection
  - Public API cleanup — provider as primary integration point; internals via `./internal`

- **White-label asset pipeline** (Sprint 3 Task 2) — `@ai-commerce/white-label-engine`
  - Backward-compatible branding schema additions — optional `logo.appIcon` and `branding.fonts`
  - `AssetNormalizer` — canonical asset reference normalization with app icon fallback chain
  - `BrandCompiler` — manifest/reference-only compilation for web, mobile, and admin-dashboard surfaces
  - `BrandCache` — in-memory LRU cache keyed by asset hash and surfaces
  - Surface emitters — web link descriptors, mobile icon metadata, admin header/favicon references
  - Deterministic asset hash, extended brand hash for font assets, engine output schemas
  - Unit and Config Runtime integration tests

- **White-label brand foundation** (Sprint 3 Task 1) — `@ai-commerce/white-label-engine`
  - `BrandResolver` — platform → vertical → tenant → environment branding merge
  - Platform and vertical brand defaults (all six verticals)
  - `toResolveBrandInput` / `brandConfigSourceFromProviderResult` — Config Runtime mapping without re-resolution
  - Deterministic SHA-256 brand hash and layer audit metadata
  - Unit and Config Runtime integration tests
  - Platform scaffold renamed to `@ai-commerce/white-label-engine-service`

- **ThemeProvider facade** (Sprint 2 Task 3) — `@ai-commerce/theme-engine`
  - `ThemeProvider` — public facade for resolve + compile pipeline
  - `createThemeProvider` — factory with default resolver, compiler, cache, and emitters
  - `ThemeConfigSource` — structural type for Config Runtime integration without re-resolution
  - `toResolveThemeInput` — maps resolved config output to theme resolver input
  - Public API cleanup — stable exports via main entry; internals via `./internal`
  - Integration tests — ConfigProvider → ThemeProvider, cache, multi-tenant, presets, light/dark

- **Theme compiler & emitters** (Sprint 2 Task 2) — `@ai-commerce/theme-engine`
  - `TokenNormalizer` — canonical normalized design tokens from resolved themes
  - `ThemeCompiler` — orchestrates resolve → normalize → emit pipeline
  - `ThemeCache` — in-memory LRU cache for compiled artifacts
  - `CssVariablesEmitter` — CSS custom properties with light/dark mode support
  - `TailwindEmitter` — Tailwind theme extension configuration
  - `ReactNativeEmitter` — React Native theme objects per mode
  - `AdminDashboardTokenEmitter` — admin semantic tokens and CSS variables
  - Unit and snapshot tests for all compiler and emitter modules

---

## [0.1.0] — 2026-08-02

Sprint 1 complete. Monorepo foundation, configuration schema, and configuration runtime.

### Added

- **Monorepo foundation** (Sprint 1 Task 1)
  - Turborepo monorepo with pnpm workspaces
  - ESLint, Prettier, Husky, Commitlint tooling
  - Package scaffolds: apps, packages, modules, platform, schemas, tooling, infra
  - Approved architecture layout documented in `docs/architecture/`

- **Configuration schema** (Sprint 1 Task 2) — `@ai-commerce/config-schema`
  - JSON Schema contracts in `schemas/tenant-config/v1/` (18+ domain schemas)
  - Generated TypeScript interfaces and Zod validators
  - Schema versioning, references, and migration documentation
  - Tag: `sprint1-task2`

- **Configuration runtime** (Sprint 1 Task 3) — `@ai-commerce/config-runtime`
  - `ConfigLoader` — parse JSON strings, objects, and files
  - `ConfigResolver` — merge inheritance chain with deep merge
  - `ConfigValidator` — validate against Zod schemas
  - `ConfigCache` — in-memory LRU cache with optional TTL
  - `ConfigProvider` — facade combining load → resolve → validate → cache
  - Platform and vertical default presets
  - Full test suite with Vitest
  - Tag: `sprint1-task3`

- **Documentation**
  - `PROJECT_STATUS.md` — project status tracker
  - `PRODUCT_VISION.md` — vision, mission, and roadmap
  - `ARCHITECTURE_RULES.md` — permanent architectural rules
  - `SPRINT_BOARD.md` — sprint roadmap
  - `CONTRIBUTING.md` — contribution guidelines
  - `AGENTS.md` — AI assistant guidelines
  - `CHANGELOG.md` — version history

### Infrastructure

- Node.js >= 20, pnpm >= 9, TypeScript 5.7
- Conventional Commits enforced via Commitlint

---

## Version History

| Version | Sprint   | Tag             | Commit    | Description                                          |
| ------- | -------- | --------------- | --------- | ---------------------------------------------------- |
| 0.1.0   | Sprint 1 | `sprint1-task3` | `162fab4` | Monorepo foundation + config schema + config runtime |

[Unreleased]: https://github.com/your-org/ai-commerce-platform/compare/sprint1-task3...HEAD
[0.1.0]: https://github.com/your-org/ai-commerce-platform/releases/tag/sprint1-task3
