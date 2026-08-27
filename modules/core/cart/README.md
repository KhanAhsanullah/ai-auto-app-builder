# Cart Module

Core domain module for shopping cart lines. Entry point to the checkout pipeline.

## Package

`@ai-commerce/module-cart`

## Status

**Sprint 15 Task 1** — Domain model, `CartService`, in-memory repository.

## Modules

| Module                   | Purpose                                  |
| ------------------------ | ---------------------------------------- |
| `CartService`            | Create cart, add/merge lines, quantities |
| `CartRepository`         | Persistence port                         |
| `InMemoryCartRepository` | In-memory store for tests / local        |

## Usage

```ts
import { CartService, InMemoryCartRepository } from '@ai-commerce/module-cart';

const carts = new CartService({
  repository: new InMemoryCartRepository(),
});

const cart = await carts.createCart({
  tenantId: 'tenant-fresh',
  currency: 'USD',
  sessionId: 'sess-1',
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
```

Carts are **tenant-scoped**. Same `variantId` merges quantities. Line prices are snapshots (catalog lookup deferred to Task 2+).

## Scripts

```bash
pnpm --filter @ai-commerce/module-cart test
pnpm --filter @ai-commerce/module-cart typecheck
pnpm --filter @ai-commerce/module-cart lint
```

## Architecture

See [docs/architecture/cart.md](../../../docs/architecture/cart.md).
