import type { Order, OrderModule } from '@ai-commerce/module-order';

import { FeatureFlagEvaluator } from './feature-flag-evaluator.js';
import { MobileAppOrderUnavailableException } from '../errors.js';
import type { ResolvedMobileAppShell } from '../types.js';

export interface MobileAppOrderBinding {
  orders: OrderModule;
}

export class MobileAppOrderSurface {
  private readonly flags: FeatureFlagEvaluator;
  private readonly tenantId: string;

  constructor(
    private readonly shell: ResolvedMobileAppShell,
    private readonly binding: MobileAppOrderBinding | undefined,
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
      throw new MobileAppOrderUnavailableException(
        'Order module is not wired. Pass orders to createMobileApp({ orders }).',
      );
    }
    if (!this.flags.isEnabled('modules.order')) {
      throw new MobileAppOrderUnavailableException(
        'Order module is disabled for this tenant (modules.order).',
      );
    }
    return this.binding.orders;
  }
}
