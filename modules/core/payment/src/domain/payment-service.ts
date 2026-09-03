import { randomUUID } from 'node:crypto';

import type { OrderLookup } from './order-lookup.js';
import { isPayableOrderStatus } from './order-lookup.js';
import type { PaymentGatewayPort } from './payment-gateway.js';
import type { PaymentRepository } from './payment-repository.js';
import {
  PaymentNotFoundException,
  PaymentOrderException,
  PaymentStatusException,
  PaymentValidationException,
} from '../errors.js';
import type {
  CreatePaymentIntentInput,
  ListPaymentIntentsOptions,
  Money,
  PaymentIntent,
  PaymentIntentStatus,
} from '../types.js';

export interface PaymentServiceDeps {
  repository: PaymentRepository;
  orderLookup: OrderLookup;
  /** Optional; when set, authorize/capture call the provider first. */
  gateway?: PaymentGatewayPort;
  now?: () => string;
  createId?: () => string;
}

const AUTHORIZABLE: readonly PaymentIntentStatus[] = ['pending'];
const CAPTURABLE: readonly PaymentIntentStatus[] = ['pending', 'authorized'];
const FAILABLE: readonly PaymentIntentStatus[] = ['pending', 'authorized'];
const CANCELABLE: readonly PaymentIntentStatus[] = ['pending', 'authorized'];

/**
 * Tenant-scoped payment intents: create, status transitions, queries.
 */
export class PaymentService {
  private readonly now: () => string;
  private readonly createId: () => string;

  constructor(private readonly deps: PaymentServiceDeps) {
    this.now = deps.now ?? (() => new Date().toISOString());
    this.createId = deps.createId ?? (() => randomUUID());
  }

  /** Create a payment intent from a payable order (idempotent per order). */
  async createPaymentIntent(input: CreatePaymentIntentInput): Promise<PaymentIntent> {
    const tenantId = this.requireTenantId(input.tenantId);
    const orderId = input.orderId.trim();
    if (!orderId) {
      throw new PaymentValidationException('orderId cannot be empty.');
    }
    if (!input.method) {
      throw new PaymentValidationException('method is required.');
    }

    const existing = await this.deps.repository.findByOrderId(tenantId, orderId);
    if (existing) {
      return existing;
    }

    const order = await this.deps.orderLookup.getOrder(tenantId, orderId);
    if (!order) {
      throw new PaymentOrderException(
        `Order '${orderId}' not found for tenant '${tenantId}'.`,
        tenantId,
        orderId,
      );
    }
    if (!isPayableOrderStatus(order.status)) {
      throw new PaymentOrderException(
        `Order '${orderId}' cannot accept payment in status '${order.status}'.`,
        tenantId,
        orderId,
      );
    }
    if (!order.checkoutId?.trim()) {
      throw new PaymentOrderException(
        `Order '${orderId}' is missing checkoutId.`,
        tenantId,
        orderId,
      );
    }
    if (!Number.isFinite(order.total.amount) || order.total.amount < 0) {
      throw new PaymentOrderException(
        `Order '${orderId}' has an invalid total amount.`,
        tenantId,
        orderId,
      );
    }
    if (!order.total.currency?.trim()) {
      throw new PaymentOrderException(`Order '${orderId}' is missing currency.`, tenantId, orderId);
    }

    const customerId = input.customerId?.trim() || order.customerId?.trim() || undefined;
    const timestamp = this.now();
    const intent: PaymentIntent = {
      tenantId,
      id: input.id?.trim() || this.createId(),
      orderId,
      checkoutId: order.checkoutId.trim(),
      status: 'pending',
      amount: this.roundMoney({
        amount: order.total.amount,
        currency: order.total.currency.trim().toUpperCase(),
      }),
      method: input.method,
      gateway: input.gateway ?? 'manual',
      captureStrategy: input.captureStrategy ?? 'manual',
      createdAt: timestamp,
      updatedAt: timestamp,
      ...(customerId ? { customerId } : {}),
    };

    await this.deps.repository.save(intent);
    return intent;
  }

  async getPaymentIntent(tenantId: string, paymentIntentId: string): Promise<PaymentIntent> {
    return this.requireIntent(this.requireTenantId(tenantId), paymentIntentId);
  }

  async getPaymentIntentByOrderId(tenantId: string, orderId: string): Promise<PaymentIntent> {
    const trimmedTenant = this.requireTenantId(tenantId);
    const trimmedOrder = orderId.trim();
    if (!trimmedOrder) {
      throw new PaymentValidationException('orderId cannot be empty.');
    }
    const intent = await this.deps.repository.findByOrderId(trimmedTenant, trimmedOrder);
    if (!intent) {
      throw new PaymentNotFoundException(trimmedTenant, `order:${trimmedOrder}`);
    }
    return intent;
  }

  async listPaymentIntents(
    tenantId: string,
    options: ListPaymentIntentsOptions = {},
  ): Promise<PaymentIntent[]> {
    const trimmedTenant = this.requireTenantId(tenantId);
    let list: PaymentIntent[];

    if (options.orderId?.trim()) {
      list = await this.deps.repository.listByOrderId(trimmedTenant, options.orderId.trim());
    } else {
      list = await this.deps.repository.listByTenant(trimmedTenant);
    }

    if (options.status !== undefined) {
      const allowed = new Set(
        Array.isArray(options.status) ? options.status : [options.status],
      ) as Set<PaymentIntentStatus>;
      list = list.filter((intent) => allowed.has(intent.status));
    }

    return [...list].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }

  async listPaymentIntentsByOrder(tenantId: string, orderId: string): Promise<PaymentIntent[]> {
    return this.listPaymentIntents(tenantId, { orderId });
  }

  /** pending → authorized (idempotent if already authorized). */
  async authorizePaymentIntent(tenantId: string, paymentIntentId: string): Promise<PaymentIntent> {
    const trimmedTenant = this.requireTenantId(tenantId);
    const intent = await this.requireIntent(trimmedTenant, paymentIntentId);

    if (intent.status === 'authorized') {
      return intent;
    }
    if (intent.status === 'captured') {
      throw new PaymentStatusException(
        `Payment intent '${paymentIntentId}' is already captured.`,
        trimmedTenant,
        paymentIntentId,
        intent.status,
      );
    }
    if (!AUTHORIZABLE.includes(intent.status)) {
      throw new PaymentStatusException(
        `Payment intent '${paymentIntentId}' must be pending before authorize (status: ${intent.status}).`,
        trimmedTenant,
        paymentIntentId,
        intent.status,
      );
    }

    const gatewayResult = this.deps.gateway?.authorize
      ? await this.deps.gateway.authorize(intent)
      : undefined;

    const authorizedAt = this.now();
    const updated: PaymentIntent = {
      ...intent,
      status: 'authorized',
      updatedAt: authorizedAt,
      authorizedAt,
      ...(gatewayResult?.providerReference
        ? { providerReference: gatewayResult.providerReference }
        : {}),
    };
    await this.deps.repository.update(updated);
    return updated;
  }

  /**
   * Capture funds.
   * - `immediate`: pending → captured allowed
   * - `authorize_then_capture`: must authorize first
   * - `manual`: pending or authorized → captured
   */
  async capturePaymentIntent(tenantId: string, paymentIntentId: string): Promise<PaymentIntent> {
    const trimmedTenant = this.requireTenantId(tenantId);
    const intent = await this.requireIntent(trimmedTenant, paymentIntentId);

    if (intent.status === 'captured') {
      return intent;
    }
    if (!CAPTURABLE.includes(intent.status)) {
      throw new PaymentStatusException(
        `Payment intent '${paymentIntentId}' cannot be captured (status: ${intent.status}).`,
        trimmedTenant,
        paymentIntentId,
        intent.status,
      );
    }

    if (intent.captureStrategy === 'authorize_then_capture' && intent.status === 'pending') {
      throw new PaymentStatusException(
        `Payment intent '${paymentIntentId}' must be authorized before capture when strategy is authorize_then_capture.`,
        trimmedTenant,
        paymentIntentId,
        intent.status,
      );
    }

    const gatewayResult = this.deps.gateway?.capture
      ? await this.deps.gateway.capture(intent)
      : undefined;

    const capturedAt = this.now();
    const updated: PaymentIntent = {
      ...intent,
      status: 'captured',
      updatedAt: capturedAt,
      capturedAt,
      ...(intent.status === 'pending' && !intent.authorizedAt ? { authorizedAt: capturedAt } : {}),
      ...(gatewayResult?.providerReference
        ? { providerReference: gatewayResult.providerReference }
        : {}),
    };
    await this.deps.repository.update(updated);
    return updated;
  }

  /** pending | authorized → failed. */
  async failPaymentIntent(
    tenantId: string,
    paymentIntentId: string,
    reason?: string,
  ): Promise<PaymentIntent> {
    const trimmedTenant = this.requireTenantId(tenantId);
    const intent = await this.requireIntent(trimmedTenant, paymentIntentId);

    if (intent.status === 'failed') {
      return intent;
    }
    if (!FAILABLE.includes(intent.status)) {
      throw new PaymentStatusException(
        `Payment intent '${paymentIntentId}' cannot be marked failed (status: ${intent.status}).`,
        trimmedTenant,
        paymentIntentId,
        intent.status,
      );
    }

    const failedAt = this.now();
    const failureReason = reason?.trim() || undefined;
    const updated: PaymentIntent = {
      ...intent,
      status: 'failed',
      updatedAt: failedAt,
      failedAt,
      ...(failureReason ? { failureReason } : {}),
    };
    await this.deps.repository.update(updated);
    return updated;
  }

  /** pending | authorized → cancelled (not after capture). */
  async cancelPaymentIntent(tenantId: string, paymentIntentId: string): Promise<PaymentIntent> {
    const trimmedTenant = this.requireTenantId(tenantId);
    const intent = await this.requireIntent(trimmedTenant, paymentIntentId);

    if (intent.status === 'cancelled') {
      return intent;
    }
    if (!CANCELABLE.includes(intent.status)) {
      throw new PaymentStatusException(
        `Payment intent '${paymentIntentId}' cannot be cancelled (status: ${intent.status}).`,
        trimmedTenant,
        paymentIntentId,
        intent.status,
      );
    }

    const cancelledAt = this.now();
    const updated: PaymentIntent = {
      ...intent,
      status: 'cancelled',
      updatedAt: cancelledAt,
      cancelledAt,
    };
    await this.deps.repository.update(updated);
    return updated;
  }

  private async requireIntent(tenantId: string, paymentIntentId: string): Promise<PaymentIntent> {
    const id = paymentIntentId.trim();
    if (!id) {
      throw new PaymentValidationException('paymentIntentId cannot be empty.');
    }
    const intent = await this.deps.repository.findById(tenantId, id);
    if (!intent) {
      throw new PaymentNotFoundException(tenantId, id);
    }
    return intent;
  }

  private requireTenantId(tenantId: string): string {
    const trimmed = tenantId.trim();
    if (!trimmed) {
      throw new PaymentValidationException('tenantId cannot be empty.');
    }
    return trimmed;
  }

  private roundMoney(money: Money): Money {
    return {
      amount: Math.round(money.amount * 100) / 100,
      currency: money.currency,
    };
  }
}
