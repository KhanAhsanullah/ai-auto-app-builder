import { describe, expect, it } from 'vitest';

import { CartService } from '../src/domain/cart-service.js';
import {
  CartLineNotFoundException,
  CartNotFoundException,
  CartValidationException,
} from '../src/errors.js';
import { InMemoryCartRepository } from '../src/infrastructure/in-memory-cart-repository.js';

function createService() {
  let n = 0;
  const service = new CartService({
    repository: new InMemoryCartRepository(),
    now: () => '2026-08-27T12:00:00.000Z',
    createId: () => `id-${++n}`,
  });
  return service;
}

describe('CartService', () => {
  it('creates an empty cart and lists by tenant', async () => {
    const service = createService();
    const cart = await service.createCart({
      tenantId: 'tenant-a',
      currency: 'USD',
      sessionId: 'sess-1',
      id: 'cart-1',
    });

    expect(cart).toMatchObject({
      id: 'cart-1',
      currency: 'USD',
      sessionId: 'sess-1',
      lines: [],
      subtotal: { amount: 0, currency: 'USD' },
    });

    await expect(service.listCarts('tenant-a')).resolves.toHaveLength(1);
    await expect(service.getCartBySessionId('tenant-a', 'sess-1')).resolves.toMatchObject({
      id: 'cart-1',
    });
  });

  it('adds items, merges same variant, and updates subtotal', async () => {
    const service = createService();
    await service.createCart({
      tenantId: 'tenant-a',
      currency: 'USD',
      id: 'cart-1',
    });

    const afterFirst = await service.addItem({
      tenantId: 'tenant-a',
      cartId: 'cart-1',
      productId: 'prod-apple',
      variantId: 'var-1',
      sku: 'APL-1',
      title: 'Organic Apple',
      unitPrice: { amount: 2.5, currency: 'USD' },
      quantity: 2,
    });

    expect(afterFirst.lines).toHaveLength(1);
    expect(afterFirst.lines[0]).toMatchObject({
      quantity: 2,
      lineTotal: { amount: 5, currency: 'USD' },
    });
    expect(afterFirst.subtotal).toEqual({ amount: 5, currency: 'USD' });

    const afterMerge = await service.addItem({
      tenantId: 'tenant-a',
      cartId: 'cart-1',
      productId: 'prod-apple',
      variantId: 'var-1',
      sku: 'APL-1',
      title: 'Organic Apple',
      unitPrice: { amount: 2.5, currency: 'USD' },
      quantity: 1,
    });

    expect(afterMerge.lines).toHaveLength(1);
    expect(afterMerge.lines[0]?.quantity).toBe(3);
    expect(afterMerge.subtotal).toEqual({ amount: 7.5, currency: 'USD' });
  });

  it('sets quantity, removes lines, and clears the cart', async () => {
    const service = createService();
    await service.createCart({ tenantId: 'tenant-a', currency: 'USD', id: 'cart-1' });
    const withItem = await service.addItem({
      tenantId: 'tenant-a',
      cartId: 'cart-1',
      productId: 'p1',
      variantId: 'v1',
      sku: 'SKU-1',
      title: 'Item',
      unitPrice: { amount: 10, currency: 'USD' },
      quantity: 2,
    });
    const lineId = withItem.lines[0]!.id;

    const updated = await service.setLineQuantity({
      tenantId: 'tenant-a',
      cartId: 'cart-1',
      lineId,
      quantity: 1,
    });
    expect(updated.subtotal).toEqual({ amount: 10, currency: 'USD' });

    await service.removeLine({ tenantId: 'tenant-a', cartId: 'cart-1', lineId });
    const cleared = await service.clearCart('tenant-a', 'cart-1');
    expect(cleared.lines).toHaveLength(0);
    expect(cleared.subtotal.amount).toBe(0);
  });

  it('rejects currency mismatch and invalid quantity', async () => {
    const service = createService();
    await service.createCart({ tenantId: 'tenant-a', currency: 'USD', id: 'cart-1' });

    await expect(
      service.addItem({
        tenantId: 'tenant-a',
        cartId: 'cart-1',
        productId: 'p1',
        variantId: 'v1',
        sku: 'SKU-1',
        title: 'Item',
        unitPrice: { amount: 1, currency: 'EUR' },
      }),
    ).rejects.toThrow(CartValidationException);

    await expect(
      service.addItem({
        tenantId: 'tenant-a',
        cartId: 'cart-1',
        productId: 'p1',
        variantId: 'v1',
        sku: 'SKU-1',
        title: 'Item',
        unitPrice: { amount: 1, currency: 'USD' },
        quantity: 0,
      }),
    ).rejects.toThrow(CartValidationException);
  });

  it('throws when cart or line is missing', async () => {
    const service = createService();
    await expect(service.getCart('tenant-a', 'missing')).rejects.toThrow(CartNotFoundException);

    await service.createCart({ tenantId: 'tenant-a', currency: 'USD', id: 'cart-1' });
    await expect(
      service.setLineQuantity({
        tenantId: 'tenant-a',
        cartId: 'cart-1',
        lineId: 'missing',
        quantity: 1,
      }),
    ).rejects.toThrow(CartLineNotFoundException);
  });

  it('isolates carts by tenant and looks up by customer', async () => {
    const service = createService();
    await service.createCart({
      tenantId: 'tenant-a',
      currency: 'USD',
      customerId: 'cust-1',
      id: 'cart-a',
    });
    await service.createCart({
      tenantId: 'tenant-b',
      currency: 'USD',
      customerId: 'cust-1',
      id: 'cart-b',
    });

    await expect(service.getCartByCustomerId('tenant-a', 'cust-1')).resolves.toMatchObject({
      id: 'cart-a',
    });
    await expect(service.listCarts('tenant-b')).resolves.toHaveLength(1);
  });
});
