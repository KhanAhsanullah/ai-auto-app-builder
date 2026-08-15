# White-Label Engine Architecture

Architecture reference for Sprint 3 — White Label Engine.

## Overview

The White-Label Engine resolves tenant branding identity and compiles brand asset references into deterministic manifests for all platform surfaces. Sprint 3 code lives entirely in `@ai-commerce/white-label-engine` (`packages/white-label-engine`). The control-plane **white-label-engine-service** remains a deferred HTTP adapter.

**Principle:** Config Runtime resolves _what_ the tenant config is; White-Label Engine resolves _how_ branding applies across inheritance layers and surfaces.

Tenant branding input is the Sprint 1 contract:

`schemas/tenant-config/v1/branding.schema.json`

`schemas/white-label/v1/` documents engine output and engine-owned defaults. It is not a competing tenant input schema.

## Package Scope

| In scope (Sprint 3 Task 1–2)                       | Out of scope (later tasks)                 |
| -------------------------------------------------- | ------------------------------------------ |
| `packages/white-label-engine`                      | `WhiteLabelProvider` facade (Task 3)       |
| `BrandResolver`, platform/vertical defaults        | `platform/white-label-engine` HTTP service |
| Config Runtime structural mapping                  | Binary asset transformation                |
| `AssetNormalizer`, `BrandCompiler`, `BrandCache`   | CDN / cloud storage                        |
| Surface emitters (web, mobile, admin-dashboard)    | Domains, SSL, bundle IDs                   |
| Engine output schemas in `schemas/white-label/v1/` | Build Orchestrator persistence             |

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
│   │   ├── brand-emitter-registry.ts
│   │   └── map-config-brand-source.ts
│   ├── infrastructure/
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
BrandCompiler.compileFromResolved()
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
brandConfigSourceFromProviderResult()
        ↓
toResolveBrandInput()
        ↓
BrandResolver.resolve()
        ↓
BrandCompiler.compileFromResolved()
        ↓
CompiledBrandResult
```

Production code depends on `@ai-commerce/config-schema` only. `@ai-commerce/config-runtime` is a test/dev dependency.

## Hashing

| Hash        | Source               | Purpose                        |
| ----------- | -------------------- | ------------------------------ |
| `brandHash` | `computeBrandHash()` | Config change detection        |
| `assetHash` | `computeAssetHash()` | Compilation/cache invalidation |

Brand hash includes optional `logo.appIcon` and `branding.fonts` when present. Asset hash covers normalized asset references and compiler version — not binary contents.

## Decision Log

| Decision              | Choice                                                                                        |
| --------------------- | --------------------------------------------------------------------------------------------- |
| Library location      | `packages/white-label-engine` (`@ai-commerce/white-label-engine`)                             |
| Service location      | Deferred — `platform/white-label-engine` renamed to `@ai-commerce/white-label-engine-service` |
| Tenant input schema   | Extend existing `Branding` additively (`logo.appIcon`, `fonts`)                               |
| Engine schema dir     | `schemas/white-label/v1/` for presets and output docs only                                    |
| Compilation depth     | Manifest/reference-only in Task 2; binary transforms deferred                                 |
| Theme Engine coupling | None — brand fonts are branding asset refs, not theme tokens                                  |
| Public API (Task 2)   | `BrandCompiler` on main entry; internals via `./internal`                                     |
