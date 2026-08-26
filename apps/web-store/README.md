# Web Store

Config-driven consumer web storefront for CommerceOS AI — resolve tenant config into a branded shell (nav, SEO, domain, PWA) before screens and SSR layout land in later tasks.

## Package

`@ai-commerce/web-store`

## Status

**Sprint 11 Task 1** — Shell foundation (nav, flags, branding, domain/SEO/rendering).

Tasks 2–3 (screen registry + React/SSR layout, `createWebStore` facade) are not yet implemented.

## Modules

| Module                        | Purpose                                                  |
| ----------------------------- | -------------------------------------------------------- |
| `FeatureFlagEvaluator`        | `flags.*` / `modules.*` evaluation                       |
| `WebNavigationResolver`       | Visibility + feature-flag gated `navigation.web`         |
| `WebBrandingResolver`         | Branding / favicon / OG slice                            |
| `WebStoreShellResolver`       | Composed shell (nav, identity domain/SEO, landing route) |
| `toResolveWebStoreShellInput` | Config Runtime → shell input                             |

## Usage

```ts
import { WebStoreShellResolver, toResolveWebStoreShellInput } from '@ai-commerce/web-store';
import { ConfigProvider } from '@ai-commerce/config-runtime';

const result = new ConfigProvider({ cache: false }).resolve({ tenantConfig });
const shell = new WebStoreShellResolver().resolve(toResolveWebStoreShellInput(result));
```

## Scripts

```bash
pnpm --filter @ai-commerce/web-store test
pnpm --filter @ai-commerce/web-store typecheck
pnpm --filter @ai-commerce/web-store lint
```

## Architecture

See [docs/architecture/web-store.md](../../docs/architecture/web-store.md).
