import type { ListOrdersOptions, Order, OrderModule } from '@ai-commerce/module-order';
import type {
  ListPaymentIntentsOptions,
  PaymentIntent,
  PaymentModule,
} from '@ai-commerce/module-payment';

import { FeatureFlagEvaluator } from './feature-flag-evaluator.js';
import {
  AdminDashboardOrderUnavailableException,
  AdminDashboardPaymentUnavailableException,
} from '../errors.js';
import type { ResolvedAdminDashboardShell } from '../types.js';

export interface AdminDashboardOrderBinding {
  orders: OrderModule;
}

export interface AdminDashboardPaymentBinding {
  payments: PaymentModule;
}

/** Admin order manage: list, confirm, fulfill, cancel. */
export class AdminDashboardOrderSurface {
  private readonly flags: FeatureFlagEvaluator;
  private readonly tenantId: string;

  constructor(
    private readonly shell: ResolvedAdminDashboardShell,
    private readonly binding: AdminDashboardOrderBinding | undefined,
  ) {
    this.flags = new FeatureFlagEvaluator(shell.featureFlags);
    this.tenantId = shell.tenant.id;
  }

  isAvailable(): boolean {
    return this.binding !== undefined && this.flags.isEnabled('modules.order');
  }

  async listOrders(options?: ListOrdersOptions): Promise<Order[]> {
    return this.requireOrders().listOrders(this.tenantId, options);
  }

  async getOrder(orderId: string): Promise<Order> {
    return this.requireOrders().getOrder(this.tenantId, orderId);
  }

  async confirmOrder(orderId: string): Promise<Order> {
    return this.requireOrders().confirmOrder(this.tenantId, orderId);
  }

  async fulfillOrder(orderId: string): Promise<Order> {
    return this.requireOrders().fulfillOrder(this.tenantId, orderId);
  }

  async cancelOrder(orderId: string): Promise<Order> {
    return this.requireOrders().cancelOrder(this.tenantId, orderId);
  }

  private requireOrders(): OrderModule {
    if (!this.binding) {
      throw new AdminDashboardOrderUnavailableException(
        'Order module is not wired. Pass orders to createAdminDashboard({ orders }).',
      );
    }
    if (!this.flags.isEnabled('modules.order')) {
      throw new AdminDashboardOrderUnavailableException(
        'Order module is disabled for this tenant (modules.order).',
      );
    }
    return this.binding.orders;
  }
}

/** Admin payment inspect / capture / fail. */
export class AdminDashboardPaymentSurface {
  private readonly flags: FeatureFlagEvaluator;
  private readonly tenantId: string;

  constructor(
    private readonly shell: ResolvedAdminDashboardShell,
    private readonly binding: AdminDashboardPaymentBinding | undefined,
  ) {
    this.flags = new FeatureFlagEvaluator(shell.featureFlags);
    this.tenantId = shell.tenant.id;
  }

  isAvailable(): boolean {
    return this.binding !== undefined && this.flags.isEnabled('modules.payment');
  }

  async listPaymentIntents(options?: ListPaymentIntentsOptions): Promise<PaymentIntent[]> {
    return this.requirePayments().listPaymentIntents(this.tenantId, options);
  }

  async getPaymentIntent(paymentIntentId: string): Promise<PaymentIntent> {
    return this.requirePayments().getPaymentIntent(this.tenantId, paymentIntentId);
  }

  async capturePaymentIntent(paymentIntentId: string): Promise<PaymentIntent> {
    return this.requirePayments().capturePaymentIntent(this.tenantId, paymentIntentId);
  }

  async failPaymentIntent(paymentIntentId: string, reason?: string): Promise<PaymentIntent> {
    return this.requirePayments().failPaymentIntent(this.tenantId, paymentIntentId, reason);
  }

  async cancelPaymentIntent(paymentIntentId: string): Promise<PaymentIntent> {
    return this.requirePayments().cancelPaymentIntent(this.tenantId, paymentIntentId);
  }

  private requirePayments(): PaymentModule {
    if (!this.binding) {
      throw new AdminDashboardPaymentUnavailableException(
        'Payment module is not wired. Pass payments to createAdminDashboard({ payments }).',
      );
    }
    if (!this.flags.isEnabled('modules.payment')) {
      throw new AdminDashboardPaymentUnavailableException(
        'Payment module is disabled for this tenant (modules.payment).',
      );
    }
    return this.binding.payments;
  }
}
