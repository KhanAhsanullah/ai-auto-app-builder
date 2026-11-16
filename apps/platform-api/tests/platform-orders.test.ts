import { describe, expect, it } from 'vitest';

import { PlatformApiException } from '../src/errors.js';
import { createPlatformApi } from '../src/infrastructure/create-platform-api.js';
import {
  parsePlatformOrderCreateBody,
  parsePlatformOrderPatchBody,
} from '../src/domain/map-platform-order.js';

describe('platform orders', () => {
  it('parses create and patch bodies', () => {
    const created = parsePlatformOrderCreateBody({
      lines: [{ sku: 'BRY-1', title: 'Biryani', quantity: 2, unitAmount: 650 }],
      customerName: 'Ali',
    });
    expect(created.lines[0]?.lineAmount).toBe(1300);
    expect(created.currency).toBe('PKR');
    expect(parsePlatformOrderPatchBody({ status: 'confirmed' }).status).toBe('confirmed');
    expect(() => parsePlatformOrderPatchBody({ status: 'nope' })).toThrow(PlatformApiException);
  });

  it('creates, lists, and transitions order status', async () => {
    const api = createPlatformApi({
      clock: () => '2026-11-14T00:00:00.000Z',
      createOrderId: () => 'order-demo-1',
    });
    const launched = await api.launchBoom({
      businessName: 'Order Cafe',
      vertical: 'restaurant',
      tenantId: '11111111-1111-4111-8111-111111111111',
    });

    const empty = await api.listTenantOrders(launched.tenantId);
    expect(empty.orders).toHaveLength(0);

    const order = await api.createTenantOrder(launched.tenantId, {
      lines: [
        {
          sku: 'BRY-1',
          title: 'Chicken Biryani',
          quantity: 1,
          unitAmount: 650,
          lineAmount: 650,
          currency: 'PKR',
        },
      ],
      currency: 'PKR',
      customerName: 'Sara',
    });
    expect(order).toMatchObject({
      id: 'order-demo-1',
      status: 'placed',
      totalAmount: 650,
      customerName: 'Sara',
    });

    const listed = await api.listTenantOrders(launched.tenantId);
    expect(listed.orders).toHaveLength(1);

    const confirmed = await api.updateTenantOrderStatus(launched.tenantId, order.id, {
      status: 'confirmed',
    });
    expect(confirmed.status).toBe('confirmed');
    expect(confirmed.confirmedAt).toBe('2026-11-14T00:00:00.000Z');

    const fulfilled = await api.updateTenantOrderStatus(launched.tenantId, order.id, {
      status: 'fulfilled',
    });
    expect(fulfilled.status).toBe('fulfilled');

    await expect(
      api.updateTenantOrderStatus(launched.tenantId, order.id, { status: 'cancelled' }),
    ).rejects.toBeInstanceOf(PlatformApiException);
  });
});
