# Catalog Module

Core domain module for products, variants, categories, and media associations. Universal across all verticals.

## Package

`@ai-commerce/module-catalog`

## Status

**Sprint 14 Task 2** — Product queries (by category, active-only) and search helpers.

## Modules

| Module                      | Purpose                                    |
| --------------------------- | ------------------------------------------ |
| `CatalogService`            | CRUD + list/search queries (tenant-scoped) |
| `CatalogRepository`         | Persistence port                           |
| `InMemoryCatalogRepository` | In-memory store for tests / local          |

## Usage

```ts
import { CatalogService, InMemoryCatalogRepository } from '@ai-commerce/module-catalog';

const catalog = new CatalogService({
  repository: new InMemoryCatalogRepository(),
});

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

// Storefront queries
await catalog.listActiveProducts('tenant-fresh');
await catalog.listProductsByCategory('tenant-fresh', 'cat-fruit', { activeOnly: true });
await catalog.searchProducts('tenant-fresh', 'apple', { activeOnly: true });
```

All reads/writes are **tenant-scoped**. Slugs are unique per tenant; SKUs are unique per tenant across products.

## Scripts

```bash
pnpm --filter @ai-commerce/module-catalog test
pnpm --filter @ai-commerce/module-catalog typecheck
pnpm --filter @ai-commerce/module-catalog lint
```

## Architecture

See [docs/architecture/catalog.md](../../../docs/architecture/catalog.md).

## Manifest

Module capabilities are declared in `manifest.json`.
