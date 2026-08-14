# White-Label Engine

Resolves tenant branding through platform → vertical → tenant → environment inheritance. Transforms the existing `Branding` config contract into a deterministic `ResolvedBrandResult` with layer audit data and a SHA-256 hash.

## Package

`@ai-commerce/white-label-engine`

## Status

Sprint 3 Task 1 — BrandResolver, platform/vertical defaults, Config Runtime mapping.

Asset pipeline, compiler, cache, and provider facade are deferred to later Sprint 3 tasks. The control-plane HTTP service remains `platform/white-label-engine` (`@ai-commerce/white-label-engine-service`).

## Modules

| Module                                | Responsibility                                             |
| ------------------------------------- | ---------------------------------------------------------- |
| `BrandResolver`                       | Merge inheritance chain and validate with `brandingSchema` |
| `toResolveBrandInput`                 | Map resolved config output to resolver input               |
| `brandConfigSourceFromProviderResult` | Normalize Config Runtime output without re-resolution      |

## Resolution precedence

```
Platform brand defaults
  ↓
Vertical brand defaults
  ↓
Tenant branding
  ↓
Environment branding override (shallow section merge)
```

Tenant branding input is `schemas/tenant-config/v1/branding.schema.json`. Engine presets live in `schemas/white-label/v1/`.

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
  BrandResolver,
  brandConfigSourceFromProviderResult,
  toResolveBrandInput,
} from '@ai-commerce/white-label-engine';

const configProvider = new ConfigProvider();
const resolver = new BrandResolver();

const configResult = await configProvider.loadFromFile('./tenant-config.json');
const brand = resolver.resolve(
  toResolveBrandInput(brandConfigSourceFromProviderResult(configResult)),
);

console.log(brand.branding.appName);
console.log(brand.metadata.hash);
```
