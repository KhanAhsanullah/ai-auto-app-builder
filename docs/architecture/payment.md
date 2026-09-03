# Payment Module

Core data-plane domain module (`@ai-commerce/module-payment`) for tenant-scoped payment intents created against payable orders.

## Principles

1. **Tenant-aware** — every intent is scoped by `tenantId`.
2. **Order-backed amount** — amount and currency come from the order snapshot, not caller input.
3. **One intent per order** — `createPaymentIntent` is idempotent.
4. **No hard order dependency** — `OrderLookup` port adapts `@ai-commerce/module-order`.
5. **Config-driven gateways** — `gateway` / `method` / `captureStrategy` are passed in from tenant `payments` config; never hardcoded per tenant.
6. **Optional gateway port** — `PaymentGatewayPort` for real providers; without it, status updates are domain-only (manual / tests).
7. **No live PCI** — provider SDKs and webhooks deferred.
8. **Clean Architecture** — domain ports + service; in-memory adapter first.

## Flow

```
OrderLookup.getOrder → PaymentService.createPaymentIntent → PaymentRepository
                              │
                              ├─ authorizePaymentIntent / capturePaymentIntent
                              ├─ failPaymentIntent / cancelPaymentIntent
                              └─ listPaymentIntents / listPaymentIntentsByOrder
                                      │
                                      ▼ (optional)
                               PaymentGatewayPort
```

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
