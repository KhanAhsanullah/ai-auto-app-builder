# Checkout Module

Core domain module for address collection, shipping method selection, and checkout completion. Entry point from cart to order (order module deferred).

## Package

`@ai-commerce/module-checkout`

## Status

**Sprint 16 Task 2** — `getActiveCheckoutByCart` + optional `ShippingMethodCatalog`.

## Modules

| Module                          | Purpose                                         |
| ------------------------------- | ----------------------------------------------- |
| `CheckoutService`               | Start from cart, address, shipping, complete    |
| `CartLookup`                    | Port to load cart snapshot                      |
| `ShippingMethodCatalog`         | Optional port for config-driven shipping offers |
| `CheckoutRepository`            | Persistence port                                |
| `InMemoryCheckoutRepository`    | In-memory store for tests / local               |
| `InMemoryShippingMethodCatalog` | In-memory shipping offers for tests / local     |

## Usage

```ts
import {
  CheckoutService,
  InMemoryCheckoutRepository,
  InMemoryShippingMethodCatalog,
} from '@ai-commerce/module-checkout';

const checkout = new CheckoutService({
  repository: new InMemoryCheckoutRepository(),
  cartLookup: { getCart: async (tenantId, cartId) => /* adapt CartModule */ undefined },
  shippingCatalog: new InMemoryShippingMethodCatalog([
    { id: 'standard', name: 'Standard', price: { amount: 5, currency: 'USD' } },
  ]),
});

const active = await checkout.getActiveCheckoutByCart(tenantId, cartId);
const session = active ?? (await checkout.startCheckout({ tenantId, cartId }));

await checkout.updateShippingAddress({ tenantId, checkoutId: session.id, address });
await checkout.selectShippingMethodById({
  tenantId,
  checkoutId: session.id,
  methodId: 'standard',
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
