# White-Label Engine

Resolves tenant branding through platform → vertical → tenant → environment inheritance. Compiles resolved branding into deterministic asset manifests and surface-specific reference artifacts.

## Package

`@ai-commerce/white-label-engine`

## Status

Sprint 3 Task 3 — `WhiteLabelProvider` facade, Config Runtime integration, public API cleanup.

The control-plane HTTP service (`@ai-commerce/white-label-engine-service`) remains deferred.

## Modules

| Module                                | Responsibility                                             |
| ------------------------------------- | ---------------------------------------------------------- |
| `WhiteLabelProvider`                  | Public facade — resolve + compile from config or resolver  |
| `createWhiteLabelProvider`            | Factory wiring resolver, compiler, cache, and emitters     |
| `BrandResolver`                       | Merge inheritance chain and validate with `brandingSchema` |
| `BrandCompiler`                       | Normalize assets and emit surface reference artifacts      |
| `toResolveBrandInput`                 | Map resolved config output to resolver input               |
| `brandConfigSourceFromProviderResult` | Normalize Config Runtime output without re-resolution      |

Internal modules (normalizer, cache, emitters) are available via `@ai-commerce/white-label-engine/internal`.

## Pipeline

```
ConfigProvider.resolve()
        ↓
WhiteLabelProvider.provideFromProviderResult()
        ↓
BrandResolver → BrandCompiler → Surface Artifacts
```

## Surface responsibilities

| Surface           | Output                                               |
| ----------------- | ---------------------------------------------------- |
| `web`             | Link descriptors, font-face CSS references, OG href  |
| `mobile`          | App icon source URL, icon size metadata, splash refs |
| `admin-dashboard` | Header logo and favicon references                   |

## Scripts

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

## Usage

```typescript
import { ConfigProvider } from '@ai-commerce/config-runtime';
import { createWhiteLabelProvider } from '@ai-commerce/white-label-engine';

const configProvider = new ConfigProvider();
const brandProvider = createWhiteLabelProvider();

const configResult = await configProvider.loadFromFile('./tenant-config.json');
const brand = brandProvider.provideFromProviderResult(configResult);

console.log(brand.resolved.branding.appName);
console.log(brand.artifacts.web.links);
console.log(brand.metadata.assetHash);
console.log(brand.fromCache);
```

Direct resolver input (without Config Runtime):

```typescript
const brand = brandProvider.provide({
  tenantBranding: { appName: 'Acme Market', logo: { primary: 'https://cdn.example.com/logo.svg' } },
  surfaces: ['web', 'mobile'],
});
```

## Cache

- **Brand hash** (`metadata.brandHash`) — resolved branding/config identity
- **Asset hash** (`metadata.assetHash`) — normalized asset compilation identity; used by `BrandCache` and `getCachedCompiled()`

`BrandCompiler` owns compiled artifact cache. `WhiteLabelProvider` orchestrates compilation and reports `fromCache` without duplicating cache logic.

## Theme Engine

`WhiteLabelProvider` is independent of `@ai-commerce/theme-engine`. Applications compose both providers at the platform layer:

```typescript
const configResult = configProvider.resolve({ tenantConfig });
const theme = themeProvider.provideFromProviderResult(configResult);
const brand = brandProvider.provideFromProviderResult(configResult);
```

## Documentation

- [White-Label Engine Architecture](../../docs/architecture/white-label-engine.md)
- [White-Label Schemas](../../schemas/white-label/v1/README.md)

## Dependencies

- `@ai-commerce/config-schema` — `Branding` type and validation types
- `@ai-commerce/config-runtime` — `ConfigProvider` integration (dev/tests)
