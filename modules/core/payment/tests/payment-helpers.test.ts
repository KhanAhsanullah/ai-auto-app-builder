import { describe, expect, it } from 'vitest';

import type { OrderLookup } from '../src/domain/order-lookup.js';
import type { PaymentGatewayPort } from '../src/domain/payment-gateway.js';
import { PaymentService } from '../src/domain/payment-service.js';
import { PaymentStatusException } from '../src/errors.js';
import { InMemoryPaymentRepository } from '../src/infrastructure/in-memory-payment-repository.js';
import type { CreatePaymentIntentInput } from '../src/types.js';

const payableOrder: OrderLookup = {
  async getOrder(tenantId, orderId) {
    if (tenantId !== 'tenant-a') {
      return undefined;
    }
    if (orderId === 'ord-1') {
      return {
        id: 'ord-1',
        tenantId: 'tenant-a',
        checkoutId: 'chk-1',
        currency: 'USD',
        status: 'placed',
        total: { amount: 15, currency: 'USD' },
        customerId: 'cust-1',
      };
    }
    if (orderId === 'ord-2') {
      return {
        id: 'ord-2',
        tenantId: 'tenant-a',
        checkoutId: 'chk-2',
        currency: 'USD',
        status: 'confirmed',
        total: { amount: 20, currency: 'USD' },
        customerId: 'cust-2',
      };
    }
    return undefined;
  },
};

function createService(gateway?: PaymentGatewayPort) {
  let n = 0;
  return new PaymentService({
    repository: new InMemoryPaymentRepository(),
    orderLookup: payableOrder,
    gateway,
    now: () => '2026-09-04T02:00:00.000Z',
    createId: () => `pay-${++n}`,
  });
}

async function createPending(
  service: PaymentService,
  overrides: Partial<CreatePaymentIntentInput> = {},
) {
  return service.createPaymentIntent({
    tenantId: 'tenant-a',
    orderId: 'ord-1',
    method: 'card',
    id: 'pi-1',
    ...overrides,
  });
}

describe('PaymentService Task 2 helpers', () => {
  it('authorizes then captures an intent', async () => {
    const service = createService();
    await createPending(service, { captureStrategy: 'authorize_then_capture' });

    const authorized = await service.authorizePaymentIntent('tenant-a', 'pi-1');
    expect(authorized).toMatchObject({
      status: 'authorized',
      authorizedAt: '2026-09-04T02:00:00.000Z',
    });

    const captured = await service.capturePaymentIntent('tenant-a', 'pi-1');
    expect(captured).toMatchObject({
      status: 'captured',
      capturedAt: '2026-09-04T02:00:00.000Z',
    });
  });

  it('captures immediately from pending when strategy is immediate', async () => {
    const service = createService();
    await createPending(service, { captureStrategy: 'immediate' });

    const captured = await service.capturePaymentIntent('tenant-a', 'pi-1');
    expect(captured.status).toBe('captured');
    expect(captured.authorizedAt).toBe('2026-09-04T02:00:00.000Z');
  });

  it('requires authorize before capture for authorize_then_capture', async () => {
    const service = createService();
    await createPending(service, { captureStrategy: 'authorize_then_capture' });

    await expect(service.capturePaymentIntent('tenant-a', 'pi-1')).rejects.toBeInstanceOf(
      PaymentStatusException,
    );
  });

  it('fails and cancels from pending; blocks cancel after capture', async () => {
    const service = createService();
    await createPending(service, { orderId: 'ord-1', id: 'pi-1' });
    await service.createPaymentIntent({
      tenantId: 'tenant-a',
      orderId: 'ord-2',
      method: 'wallet',
      id: 'pi-2',
      captureStrategy: 'immediate',
    });

    const failed = await service.failPaymentIntent('tenant-a', 'pi-1', 'card declined');
    expect(failed).toMatchObject({ status: 'failed', failureReason: 'card declined' });

    await service.capturePaymentIntent('tenant-a', 'pi-2');
    await expect(service.cancelPaymentIntent('tenant-a', 'pi-2')).rejects.toBeInstanceOf(
      PaymentStatusException,
    );

    await expect(service.listPaymentIntentsByOrder('tenant-a', 'ord-2')).resolves.toMatchObject([
      { id: 'pi-2', status: 'captured' },
    ]);
  });

  it('calls gateway port and stores providerReference', async () => {
    const gateway: PaymentGatewayPort = {
      async authorize() {
        return { providerReference: 'auth_ref_1' };
      },
      async capture() {
        return { providerReference: 'cap_ref_1' };
      },
    };
    const service = createService(gateway);
    await createPending(service, { captureStrategy: 'authorize_then_capture' });

    const authorized = await service.authorizePaymentIntent('tenant-a', 'pi-1');
    expect(authorized.providerReference).toBe('auth_ref_1');

    const captured = await service.capturePaymentIntent('tenant-a', 'pi-1');
    expect(captured.providerReference).toBe('cap_ref_1');
  });

  it('is idempotent for authorize and capture', async () => {
    const service = createService();
    await createPending(service, { captureStrategy: 'immediate' });

    await service.authorizePaymentIntent('tenant-a', 'pi-1');
    const again = await service.authorizePaymentIntent('tenant-a', 'pi-1');
    expect(again.status).toBe('authorized');

    await service.capturePaymentIntent('tenant-a', 'pi-1');
    const capturedAgain = await service.capturePaymentIntent('tenant-a', 'pi-1');
    expect(capturedAgain.status).toBe('captured');
  });
});
