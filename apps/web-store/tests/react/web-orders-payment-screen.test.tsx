import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { createCartModule } from '@ai-commerce/module-cart';
import { createCatalogModule } from '@ai-commerce/module-catalog';
import { createCheckoutModule } from '@ai-commerce/module-checkout';
import { createOrderModule } from '@ai-commerce/module-order';
import { createPaymentModule } from '@ai-commerce/module-payment';

import { adaptCartLookup } from '../../src/domain/adapt-cart-lookup.js';
import { adaptCatalogProductLookup } from '../../src/domain/adapt-catalog-product-lookup.js';
import { adaptCheckoutLookup } from '../../src/domain/adapt-checkout-lookup.js';
import { adaptOrderLookup } from '../../src/domain/adapt-order-lookup.js';
import { createWebStore } from '../../src/infrastructure/create-web-store.js';
import { WebStoreApp } from '../../src/react/web-store-app.js';
import { loadResolvedTenantConfig } from '../helpers.js';

const TENANT_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

afterEach(() => {
  cleanup();
});

describe('WebStoreApp orders + payment screens', () => {
  it('confirms payment and lists order after checkout', async () => {
    let n = 0;
    const createId = () => `id-${++n}`;
    const now = () => '2026-09-04T09:00:00.000Z';
    const catalog = createCatalogModule({ now, createId });
    const product = await catalog.createProduct({
      tenantId: TENANT_ID,
      slug: 'sugar',
      name: 'Sugar',
      status: 'active',
      variants: [{ sku: 'SUG-1', title: '1kg', price: { amount: 3, currency: 'PKR' } }],
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

    const sessionCart = await store.cartSurface.getOrCreateBySession({
      sessionId: 'web-guest',
    });
    await store.cartSurface.addItemFromCatalog({
      cartId: sessionCart.id,
      productId: product.id,
      variantId: product.variants[0]!.id,
    });
    const started = await store.checkoutSurface.startCheckout(sessionCart.id);
    await store.checkoutSurface.updateShippingAddress(started.id, {
      line1: '1 St',
      city: 'Karachi',
      postalCode: '74000',
      country: 'PK',
    });
    await store.checkoutSurface.selectShippingMethod(started.id, {
      id: 'standard',
      name: 'Standard',
      price: { amount: 0, currency: 'PKR' },
    });
    const completed = await store.checkoutSurface.completeCheckout(started.id);

    render(
      <WebStoreApp
        store={store}
        activeRoute="store.payment"
        sessionId="web-guest"
        checkoutId={completed.id}
      />,
    );

    await waitFor(() => {
      expect(screen.getByTestId('web-payment-screen').getAttribute('data-state')).toBe('captured');
    });
    expect(screen.getByTestId('web-payment-done')).toBeTruthy();

    cleanup();
    render(<WebStoreApp store={store} activeRoute="store.orders" sessionId="web-guest" />);

    await waitFor(() => {
      expect(screen.getByTestId('web-orders-screen').getAttribute('data-state')).toBe('ready');
    });
    expect(screen.getByTestId('web-orders-list').textContent).toContain('placed');
  });
});
