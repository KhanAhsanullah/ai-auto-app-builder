import { randomUUID } from 'node:crypto';

import type { CartLookup } from './cart-lookup.js';
import type { CheckoutRepository } from './checkout-repository.js';
import {
  CheckoutCartException,
  CheckoutNotFoundException,
  CheckoutStatusException,
  CheckoutValidationException,
} from '../errors.js';
import type {
  CheckoutSession,
  CheckoutStatus,
  Money,
  SelectShippingMethodInput,
  ShippingAddress,
  StartCheckoutInput,
  UpdateShippingAddressInput,
} from '../types.js';

export interface CheckoutServiceDeps {
  repository: CheckoutRepository;
  cartLookup: CartLookup;
  now?: () => string;
  createId?: () => string;
}

const ACTIVE_STATUSES: readonly CheckoutStatus[] = [
  'draft',
  'address_collected',
  'shipping_selected',
];

/**
 * Tenant-scoped checkout: start from cart, collect address/shipping, complete.
 */
export class CheckoutService {
  private readonly now: () => string;
  private readonly createId: () => string;

  constructor(private readonly deps: CheckoutServiceDeps) {
    this.now = deps.now ?? (() => new Date().toISOString());
    this.createId = deps.createId ?? (() => randomUUID());
  }

  /** Start checkout from a cart snapshot (requires non-empty lines). */
  async startCheckout(input: StartCheckoutInput): Promise<CheckoutSession> {
    const tenantId = this.requireTenantId(input.tenantId);
    const cartId = input.cartId.trim();
    if (!cartId) {
      throw new CheckoutValidationException('cartId cannot be empty.');
    }

    const existing = await this.deps.repository.findByCartId(tenantId, cartId);
    if (existing && ACTIVE_STATUSES.includes(existing.status)) {
      throw new CheckoutValidationException(
        `Active checkout already exists for cart '${cartId}' (checkout '${existing.id}').`,
      );
    }

    const cart = await this.deps.cartLookup.getCart(tenantId, cartId);
    if (!cart) {
      throw new CheckoutCartException(
        `Cart '${cartId}' not found for tenant '${tenantId}'.`,
        tenantId,
        cartId,
      );
    }
    if (cart.lines.length === 0) {
      throw new CheckoutCartException(
        `Cart '${cartId}' has no lines to checkout.`,
        tenantId,
        cartId,
      );
    }

    const timestamp = this.now();
    const subtotal = this.roundMoney(cart.subtotal);
    const session: CheckoutSession = {
      tenantId,
      id: input.id?.trim() || this.createId(),
      cartId,
      status: 'draft',
      currency: cart.currency,
      lines: cart.lines.map((line) => structuredClone(line)),
      subtotal,
      total: subtotal,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    await this.deps.repository.save(session);
    return session;
  }

  async getCheckout(tenantId: string, checkoutId: string): Promise<CheckoutSession> {
    return this.requireCheckout(this.requireTenantId(tenantId), checkoutId);
  }

  async listCheckouts(tenantId: string): Promise<CheckoutSession[]> {
    const list = await this.deps.repository.listByTenant(this.requireTenantId(tenantId));
    return [...list].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }

  async updateShippingAddress(input: UpdateShippingAddressInput): Promise<CheckoutSession> {
    const tenantId = this.requireTenantId(input.tenantId);
    const session = await this.requireCheckout(tenantId, input.checkoutId);
    this.requireActive(session);

    const address = this.requireAddress(input.address);
    const updated: CheckoutSession = {
      ...session,
      shippingAddress: address,
      status: 'address_collected',
      updatedAt: this.now(),
    };

    await this.deps.repository.update(updated);
    return updated;
  }

  async selectShippingMethod(input: SelectShippingMethodInput): Promise<CheckoutSession> {
    const tenantId = this.requireTenantId(input.tenantId);
    const session = await this.requireCheckout(tenantId, input.checkoutId);
    this.requireActive(session);

    if (!session.shippingAddress) {
      throw new CheckoutValidationException(
        'Shipping address must be collected before selecting a shipping method.',
      );
    }

    const method = input.method;
    if (!method.id.trim() || !method.name.trim()) {
      throw new CheckoutValidationException('Shipping method id and name are required.');
    }
    const shippingPrice = this.requireMoney(method.price, 'shipping price');
    if (shippingPrice.currency !== session.currency) {
      throw new CheckoutValidationException(
        `Shipping currency '${shippingPrice.currency}' does not match checkout currency '${session.currency}'.`,
      );
    }

    const shipping = this.roundMoney(shippingPrice);
    const total = this.roundMoney({
      amount: session.subtotal.amount + shipping.amount,
      currency: session.currency,
    });

    const updated: CheckoutSession = {
      ...session,
      shippingMethod: {
        id: method.id.trim(),
        name: method.name.trim(),
        price: shipping,
      },
      shipping,
      total,
      status: 'shipping_selected',
      updatedAt: this.now(),
    };

    await this.deps.repository.update(updated);
    return updated;
  }

  async completeCheckout(tenantId: string, checkoutId: string): Promise<CheckoutSession> {
    const trimmedTenant = this.requireTenantId(tenantId);
    const session = await this.requireCheckout(trimmedTenant, checkoutId);

    if (session.status === 'completed') {
      return session;
    }
    if (session.status === 'cancelled') {
      throw new CheckoutStatusException(
        `Checkout '${checkoutId}' is cancelled and cannot be completed.`,
        trimmedTenant,
        checkoutId,
        session.status,
      );
    }
    if (session.status !== 'shipping_selected') {
      throw new CheckoutStatusException(
        `Checkout '${checkoutId}' must have shipping selected before completion (status: ${session.status}).`,
        trimmedTenant,
        checkoutId,
        session.status,
      );
    }

    const completedAt = this.now();
    const updated: CheckoutSession = {
      ...session,
      status: 'completed',
      updatedAt: completedAt,
      completedAt,
    };

    await this.deps.repository.update(updated);
    return updated;
  }

  async cancelCheckout(tenantId: string, checkoutId: string): Promise<CheckoutSession> {
    const trimmedTenant = this.requireTenantId(tenantId);
    const session = await this.requireCheckout(trimmedTenant, checkoutId);

    if (session.status === 'completed') {
      throw new CheckoutStatusException(
        `Checkout '${checkoutId}' is already completed and cannot be cancelled.`,
        trimmedTenant,
        checkoutId,
        session.status,
      );
    }
    if (session.status === 'cancelled') {
      return session;
    }

    const updated: CheckoutSession = {
      ...session,
      status: 'cancelled',
      updatedAt: this.now(),
    };

    await this.deps.repository.update(updated);
    return updated;
  }

  private requireActive(session: CheckoutSession): void {
    if (!ACTIVE_STATUSES.includes(session.status)) {
      throw new CheckoutStatusException(
        `Checkout '${session.id}' is not active (status: ${session.status}).`,
        session.tenantId,
        session.id,
        session.status,
      );
    }
  }

  private requireAddress(address: ShippingAddress): ShippingAddress {
    const line1 = address.line1?.trim();
    const city = address.city?.trim();
    const postalCode = address.postalCode?.trim();
    const country = address.country?.trim();
    if (!line1 || !city || !postalCode || !country) {
      throw new CheckoutValidationException(
        'Shipping address requires line1, city, postalCode, and country.',
      );
    }
    return {
      line1,
      city,
      postalCode,
      country,
      ...(address.line2?.trim() ? { line2: address.line2.trim() } : {}),
      ...(address.region?.trim() ? { region: address.region.trim() } : {}),
    };
  }

  private async requireCheckout(tenantId: string, checkoutId: string): Promise<CheckoutSession> {
    const trimmedId = checkoutId.trim();
    if (!trimmedId) {
      throw new CheckoutValidationException('checkoutId cannot be empty.');
    }
    const session = await this.deps.repository.findById(tenantId, trimmedId);
    if (!session) {
      throw new CheckoutNotFoundException(tenantId, trimmedId);
    }
    return session;
  }

  private requireTenantId(tenantId: string): string {
    const trimmed = tenantId.trim();
    if (!trimmed) {
      throw new CheckoutValidationException('tenantId cannot be empty.');
    }
    return trimmed;
  }

  private requireMoney(money: Money, field: string): Money {
    if (!money || typeof money !== 'object') {
      throw new CheckoutValidationException(`${field} is required.`);
    }
    if (typeof money.amount !== 'number' || !Number.isFinite(money.amount) || money.amount < 0) {
      throw new CheckoutValidationException(`${field}.amount must be a non-negative number.`);
    }
    const currency = money.currency?.trim();
    if (!currency) {
      throw new CheckoutValidationException(`${field}.currency cannot be empty.`);
    }
    return { amount: money.amount, currency };
  }

  private roundMoney(money: Money): Money {
    return {
      amount: Math.round(money.amount * 100) / 100,
      currency: money.currency,
    };
  }
}
