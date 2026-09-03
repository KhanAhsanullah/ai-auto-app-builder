import { describe, expect, it } from 'vitest';

import type { CheckoutLookup } from '../src/domain/checkout-lookup.js';
import { OrderNotFoundException } from '../src/errors.js';
import { createOrderModule } from '../src/infrastructure/create-order-module.js';

const checkoutLookup: CheckoutLookup = {
  async getCheckout(tenantId, checkoutId) {
    if (tenantId !== 'tenant-fresh' || checkoutId !== 'chk-1') {
      return undefined;
    }
    return {
      id: 'chk-1',
      tenantId: 'tenant-fresh',
      cartId: 'cart-1',
      customerId: 'cust-1',
      currency: 'USD',
      status: 'completed',
      lines: [
        {
          id: 'line-1',
          productId: 'prod-1',
          variantId: 'var-1',
          sku: 'SKU-1',
          title: 'Item',
          unitPrice: { amount: 10, currency: 'USD' },
          quantity: 1,
          lineTotal: { amount: 10, currency: 'USD' },
        },
      ],
      subtotal: { amount: 10, currency: 'USD' },
      shipping: { amount: 5, currency: 'USD' },
      total: { amount: 15, currency: 'USD' },
      shippingAddress: {
        line1: '123 Main St',
        city: 'Austin',
        postalCode: '78701',
        country: 'US',
      },
      shippingMethod: {
        id: 'standard',
        name: 'Standard',
        price: { amount: 5, currency: 'USD' },
      },
    };
  },
};

describe('OrderModule / createOrderModule', () => {
  it('wires create → confirm → fulfill end-to-end', async () => {
    let n = 0;
    const orders = createOrderModule({
      checkoutLookup,
      now: () => '2026-09-04T01:00:00.000Z',
      createId: () => `id-${++n}`,
    });

    const created = await orders.createOrderFromCheckout({
      tenantId: 'tenant-fresh',
      checkoutId: 'chk-1',
      id: 'ord-1',
    });
    expect(created.status).toBe('placed');
    expect(created.customerId).toBe('cust-1');

    await orders.confirmOrder('tenant-fresh', 'ord-1');
    const fulfilled = await orders.fulfillOrder('tenant-fresh', 'ord-1');
    expect(fulfilled.status).toBe('fulfilled');

    await expect(orders.listOrdersByCustomer('tenant-fresh', 'cust-1')).resolves.toHaveLength(1);
  });

  it('getOrder throws when missing', async () => {
    const orders = createOrderModule({ checkoutLookup });
    await expect(orders.getOrder('tenant-fresh', 'missing')).rejects.toThrow(
      OrderNotFoundException,
    );
  });
});
