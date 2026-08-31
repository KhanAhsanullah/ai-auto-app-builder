# Checkout Module

Core data-plane domain module (`@ai-commerce/module-checkout`) for tenant-scoped checkout sessions started from a cart.

## Principles

1. **Tenant-aware** — every checkout session is scoped by `tenantId`.
2. **Cart snapshot** — lines and subtotal copied at start (no live cart mutation during checkout).
3. **Status machine** — `draft` → `address_collected` → `shipping_selected` → `completed` (or `cancelled`).
4. **No hard cart dependency** — `CartLookup` port adapts `@ai-commerce/module-cart`.
5. **Shipping from config** — optional `ShippingMethodCatalog` (host wires tenant shipping offers).
6. **Clean Architecture** — domain ports + service; in-memory adapter first.

## Flow

```
getActiveCheckoutByCart / startCheckout + CartLookup
        │
        ▼
CheckoutService
        ├── updateShippingAddress
        ├── listShippingMethods / selectShippingMethodById  (ShippingMethodCatalog)
        ├── selectShippingMethod (inline; validated when catalog set)
        ├── completeCheckout
        └── cancelCheckout
                │
                ▼
        CheckoutRepository
```

## Sprint 16 Task Breakdown

| Task   | Deliverable                                                          |
| ------ | -------------------------------------------------------------------- |
| Task 1 | Domain model, `CheckoutService`, in-memory repository                |
| Task 2 | getActiveByCart helper, shipping method catalog port (config-driven) |
| Task 3 | `CheckoutModule` / `createCheckoutModule` facade + surface wiring    |

## Deferred

- Payment intent / gateway integration (Payment module)
- Order creation handoff (Order module)
- Tax / promotions
- Persistent DB
- HTTP / API handlers
