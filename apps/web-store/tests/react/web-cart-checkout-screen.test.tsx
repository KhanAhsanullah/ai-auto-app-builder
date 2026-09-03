import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { createCartModule } from '@ai-commerce/module-cart';
import { createCatalogModule } from '@ai-commerce/module-catalog';
import { createCheckoutModule } from '@ai-commerce/module-checkout';

import { adaptCartLookup } from '../../src/domain/adapt-cart-lookup.js';
import { adaptCatalogProductLookup } from '../../src/domain/adapt-catalog-product-lookup.js';
import { createWebStore } from '../../src/infrastructure/create-web-store.js';
import { WebStoreApp } from '../../src/react/web-store-app.js';
import { loadResolvedTenantConfig } from '../helpers.js';

const TENANT_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

afterEach(() => {
  cleanup();
});

function createIdFactory() {
  let n = 0;
  return () => `id-${++n}`;
}

describe('WebStoreApp cart + checkout screens', () => {
  it('shows session cart lines on store.cart', async () => {
    const createId = createIdFactory();
    const now = () => '2026-09-04T08:00:00.000Z';
    const catalog = createCatalogModule({ now, createId });
    const product = await catalog.createProduct({
      tenantId: TENANT_ID,
      slug: 'milk',
      name: 'Milk',
      status: 'active',
      variants: [{ sku: 'MLK-1', title: '1L', price: { amount: 5, currency: 'PKR' } }],
    });
    const cart = createCartModule({
      catalogLookup: adaptCatalogProductLookup(catalog),
      now,
      createId,
    });
    const store = createWebStore({
      config: loadResolvedTenantConfig(),
      catalog,
      cart,
    });
    const sessionCart = await store.cartSurface.getOrCreateBySession({
      sessionId: 'web-guest',
    });
    await store.cartSurface.addItemFromCatalog({
      cartId: sessionCart.id,
      productId: product.id,
      variantId: product.variants[0]!.id,
    });

    render(<WebStoreApp store={store} activeRoute="store.cart" sessionId="web-guest" />);

    await waitFor(() => {
      expect(screen.getByTestId('web-cart-screen').getAttribute('data-state')).toBe('ready');
    });
    expect(screen.getByTestId('web-cart-line-MLK-1').textContent).toContain('Milk');
  });

  it('starts checkout form on store.checkout when cart has items', async () => {
    const createId = createIdFactory();
    const now = () => '2026-09-04T08:00:00.000Z';
    const catalog = createCatalogModule({ now, createId });
    const product = await catalog.createProduct({
      tenantId: TENANT_ID,
      slug: 'eggs',
      name: 'Eggs',
      status: 'active',
      variants: [{ sku: 'EGG-1', title: 'Dozen', price: { amount: 4, currency: 'PKR' } }],
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
    const store = createWebStore({
      config: loadResolvedTenantConfig(),
      catalog,
      cart,
      checkout,
    });
    const sessionCart = await store.cartSurface.getOrCreateBySession({
      sessionId: 'web-guest',
    });
    await store.cartSurface.addItemFromCatalog({
      cartId: sessionCart.id,
      productId: product.id,
      variantId: product.variants[0]!.id,
    });

    render(<WebStoreApp store={store} activeRoute="store.checkout" sessionId="web-guest" />);

    await waitFor(() => {
      expect(screen.getByTestId('web-checkout-screen').getAttribute('data-state')).toBe('ready');
    });
    expect(screen.getByTestId('web-checkout-submit')).toBeTruthy();
  });
});
