# Payment Module

Core domain module for payment intents against orders. Gateway capture stays behind ports — no live PCI traffic in this module yet.

## Package

`@ai-commerce/module-payment`

## Status

**Sprint 18 Task 2** — authorize / capture / fail / cancel + optional gateway port.

## Modules

| Module                      | Purpose                                               |
| --------------------------- | ----------------------------------------------------- |
| `PaymentService`            | Create intent, authorize, capture, fail, cancel, list |
| `OrderLookup`               | Required port to load a payable order                 |
| `PaymentGatewayPort`        | Optional provider adapter (Stripe etc. later)         |
| `InMemoryPaymentRepository` | In-memory store for tests / local                     |

## Usage

```ts
import { PaymentService, InMemoryPaymentRepository } from '@ai-commerce/module-payment';

const payments = new PaymentService({
  repository: new InMemoryPaymentRepository(),
  orderLookup, // adapt from createOrderModule()
  // gateway: optional Stripe/PayPal adapter
});

const intent = await payments.createPaymentIntent({
  tenantId,
  orderId,
  method: 'card',
  gateway: 'stripe',
  captureStrategy: 'authorize_then_capture', // from tenant config
});

await payments.authorizePaymentIntent(tenantId, intent.id);
await payments.capturePaymentIntent(tenantId, intent.id);
```

Pass gateway / capture strategy from tenant config (`payments.*`) — do not hardcode per tenant.

## Scripts

```bash
pnpm --filter @ai-commerce/module-payment test
pnpm --filter @ai-commerce/module-payment typecheck
pnpm --filter @ai-commerce/module-payment lint
```

## Architecture

See [docs/architecture/payment.md](../../../docs/architecture/payment.md).
