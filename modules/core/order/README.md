# Order Module

Core domain module for order lifecycle. Authoritative record created from a completed checkout.

## Package

`@ai-commerce/module-order`

## Status

**Sprint 17 Task 2** — confirm/fulfill status helpers + list by cart/customer.

## Modules

| Module                    | Purpose                                         |
| ------------------------- | ----------------------------------------------- |
| `OrderService`            | Create, confirm, fulfill, cancel, filtered list |
| `CheckoutLookup`          | Port to load completed checkout snapshot        |
| `OrderRepository`         | Persistence port                                |
| `InMemoryOrderRepository` | In-memory store for tests / local               |

## Usage

```ts
import { OrderService, InMemoryOrderRepository } from '@ai-commerce/module-order';

const orders = new OrderService({
  repository: new InMemoryOrderRepository(),
  checkoutLookup: { getCheckout: async () => undefined },
});

const order = await orders.createOrderFromCheckout({ tenantId, checkoutId });
await orders.confirmOrder(tenantId, order.id);
await orders.fulfillOrder(tenantId, order.id);

await orders.listOrdersByCustomer(tenantId, customerId);
await orders.listOrders(tenantId, { cartId, status: 'placed' });
```

Status machine: `placed` → `confirmed` → `fulfilled` (or `cancelled` from placed/confirmed).

## Scripts

```bash
pnpm --filter @ai-commerce/module-order test
pnpm --filter @ai-commerce/module-order typecheck
pnpm --filter @ai-commerce/module-order lint
```

## Architecture

See [docs/architecture/order.md](../../../docs/architecture/order.md).
