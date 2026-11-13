import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { createCatalogModule } from '@ai-commerce/module-catalog';

import { createWebStore } from '../../src/infrastructure/create-web-store.js';
import { WebProductScreen } from '../../src/react/screens/web-product-screen.js';
import { loadResolvedTenantConfig } from '../helpers.js';

afterEach(() => {
  cleanup();
});

describe('WebProductScreen', () => {
  it('loads a product by slug', async () => {
    const catalog = createCatalogModule({
      now: () => '2026-11-13T00:00:00.000Z',
      createId: (() => {
        let n = 0;
        return () => `id-${++n}`;
      })(),
    });
    const config = loadResolvedTenantConfig();
    await catalog.createProduct({
      tenantId: config.tenant.id,
      slug: 'oil',
      name: 'Olive Oil',
      status: 'active',
      variants: [{ sku: 'OIL-1', title: '1L', price: { amount: 1800, currency: 'PKR' } }],
    });
    const store = createWebStore({ config, catalog });

    render(<WebProductScreen store={store} productSlug="oil" />);

    await waitFor(() => {
      expect(screen.getByTestId('web-product-screen').getAttribute('data-state')).toBe('ready');
    });
    expect(screen.getByTestId('web-product-name').textContent).toBe('Olive Oil');
    expect(screen.getByTestId('web-product-price').textContent).toContain('1800');
  });
});
