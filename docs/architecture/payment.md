# Payment Module

Core data-plane domain module (`@ai-commerce/module-payment`) for tenant-scoped payment intents created against payable orders.

## Principles

1. **Tenant-aware** — every intent is scoped by `tenantId`.
2. **Order-backed amount** — amount and currency come from the order snapshot, not caller input.
3. **One intent per order** — `createPaymentIntent` is idempotent.
4. **No hard order dependency** — `OrderLookup` port adapts `@ai-commerce/module-order`.
5. **Config-driven gateways** — `gateway` / `method` / `captureStrategy` are passed in from tenant `payments` config; never hardcoded per tenant.
6. **Optional gateway port** — `PaymentGatewayPort` for real providers; without it, status updates are domain-only (manual / tests).
7. **Facade entry** — callers use `createPaymentModule` / `PaymentModule`.
8. **No live PCI** — provider SDKs and webhooks deferred.
9. **Clean Architecture** — domain ports + service; in-memory adapter first.

## Flow

```
createPaymentModule({ orderLookup, gateway? }) → PaymentModule
        │
        ├─ createPaymentIntent
        ├─ authorizePaymentIntent / capturePaymentIntent
        ├─ failPaymentIntent / cancelPaymentIntent
        └─ listPaymentIntents / listPaymentIntentsByOrder
                │
                ▼
          PaymentService → PaymentRepository
                │
                ▼ (optional)
          PaymentGatewayPort
```

## Surface wiring

Gate payment UI with tenant config `features.payment`. After an order is placed:

| Surface             | Typical calls                                                            |
| ------------------- | ------------------------------------------------------------------------ |
| **Web Store**       | `createPaymentIntent`, `capturePaymentIntent` / `authorizePaymentIntent` |
| **Mobile App**      | Same as Web Store                                                        |
| **Admin Dashboard** | `listPaymentIntents`, `capturePaymentIntent` (manual), `fail` / `cancel` |
| **API Gateway**     | Thin handlers that call the same facade (HTTP deferred)                  |

```ts
import { createOrderModule } from '@ai-commerce/module-order';
import { createPaymentModule } from '@ai-commerce/module-payment';

const orders = createOrderModule({ checkoutLookup });
const payments = createPaymentModule({
  orderLookup: {
    getOrder: async (tenantId, orderId) => {
      // map Order → PayableOrderSnapshot
      return undefined;
    },
  },
});
```

Do **not** store payment secrets in tenant JSON config — use `credentialsRef` / secrets store. Config only selects gateway, methods, and `captureStrategy`.

## Status machine

```
pending → authorized → captured
   │           │
   └───────────┴──→ failed | cancelled
```

- `immediate`: capture may run from `pending`
- `authorize_then_capture`: must authorize before capture
- `manual`: capture from pending or authorized

## Sprint 18 Task Breakdown

| Task   | Deliverable                                                          |
| ------ | -------------------------------------------------------------------- |
| Task 1 | Domain model, `PaymentService`, in-memory repository                 |
| Task 2 | Authorize / capture / fail / cancel + optional gateway port          |
| Task 3 | `PaymentModule` / `createPaymentModule` facade + surface wiring docs |

## Deferred

- Real Stripe / PayPal / JazzCash / EasyPaisa adapters
- Webhooks and reconciliation
- Refunds
- Persistent DB
- HTTP / API handlers
- Split payments
