# Catalog Module

Core domain module for products, variants, categories, and media associations. Universal across all verticals.

## Package

`@ai-commerce/module-catalog`

## Status

**Sprint 14 complete** — Task 3 delivers `CatalogModule` / `createCatalogModule` facade + surface wiring docs.

## Modules

| Module                      | Purpose                             |
| --------------------------- | ----------------------------------- |
| `createCatalogModule`       | Wire service + in-memory repository |
| `CatalogModule`             | Facade: CRUD + storefront queries   |
| `CatalogService`            | Domain service (used by the facade) |
| `CatalogRepository`         | Persistence port                    |
| `InMemoryCatalogRepository` | In-memory store for tests / local   |

## Usage

```ts
import { createCatalogModule } from '@ai-commerce/module-catalog';

const catalog = createCatalogModule();

await catalog.createCategory({
  tenantId: 'tenant-fresh',
  slug: 'fruit',
  name: 'Fruit',
  id: 'cat-fruit',
});

await catalog.createProduct({
  tenantId: 'tenant-fresh',
  slug: 'organic-apple',
  name: 'Organic Apple',
  status: 'active',
  categoryIds: ['cat-fruit'],
  variants: [{ sku: 'APL-1', title: 'Default', price: { amount: 2.5, currency: 'USD' } }],
});

// Web / Mobile storefront
await catalog.listActiveProducts('tenant-fresh');
await catalog.getProductBySlug('tenant-fresh', 'organic-apple');
```

Surface wiring guidance: [docs/architecture/catalog.md](../../../docs/architecture/catalog.md#surface-wiring).

## Scripts

```bash
pnpm --filter @ai-commerce/module-catalog test
pnpm --filter @ai-commerce/module-catalog typecheck
pnpm --filter @ai-commerce/module-catalog lint
```

## Manifest

Module capabilities are declared in `manifest.json`.
