# Web Store Architecture

Config-driven consumer web storefront surface for CommerceOS AI.

## Overview

`@ai-commerce/web-store` resolves tenant configuration into a shell model, maps `store.*` routes through `WebScreenRegistry`, and exposes a React app via `createWebStore` → `WebStoreApp` / `mountWebStore`.

## Boundaries

```
Tenant config (ConfigProvider.resolve)
        ↓
createWebStore({ config, catalog? })
        ├── WebStoreShellResolver
        ├── WebScreenRegistry (defaults + extras)
        └── optional CatalogModule → catalogSurface
        ↓
WebStore facade (getViewModel / registerScreen / catalogSurface)
        ↓
WebStoreApp / mountWebStore
        └── WebShellLayout (header / top nav / content / footer)
```

| Concern                   | Owner                             |
| ------------------------- | --------------------------------- |
| Navigation / flags schema | Sprint 1 `config-schema`          |
| Config merge / validation | `@ai-commerce/config-runtime`     |
| Theme tokens              | `@ai-commerce/theme-engine`       |
| Brand assets              | `@ai-commerce/white-label-engine` |
| Shell + facade + React    | `@ai-commerce/web-store`          |

## Sprint 11 Task Breakdown

| Task   | Deliverable                                                           |
| ------ | --------------------------------------------------------------------- |
| Task 1 | Shell foundation — nav, feature flags, branding, domain/SEO/rendering |
| Task 2 | Screen registry + React storefront layout shell                       |
| Task 3 | `createWebStore` facade, `WebStoreApp`, `mountWebStore`, docs         |

## Catalog wiring (Sprint 19 Task 1)

Inject `@ai-commerce/module-catalog` when creating the store:

```ts
import { createCatalogModule } from '@ai-commerce/module-catalog';
import { createWebStore } from '@ai-commerce/web-store';

const catalog = createCatalogModule();
const store = createWebStore({ config: resolvedConfig, catalog });

if (store.isCatalogAvailable()) {
  const products = await store.catalogSurface.listActiveProducts();
}
```

Gated by tenant `featureFlags.modules.catalog`. Tenant id comes from the resolved shell.

## Cart + checkout wiring (Sprint 19 Task 2)

```ts
import { createCartModule } from '@ai-commerce/module-cart';
import { createCheckoutModule } from '@ai-commerce/module-checkout';
import { adaptCartLookup, adaptCatalogProductLookup, createWebStore } from '@ai-commerce/web-store';

const catalog = createCatalogModule();
const cart = createCartModule({ catalogLookup: adaptCatalogProductLookup(catalog) });
const checkout = createCheckoutModule({ cartLookup: adaptCartLookup(cart) });
const store = createWebStore({ config, catalog, cart, checkout });

const sessionCart = await store.cartSurface.getOrCreateBySession({ sessionId });
await store.cartSurface.addItemFromCatalog({
  cartId: sessionCart.id,
  productId,
  variantId,
});
await store.checkoutSurface.startCheckout(sessionCart.id);
```

Gated by `modules.cart` / `modules.checkout`. Default currency from tenant `currency.default`.

## Order + payment wiring (Sprint 19 Task 3)

```ts
import { createOrderModule } from '@ai-commerce/module-order';
import { createPaymentModule } from '@ai-commerce/module-payment';
import { adaptCheckoutLookup, adaptOrderLookup, createWebStore } from '@ai-commerce/web-store';

const orders = createOrderModule({ checkoutLookup: adaptCheckoutLookup(checkout) });
const payments = createPaymentModule({ orderLookup: adaptOrderLookup(orders) });
const store = createWebStore({ config, catalog, cart, checkout, orders, payments });

await store.checkoutSurface.completeCheckout(checkoutId);
const order = await store.orderSurface.createOrderFromCheckout(checkoutId);
const intent = await store.paymentSurface.createPaymentIntent({
  orderId: order.id,
  method: 'card',
});
await store.paymentSurface.capturePaymentIntent(intent.id);
```

Gateway / capture strategy defaults come from tenant `payments.*`.

## Deferred

- Dedicated Next.js / Vite host app
- Full theme compile at render time
- CDN / edge caching policies beyond `rendering.cacheTtlSeconds`
- Rich React screen components (hosts use `*Surface` + `renderScreen`)
