# Catalog Module

Core domain module for products, variants, categories, and media associations. Universal across all verticals.

## Package

`@ai-commerce/module-catalog`

## Status

**Sprint 14 Task 1** — Domain model, `CatalogService`, in-memory repository.

## Modules

| Module                      | Purpose                               |
| --------------------------- | ------------------------------------- |
| `CatalogService`            | Tenant-scoped category + product CRUD |
| `CatalogRepository`         | Persistence port                      |
| `InMemoryCatalogRepository` | In-memory store for tests / local     |

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
});

await catalog.createProduct({
  tenantId: 'tenant-fresh',
  slug: 'organic-apple',
  name: 'Organic Apple',
  categoryIds: [/* category id */],
  variants: [{ sku: 'APL-1', title: 'Default', price: { amount: 2.5, currency: 'USD' } }],
});
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
