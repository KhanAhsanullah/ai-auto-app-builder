# Order Module

Core domain module for order lifecycle. Authoritative record created from a completed checkout.

## Package

`@ai-commerce/module-order`

## Status

**Sprint 17 Task 1** — Domain model, `OrderService`, in-memory repository.

## Modules

| Module                    | Purpose                                  |
| ------------------------- | ---------------------------------------- |
| `OrderService`            | Create from checkout, get, list, cancel  |
| `CheckoutLookup`          | Port to load completed checkout snapshot |
| `OrderRepository`         | Persistence port                         |
| `InMemoryOrderRepository` | In-memory store for tests / local        |

## Usage

```ts
import { OrderService, InMemoryOrderRepository } from '@ai-commerce/module-order';

const orders = new OrderService({
  repository: new InMemoryOrderRepository(),
  checkoutLookup: {
    getCheckout: async (tenantId, checkoutId) => {
      const session = await checkout.getCheckout(tenantId, checkoutId);
      if (!session || session.status !== 'completed') return undefined;
      return {
        id: session.id,
        tenantId: session.tenantId,
        cartId: session.cartId,
        currency: session.currency,
        status: session.status,
        lines: session.lines,
        subtotal: session.subtotal,
        shipping: session.shipping!,
        total: session.total,
        shippingAddress: session.shippingAddress!,
        shippingMethod: session.shippingMethod!,
        completedAt: session.completedAt,
      };
    },
  },
});

const order = await orders.createOrderFromCheckout({
  tenantId: 'tenant-fresh',
  checkoutId: 'chk-1',
});
```

## Scripts

```bash
pnpm --filter @ai-commerce/module-order test
pnpm --filter @ai-commerce/module-order typecheck
pnpm --filter @ai-commerce/module-order lint
```

## Architecture

See [docs/architecture/order.md](../../../docs/architecture/order.md).
