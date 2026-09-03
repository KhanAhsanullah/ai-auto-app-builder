import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { createCartModule } from '@ai-commerce/module-cart';
import { createCatalogModule } from '@ai-commerce/module-catalog';
import { createCheckoutModule } from '@ai-commerce/module-checkout';
import { createOrderModule } from '@ai-commerce/module-order';

import { adaptCartLookup } from '../../src/domain/adapt-cart-lookup.js';
import { adaptCatalogProductLookup } from '../../src/domain/adapt-catalog-product-lookup.js';
import { adaptCheckoutLookup } from '../../src/domain/adapt-checkout-lookup.js';
import { createMobileApp } from '../../src/infrastructure/create-mobile-app.js';
import { MobileAppRoot } from '../../src/native/mobile-app-root.js';
import { loadResolvedTenantConfig } from '../helpers.js';

const TENANT_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

afterEach(() => {
  cleanup();
});

describe('MobileAppRoot orders screen', () => {
  it('lists orders for the session cart', async () => {
    let n = 0;
    const createId = () => `id-${++n}`;
    const now = () => '2026-09-04T09:00:00.000Z';
    const catalog = createCatalogModule({ now, createId });
    const product = await catalog.createProduct({
      tenantId: TENANT_ID,
      slug: 'salt',
      name: 'Salt',
      status: 'active',
      variants: [{ sku: 'SLT-1', title: 'Pack', price: { amount: 1, currency: 'PKR' } }],
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
    const app = createMobileApp({
      config: loadResolvedTenantConfig(),
      catalog,
      cart,
      checkout,
      orders,
    });

    const sessionCart = await app.cartSurface.getOrCreateBySession({
      sessionId: 'mobile-guest',
    });
    await app.cartSurface.addItemFromCatalog({
      cartId: sessionCart.id,
      productId: product.id,
      variantId: product.variants[0]!.id,
    });
    const started = await app.checkoutSurface.startCheckout(sessionCart.id);
    await app.checkoutSurface.updateShippingAddress(started.id, {
      line1: '1 St',
      city: 'Karachi',
      postalCode: '74000',
      country: 'PK',
    });
    await app.checkoutSurface.selectShippingMethod(started.id, {
      id: 'standard',
      name: 'Standard',
      price: { amount: 0, currency: 'PKR' },
    });
    await app.checkoutSurface.completeCheckout(started.id);
    const order = await app.orderSurface.createOrderFromCheckout(started.id);

    render(<MobileAppRoot app={app} activeRoute="store.orders" sessionId="mobile-guest" />);

    await waitFor(() => {
      expect(screen.getByTestId(`mobile-orders-item-${order.id}`)).toBeTruthy();
    });
  });
});
