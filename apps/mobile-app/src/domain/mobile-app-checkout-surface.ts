import type { CheckoutModule, CheckoutSession } from '@ai-commerce/module-checkout';

import { FeatureFlagEvaluator } from './feature-flag-evaluator.js';
import { MobileAppCheckoutUnavailableException } from '../errors.js';
import type { ResolvedMobileAppShell } from '../types.js';

export interface MobileAppCheckoutBinding {
  checkout: CheckoutModule;
}

/** Mobile checkout access (start from cart). */
export class MobileAppCheckoutSurface {
  private readonly flags: FeatureFlagEvaluator;
  private readonly tenantId: string;

  constructor(
    private readonly shell: ResolvedMobileAppShell,
    private readonly binding: MobileAppCheckoutBinding | undefined,
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
      throw new MobileAppCheckoutUnavailableException(
        'Checkout module is not wired. Pass checkout to createMobileApp({ checkout }).',
      );
    }
    if (!this.flags.isEnabled('modules.checkout')) {
      throw new MobileAppCheckoutUnavailableException(
        'Checkout module is disabled for this tenant (modules.checkout).',
      );
    }
    return this.binding.checkout;
  }
}
