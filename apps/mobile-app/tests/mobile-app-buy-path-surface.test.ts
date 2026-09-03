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
import { createMobileApp } from '../src/infrastructure/create-mobile-app.js';
import { loadResolvedTenantConfig } from './helpers.js';

const TENANT_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

describe('MobileApp buy-path surfaces', () => {
  it('creates order and captures payment', async () => {
    let n = 0;
    const createId = () => `m-${++n}`;
    const now = () => '2026-09-04T06:00:00.000Z';

    const catalog = createCatalogModule({ now, createId });
    const product = await catalog.createProduct({
      tenantId: TENANT_ID,
      slug: 'lassi',
      name: 'Lassi',
      status: 'active',
      variants: [{ sku: 'LAS-1', title: 'Cup', price: { amount: 2, currency: 'PKR' } }],
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

    const app = createMobileApp({
      config: loadResolvedTenantConfig(),
      catalog,
      cart,
      checkout,
      orders,
      payments,
    });

    const sessionCart = await app.cartSurface.getOrCreateBySession({
      sessionId: 'm-buy',
      id: 'm-cart',
    });
    await app.cartSurface.addItemFromCatalog({
      cartId: sessionCart.id,
      productId: product.id,
      variantId: product.variants[0]!.id,
    });
    const started = await app.checkoutSurface.startCheckout(sessionCart.id, 'm-chk');
    await app.checkoutSurface.updateShippingAddress(started.id, {
      line1: '2 Road',
      city: 'Lahore',
      postalCode: '54000',
      country: 'PK',
    });
    await app.checkoutSurface.selectShippingMethod(started.id, {
      id: 'pickup',
      name: 'Pickup',
      price: { amount: 0, currency: 'PKR' },
    });
    await app.checkoutSurface.completeCheckout(started.id);

    const order = await app.orderSurface.createOrderFromCheckout(started.id);
    const intent = await app.paymentSurface.createPaymentIntent({
      orderId: order.id,
      method: 'wallet',
    });
    const captured = await app.paymentSurface.capturePaymentIntent(intent.id);
    expect(captured.status).toBe('captured');
  });
});
