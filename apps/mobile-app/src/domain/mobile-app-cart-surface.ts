import type {
  AddCartItemFromCatalogInput,
  AddCartItemInput,
  Cart,
  CartModule,
  RemoveCartLineInput,
  SetCartLineQuantityInput,
} from '@ai-commerce/module-cart';

import { FeatureFlagEvaluator } from './feature-flag-evaluator.js';
import { MobileAppCartUnavailableException } from '../errors.js';
import type { ResolvedMobileAppShell } from '../types.js';

export interface MobileAppCartBinding {
  cart: CartModule;
  defaultCurrency: string;
}

type SessionCreate = { sessionId: string; currency?: string; id?: string };
type CustomerCreate = { customerId: string; currency?: string; id?: string };
type AddItemFields = Omit<AddCartItemInput, 'tenantId'>;
type AddFromCatalogFields = Omit<AddCartItemFromCatalogInput, 'tenantId'>;
type SetQtyFields = Omit<SetCartLineQuantityInput, 'tenantId'>;
type RemoveFields = Omit<RemoveCartLineInput, 'tenantId'>;

/** Mobile storefront cart access: feature-flag gated + tenant-scoped. */
export class MobileAppCartSurface {
  private readonly flags: FeatureFlagEvaluator;
  private readonly tenantId: string;

  constructor(
    private readonly shell: ResolvedMobileAppShell,
    private readonly binding: MobileAppCartBinding | undefined,
  ) {
    this.flags = new FeatureFlagEvaluator(shell.featureFlags);
    this.tenantId = shell.tenant.id;
  }

  isAvailable(): boolean {
    return this.binding !== undefined && this.flags.isEnabled('modules.cart');
  }

  async getOrCreateBySession(input: SessionCreate): Promise<Cart> {
    const binding = this.requireCart();
    return binding.cart.getOrCreateBySession({
      tenantId: this.tenantId,
      sessionId: input.sessionId,
      currency: input.currency?.trim() || binding.defaultCurrency,
      ...(input.id ? { id: input.id } : {}),
    });
  }

  async getOrCreateByCustomer(input: CustomerCreate): Promise<Cart> {
    const binding = this.requireCart();
    return binding.cart.getOrCreateByCustomer({
      tenantId: this.tenantId,
      customerId: input.customerId,
      currency: input.currency?.trim() || binding.defaultCurrency,
      ...(input.id ? { id: input.id } : {}),
    });
  }

  async getCart(cartId: string): Promise<Cart> {
    return this.requireCart().cart.getCart(this.tenantId, cartId);
  }

  async addItem(input: AddItemFields): Promise<Cart> {
    return this.requireCart().cart.addItem({ ...input, tenantId: this.tenantId });
  }

  async addItemFromCatalog(input: AddFromCatalogFields): Promise<Cart> {
    return this.requireCart().cart.addItemFromCatalog({ ...input, tenantId: this.tenantId });
  }

  async setLineQuantity(input: SetQtyFields): Promise<Cart> {
    return this.requireCart().cart.setLineQuantity({ ...input, tenantId: this.tenantId });
  }

  async removeLine(input: RemoveFields): Promise<Cart> {
    return this.requireCart().cart.removeLine({ ...input, tenantId: this.tenantId });
  }

  async clearCart(cartId: string): Promise<Cart> {
    return this.requireCart().cart.clearCart(this.tenantId, cartId);
  }

  private requireCart(): MobileAppCartBinding {
    if (!this.binding) {
      throw new MobileAppCartUnavailableException(
        'Cart module is not wired. Pass cart to createMobileApp({ cart }).',
      );
    }
    if (!this.flags.isEnabled('modules.cart')) {
      throw new MobileAppCartUnavailableException(
        'Cart module is disabled for this tenant (modules.cart).',
      );
    }
    return this.binding;
  }
}
