# White-Label Engine

Resolves tenant branding through platform → vertical → tenant → environment inheritance. Compiles resolved branding into deterministic asset manifests and surface-specific reference artifacts.

## Package

`@ai-commerce/white-label-engine`

## Status

Sprint 3 Task 2 — AssetNormalizer, BrandCompiler, BrandCache, surface emitters, extended brand hashing.

The `WhiteLabelProvider` facade and control-plane HTTP service remain deferred to Sprint 3 Task 3.

## Modules

| Module                                | Responsibility                                             |
| ------------------------------------- | ---------------------------------------------------------- |
| `BrandResolver`                       | Merge inheritance chain and validate with `brandingSchema` |
| `BrandCompiler`                       | Normalize assets and emit surface reference artifacts      |
| `toResolveBrandInput`                 | Map resolved config output to resolver input               |
| `brandConfigSourceFromProviderResult` | Normalize Config Runtime output without re-resolution      |

Internal modules (normalizer, cache, emitters) are available via `@ai-commerce/white-label-engine/internal`.

## Pipeline

```
ConfigProvider.resolve()
        ↓
BrandResolver.resolve()
        ↓
AssetNormalizer.normalize()
        ↓
BrandCompiler.compileFromResolved()
        ↓
Surface Artifacts (web, mobile, admin-dashboard)
```

Tenant branding input is `schemas/tenant-config/v1/branding.schema.json`. Engine output contracts live in `schemas/white-label/v1/`.

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
import {
  BrandCompiler,
  BrandResolver,
  brandConfigSourceFromProviderResult,
  toResolveBrandInput,
} from '@ai-commerce/white-label-engine';

const configProvider = new ConfigProvider();
const resolver = new BrandResolver();
const compiler = new BrandCompiler();

const configResult = await configProvider.loadFromFile('./tenant-config.json');
const resolved = resolver.resolve(
  toResolveBrandInput(brandConfigSourceFromProviderResult(configResult)),
);
const compiled = compiler.compileFromResolved({ resolved });

console.log(compiled.manifest.assets);
console.log(compiled.artifacts.web.links);
console.log(compiled.metadata.assetHash);
```
