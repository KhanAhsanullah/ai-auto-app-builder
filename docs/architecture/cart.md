# Cart Module

Core data-plane domain module (`@ai-commerce/module-cart`) for tenant-scoped shopping carts. Powers Web Store and Mobile buy flows; Admin may inspect carts later.

## Principles

1. **Tenant-aware** — every cart is scoped by `tenantId`.
2. **Variant lines** — lines key on `variantId`; re-adding merges quantity.
3. **Price snapshot** — `unitPrice` / `lineTotal` stored on the line; optional catalog validation.
4. **Guest or customer** — optional `sessionId` and/or `customerId` with getOrCreate helpers.
5. **Clean Architecture** — domain ports + service; in-memory adapter first.
6. **Facade entry** — callers use `createCartModule` / `CartModule`.

## Flow

```
createCartModule() → CartModule
        │
        ├─ getOrCreateBySession / getOrCreateByCustomer
        ├─ addItem / addItemFromCatalog / setLineQuantity / removeLine
        └─ getCart / listCarts
                │
                ├── optional CatalogProductLookup
                ▼
          CartService → CartRepository
```

## Surface wiring

Gate cart UI with tenant config `features.cart` (via Config Runtime). Pair with `createCatalogModule` for product pages → add-to-cart:

| Surface             | Typical calls                                                          |
| ------------------- | ---------------------------------------------------------------------- |
| **Web Store**       | `getOrCreateBySession`, `addItemFromCatalog` (or `addItem`), `getCart` |
| **Mobile App**      | Same as Web Store                                                      |
| **Admin Dashboard** | `listCarts`, `getCart` (inspect); cart management screens deferred     |
| **API Gateway**     | Thin handlers that call the same facade (HTTP deferred)                |

```ts
import { createCartModule } from '@ai-commerce/module-cart';
import { createCatalogModule } from '@ai-commerce/module-catalog';

const catalog = createCatalogModule();
const cart = createCartModule({
  catalogLookup: {
    findVariant: async (tenantId, productId, variantId) => {
      const product = await catalog.getProduct(tenantId, productId);
      const variant = product.variants.find((v) => v.id === variantId);
      if (!variant) return undefined;
      return {
        productId,
        variantId,
        sku: variant.sku,
        title: variant.title,
        unitPrice: variant.price,
        status: product.status,
      };
    },
  },
});

// Guest storefront flow
const sessionCart = await cart.getOrCreateBySession({
  tenantId,
  sessionId,
  currency: resolvedConfig.currency,
});
await cart.addItemFromCatalog({
  tenantId,
  cartId: sessionCart.id,
  productId,
  variantId,
});
```

Do **not** store cart lines in tenant JSON config — config only toggles `features.cart` and navigation routes.

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
