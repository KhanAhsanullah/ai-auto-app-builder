import { describe, expect, it } from 'vitest';

import type { CatalogProductLookup } from '../src/domain/catalog-product-lookup.js';
import { CartNotFoundException } from '../src/errors.js';
import { createCartModule } from '../src/infrastructure/create-cart-module.js';

function createLookup(): CatalogProductLookup {
  return {
    async findVariant(tenantId, productId, variantId) {
      if (tenantId !== 'tenant-fresh' || productId !== 'prod-apple' || variantId !== 'var-1') {
        return undefined;
      }
      return {
        productId,
        variantId,
        sku: 'APL-1',
        title: 'Organic Apple',
        unitPrice: { amount: 2.5, currency: 'USD' },
        status: 'active',
      };
    },
  };
}

describe('CartModule / createCartModule', () => {
  it('wires getOrCreate, addItem, and catalog add end-to-end', async () => {
    let n = 0;
    const cart = createCartModule({
      catalogLookup: createLookup(),
      now: () => '2026-08-28T02:00:00.000Z',
      createId: () => `id-${++n}`,
    });

    const sessionCart = await cart.getOrCreateBySession({
      tenantId: 'tenant-fresh',
      sessionId: 'sess-1',
      currency: 'USD',
      id: 'cart-1',
    });

    expect(sessionCart.id).toBe('cart-1');

    const same = await cart.getOrCreateBySession({
      tenantId: 'tenant-fresh',
      sessionId: 'sess-1',
      currency: 'USD',
    });
    expect(same.id).toBe('cart-1');

    const withItem = await cart.addItem({
      tenantId: 'tenant-fresh',
      cartId: 'cart-1',
      productId: 'prod-apple',
      variantId: 'var-1',
      sku: 'APL-1',
      title: 'Organic Apple',
      unitPrice: { amount: 2.5, currency: 'USD' },
      quantity: 2,
    });

    expect(withItem.subtotal).toEqual({ amount: 5, currency: 'USD' });

    const fromCatalog = await cart.addItemFromCatalog({
      tenantId: 'tenant-fresh',
      cartId: 'cart-1',
      productId: 'prod-apple',
      variantId: 'var-1',
      quantity: 1,
    });

    expect(fromCatalog.lines[0]?.quantity).toBe(3);
    await expect(cart.getCart('tenant-fresh', 'cart-1')).resolves.toMatchObject({
      id: 'cart-1',
    });
  });

  it('getCart throws when missing', async () => {
    const cart = createCartModule();
    await expect(cart.getCart('tenant-fresh', 'missing')).rejects.toThrow(CartNotFoundException);
  });
});
