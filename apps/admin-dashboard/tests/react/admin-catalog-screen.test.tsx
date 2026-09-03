import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { createCatalogModule } from '@ai-commerce/module-catalog';

import { createAdminDashboard } from '../../src/infrastructure/create-admin-dashboard.js';
import { AdminDashboardApp } from '../../src/react/admin-dashboard-app.js';
import { loadResolvedTenantConfig } from '../helpers.js';

afterEach(() => {
  cleanup();
});

describe('AdminDashboardApp catalog screen', () => {
  it('lists products on admin.catalog when catalog is wired', async () => {
    const catalog = createCatalogModule({
      now: () => '2026-09-04T07:00:00.000Z',
      createId: (() => {
        let n = 0;
        return () => `id-${++n}`;
      })(),
    });
    const dashboard = createAdminDashboard({
      config: loadResolvedTenantConfig(),
      catalog,
    });

    await dashboard.catalogSurface.createProduct({
      slug: 'oil',
      name: 'Cooking Oil',
      status: 'draft',
      variants: [{ sku: 'OIL-1', title: '1L', price: { amount: 8, currency: 'PKR' } }],
    });

    render(<AdminDashboardApp dashboard={dashboard} activeRoute="admin.catalog" />);

    await waitFor(() => {
      expect(screen.getByTestId('admin-catalog-screen').getAttribute('data-state')).toBe('ready');
    });
    expect(screen.getByTestId('admin-catalog-row-oil').textContent).toContain('Cooking Oil');
    expect(screen.getByTestId('admin-catalog-row-oil').textContent).toContain('draft');
  });
});
