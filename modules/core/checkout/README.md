# Checkout Module

Core domain module for address collection, shipping method selection, and checkout completion. Entry point from cart to order (order module deferred).

## Package

`@ai-commerce/module-checkout`

## Status

**Sprint 16 complete** — Task 3 delivers `CheckoutModule` / `createCheckoutModule` facade.

## Modules

| Module                          | Purpose                                         |
| ------------------------------- | ----------------------------------------------- |
| `createCheckoutModule`          | Wire service + in-memory repository             |
| `CheckoutModule`                | Facade: start → address → shipping → complete   |
| `CheckoutService`               | Domain service (used by the facade)             |
| `CartLookup`                    | Required port to load cart snapshot             |
| `ShippingMethodCatalog`         | Optional port for config-driven shipping offers |
| `InMemoryCheckoutRepository`    | In-memory store for tests / local               |
| `InMemoryShippingMethodCatalog` | In-memory shipping offers for tests / local     |

## Usage

```ts
import { createCheckoutModule, InMemoryShippingMethodCatalog } from '@ai-commerce/module-checkout';
import { createCartModule } from '@ai-commerce/module-cart';

const cart = createCartModule();
const checkout = createCheckoutModule({
  cartLookup: {
    getCart: async (tenantId, cartId) => {
      const c = await cart.getCart(tenantId, cartId);
      return {
        id: c.id,
        tenantId: c.tenantId,
        currency: c.currency,
        subtotal: c.subtotal,
        lines: c.lines,
      };
    },
  },
  shippingCatalog: new InMemoryShippingMethodCatalog([
    { id: 'standard', name: 'Standard', price: { amount: 5, currency: 'USD' } },
  ]),
});

const session =
  (await checkout.getActiveCheckoutByCart(tenantId, cartId)) ??
  (await checkout.startCheckout({ tenantId, cartId }));
```

Surface wiring: [docs/architecture/checkout.md](../../../docs/architecture/checkout.md#surface-wiring).

## Scripts

```bash
pnpm --filter @ai-commerce/module-checkout test
pnpm --filter @ai-commerce/module-checkout typecheck
pnpm --filter @ai-commerce/module-checkout lint
```

## Architecture

See [docs/architecture/checkout.md](../../../docs/architecture/checkout.md).
