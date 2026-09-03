# Order Module

Core data-plane domain module (`@ai-commerce/module-order`) for tenant-scoped orders created from completed checkouts.

## Principles

1. **Tenant-aware** — every order is scoped by `tenantId`.
2. **Checkout snapshot** — lines, address, and totals copied at create time.
3. **One order per checkout** — `createOrderFromCheckout` is idempotent.
4. **No hard checkout dependency** — `CheckoutLookup` port adapts `@ai-commerce/module-checkout`.
5. **Status machine** — `placed` → `confirmed` → `fulfilled` (or `cancelled`).
6. **Facade entry** — callers use `createOrderModule` / `OrderModule`.
7. **Clean Architecture** — domain ports + service; in-memory adapter first.

## Flow

```
createOrderModule({ checkoutLookup }) → OrderModule
        │
        ├─ createOrderFromCheckout
        ├─ confirmOrder / fulfillOrder / cancelOrder
        └─ listOrders / listOrdersByCart / listOrdersByCustomer
                │
                ▼
          OrderService → OrderRepository
```

## Surface wiring

Gate order UI with tenant config `features.order`. After checkout completes:

| Surface             | Typical calls                                               |
| ------------------- | ----------------------------------------------------------- |
| **Web Store**       | `createOrderFromCheckout`, `getOrder` (confirmation page)   |
| **Mobile App**      | Same as Web Store                                           |
| **Admin Dashboard** | `listOrders`, `confirmOrder`, `fulfillOrder`, `cancelOrder` |
| **API Gateway**     | Thin handlers that call the same facade (HTTP deferred)     |

```ts
import { createCheckoutModule } from '@ai-commerce/module-checkout';
import { createOrderModule } from '@ai-commerce/module-order';

const checkout = createCheckoutModule({ cartLookup, shippingCatalog });
const orders = createOrderModule({
  checkoutLookup: {
    getCheckout: async (tenantId, checkoutId) => {
      const session = await checkout.getCheckout(tenantId, checkoutId);
      // map completed session → CompletedCheckoutSnapshot
      return undefined;
    },
  },
});
```

Do **not** store orders in tenant JSON config — config only toggles `features.order`.

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
