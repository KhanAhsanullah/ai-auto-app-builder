import { describe, expect, it } from 'vitest';

import type { CartLookup } from '../src/domain/cart-lookup.js';
import { CheckoutNotFoundException } from '../src/errors.js';
import { createCheckoutModule } from '../src/infrastructure/create-checkout-module.js';
import { InMemoryShippingMethodCatalog } from '../src/infrastructure/in-memory-shipping-method-catalog.js';

const cartLookup: CartLookup = {
  async getCart(tenantId, cartId) {
    if (tenantId !== 'tenant-fresh' || cartId !== 'cart-1') {
      return undefined;
    }
    return {
      id: 'cart-1',
      tenantId: 'tenant-fresh',
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

describe('CheckoutModule / createCheckoutModule', () => {
  it('wires full checkout pipeline end-to-end', async () => {
    let n = 0;
    const checkout = createCheckoutModule({
      cartLookup,
      shippingCatalog: new InMemoryShippingMethodCatalog([
        {
          id: 'standard',
          name: 'Standard',
          price: { amount: 5, currency: 'USD' },
        },
      ]),
      now: () => '2026-08-31T20:00:00.000Z',
      createId: () => `id-${++n}`,
    });

    const started = await checkout.startCheckout({
      tenantId: 'tenant-fresh',
      cartId: 'cart-1',
      id: 'chk-1',
    });
    expect(started.status).toBe('draft');

    await expect(checkout.getActiveCheckoutByCart('tenant-fresh', 'cart-1')).resolves.toMatchObject(
      { id: 'chk-1' },
    );

    await checkout.updateShippingAddress({
      tenantId: 'tenant-fresh',
      checkoutId: 'chk-1',
      address: {
        line1: '123 Main St',
        city: 'Austin',
        postalCode: '78701',
        country: 'US',
      },
    });

    const methods = await checkout.listShippingMethods('tenant-fresh', 'chk-1');
    expect(methods).toHaveLength(1);

    await checkout.selectShippingMethodById({
      tenantId: 'tenant-fresh',
      checkoutId: 'chk-1',
      methodId: 'standard',
    });

    const completed = await checkout.completeCheckout('tenant-fresh', 'chk-1');
    expect(completed.status).toBe('completed');
    expect(completed.total).toEqual({ amount: 15, currency: 'USD' });
  });

  it('getCheckout throws when missing', async () => {
    const checkout = createCheckoutModule({ cartLookup });
    await expect(checkout.getCheckout('tenant-fresh', 'missing')).rejects.toThrow(
      CheckoutNotFoundException,
    );
  });
});
