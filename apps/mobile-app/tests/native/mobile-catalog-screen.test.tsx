import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { createCatalogModule } from '@ai-commerce/module-catalog';

import { createMobileApp } from '../../src/infrastructure/create-mobile-app.js';
import { MobileAppRoot } from '../../src/native/mobile-app-root.js';
import { loadResolvedTenantConfig } from '../helpers.js';

const TENANT_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

afterEach(() => {
  cleanup();
});

describe('MobileAppRoot catalog screen', () => {
  it('lists active products on store.catalog when catalog is wired', async () => {
    const catalog = createCatalogModule({
      now: () => '2026-09-04T07:00:00.000Z',
      createId: (() => {
        let n = 0;
        return () => `id-${++n}`;
      })(),
    });
    await catalog.createProduct({
      tenantId: TENANT_ID,
      slug: 'dates',
      name: 'Dates',
      status: 'active',
      variants: [{ sku: 'DAT-1', title: 'Pack', price: { amount: 6, currency: 'PKR' } }],
    });

    const app = createMobileApp({
      config: loadResolvedTenantConfig(),
      catalog,
    });

    render(<MobileAppRoot app={app} activeRoute="store.catalog" />);

    await waitFor(() => {
      expect(screen.getByTestId('mobile-catalog-item-dates')).toBeTruthy();
    });
    expect(screen.getByTestId('mobile-catalog-item-dates').textContent).toContain('Dates');
  });
});
