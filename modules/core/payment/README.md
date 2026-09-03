# Payment Module

Core domain module for payment intents against orders. Gateway capture stays behind ports — no live PCI traffic in this module yet.

## Package

`@ai-commerce/module-payment`

## Status

**Sprint 18 Task 1** — domain model, `PaymentService`, in-memory repository.

## Modules

| Module                      | Purpose                               |
| --------------------------- | ------------------------------------- |
| `PaymentService`            | Create intent from order, get, list   |
| `OrderLookup`               | Required port to load a payable order |
| `InMemoryPaymentRepository` | In-memory store for tests / local     |

## Usage

```ts
import { PaymentService, InMemoryPaymentRepository } from '@ai-commerce/module-payment';
import { createOrderModule } from '@ai-commerce/module-order';

const orders = createOrderModule({ checkoutLookup });
const payments = new PaymentService({
  repository: new InMemoryPaymentRepository(),
  orderLookup: {
    getOrder: async (tenantId, orderId) => {
      try {
        const order = await orders.getOrder(tenantId, orderId);
        return {
          id: order.id,
          tenantId: order.tenantId,
          checkoutId: order.checkoutId,
          currency: order.currency,
          status: order.status,
          total: order.total,
          customerId: order.customerId,
        };
      } catch {
        return undefined;
      }
    },
  },
});

const intent = await payments.createPaymentIntent({
  tenantId,
  orderId,
  method: 'card',
  gateway: 'stripe',
  captureStrategy: 'immediate', // from tenant payments.checkout.captureStrategy
});
```

Pass gateway / capture strategy from tenant config (`payments.*`) — do not hardcode per tenant in the module.

## Scripts

```bash
pnpm --filter @ai-commerce/module-payment test
pnpm --filter @ai-commerce/module-payment typecheck
pnpm --filter @ai-commerce/module-payment lint
```

## Architecture

See [docs/architecture/payment.md](../../../docs/architecture/payment.md).
