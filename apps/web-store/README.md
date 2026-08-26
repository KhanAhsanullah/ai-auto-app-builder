# Web Store

Config-driven consumer web storefront for CommerceOS AI — resolve tenant config into a branded shell, map `store.*` screens, and render a React top-bar layout.

## Package

`@ai-commerce/web-store`

## Status

**Sprint 11 Task 2** — Screen registry + React storefront layout shell.

Task 3 (`createWebStore` facade + app entry) is not yet implemented.

## Modules

| Module                       | Purpose                                             |
| ---------------------------- | --------------------------------------------------- |
| `WebStoreShellResolver`      | Composed shell (nav, branding, domain/SEO, landing) |
| `WebScreenRegistry`          | `store.*` route → screen map                        |
| `buildWebShellViewModel`     | Shell + registry view-model for layout              |
| `WebShellLayout` (`./react`) | Header + top nav + content + footer                 |

## Usage

```ts
import {
  WebStoreShellResolver,
  toResolveWebStoreShellInput,
  createDefaultWebScreenRegistry,
  buildWebShellViewModel,
} from '@ai-commerce/web-store';
import { WebShellLayout } from '@ai-commerce/web-store/react';
import { ConfigProvider } from '@ai-commerce/config-runtime';

const result = new ConfigProvider({ cache: false }).resolve({ tenantConfig });
const shell = new WebStoreShellResolver().resolve(toResolveWebStoreShellInput(result));
const viewModel = buildWebShellViewModel(shell, createDefaultWebScreenRegistry());

<WebShellLayout viewModel={viewModel} onNavigate={(route) => { /* set active route */ }} />
```

## Scripts

```bash
pnpm --filter @ai-commerce/web-store test
pnpm --filter @ai-commerce/web-store typecheck
pnpm --filter @ai-commerce/web-store lint
```

## Architecture

See [docs/architecture/web-store.md](../../docs/architecture/web-store.md).
