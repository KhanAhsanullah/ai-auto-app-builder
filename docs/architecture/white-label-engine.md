# White-Label Engine Architecture

Architecture reference for Sprint 3 — White Label Engine.

## Overview

The White-Label Engine resolves tenant branding identity and compiles brand asset references into deterministic manifests for all platform surfaces. Sprint 3 code lives entirely in `@ai-commerce/white-label-engine` (`packages/white-label-engine`). The control-plane **white-label-engine-service** remains a deferred HTTP adapter.

**Principle:** Config Runtime resolves _what_ the tenant config is; White-Label Engine resolves _how_ branding applies across inheritance layers and surfaces.

Tenant branding input is the Sprint 1 contract:

`schemas/tenant-config/v1/branding.schema.json`

`schemas/white-label/v1/` documents engine output and engine-owned defaults. It is not a competing tenant input schema.

## Package Scope

| In scope (Sprint 3)                                | Out of scope (later sprints)               |
| -------------------------------------------------- | ------------------------------------------ |
| `packages/white-label-engine`                      | `platform/white-label-engine` HTTP service |
| `BrandResolver`, platform/vertical defaults        | Binary asset transformation                |
| `AssetNormalizer`, `BrandCompiler`, `BrandCache`   | CDN / cloud storage                        |
| Surface emitters (web, mobile, admin-dashboard)    | Domains, SSL, bundle IDs                   |
| `WhiteLabelProvider` facade and integration tests  | Build Orchestrator persistence             |
| Engine output schemas in `schemas/white-label/v1/` | App/surface integrations                   |

## Folder Structure

```
schemas/white-label/v1/
├── resolved-brand.schema.json
├── normalized-brand-assets.schema.json
├── compiled-brand.schema.json
├── presets/
│   ├── default.json
│   └── vertical/
└── examples/

packages/white-label-engine/
├── src/
│   ├── index.ts
│   ├── internal.ts
│   ├── types.ts
│   ├── errors.ts
│   ├── defaults/
│   ├── domain/
│   │   ├── brand-resolver.ts
│   │   ├── asset-normalizer.ts
│   │   ├── brand-compiler.ts
│   │   ├── white-label-provider.ts
│   │   ├── brand-emitter-registry.ts
│   │   └── map-config-brand-source.ts
│   ├── infrastructure/
│   │   ├── create-white-label-provider.ts
│   │   ├── brand-cache.ts
│   │   ├── brand-emitter-registry.ts
│   │   └── emitters/
│   └── utils/
└── tests/
```

## Resolution precedence

```
Platform brand defaults
  ↓
Vertical brand defaults (keyed by tenant.vertical)
  ↓
Tenant branding (from already-resolved config)
  ↓
Environment branding override (shallow section merge)
```

Brand defaults live in `@ai-commerce/white-label-engine/defaults/` — not in `@ai-commerce/config-runtime`.

## Provider pipeline (Task 3)

```
ConfigProvider.resolve()
        ↓
WhiteLabelProvider.provideFromProviderResult()
        ↓
brandConfigSourceFromProviderResult() / toResolveBrandInput()
        ↓
BrandResolver.resolve()
        ↓
BrandCompiler.compileFromResolvedWithMeta()
        ↓
WhiteLabelProviderResult (resolved + compiled + fromCache)
```

`WhiteLabelProvider` is an orchestration facade. It does not load configuration, perform I/O, or duplicate resolver/compiler domain logic.

## Asset compilation pipeline (Task 2)

```
BrandResolver.resolve()
        ↓
ResolvedBrandResult
        ↓
AssetNormalizer.normalize()
        ↓
NormalizedBrandAssets
        ↓
BrandCompiler.compileFromResolvedWithMeta()
        ↓
BrandAssetManifest + surface artifacts
```

Task 2 is **manifest/reference-only**. It validates and normalizes asset URLs and metadata. It does not download, resize, or transform binary files.

### App icon fallback

```
logo.appIcon → logo.appleTouchIcon → logo.primary
```

### Supported compilation surfaces

| Surface           | Output                                               |
| ----------------- | ---------------------------------------------------- |
| `web`             | Link descriptors, font-face CSS references, OG href  |
| `mobile`          | App icon source URL, icon size metadata, splash refs |
| `admin-dashboard` | Header logo and favicon references                   |

## Integration with Config Runtime

```
ConfigProvider.resolve()
        ↓
ConfigProviderResult (structural ConfigProviderBrandInput)
        ↓
WhiteLabelProvider.provideFromProviderResult()
        ↓
WhiteLabelProviderResult
```

Production code depends on `@ai-commerce/config-schema` only. `@ai-commerce/config-runtime` is a test/dev dependency. Applications compose `ConfigProvider` with `WhiteLabelProvider` — the provider does not inject or wrap Config Runtime.

## Theme Engine relationship

No package dependency between `@ai-commerce/white-label-engine` and `@ai-commerce/theme-engine`. Both providers are independently composable at the application/platform layer from the same `ConfigProviderResult`.

## Hashing and cache

| Hash        | Source               | Purpose                        |
| ----------- | -------------------- | ------------------------------ |
| `brandHash` | `computeBrandHash()` | Resolved branding identity     |
| `assetHash` | `computeAssetHash()` | Compilation/cache invalidation |

- **Brand hash** — config/branding change detection on resolved output
- **Asset hash** — normalized asset compilation identity; `BrandCache` keys and `getCachedCompiled()` use this value

`BrandCompiler` owns compiled artifact cache (`assetHash:sortedSurfaces`). `WhiteLabelProvider` delegates to `compileFromResolvedWithMeta()` for `fromCache` metadata and does not implement a second cache.

Tenants with identical normalized branding may share compiled cache entries. Per-request `resolved` metadata (including `tenantId`) is always attached by the provider and is never mutated inside shared cache entries.

## Public API (Task 3)

| Export                     | Role                                               |
| -------------------------- | -------------------------------------------------- |
| `WhiteLabelProvider`       | Facade — `resolve`, `provide`, config integration  |
| `createWhiteLabelProvider` | Factory with resolver, compiler, cache wiring      |
| `BrandResolver`            | Direct resolution (advanced use)                   |
| `BrandCompiler`            | Direct compilation (advanced use)                  |
| `BrandConfigSource`        | Structural config contract for `provideFromConfig` |

Internals (`AssetNormalizer`, `BrandCache`, emitters) remain on `@ai-commerce/white-label-engine/internal`.

## Decision Log

| Decision              | Choice                                                                                          |
| --------------------- | ----------------------------------------------------------------------------------------------- |
| Library location      | `packages/white-label-engine` (`@ai-commerce/white-label-engine`)                               |
| Service location      | Deferred — `platform/white-label-engine` renamed to `@ai-commerce/white-label-engine-service`   |
| Tenant input schema   | Extend existing `Branding` additively (`logo.appIcon`, `fonts`)                                 |
| Engine schema dir     | `schemas/white-label/v1/` for presets and output docs only                                      |
| Compilation depth     | Manifest/reference-only in Task 2; binary transforms deferred                                   |
| Theme Engine coupling | None — providers composed independently at application layer                                    |
| Provider API          | Mirror `ThemeProvider` — `resolve`, `provide`, `provideFromConfig`, `provideFromProviderResult` |
| Cache ownership       | `BrandCompiler`; provider uses `compileFromResolvedWithMeta()` for `fromCache`                  |
| Cache key             | `assetHash` (not `brandHash`)                                                                   |

## Sprint deliverables

| Task   | Deliverable                                                  | Tag             |
| ------ | ------------------------------------------------------------ | --------------- |
| Task 1 | BrandResolver, defaults, Config Runtime mapping              | `sprint3-task1` |
| Task 2 | AssetNormalizer, BrandCompiler, BrandCache, surface emitters | `sprint3-task2` |
| Task 3 | WhiteLabelProvider facade, integration tests, docs           | `sprint3-task3` |
