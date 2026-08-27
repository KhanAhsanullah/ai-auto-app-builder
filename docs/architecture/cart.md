# Cart Module

Core data-plane domain module (`@ai-commerce/module-cart`) for tenant-scoped shopping carts. Powers Web Store and Mobile buy flows; Admin may inspect carts later.

## Principles

1. **Tenant-aware** — every cart is scoped by `tenantId`.
2. **Variant lines** — lines key on `variantId`; re-adding merges quantity.
3. **Price snapshot** — `unitPrice` / `lineTotal` stored on the line (catalog re-price optional later).
4. **Guest or customer** — optional `sessionId` and/or `customerId`.
5. **Clean Architecture** — domain ports + service; in-memory adapter first.

## Flow

```
createCart → Cart (empty)
     │
     ▼
addItem / setLineQuantity / removeLine / clearCart
     │
     ▼
CartService → CartRepository  (subtotal recalculated)
```

## Sprint 15 Task Breakdown

| Task   | Deliverable                                                    |
| ------ | -------------------------------------------------------------- |
| Task 1 | Domain model, `CartService`, in-memory repository              |
| Task 2 | getOrCreate helpers, optional catalog price validation port    |
| Task 3 | `CartModule` / `createCartModule` facade + surface wiring docs |

## Deferred

- Promotions / coupons
- Tax preview
- Persistent DB
- Checkout handoff (Checkout module)
- Hard dependency on `@ai-commerce/module-catalog` (optional port in Task 2)
