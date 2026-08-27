# Cart Module

Core domain module for shopping cart lines. Entry point to the checkout pipeline.

## Package

`@ai-commerce/module-cart`

## Status

**Sprint 15 complete** — Task 3 delivers `CartModule` / `createCartModule` facade.

## Modules

| Module                   | Purpose                                          |
| ------------------------ | ------------------------------------------------ |
| `createCartModule`       | Wire service + in-memory repository              |
| `CartModule`             | Facade: getOrCreate, add lines, quantities       |
| `CartService`            | Domain service (used by the facade)              |
| `CatalogProductLookup`   | Optional port for catalog price / variant quotes |
| `CartRepository`         | Persistence port                                 |
| `InMemoryCartRepository` | In-memory store for tests / local                |

## Usage

```ts
import { createCartModule } from '@ai-commerce/module-cart';

const cart = createCartModule({
  // optional: catalogLookup: adapterFromCatalogModule(catalog),
});

const sessionCart = await cart.getOrCreateBySession({
  tenantId: 'tenant-fresh',
  sessionId: 'sess-1',
  currency: 'USD',
});

await cart.addItem({
  tenantId: 'tenant-fresh',
  cartId: sessionCart.id,
  productId: 'prod-apple',
  variantId: 'var-1',
  sku: 'APL-1',
  title: 'Organic Apple',
  unitPrice: { amount: 2.5, currency: 'USD' },
  quantity: 2,
});
```

Surface wiring guidance: [docs/architecture/cart.md](../../../docs/architecture/cart.md#surface-wiring).

## Scripts

```bash
pnpm --filter @ai-commerce/module-cart test
pnpm --filter @ai-commerce/module-cart typecheck
pnpm --filter @ai-commerce/module-cart lint
```

## Architecture

See [docs/architecture/cart.md](../../../docs/architecture/cart.md).
