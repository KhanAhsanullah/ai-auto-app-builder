import type { CheckoutService } from './checkout-service.js';
import type { ShippingMethodOffer } from './shipping-method-catalog.js';
import type {
  CheckoutSession,
  SelectShippingMethodByIdInput,
  SelectShippingMethodInput,
  StartCheckoutInput,
  UpdateShippingAddressInput,
} from '../types.js';

export interface CheckoutModuleDeps {
  service: CheckoutService;
}

/**
 * Public facade for tenant checkout: start from cart, address, shipping, complete.
 */
export class CheckoutModule {
  constructor(private readonly deps: CheckoutModuleDeps) {}

  async startCheckout(input: StartCheckoutInput): Promise<CheckoutSession> {
    return this.deps.service.startCheckout(input);
  }

  async getCheckout(tenantId: string, checkoutId: string): Promise<CheckoutSession> {
    return this.deps.service.getCheckout(tenantId, checkoutId);
  }

  async getActiveCheckoutByCart(
    tenantId: string,
    cartId: string,
  ): Promise<CheckoutSession | undefined> {
    return this.deps.service.getActiveCheckoutByCart(tenantId, cartId);
  }

  async listCheckouts(tenantId: string): Promise<CheckoutSession[]> {
    return this.deps.service.listCheckouts(tenantId);
  }

  async listShippingMethods(
    tenantId: string,
    checkoutId: string,
  ): Promise<readonly ShippingMethodOffer[]> {
    return this.deps.service.listShippingMethods(tenantId, checkoutId);
  }

  async updateShippingAddress(input: UpdateShippingAddressInput): Promise<CheckoutSession> {
    return this.deps.service.updateShippingAddress(input);
  }

  async selectShippingMethod(input: SelectShippingMethodInput): Promise<CheckoutSession> {
    return this.deps.service.selectShippingMethod(input);
  }

  async selectShippingMethodById(input: SelectShippingMethodByIdInput): Promise<CheckoutSession> {
    return this.deps.service.selectShippingMethodById(input);
  }

  async completeCheckout(tenantId: string, checkoutId: string): Promise<CheckoutSession> {
    return this.deps.service.completeCheckout(tenantId, checkoutId);
  }

  async cancelCheckout(tenantId: string, checkoutId: string): Promise<CheckoutSession> {
    return this.deps.service.cancelCheckout(tenantId, checkoutId);
  }
}
