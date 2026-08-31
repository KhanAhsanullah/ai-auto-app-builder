import { describe, expect, it } from 'vitest';

import type { CheckoutLookup } from '../src/domain/checkout-lookup.js';
import { OrderService } from '../src/domain/order-service.js';
import {
  OrderCheckoutException,
  OrderNotFoundException,
  OrderValidationException,
} from '../src/errors.js';
import { InMemoryOrderRepository } from '../src/infrastructure/in-memory-order-repository.js';

const completedCheckout: CheckoutLookup = {
  async getCheckout(tenantId, checkoutId) {
    if (tenantId !== 'tenant-a' || checkoutId !== 'chk-1') {
      return undefined;
    }
    return {
      id: 'chk-1',
      tenantId: 'tenant-a',
      cartId: 'cart-1',
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
      completedAt: '2026-08-31T22:00:00.000Z',
    };
  },
};

function createService(lookup: CheckoutLookup = completedCheckout) {
  let n = 0;
  return new OrderService({
    repository: new InMemoryOrderRepository(),
    checkoutLookup: lookup,
    now: () => '2026-08-31T22:30:00.000Z',
    createId: () => `id-${++n}`,
  });
}

describe('OrderService', () => {
  it('creates an order from a completed checkout', async () => {
    const service = createService();
    const order = await service.createOrderFromCheckout({
      tenantId: 'tenant-a',
      checkoutId: 'chk-1',
      id: 'ord-1',
    });

    expect(order).toMatchObject({
      id: 'ord-1',
      checkoutId: 'chk-1',
      cartId: 'cart-1',
      status: 'placed',
      total: { amount: 15, currency: 'USD' },
      shippingMethod: { id: 'standard' },
    });

    await expect(service.getOrder('tenant-a', 'ord-1')).resolves.toMatchObject({ id: 'ord-1' });
    await expect(service.listOrders('tenant-a')).resolves.toHaveLength(1);
  });

  it('is idempotent for the same checkout', async () => {
    const service = createService();
    const first = await service.createOrderFromCheckout({
      tenantId: 'tenant-a',
      checkoutId: 'chk-1',
      id: 'ord-1',
    });
    const second = await service.createOrderFromCheckout({
      tenantId: 'tenant-a',
      checkoutId: 'chk-1',
      id: 'ord-2',
    });
    expect(second.id).toBe(first.id);
  });

  it('rejects non-completed or missing checkouts', async () => {
    const draftLookup: CheckoutLookup = {
      async getCheckout() {
        return {
          ...(await completedCheckout.getCheckout('tenant-a', 'chk-1'))!,
          status: 'draft',
        };
      },
    };
    const service = createService(draftLookup);
    await expect(
      service.createOrderFromCheckout({ tenantId: 'tenant-a', checkoutId: 'chk-1' }),
    ).rejects.toThrow(OrderCheckoutException);

    const missing = createService({
      async getCheckout() {
        return undefined;
      },
    });
    await expect(
      missing.createOrderFromCheckout({ tenantId: 'tenant-a', checkoutId: 'missing' }),
    ).rejects.toThrow(OrderCheckoutException);
  });

  it('cancels a placed order and looks up by checkout', async () => {
    const service = createService();
    await service.createOrderFromCheckout({
      tenantId: 'tenant-a',
      checkoutId: 'chk-1',
      id: 'ord-1',
    });

    const cancelled = await service.cancelOrder('tenant-a', 'ord-1');
    expect(cancelled.status).toBe('cancelled');
    expect(cancelled.cancelledAt).toBe('2026-08-31T22:30:00.000Z');

    await expect(service.getOrderByCheckoutId('tenant-a', 'chk-1')).resolves.toMatchObject({
      status: 'cancelled',
    });
  });

  it('throws when order is missing', async () => {
    const service = createService();
    await expect(service.getOrder('tenant-a', 'missing')).rejects.toThrow(OrderNotFoundException);
    await expect(
      service.createOrderFromCheckout({ tenantId: 'tenant-a', checkoutId: '' }),
    ).rejects.toThrow(OrderValidationException);
  });
});
