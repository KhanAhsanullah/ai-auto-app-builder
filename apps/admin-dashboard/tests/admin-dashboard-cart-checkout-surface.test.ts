import { describe, expect, it } from 'vitest';

import { createCartModule } from '@ai-commerce/module-cart';
import { createCheckoutModule } from '@ai-commerce/module-checkout';

import { createAdminDashboard } from '../src/infrastructure/create-admin-dashboard.js';
import { AdminDashboardCartUnavailableException } from '../src/errors.js';
import { loadResolvedTenantConfig } from './helpers.js';

const TENANT_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

describe('AdminDashboard cart + checkout surfaces', () => {
  it('lists carts when wired', async () => {
    const cart = createCartModule({
      now: () => '2026-09-04T05:00:00.000Z',
      createId: () => 'cart-admin-1',
    });
    await cart.createCart({
      tenantId: TENANT_ID,
      currency: 'PKR',
      id: 'cart-admin-1',
      sessionId: 's1',
    });

    const checkout = createCheckoutModule({
      cartLookup: {
        async getCart(tenantId, cartId) {
          try {
            const loaded = await cart.getCart(tenantId, cartId);
            return {
              id: loaded.id,
              tenantId: loaded.tenantId,
              currency: loaded.currency,
              subtotal: loaded.subtotal,
              lines: [...loaded.lines],
            };
          } catch {
            return undefined;
          }
        },
      },
    });

    const admin = createAdminDashboard({
      config: loadResolvedTenantConfig(),
      cart,
      checkout,
    });

    expect(admin.isCartAvailable()).toBe(true);
    await expect(admin.cartSurface.listCarts()).resolves.toHaveLength(1);
    await expect(admin.checkoutSurface.listCheckouts()).resolves.toHaveLength(0);
  });

  it('throws when cart is not wired', async () => {
    const admin = createAdminDashboard({ config: loadResolvedTenantConfig() });
    await expect(admin.cartSurface.listCarts()).rejects.toBeInstanceOf(
      AdminDashboardCartUnavailableException,
    );
  });
});
