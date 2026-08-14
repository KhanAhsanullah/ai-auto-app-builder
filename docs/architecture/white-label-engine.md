# White-Label Engine Architecture

Architecture reference for Sprint 3 Task 1 — Brand Foundation. Approved for implementation.

## Overview

The White-Label Engine resolves tenant branding identity for unlimited tenants. Task 1 lives entirely in `@ai-commerce/white-label-engine` (`packages/white-label-engine`). The control-plane **white-label-engine-service** remains a deferred HTTP adapter.

**Principle:** Config Runtime resolves _what_ the tenant config is; White-Label Engine resolves _how_ branding applies across inheritance layers.

Tenant branding input is the existing Sprint 1 contract:

`schemas/tenant-config/v1/branding.schema.json`

`schemas/white-label/v1/` documents resolver output and engine-owned defaults. It is not a competing tenant input schema.

## Package Scope (Task 1)

| In scope                                                | Out of scope (later tasks)                           |
| ------------------------------------------------------- | ---------------------------------------------------- |
| `packages/white-label-engine`                           | Asset pipeline (logo, favicon, icons, splash, fonts) |
| `schemas/white-label/v1/` presets + resolved-brand docs | `BrandCompiler`, cache, emitters                     |
| `BrandResolver`                                         | `WhiteLabelProvider` facade                          |
| Platform / vertical brand defaults                      | Domains, SSL, bundle IDs, company identity           |
| Config Runtime structural mapping                       | `platform/white-label-engine` HTTP service           |

## Folder Structure

```
schemas/white-label/v1/
├── resolved-brand.schema.json
├── presets/
│   ├── default.json
│   └── vertical/
└── examples/

packages/white-label-engine/
├── src/
│   ├── index.ts
│   ├── types.ts
│   ├── errors.ts
│   ├── defaults/
│   ├── domain/
│   │   ├── brand-resolver.ts
│   │   └── map-config-brand-source.ts
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
ResolvedBrandResult
```

Production code depends on `@ai-commerce/config-schema` only. `@ai-commerce/config-runtime` is a test/dev dependency.

## Decision Log

| Decision            | Choice                                                                                        |
| ------------------- | --------------------------------------------------------------------------------------------- |
| Library location    | `packages/white-label-engine` (`@ai-commerce/white-label-engine`)                             |
| Service location    | Deferred — `platform/white-label-engine` renamed to `@ai-commerce/white-label-engine-service` |
| Tenant input schema | Reuse existing `Branding` / `brandingSchema`                                                  |
| Engine schema dir   | `schemas/white-label/v1/` for presets and output docs only                                    |
| Resolver surface    | Branding only (tenantId, vertical, environment for keys/layers)                               |
