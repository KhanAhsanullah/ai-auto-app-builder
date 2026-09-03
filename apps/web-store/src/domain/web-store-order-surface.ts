import type { Order, OrderModule } from '@ai-commerce/module-order';

import { FeatureFlagEvaluator } from './feature-flag-evaluator.js';
import { WebStoreOrderUnavailableException } from '../errors.js';
import type { ResolvedWebStoreShell } from '../types.js';

export interface WebStoreOrderBinding {
  orders: OrderModule;
}

/** Storefront order access: create from completed checkout, get, list by cart. */
export class WebStoreOrderSurface {
  private readonly flags: FeatureFlagEvaluator;
  private readonly tenantId: string;

  constructor(
    private readonly shell: ResolvedWebStoreShell,
    private readonly binding: WebStoreOrderBinding | undefined,
  ) {
    this.flags = new FeatureFlagEvaluator(shell.featureFlags);
    this.tenantId = shell.tenant.id;
  }

  isAvailable(): boolean {
    return this.binding !== undefined && this.flags.isEnabled('modules.order');
  }

  async createOrderFromCheckout(checkoutId: string, id?: string): Promise<Order> {
    return this.requireOrders().createOrderFromCheckout({
      tenantId: this.tenantId,
      checkoutId,
      ...(id ? { id } : {}),
    });
  }

  async getOrder(orderId: string): Promise<Order> {
    return this.requireOrders().getOrder(this.tenantId, orderId);
  }

  async getOrderByCheckoutId(checkoutId: string): Promise<Order> {
    return this.requireOrders().getOrderByCheckoutId(this.tenantId, checkoutId);
  }

  async listOrdersByCart(cartId: string): Promise<Order[]> {
    return this.requireOrders().listOrdersByCart(this.tenantId, cartId);
  }

  private requireOrders(): OrderModule {
    if (!this.binding) {
      throw new WebStoreOrderUnavailableException(
        'Order module is not wired. Pass orders to createWebStore({ orders }).',
      );
    }
    if (!this.flags.isEnabled('modules.order')) {
      throw new WebStoreOrderUnavailableException(
        'Order module is disabled for this tenant (modules.order).',
      );
    }
    return this.binding.orders;
  }
}
