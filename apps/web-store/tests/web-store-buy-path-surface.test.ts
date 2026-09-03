import { describe, expect, it } from 'vitest';

import { createCartModule } from '@ai-commerce/module-cart';
import { createCatalogModule } from '@ai-commerce/module-catalog';
import { createCheckoutModule } from '@ai-commerce/module-checkout';
import { createOrderModule } from '@ai-commerce/module-order';
import { createPaymentModule } from '@ai-commerce/module-payment';

import { adaptCartLookup } from '../src/domain/adapt-cart-lookup.js';
import { adaptCatalogProductLookup } from '../src/domain/adapt-catalog-product-lookup.js';
import { adaptCheckoutLookup } from '../src/domain/adapt-checkout-lookup.js';
import { adaptOrderLookup } from '../src/domain/adapt-order-lookup.js';
import { createWebStore } from '../src/infrastructure/create-web-store.js';
import { loadResolvedTenantConfig } from './helpers.js';

const TENANT_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

describe('WebStore buy-path surfaces (order + payment)', () => {
  it('runs catalog → cart → checkout → order → payment capture', async () => {
    let n = 0;
    const createId = () => `id-${++n}`;
    const now = () => '2026-09-04T06:00:00.000Z';

    const catalog = createCatalogModule({ now, createId });
    const product = await catalog.createProduct({
      tenantId: TENANT_ID,
      slug: 'chai',
      name: 'Chai',
      status: 'active',
      variants: [{ sku: 'CHAI-1', title: 'Box', price: { amount: 4, currency: 'PKR' } }],
    });

    const cart = createCartModule({
      catalogLookup: adaptCatalogProductLookup(catalog),
      now,
      createId,
    });
    const checkout = createCheckoutModule({
      cartLookup: adaptCartLookup(cart),
      now,
      createId,
    });
    const orders = createOrderModule({
      checkoutLookup: adaptCheckoutLookup(checkout),
      now,
      createId,
    });
    const payments = createPaymentModule({
      orderLookup: adaptOrderLookup(orders),
      now,
      createId,
    });

    const store = createWebStore({
      config: loadResolvedTenantConfig(),
      catalog,
      cart,
      checkout,
      orders,
      payments,
    });

    expect(store.isOrderAvailable()).toBe(true);
    expect(store.isPaymentAvailable()).toBe(true);

    const sessionCart = await store.cartSurface.getOrCreateBySession({
      sessionId: 'buy-sess',
      id: 'buy-cart',
    });
    await store.cartSurface.addItemFromCatalog({
      cartId: sessionCart.id,
      productId: product.id,
      variantId: product.variants[0]!.id,
    });

    const started = await store.checkoutSurface.startCheckout(sessionCart.id, 'buy-chk');
    await store.checkoutSurface.updateShippingAddress(started.id, {
      line1: '1 Street',
      city: 'Karachi',
      postalCode: '74000',
      country: 'PK',
    });
    await store.checkoutSurface.selectShippingMethod(started.id, {
      id: 'standard',
      name: 'Standard',
      price: { amount: 2, currency: 'PKR' },
    });
    await store.checkoutSurface.completeCheckout(started.id);

    const order = await store.orderSurface.createOrderFromCheckout(started.id, 'buy-ord');
    expect(order.status).toBe('placed');
    expect(order.total.amount).toBe(6);

    const intent = await store.paymentSurface.createPaymentIntent({
      orderId: order.id,
      method: 'card',
      id: 'buy-pi',
    });
    // tenant config captureStrategy is immediate → capture from pending
    expect(intent.captureStrategy).toBe('immediate');
    expect(intent.gateway).toBe('jazzcash');

    const captured = await store.paymentSurface.capturePaymentIntent(intent.id);
    expect(captured.status).toBe('captured');
  });
});
