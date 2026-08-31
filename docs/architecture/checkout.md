# Checkout Module

Core data-plane domain module (`@ai-commerce/module-checkout`) for tenant-scoped checkout sessions started from a cart.

## Principles

1. **Tenant-aware** — every checkout session is scoped by `tenantId`.
2. **Cart snapshot** — lines and subtotal copied at start (no live cart mutation during checkout).
3. **Status machine** — `draft` → `address_collected` → `shipping_selected` → `completed` (or `cancelled`).
4. **No hard cart dependency** — `CartLookup` port adapts `@ai-commerce/module-cart`.
5. **Shipping from config** — optional `ShippingMethodCatalog` (host wires tenant shipping offers).
6. **Facade entry** — callers use `createCheckoutModule` / `CheckoutModule`.
7. **Clean Architecture** — domain ports + service; in-memory adapter first.

## Flow

```
createCheckoutModule({ cartLookup, shippingCatalog? }) → CheckoutModule
        │
        ├─ getActiveCheckoutByCart / startCheckout
        ├─ updateShippingAddress
        ├─ listShippingMethods / selectShippingMethodById
        ├─ completeCheckout / cancelCheckout
        │
        ▼
  CheckoutService → CheckoutRepository
```

## Surface wiring

Gate checkout UI with tenant config `features.checkout`. Wire cart → checkout in the host:

| Surface             | Typical calls                                                                                             |
| ------------------- | --------------------------------------------------------------------------------------------------------- |
| **Web Store**       | `getActiveCheckoutByCart` / `startCheckout`, address form, `selectShippingMethodById`, `completeCheckout` |
| **Mobile App**      | Same as Web Store                                                                                         |
| **Admin Dashboard** | `listCheckouts` / `getCheckout` (inspect); payment ops deferred                                           |
| **API Gateway**     | Thin handlers that call the same facade (HTTP deferred)                                                   |

```ts
import { createCartModule } from '@ai-commerce/module-cart';
import { createCheckoutModule, InMemoryShippingMethodCatalog } from '@ai-commerce/module-checkout';

const cart = createCartModule();
const checkout = createCheckoutModule({
  cartLookup: {
    getCart: async (tenantId, cartId) => {
      const c = await cart.getCart(tenantId, cartId);
      return {
        id: c.id,
        tenantId: c.tenantId,
        currency: c.currency,
        subtotal: c.subtotal,
        lines: [...c.lines],
      };
    },
  },
  // Prefer offers from resolved tenant config in production
  shippingCatalog: new InMemoryShippingMethodCatalog([
    { id: 'standard', name: 'Standard', price: { amount: 5, currency: 'USD' } },
  ]),
});
```

Do **not** store checkout sessions in tenant JSON config — config toggles `features.checkout` and supplies shipping offers via the catalog adapter.

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
