# Payment Module

Core domain module for payment intents against orders. Gateway capture stays behind ports — no live PCI traffic in this module yet.

## Package

`@ai-commerce/module-payment`

## Status

**Sprint 18 complete** — Task 3 delivers `PaymentModule` / `createPaymentModule` facade.

## Modules

| Module                      | Purpose                                                |
| --------------------------- | ------------------------------------------------------ |
| `createPaymentModule`       | Wire service + in-memory repository                    |
| `PaymentModule`             | Facade: create, authorize, capture, fail, cancel, list |
| `PaymentService`            | Domain service (used by the facade)                    |
| `OrderLookup`               | Required port to load a payable order                  |
| `PaymentGatewayPort`        | Optional provider adapter (Stripe etc. later)          |
| `InMemoryPaymentRepository` | In-memory store for tests / local                      |

## Usage

```ts
import { createPaymentModule } from '@ai-commerce/module-payment';
import { createOrderModule } from '@ai-commerce/module-order';

const orders = createOrderModule({ checkoutLookup });
const payments = createPaymentModule({
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
await payments.capturePaymentIntent(tenantId, intent.id);
```

Surface wiring: [docs/architecture/payment.md](../../../docs/architecture/payment.md#surface-wiring).

## Scripts

```bash
pnpm --filter @ai-commerce/module-payment test
pnpm --filter @ai-commerce/module-payment typecheck
pnpm --filter @ai-commerce/module-payment lint
```

## Architecture

See [docs/architecture/payment.md](../../../docs/architecture/payment.md).
