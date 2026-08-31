# Order Module

Core data-plane domain module (`@ai-commerce/module-order`) for tenant-scoped orders created from completed checkouts.

## Principles

1. **Tenant-aware** — every order is scoped by `tenantId`.
2. **Checkout snapshot** — lines, address, and totals copied at create time.
3. **One order per checkout** — `createOrderFromCheckout` is idempotent.
4. **No hard checkout dependency** — `CheckoutLookup` port adapts `@ai-commerce/module-checkout`.
5. **Clean Architecture** — domain ports + service; in-memory adapter first.

## Flow

```
CreateOrderFromCheckoutInput + CheckoutLookup (status=completed)
        │
        ▼
OrderService
        ├── getOrder / getOrderByCheckoutId / listOrders
        └── cancelOrder (placed → cancelled)
                │
                ▼
        OrderRepository
```

## Sprint 17 Task Breakdown

| Task   | Deliverable                                                      |
| ------ | ---------------------------------------------------------------- |
| Task 1 | Domain model, `OrderService`, in-memory repository               |
| Task 2 | Status helpers (confirm/fulfill), list by cart / customer port   |
| Task 3 | `OrderModule` / `createOrderModule` facade + surface wiring docs |

## Deferred

- Payment capture / refunds (Payment module)
- Fulfillment / shipping labels
- Persistent DB
- HTTP / API handlers
