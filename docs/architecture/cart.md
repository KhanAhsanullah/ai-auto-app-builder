# Cart Module

Core data-plane domain module (`@ai-commerce/module-cart`) for tenant-scoped shopping carts. Powers Web Store and Mobile buy flows; Admin may inspect carts later.

## Principles

1. **Tenant-aware** — every cart is scoped by `tenantId`.
2. **Variant lines** — lines key on `variantId`; re-adding merges quantity.
3. **Price snapshot** — `unitPrice` / `lineTotal` stored on the line; optional catalog validation.
4. **Guest or customer** — optional `sessionId` and/or `customerId` with getOrCreate helpers.
5. **Clean Architecture** — domain ports + service; in-memory adapter first.

## Flow

```
getOrCreateBySession / getOrCreateByCustomer
        │
        ▼
createCart → Cart (empty)
        │
        ▼
addItem / addItemFromCatalog / setLineQuantity / removeLine / clearCart
        │
        ├── optional CatalogProductLookup (price + active status)
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
- Built-in hard dependency on `@ai-commerce/module-catalog` (wire via `CatalogProductLookup` adapter)
