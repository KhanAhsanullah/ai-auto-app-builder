import { describe, expect, it } from 'vitest';

import type { OrderLookup } from '../src/domain/order-lookup.js';
import { PaymentService } from '../src/domain/payment-service.js';
import {
  PaymentNotFoundException,
  PaymentOrderException,
  PaymentValidationException,
} from '../src/errors.js';
import { InMemoryPaymentRepository } from '../src/infrastructure/in-memory-payment-repository.js';

const payableOrder: OrderLookup = {
  async getOrder(tenantId, orderId) {
    if (tenantId !== 'tenant-a' || orderId !== 'ord-1') {
      return undefined;
    }
    return {
      id: 'ord-1',
      tenantId: 'tenant-a',
      checkoutId: 'chk-1',
      currency: 'USD',
      status: 'placed',
      total: { amount: 15.5, currency: 'USD' },
      customerId: 'cust-1',
    };
  },
};

function createService(lookup: OrderLookup = payableOrder) {
  let n = 0;
  return new PaymentService({
    repository: new InMemoryPaymentRepository(),
    orderLookup: lookup,
    now: () => '2026-09-04T01:00:00.000Z',
    createId: () => `pay-${++n}`,
  });
}

describe('PaymentService', () => {
  it('creates a payment intent from a payable order', async () => {
    const service = createService();
    const intent = await service.createPaymentIntent({
      tenantId: 'tenant-a',
      orderId: 'ord-1',
      method: 'card',
      gateway: 'stripe',
      captureStrategy: 'immediate',
      id: 'pi-1',
    });

    expect(intent).toMatchObject({
      id: 'pi-1',
      orderId: 'ord-1',
      checkoutId: 'chk-1',
      customerId: 'cust-1',
      status: 'pending',
      amount: { amount: 15.5, currency: 'USD' },
      method: 'card',
      gateway: 'stripe',
      captureStrategy: 'immediate',
    });

    await expect(service.getPaymentIntent('tenant-a', 'pi-1')).resolves.toMatchObject({
      id: 'pi-1',
    });
    await expect(service.listPaymentIntents('tenant-a')).resolves.toHaveLength(1);
  });

  it('is idempotent for the same order', async () => {
    const service = createService();
    const first = await service.createPaymentIntent({
      tenantId: 'tenant-a',
      orderId: 'ord-1',
      method: 'card',
      id: 'pi-1',
    });
    const second = await service.createPaymentIntent({
      tenantId: 'tenant-a',
      orderId: 'ord-1',
      method: 'wallet',
      id: 'pi-2',
    });
    expect(second.id).toBe(first.id);
    expect(second.method).toBe('card');
  });

  it('defaults gateway and captureStrategy to manual', async () => {
    const service = createService();
    const intent = await service.createPaymentIntent({
      tenantId: 'tenant-a',
      orderId: 'ord-1',
      method: 'cash_on_delivery',
    });
    expect(intent.gateway).toBe('manual');
    expect(intent.captureStrategy).toBe('manual');
  });

  it('rejects non-payable order status', async () => {
    const service = createService({
      async getOrder() {
        return {
          id: 'ord-1',
          tenantId: 'tenant-a',
          checkoutId: 'chk-1',
          currency: 'USD',
          status: 'cancelled',
          total: { amount: 10, currency: 'USD' },
        };
      },
    });
    await expect(
      service.createPaymentIntent({
        tenantId: 'tenant-a',
        orderId: 'ord-1',
        method: 'card',
      }),
    ).rejects.toBeInstanceOf(PaymentOrderException);
  });

  it('throws when order is missing', async () => {
    const service = createService();
    await expect(
      service.createPaymentIntent({
        tenantId: 'tenant-a',
        orderId: 'missing',
        method: 'card',
      }),
    ).rejects.toBeInstanceOf(PaymentOrderException);
  });

  it('throws when payment intent is not found', async () => {
    const service = createService();
    await expect(service.getPaymentIntent('tenant-a', 'missing')).rejects.toBeInstanceOf(
      PaymentNotFoundException,
    );
  });

  it('rejects empty tenantId', async () => {
    const service = createService();
    await expect(
      service.createPaymentIntent({
        tenantId: '  ',
        orderId: 'ord-1',
        method: 'card',
      }),
    ).rejects.toBeInstanceOf(PaymentValidationException);
  });

  it('filters list by status', async () => {
    const service = createService();
    await service.createPaymentIntent({
      tenantId: 'tenant-a',
      orderId: 'ord-1',
      method: 'card',
    });
    await expect(
      service.listPaymentIntents('tenant-a', { status: 'pending' }),
    ).resolves.toHaveLength(1);
    await expect(
      service.listPaymentIntents('tenant-a', { status: 'captured' }),
    ).resolves.toHaveLength(0);
  });
});
