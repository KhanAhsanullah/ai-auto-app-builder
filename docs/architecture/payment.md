# Payment Module

Core data-plane domain module (`@ai-commerce/module-payment`) for tenant-scoped payment intents created against payable orders.

## Principles

1. **Tenant-aware** — every intent is scoped by `tenantId`.
2. **Order-backed amount** — amount and currency come from the order snapshot, not caller input.
3. **One intent per order** — `createPaymentIntent` is idempotent.
4. **No hard order dependency** — `OrderLookup` port adapts `@ai-commerce/module-order`.
5. **Config-driven gateways** — `gateway` / `method` / `captureStrategy` are passed in from tenant `payments` config; never hardcoded per tenant.
6. **No live PCI** — provider SDKs and webhooks deferred; intents stay domain records until a gateway adapter exists.
7. **Clean Architecture** — domain ports + service; in-memory adapter first.

## Flow

```
OrderLookup.getOrder → PaymentService.createPaymentIntent → PaymentRepository
                              │
                              ├─ getPaymentIntent / getPaymentIntentByOrderId
                              └─ listPaymentIntents
```

## Status machine (Task 1 creates `pending` only)

```
pending → authorized → captured
   │           │
   └───────────┴──→ failed | cancelled
```

Authorize / capture / fail helpers: Sprint 18 Task 2. Facade: Task 3.

## Sprint 18 Task Breakdown

| Task   | Deliverable                                                          |
| ------ | -------------------------------------------------------------------- |
| Task 1 | Domain model, `PaymentService`, in-memory repository                 |
| Task 2 | Authorize / capture / fail helpers + optional gateway port           |
| Task 3 | `PaymentModule` / `createPaymentModule` facade + surface wiring docs |

## Deferred

- Real Stripe / PayPal / JazzCash / EasyPaisa adapters
- Webhooks and reconciliation
- Refunds
- Persistent DB
- HTTP / API handlers
- Split payments
