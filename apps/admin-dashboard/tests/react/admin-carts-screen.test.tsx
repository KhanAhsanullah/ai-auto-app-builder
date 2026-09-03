import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { createCartModule } from '@ai-commerce/module-cart';

import { createAdminDashboard } from '../../src/infrastructure/create-admin-dashboard.js';
import { AdminDashboardApp } from '../../src/react/admin-dashboard-app.js';
import { loadResolvedTenantConfig } from '../helpers.js';

const TENANT_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

afterEach(() => {
  cleanup();
});

describe('AdminDashboardApp carts screen', () => {
  it('lists carts on admin.carts when cart is wired', async () => {
    const cart = createCartModule({
      now: () => '2026-09-04T08:00:00.000Z',
      createId: () => 'cart-inspect-1',
    });
    await cart.createCart({
      tenantId: TENANT_ID,
      currency: 'PKR',
      id: 'cart-inspect-1',
      sessionId: 'admin-inspect',
    });
    await cart.addItem({
      tenantId: TENANT_ID,
      cartId: 'cart-inspect-1',
      productId: 'p1',
      variantId: 'v1',
      sku: 'RIC-1',
      title: 'Rice',
      unitPrice: { amount: 10, currency: 'PKR' },
      quantity: 1,
    });

    const dashboard = createAdminDashboard({
      config: loadResolvedTenantConfig(),
      cart,
    });

    render(<AdminDashboardApp dashboard={dashboard} activeRoute="admin.carts" />);

    await waitFor(() => {
      expect(screen.getByTestId('admin-carts-screen').getAttribute('data-state')).toBe('ready');
    });
    expect(screen.getByTestId('admin-carts-row-cart-inspect-1').textContent).toContain(
      'admin-inspect',
    );
  });
});
