import { describe, expect, it } from 'vitest';

import type { CheckoutLookup } from '../src/domain/checkout-lookup.js';
import { OrderService } from '../src/domain/order-service.js';
import { OrderStatusException } from '../src/errors.js';
import { InMemoryOrderRepository } from '../src/infrastructure/in-memory-order-repository.js';

const completedCheckout: CheckoutLookup = {
  async getCheckout(tenantId, checkoutId) {
    if (tenantId !== 'tenant-a') {
      return undefined;
    }
    if (checkoutId === 'chk-1') {
      return {
        id: 'chk-1',
        tenantId: 'tenant-a',
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
    }
    if (checkoutId === 'chk-2') {
      return {
        id: 'chk-2',
        tenantId: 'tenant-a',
        cartId: 'cart-2',
        customerId: 'cust-2',
        currency: 'USD',
        status: 'completed',
        lines: [
          {
            id: 'line-2',
            productId: 'prod-2',
            variantId: 'var-2',
            sku: 'SKU-2',
            title: 'Other',
            unitPrice: { amount: 20, currency: 'USD' },
            quantity: 1,
            lineTotal: { amount: 20, currency: 'USD' },
          },
        ],
        subtotal: { amount: 20, currency: 'USD' },
        shipping: { amount: 0, currency: 'USD' },
        total: { amount: 20, currency: 'USD' },
        shippingAddress: {
          line1: '1 Oak Ave',
          city: 'Dallas',
          postalCode: '75001',
          country: 'US',
        },
        shippingMethod: {
          id: 'pickup',
          name: 'Pickup',
          price: { amount: 0, currency: 'USD' },
        },
      };
    }
    return undefined;
  },
};

function createService() {
  let n = 0;
  return new OrderService({
    repository: new InMemoryOrderRepository(),
    checkoutLookup: completedCheckout,
    now: () => '2026-09-03T01:00:00.000Z',
    createId: () => `id-${++n}`,
  });
}

describe('OrderService Task 2 helpers', () => {
  it('confirms and fulfills an order', async () => {
    const service = createService();
    await service.createOrderFromCheckout({
      tenantId: 'tenant-a',
      checkoutId: 'chk-1',
      id: 'ord-1',
    });

    const confirmed = await service.confirmOrder('tenant-a', 'ord-1');
    expect(confirmed.status).toBe('confirmed');
    expect(confirmed.confirmedAt).toBe('2026-09-03T01:00:00.000Z');

    const fulfilled = await service.fulfillOrder('tenant-a', 'ord-1');
    expect(fulfilled.status).toBe('fulfilled');
    expect(fulfilled.fulfilledAt).toBe('2026-09-03T01:00:00.000Z');
  });

  it('rejects fulfill before confirm and cancel after fulfill', async () => {
    const service = createService();
    await service.createOrderFromCheckout({
      tenantId: 'tenant-a',
      checkoutId: 'chk-1',
      id: 'ord-1',
    });

    await expect(service.fulfillOrder('tenant-a', 'ord-1')).rejects.toThrow(OrderStatusException);

    await service.confirmOrder('tenant-a', 'ord-1');
    await service.fulfillOrder('tenant-a', 'ord-1');
    await expect(service.cancelOrder('tenant-a', 'ord-1')).rejects.toThrow(OrderStatusException);
  });

  it('allows cancel from confirmed and lists by cart/customer/status', async () => {
    const service = createService();
    await service.createOrderFromCheckout({
      tenantId: 'tenant-a',
      checkoutId: 'chk-1',
      id: 'ord-1',
    });
    await service.createOrderFromCheckout({
      tenantId: 'tenant-a',
      checkoutId: 'chk-2',
      id: 'ord-2',
    });

    await service.confirmOrder('tenant-a', 'ord-1');
    await service.cancelOrder('tenant-a', 'ord-1');

    await expect(service.listOrdersByCart('tenant-a', 'cart-1')).resolves.toMatchObject([
      { id: 'ord-1', status: 'cancelled' },
    ]);
    await expect(service.listOrdersByCustomer('tenant-a', 'cust-2')).resolves.toMatchObject([
      { id: 'ord-2', customerId: 'cust-2' },
    ]);
    await expect(service.listOrders('tenant-a', { status: 'placed' })).resolves.toMatchObject([
      { id: 'ord-2' },
    ]);
  });
});
