import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { createCheckoutModule } from '@ai-commerce/module-checkout';
import { createOrderModule } from '@ai-commerce/module-order';

import { createAdminDashboard } from '../../src/infrastructure/create-admin-dashboard.js';
import { AdminDashboardApp } from '../../src/react/admin-dashboard-app.js';
import { loadResolvedTenantConfig } from '../helpers.js';

const TENANT_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

afterEach(() => {
  cleanup();
});

describe('AdminDashboardApp orders screen', () => {
  it('lists orders on admin.orders when order is wired', async () => {
    let n = 0;
    const createId = () => `id-${++n}`;
    const now = () => '2026-09-04T09:00:00.000Z';

    const checkout = createCheckoutModule({
      cartLookup: {
        async getCart() {
          return {
            id: 'cart-a',
            tenantId: TENANT_ID,
            currency: 'PKR',
            subtotal: { amount: 5, currency: 'PKR' },
            lines: [
              {
                id: 'l1',
                productId: 'p1',
                variantId: 'v1',
                sku: 'SKU-1',
                title: 'Item',
                unitPrice: { amount: 5, currency: 'PKR' },
                quantity: 1,
                lineTotal: { amount: 5, currency: 'PKR' },
              },
            ],
          };
        },
      },
      now,
      createId,
    });
    const started = await checkout.startCheckout({
      tenantId: TENANT_ID,
      cartId: 'cart-a',
      id: 'chk-admin-1',
    });
    await checkout.updateShippingAddress({
      tenantId: TENANT_ID,
      checkoutId: started.id,
      address: {
        line1: '1 St',
        city: 'Karachi',
        postalCode: '74000',
        country: 'PK',
      },
    });
    await checkout.selectShippingMethod({
      tenantId: TENANT_ID,
      checkoutId: started.id,
      method: {
        id: 'standard',
        name: 'Standard',
        price: { amount: 0, currency: 'PKR' },
      },
    });
    await checkout.completeCheckout(TENANT_ID, started.id);

    const orders = createOrderModule({
      checkoutLookup: {
        async getCheckout(tenantId, checkoutId) {
          const session = await checkout.getCheckout(tenantId, checkoutId);
          if (
            session.status !== 'completed' ||
            !session.shippingAddress ||
            !session.shippingMethod
          ) {
            return undefined;
          }
          return {
            id: session.id,
            tenantId: session.tenantId,
            cartId: session.cartId,
            currency: session.currency,
            status: session.status,
            lines: [...session.lines],
            subtotal: session.subtotal,
            shipping: session.shipping!,
            total: session.total,
            shippingAddress: session.shippingAddress,
            shippingMethod: session.shippingMethod,
            completedAt: session.completedAt,
          };
        },
      },
      now,
      createId,
    });
    const order = await orders.createOrderFromCheckout({
      tenantId: TENANT_ID,
      checkoutId: started.id,
      id: 'ord-admin-1',
    });

    const dashboard = createAdminDashboard({
      config: loadResolvedTenantConfig(),
      orders,
    });

    render(<AdminDashboardApp dashboard={dashboard} activeRoute="admin.orders" />);

    await waitFor(() => {
      expect(screen.getByTestId('admin-orders-screen').getAttribute('data-state')).toBe('ready');
    });
    expect(screen.getByTestId(`admin-orders-row-${order.id}`).textContent).toContain('placed');
  });
});
