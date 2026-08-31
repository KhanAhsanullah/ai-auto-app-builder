import { describe, expect, it } from 'vitest';

import type { CartLookup } from '../src/domain/cart-lookup.js';
import { CheckoutService } from '../src/domain/checkout-service.js';
import { CheckoutShippingException, CheckoutValidationException } from '../src/errors.js';
import { InMemoryCheckoutRepository } from '../src/infrastructure/in-memory-checkout-repository.js';
import { InMemoryShippingMethodCatalog } from '../src/infrastructure/in-memory-shipping-method-catalog.js';

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

function createService(withCatalog = true) {
  let n = 0;
  return new CheckoutService({
    repository: new InMemoryCheckoutRepository(),
    cartLookup,
    shippingCatalog: withCatalog
      ? new InMemoryShippingMethodCatalog([
          {
            id: 'standard',
            name: 'Standard',
            price: { amount: 5, currency: 'USD' },
          },
          {
            id: 'express',
            name: 'Express',
            price: { amount: 15, currency: 'USD' },
          },
        ])
      : undefined,
    now: () => '2026-08-31T18:00:00.000Z',
    createId: () => `id-${++n}`,
  });
}

async function startWithAddress(service: CheckoutService) {
  await service.startCheckout({ tenantId: 'tenant-a', cartId: 'cart-1', id: 'chk-1' });
  await service.updateShippingAddress({
    tenantId: 'tenant-a',
    checkoutId: 'chk-1',
    address: {
      line1: '123 Main St',
      city: 'Austin',
      postalCode: '78701',
      country: 'US',
    },
  });
}

describe('CheckoutService Task 2 helpers', () => {
  it('getActiveCheckoutByCart returns active session and clears after cancel', async () => {
    const service = createService();
    await service.startCheckout({ tenantId: 'tenant-a', cartId: 'cart-1', id: 'chk-1' });

    await expect(service.getActiveCheckoutByCart('tenant-a', 'cart-1')).resolves.toMatchObject({
      id: 'chk-1',
      status: 'draft',
    });

    await service.cancelCheckout('tenant-a', 'chk-1');
    await expect(service.getActiveCheckoutByCart('tenant-a', 'cart-1')).resolves.toBeUndefined();

    // Can start a new checkout after cancel
    await expect(
      service.startCheckout({ tenantId: 'tenant-a', cartId: 'cart-1', id: 'chk-2' }),
    ).resolves.toMatchObject({ id: 'chk-2' });
  });

  it('lists shipping methods and selects by id from catalog', async () => {
    const service = createService();
    await startWithAddress(service);

    const methods = await service.listShippingMethods('tenant-a', 'chk-1');
    expect(methods.map((m) => m.id)).toEqual(['standard', 'express']);

    const selected = await service.selectShippingMethodById({
      tenantId: 'tenant-a',
      checkoutId: 'chk-1',
      methodId: 'express',
    });
    expect(selected.status).toBe('shipping_selected');
    expect(selected.total).toEqual({ amount: 25, currency: 'USD' });
    expect(selected.shippingMethod?.id).toBe('express');
  });

  it('validates inline selectShippingMethod against catalog when configured', async () => {
    const service = createService();
    await startWithAddress(service);

    await expect(
      service.selectShippingMethod({
        tenantId: 'tenant-a',
        checkoutId: 'chk-1',
        method: {
          id: 'standard',
          name: 'Standard',
          price: { amount: 99, currency: 'USD' },
        },
      }),
    ).rejects.toThrow(CheckoutShippingException);

    await expect(
      service.selectShippingMethod({
        tenantId: 'tenant-a',
        checkoutId: 'chk-1',
        method: {
          id: 'standard',
          name: 'Standard',
          price: { amount: 5, currency: 'USD' },
        },
      }),
    ).resolves.toMatchObject({ status: 'shipping_selected', total: { amount: 15 } });
  });

  it('rejects catalog helpers without shippingCatalog', async () => {
    const service = createService(false);
    await startWithAddress(service);

    await expect(service.listShippingMethods('tenant-a', 'chk-1')).rejects.toThrow(
      CheckoutValidationException,
    );
    await expect(
      service.selectShippingMethodById({
        tenantId: 'tenant-a',
        checkoutId: 'chk-1',
        methodId: 'standard',
      }),
    ).rejects.toThrow(CheckoutValidationException);
  });
});
