import { describe, expect, it } from 'vitest';

import type { CatalogProductLookup } from '../src/domain/catalog-product-lookup.js';
import { CartService } from '../src/domain/cart-service.js';
import { CartCatalogException, CartValidationException } from '../src/errors.js';
import { InMemoryCartRepository } from '../src/infrastructure/in-memory-cart-repository.js';

function createLookup(): CatalogProductLookup {
  return {
    async findVariant(tenantId, productId, variantId) {
      if (tenantId !== 'tenant-a' || productId !== 'prod-apple' || variantId !== 'var-1') {
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

describe('CartService Task 2 helpers', () => {
  it('getOrCreateBySession returns existing or creates', async () => {
    let n = 0;
    const service = new CartService({
      repository: new InMemoryCartRepository(),
      now: () => '2026-08-28T00:00:00.000Z',
      createId: () => `id-${++n}`,
    });

    const first = await service.getOrCreateBySession({
      tenantId: 'tenant-a',
      sessionId: 'sess-1',
      currency: 'USD',
      id: 'cart-1',
    });
    const second = await service.getOrCreateBySession({
      tenantId: 'tenant-a',
      sessionId: 'sess-1',
      currency: 'USD',
    });

    expect(first.id).toBe('cart-1');
    expect(second.id).toBe('cart-1');
  });

  it('getOrCreateByCustomer returns existing or creates', async () => {
    let n = 0;
    const service = new CartService({
      repository: new InMemoryCartRepository(),
      createId: () => `id-${++n}`,
    });

    const first = await service.getOrCreateByCustomer({
      tenantId: 'tenant-a',
      customerId: 'cust-1',
      currency: 'USD',
      id: 'cart-c',
    });
    const second = await service.getOrCreateByCustomer({
      tenantId: 'tenant-a',
      customerId: 'cust-1',
      currency: 'USD',
    });

    expect(first.id).toBe('cart-c');
    expect(second.id).toBe('cart-c');
  });

  it('addItemFromCatalog resolves price from catalog lookup', async () => {
    let n = 0;
    const service = new CartService({
      repository: new InMemoryCartRepository(),
      catalogLookup: createLookup(),
      createId: () => `id-${++n}`,
    });

    const cart = await service.createCart({
      tenantId: 'tenant-a',
      currency: 'USD',
      id: 'cart-1',
    });

    const updated = await service.addItemFromCatalog({
      tenantId: 'tenant-a',
      cartId: cart.id,
      productId: 'prod-apple',
      variantId: 'var-1',
      quantity: 2,
    });

    expect(updated.lines[0]).toMatchObject({
      sku: 'APL-1',
      unitPrice: { amount: 2.5, currency: 'USD' },
      quantity: 2,
      lineTotal: { amount: 5, currency: 'USD' },
    });
  });

  it('addItem validates unit price when catalog lookup is configured', async () => {
    let n = 0;
    const service = new CartService({
      repository: new InMemoryCartRepository(),
      catalogLookup: createLookup(),
      createId: () => `id-${++n}`,
    });

    await service.createCart({ tenantId: 'tenant-a', currency: 'USD', id: 'cart-1' });

    await expect(
      service.addItem({
        tenantId: 'tenant-a',
        cartId: 'cart-1',
        productId: 'prod-apple',
        variantId: 'var-1',
        sku: 'APL-1',
        title: 'Organic Apple',
        unitPrice: { amount: 9.99, currency: 'USD' },
      }),
    ).rejects.toThrow(CartCatalogException);

    await expect(
      service.addItem({
        tenantId: 'tenant-a',
        cartId: 'cart-1',
        productId: 'prod-apple',
        variantId: 'var-1',
        sku: 'wrong',
        title: 'wrong',
        unitPrice: { amount: 2.5, currency: 'USD' },
      }),
    ).resolves.toMatchObject({
      lines: [{ sku: 'APL-1', title: 'Organic Apple' }],
    });
  });

  it('rejects addItemFromCatalog without lookup and unknown variants', async () => {
    const bare = new CartService({ repository: new InMemoryCartRepository() });
    await bare.createCart({ tenantId: 'tenant-a', currency: 'USD', id: 'cart-1' });
    await expect(
      bare.addItemFromCatalog({
        tenantId: 'tenant-a',
        cartId: 'cart-1',
        productId: 'p',
        variantId: 'v',
      }),
    ).rejects.toThrow(CartValidationException);

    const withLookup = new CartService({
      repository: new InMemoryCartRepository(),
      catalogLookup: createLookup(),
    });
    await withLookup.createCart({ tenantId: 'tenant-a', currency: 'USD', id: 'cart-1' });
    await expect(
      withLookup.addItemFromCatalog({
        tenantId: 'tenant-a',
        cartId: 'cart-1',
        productId: 'missing',
        variantId: 'missing',
      }),
    ).rejects.toThrow(CartCatalogException);
  });
});
