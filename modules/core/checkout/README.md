# Checkout Module

Core domain module for address collection, shipping method selection, and checkout completion. Entry point from cart to order (order module deferred).

## Package

`@ai-commerce/module-checkout`

## Status

**Sprint 16 Task 1** — Domain model, `CheckoutService`, in-memory repository.

## Modules

| Module                       | Purpose                                      |
| ---------------------------- | -------------------------------------------- |
| `CheckoutService`            | Start from cart, address, shipping, complete |
| `CartLookup`                 | Optional port to load cart snapshot          |
| `CheckoutRepository`         | Persistence port                             |
| `InMemoryCheckoutRepository` | In-memory store for tests / local            |

## Usage

```ts
import { CheckoutService, InMemoryCheckoutRepository } from '@ai-commerce/module-checkout';

const checkout = new CheckoutService({
  repository: new InMemoryCheckoutRepository(),
  cartLookup: {
    getCart: async (tenantId, cartId) => {
      const cart = await carts.getCart(tenantId, cartId);
      if (!cart) return undefined;
      return {
        id: cart.id,
        tenantId: cart.tenantId,
        currency: cart.currency,
        subtotal: cart.subtotal,
        lines: cart.lines,
      };
    },
  },
});

const session = await checkout.startCheckout({
  tenantId: 'tenant-fresh',
  cartId: 'cart-1',
});
```

## Scripts

```bash
pnpm --filter @ai-commerce/module-checkout test
pnpm --filter @ai-commerce/module-checkout typecheck
pnpm --filter @ai-commerce/module-checkout lint
```

## Architecture

See [docs/architecture/checkout.md](../../../docs/architecture/checkout.md).
