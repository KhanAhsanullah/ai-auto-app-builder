# Order Module

Core domain module for order lifecycle. Authoritative record created from a completed checkout.

## Package

`@ai-commerce/module-order`

## Status

**Sprint 17 complete** — Task 3 delivers `OrderModule` / `createOrderModule` facade.

## Modules

| Module                    | Purpose                                        |
| ------------------------- | ---------------------------------------------- |
| `createOrderModule`       | Wire service + in-memory repository            |
| `OrderModule`             | Facade: create, confirm, fulfill, cancel, list |
| `OrderService`            | Domain service (used by the facade)            |
| `CheckoutLookup`          | Required port to load completed checkout       |
| `InMemoryOrderRepository` | In-memory store for tests / local              |

## Usage

```ts
import { createOrderModule } from '@ai-commerce/module-order';
import { createCheckoutModule } from '@ai-commerce/module-checkout';

const checkout = createCheckoutModule({ cartLookup });
const orders = createOrderModule({
  checkoutLookup: {
    getCheckout: async (tenantId, checkoutId) => {
      const session = await checkout.getCheckout(tenantId, checkoutId);
      if (
        !session ||
        session.status !== 'completed' ||
        !session.shipping ||
        !session.shippingAddress ||
        !session.shippingMethod
      ) {
        return undefined;
      }
      return {
        id: session.id,
        tenantId: session.tenantId,
        cartId: session.cartId,
        currency: session.currency,
        status: session.status,
        lines: [...session.lines],
        subtotal: session.subtotal,
        shipping: session.shipping,
        total: session.total,
        shippingAddress: session.shippingAddress,
        shippingMethod: session.shippingMethod,
        completedAt: session.completedAt,
      };
    },
  },
});

const order = await orders.createOrderFromCheckout({ tenantId, checkoutId });
await orders.confirmOrder(tenantId, order.id);
```

Surface wiring: [docs/architecture/order.md](../../../docs/architecture/order.md#surface-wiring).

## Scripts

```bash
pnpm --filter @ai-commerce/module-order test
pnpm --filter @ai-commerce/module-order typecheck
pnpm --filter @ai-commerce/module-order lint
```

## Architecture

See [docs/architecture/order.md](../../../docs/architecture/order.md).
