import type { Cart, CartModule } from '@ai-commerce/module-cart';
import type { CheckoutModule, CheckoutSession } from '@ai-commerce/module-checkout';

import { FeatureFlagEvaluator } from './feature-flag-evaluator.js';
import {
  AdminDashboardCartUnavailableException,
  AdminDashboardCheckoutUnavailableException,
} from '../errors.js';
import type { ResolvedAdminDashboardShell } from '../types.js';

export interface AdminDashboardCartBinding {
  cart: CartModule;
}

export interface AdminDashboardCheckoutBinding {
  checkout: CheckoutModule;
}

/** Admin cart inspect: list / get. */
export class AdminDashboardCartSurface {
  private readonly flags: FeatureFlagEvaluator;
  private readonly tenantId: string;

  constructor(
    private readonly shell: ResolvedAdminDashboardShell,
    private readonly binding: AdminDashboardCartBinding | undefined,
  ) {
    this.flags = new FeatureFlagEvaluator(shell.featureFlags);
    this.tenantId = shell.tenant.id;
  }

  isAvailable(): boolean {
    return this.binding !== undefined && this.flags.isEnabled('modules.cart');
  }

  async listCarts(): Promise<Cart[]> {
    return this.requireCart().listCarts(this.tenantId);
  }

  async getCart(cartId: string): Promise<Cart> {
    return this.requireCart().getCart(this.tenantId, cartId);
  }

  private requireCart(): CartModule {
    if (!this.binding) {
      throw new AdminDashboardCartUnavailableException(
        'Cart module is not wired. Pass cart to createAdminDashboard({ cart }).',
      );
    }
    if (!this.flags.isEnabled('modules.cart')) {
      throw new AdminDashboardCartUnavailableException(
        'Cart module is disabled for this tenant (modules.cart).',
      );
    }
    return this.binding.cart;
  }
}

/** Admin checkout inspect: list / get. */
export class AdminDashboardCheckoutSurface {
  private readonly flags: FeatureFlagEvaluator;
  private readonly tenantId: string;

  constructor(
    private readonly shell: ResolvedAdminDashboardShell,
    private readonly binding: AdminDashboardCheckoutBinding | undefined,
  ) {
    this.flags = new FeatureFlagEvaluator(shell.featureFlags);
    this.tenantId = shell.tenant.id;
  }

  isAvailable(): boolean {
    return this.binding !== undefined && this.flags.isEnabled('modules.checkout');
  }

  async listCheckouts(): Promise<CheckoutSession[]> {
    return this.requireCheckout().listCheckouts(this.tenantId);
  }

  async getCheckout(checkoutId: string): Promise<CheckoutSession> {
    return this.requireCheckout().getCheckout(this.tenantId, checkoutId);
  }

  private requireCheckout(): CheckoutModule {
    if (!this.binding) {
      throw new AdminDashboardCheckoutUnavailableException(
        'Checkout module is not wired. Pass checkout to createAdminDashboard({ checkout }).',
      );
    }
    if (!this.flags.isEnabled('modules.checkout')) {
      throw new AdminDashboardCheckoutUnavailableException(
        'Checkout module is disabled for this tenant (modules.checkout).',
      );
    }
    return this.binding.checkout;
  }
}
