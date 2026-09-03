import { describe, expect, it } from 'vitest';

import { createCheckoutModule } from '@ai-commerce/module-checkout';
import { createOrderModule } from '@ai-commerce/module-order';
import { createPaymentModule } from '@ai-commerce/module-payment';

import { createAdminDashboard } from '../src/infrastructure/create-admin-dashboard.js';
import { AdminDashboardOrderUnavailableException } from '../src/errors.js';
import { loadResolvedTenantConfig } from './helpers.js';

const TENANT_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

describe('AdminDashboard order + payment surfaces', () => {
  it('confirms order and lists payments', async () => {
    let n = 0;
    const createId = () => `a-${++n}`;
    const now = () => '2026-09-04T06:00:00.000Z';

    const checkout = createCheckoutModule({
      cartLookup: {
        async getCart() {
          return {
            id: 'cart-a',
            tenantId: TENANT_ID,
            currency: 'PKR',
            subtotal: { amount: 10, currency: 'PKR' },
            lines: [
              {
                id: 'l1',
                productId: 'p1',
                variantId: 'v1',
                sku: 'SKU',
                title: 'Item',
                unitPrice: { amount: 10, currency: 'PKR' },
                quantity: 1,
                lineTotal: { amount: 10, currency: 'PKR' },
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
      id: 'chk-a',
    });
    await checkout.updateShippingAddress({
      tenantId: TENANT_ID,
      checkoutId: started.id,
      address: {
        line1: 'Admin St',
        city: 'Islamabad',
        postalCode: '44000',
        country: 'PK',
      },
    });
    await checkout.selectShippingMethod({
      tenantId: TENANT_ID,
      checkoutId: started.id,
      method: { id: 'std', name: 'Std', price: { amount: 0, currency: 'PKR' } },
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
      id: 'ord-a',
    });

    const payments = createPaymentModule({
      orderLookup: {
        async getOrder(tenantId, orderId) {
          const loaded = await orders.getOrder(tenantId, orderId);
          return {
            id: loaded.id,
            tenantId: loaded.tenantId,
            checkoutId: loaded.checkoutId,
            currency: loaded.currency,
            status: loaded.status,
            total: loaded.total,
          };
        },
      },
      now,
      createId,
    });
    await payments.createPaymentIntent({
      tenantId: TENANT_ID,
      orderId: order.id,
      method: 'card',
      id: 'pi-a',
    });

    const admin = createAdminDashboard({
      config: loadResolvedTenantConfig(),
      orders,
      payments,
    });

    expect(admin.isOrderAvailable()).toBe(true);
    const confirmed = await admin.orderSurface.confirmOrder(order.id);
    expect(confirmed.status).toBe('confirmed');

    const intents = await admin.paymentSurface.listPaymentIntents();
    expect(intents).toHaveLength(1);
  });

  it('throws when order is not wired', async () => {
    const admin = createAdminDashboard({ config: loadResolvedTenantConfig() });
    await expect(admin.orderSurface.listOrders()).rejects.toBeInstanceOf(
      AdminDashboardOrderUnavailableException,
    );
  });
});
