import type { CheckoutModule, CheckoutSession } from '@ai-commerce/module-checkout';

import { FeatureFlagEvaluator } from './feature-flag-evaluator.js';
import { WebStoreCheckoutUnavailableException } from '../errors.js';
import type { ResolvedWebStoreShell } from '../types.js';

export interface WebStoreCheckoutBinding {
  checkout: CheckoutModule;
}

/**
 * Storefront checkout access (start from cart). Feature-flag gated.
 */
export class WebStoreCheckoutSurface {
  private readonly flags: FeatureFlagEvaluator;
  private readonly tenantId: string;

  constructor(
    private readonly shell: ResolvedWebStoreShell,
    private readonly binding: WebStoreCheckoutBinding | undefined,
  ) {
    this.flags = new FeatureFlagEvaluator(shell.featureFlags);
    this.tenantId = shell.tenant.id;
  }

  isAvailable(): boolean {
    return this.binding !== undefined && this.flags.isEnabled('modules.checkout');
  }

  async startCheckout(cartId: string, id?: string): Promise<CheckoutSession> {
    return this.requireCheckout().startCheckout({
      tenantId: this.tenantId,
      cartId,
      ...(id ? { id } : {}),
    });
  }

  async getCheckout(checkoutId: string): Promise<CheckoutSession> {
    return this.requireCheckout().getCheckout(this.tenantId, checkoutId);
  }

  async getActiveCheckoutByCart(cartId: string): Promise<CheckoutSession | undefined> {
    return this.requireCheckout().getActiveCheckoutByCart(this.tenantId, cartId);
  }

  private requireCheckout(): CheckoutModule {
    if (!this.binding) {
      throw new WebStoreCheckoutUnavailableException(
        'Checkout module is not wired. Pass checkout to createWebStore({ checkout }).',
      );
    }
    if (!this.flags.isEnabled('modules.checkout')) {
      throw new WebStoreCheckoutUnavailableException(
        'Checkout module is disabled for this tenant (modules.checkout).',
      );
    }
    return this.binding.checkout;
  }
}
