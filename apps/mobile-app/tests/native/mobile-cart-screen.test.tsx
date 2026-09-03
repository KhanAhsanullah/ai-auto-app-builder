import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { createCartModule } from '@ai-commerce/module-cart';
import { createCatalogModule } from '@ai-commerce/module-catalog';

import { adaptCatalogProductLookup } from '../../src/domain/adapt-catalog-product-lookup.js';
import { createMobileApp } from '../../src/infrastructure/create-mobile-app.js';
import { MobileAppRoot } from '../../src/native/mobile-app-root.js';
import { loadResolvedTenantConfig } from '../helpers.js';

const TENANT_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

afterEach(() => {
  cleanup();
});

describe('MobileAppRoot cart screen', () => {
  it('lists cart lines on store.cart when cart is wired', async () => {
    let n = 0;
    const createId = () => `id-${++n}`;
    const now = () => '2026-09-04T08:00:00.000Z';
    const catalog = createCatalogModule({ now, createId });
    const product = await catalog.createProduct({
      tenantId: TENANT_ID,
      slug: 'tea',
      name: 'Tea',
      status: 'active',
      variants: [{ sku: 'TEA-1', title: 'Box', price: { amount: 2, currency: 'PKR' } }],
    });
    const cart = createCartModule({
      catalogLookup: adaptCatalogProductLookup(catalog),
      now,
      createId,
    });
    const app = createMobileApp({
      config: loadResolvedTenantConfig(),
      catalog,
      cart,
    });
    const sessionCart = await app.cartSurface.getOrCreateBySession({
      sessionId: 'mobile-guest',
    });
    await app.cartSurface.addItemFromCatalog({
      cartId: sessionCart.id,
      productId: product.id,
      variantId: product.variants[0]!.id,
    });

    render(<MobileAppRoot app={app} activeRoute="store.cart" sessionId="mobile-guest" />);

    await waitFor(() => {
      expect(screen.getByTestId('mobile-cart-line-TEA-1')).toBeTruthy();
    });
    expect(screen.getByTestId('mobile-cart-line-TEA-1').textContent).toContain('Tea');
  });
});
