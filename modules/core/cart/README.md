# Cart Module

Core domain module for shopping cart lines. Entry point to the checkout pipeline.

## Package

`@ai-commerce/module-cart`

## Status

**Sprint 15 Task 2** — getOrCreate helpers + optional `CatalogProductLookup` price validation.

## Modules

| Module                   | Purpose                                          |
| ------------------------ | ------------------------------------------------ |
| `CartService`            | Create/getOrCreate, add/merge lines, quantities  |
| `CatalogProductLookup`   | Optional port for catalog price / variant quotes |
| `CartRepository`         | Persistence port                                 |
| `InMemoryCartRepository` | In-memory store for tests / local                |

## Usage

```ts
import { CartService, InMemoryCartRepository } from '@ai-commerce/module-cart';

const carts = new CartService({
  repository: new InMemoryCartRepository(),
  // optional: catalogLookup: adapterFromCatalogModule(catalog),
});

const cart = await carts.getOrCreateBySession({
  tenantId: 'tenant-fresh',
  sessionId: 'sess-1',
  currency: 'USD',
});

await carts.addItem({
  tenantId: 'tenant-fresh',
  cartId: cart.id,
  productId: 'prod-apple',
  variantId: 'var-1',
  sku: 'APL-1',
  title: 'Organic Apple',
  unitPrice: { amount: 2.5, currency: 'USD' },
  quantity: 2,
});

// When catalogLookup is configured:
// await carts.addItemFromCatalog({ tenantId, cartId, productId, variantId, quantity: 1 });
```

## Scripts

```bash
pnpm --filter @ai-commerce/module-cart test
pnpm --filter @ai-commerce/module-cart typecheck
pnpm --filter @ai-commerce/module-cart lint
```

## Architecture

See [docs/architecture/cart.md](../../../docs/architecture/cart.md).
