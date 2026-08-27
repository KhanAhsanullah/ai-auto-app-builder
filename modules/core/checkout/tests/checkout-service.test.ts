import { describe, expect, it } from 'vitest';

import type { CartLookup } from '../src/domain/cart-lookup.js';
import { CheckoutService } from '../src/domain/checkout-service.js';
import {
  CheckoutCartException,
  CheckoutNotFoundException,
  CheckoutStatusException,
  CheckoutValidationException,
} from '../src/errors.js';
import { InMemoryCheckoutRepository } from '../src/infrastructure/in-memory-checkout-repository.js';

function createService(cartLookup: CartLookup) {
  let n = 0;
  return new CheckoutService({
    repository: new InMemoryCheckoutRepository(),
    cartLookup,
    now: () => '2026-08-28T03:00:00.000Z',
    createId: () => `id-${++n}`,
  });
}

const cartLookup: CartLookup = {
  async getCart(tenantId, cartId) {
    if (tenantId !== 'tenant-a' || cartId !== 'cart-1') {
      return undefined;
    }
    return {
      id: 'cart-1',
      tenantId: 'tenant-a',
      currency: 'USD',
      subtotal: { amount: 10, currency: 'USD' },
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
    };
  },
};

describe('CheckoutService', () => {
  it('starts checkout from a cart and completes the pipeline', async () => {
    const service = createService(cartLookup);

    const started = await service.startCheckout({
      tenantId: 'tenant-a',
      cartId: 'cart-1',
      id: 'chk-1',
    });

    expect(started).toMatchObject({
      id: 'chk-1',
      status: 'draft',
      subtotal: { amount: 10, currency: 'USD' },
      total: { amount: 10, currency: 'USD' },
    });

    const withAddress = await service.updateShippingAddress({
      tenantId: 'tenant-a',
      checkoutId: 'chk-1',
      address: {
        line1: '123 Main St',
        city: 'Austin',
        postalCode: '78701',
        country: 'US',
      },
    });
    expect(withAddress.status).toBe('address_collected');

    const withShipping = await service.selectShippingMethod({
      tenantId: 'tenant-a',
      checkoutId: 'chk-1',
      method: {
        id: 'standard',
        name: 'Standard',
        price: { amount: 5, currency: 'USD' },
      },
    });
    expect(withShipping.status).toBe('shipping_selected');
    expect(withShipping.total).toEqual({ amount: 15, currency: 'USD' });

    const completed = await service.completeCheckout('tenant-a', 'chk-1');
    expect(completed.status).toBe('completed');
    expect(completed.completedAt).toBe('2026-08-28T03:00:00.000Z');
  });

  it('rejects empty or missing carts', async () => {
    const emptyLookup: CartLookup = {
      async getCart() {
        return {
          id: 'cart-empty',
          tenantId: 'tenant-a',
          currency: 'USD',
          subtotal: { amount: 0, currency: 'USD' },
          lines: [],
        };
      },
    };
    const service = createService(emptyLookup);
    await expect(
      service.startCheckout({ tenantId: 'tenant-a', cartId: 'cart-empty' }),
    ).rejects.toThrow(CheckoutCartException);

    const service2 = createService({
      async getCart() {
        return undefined;
      },
    });
    await expect(
      service2.startCheckout({ tenantId: 'tenant-a', cartId: 'missing' }),
    ).rejects.toThrow(CheckoutCartException);
  });

  it('rejects duplicate active checkout for same cart', async () => {
    const service = createService(cartLookup);
    await service.startCheckout({ tenantId: 'tenant-a', cartId: 'cart-1', id: 'chk-1' });
    await expect(
      service.startCheckout({ tenantId: 'tenant-a', cartId: 'cart-1', id: 'chk-2' }),
    ).rejects.toThrow(CheckoutValidationException);
  });

  it('requires address before shipping and blocks invalid transitions', async () => {
    const service = createService(cartLookup);
    await service.startCheckout({ tenantId: 'tenant-a', cartId: 'cart-1', id: 'chk-1' });

    await expect(
      service.selectShippingMethod({
        tenantId: 'tenant-a',
        checkoutId: 'chk-1',
        method: { id: 'std', name: 'Standard', price: { amount: 5, currency: 'USD' } },
      }),
    ).rejects.toThrow(CheckoutValidationException);

    await expect(service.completeCheckout('tenant-a', 'chk-1')).rejects.toThrow(
      CheckoutStatusException,
    );
  });

  it('cancels active checkout but not completed', async () => {
    const service = createService(cartLookup);
    await service.startCheckout({ tenantId: 'tenant-a', cartId: 'cart-1', id: 'chk-1' });
    const cancelled = await service.cancelCheckout('tenant-a', 'chk-1');
    expect(cancelled.status).toBe('cancelled');

    await expect(service.getCheckout('tenant-a', 'missing')).rejects.toThrow(
      CheckoutNotFoundException,
    );
  });
});
