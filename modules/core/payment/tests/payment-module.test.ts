import { describe, expect, it } from 'vitest';

import type { OrderLookup } from '../src/domain/order-lookup.js';
import { PaymentNotFoundException } from '../src/errors.js';
import { createPaymentModule } from '../src/infrastructure/create-payment-module.js';

const orderLookup: OrderLookup = {
  async getOrder(tenantId, orderId) {
    if (tenantId !== 'tenant-fresh' || orderId !== 'ord-1') {
      return undefined;
    }
    return {
      id: 'ord-1',
      tenantId: 'tenant-fresh',
      checkoutId: 'chk-1',
      currency: 'USD',
      status: 'placed',
      total: { amount: 42, currency: 'USD' },
      customerId: 'cust-1',
    };
  },
};

describe('PaymentModule / createPaymentModule', () => {
  it('wires create → authorize → capture end-to-end', async () => {
    let n = 0;
    const payments = createPaymentModule({
      orderLookup,
      now: () => '2026-09-04T03:00:00.000Z',
      createId: () => `id-${++n}`,
    });

    const created = await payments.createPaymentIntent({
      tenantId: 'tenant-fresh',
      orderId: 'ord-1',
      method: 'card',
      gateway: 'stripe',
      captureStrategy: 'authorize_then_capture',
      id: 'pi-1',
    });
    expect(created.status).toBe('pending');
    expect(created.amount).toEqual({ amount: 42, currency: 'USD' });

    await payments.authorizePaymentIntent('tenant-fresh', 'pi-1');
    const captured = await payments.capturePaymentIntent('tenant-fresh', 'pi-1');
    expect(captured.status).toBe('captured');

    await expect(payments.listPaymentIntentsByOrder('tenant-fresh', 'ord-1')).resolves.toHaveLength(
      1,
    );
  });

  it('getPaymentIntent throws when missing', async () => {
    const payments = createPaymentModule({ orderLookup });
    await expect(payments.getPaymentIntent('tenant-fresh', 'missing')).rejects.toThrow(
      PaymentNotFoundException,
    );
  });
});
