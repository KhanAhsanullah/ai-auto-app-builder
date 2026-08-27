import { randomUUID } from 'node:crypto';

import type { CartRepository } from './cart-repository.js';
import {
  CartLineNotFoundException,
  CartNotFoundException,
  CartValidationException,
} from '../errors.js';
import type {
  AddCartItemInput,
  Cart,
  CartLine,
  CreateCartInput,
  Money,
  RemoveCartLineInput,
  SetCartLineQuantityInput,
} from '../types.js';

export interface CartServiceDeps {
  repository: CartRepository;
  now?: () => string;
  createId?: () => string;
}

/**
 * Tenant-scoped shopping cart create / add / update / remove operations.
 */
export class CartService {
  private readonly now: () => string;
  private readonly createId: () => string;

  constructor(private readonly deps: CartServiceDeps) {
    this.now = deps.now ?? (() => new Date().toISOString());
    this.createId = deps.createId ?? (() => randomUUID());
  }

  async createCart(input: CreateCartInput): Promise<Cart> {
    const tenantId = this.requireTenantId(input.tenantId);
    const currency = this.requireCurrency(input.currency);

    const timestamp = this.now();
    const cart: Cart = {
      tenantId,
      id: input.id?.trim() || this.createId(),
      currency,
      lines: [],
      subtotal: { amount: 0, currency },
      createdAt: timestamp,
      updatedAt: timestamp,
      ...(input.customerId?.trim() ? { customerId: input.customerId.trim() } : {}),
      ...(input.sessionId?.trim() ? { sessionId: input.sessionId.trim() } : {}),
    };

    await this.deps.repository.save(cart);
    return cart;
  }

  async getCart(tenantId: string, cartId: string): Promise<Cart> {
    return this.requireCart(this.requireTenantId(tenantId), cartId);
  }

  async listCarts(tenantId: string): Promise<Cart[]> {
    const list = await this.deps.repository.listByTenant(this.requireTenantId(tenantId));
    return [...list].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }

  async getCartByCustomerId(tenantId: string, customerId: string): Promise<Cart> {
    const trimmedTenant = this.requireTenantId(tenantId);
    const trimmedCustomer = customerId.trim();
    if (!trimmedCustomer) {
      throw new CartValidationException('customerId cannot be empty.');
    }
    const cart = await this.deps.repository.findByCustomerId(trimmedTenant, trimmedCustomer);
    if (!cart) {
      throw new CartNotFoundException(trimmedTenant, `customer:${trimmedCustomer}`);
    }
    return cart;
  }

  async getCartBySessionId(tenantId: string, sessionId: string): Promise<Cart> {
    const trimmedTenant = this.requireTenantId(tenantId);
    const trimmedSession = sessionId.trim();
    if (!trimmedSession) {
      throw new CartValidationException('sessionId cannot be empty.');
    }
    const cart = await this.deps.repository.findBySessionId(trimmedTenant, trimmedSession);
    if (!cart) {
      throw new CartNotFoundException(trimmedTenant, `session:${trimmedSession}`);
    }
    return cart;
  }

  /** Add a line or merge quantity when the same variant already exists. */
  async addItem(input: AddCartItemInput): Promise<Cart> {
    const tenantId = this.requireTenantId(input.tenantId);
    const cart = await this.requireCart(tenantId, input.cartId);
    const quantity = input.quantity ?? 1;
    this.requirePositiveQuantity(quantity);

    const productId = input.productId.trim();
    const variantId = input.variantId.trim();
    const sku = input.sku.trim();
    const title = input.title.trim();
    if (!productId || !variantId || !sku || !title) {
      throw new CartValidationException('productId, variantId, sku, and title are required.');
    }

    const unitPrice = this.requireMoney(input.unitPrice, 'unitPrice');
    if (unitPrice.currency !== cart.currency) {
      throw new CartValidationException(
        `Item currency '${unitPrice.currency}' does not match cart currency '${cart.currency}'.`,
      );
    }

    const existingIndex = cart.lines.findIndex((line) => line.variantId === variantId);
    let lines: CartLine[];

    if (existingIndex >= 0) {
      const existing = cart.lines[existingIndex]!;
      const nextQty = existing.quantity + quantity;
      const updatedLine = this.buildLine({
        id: existing.id,
        productId: existing.productId,
        variantId: existing.variantId,
        sku: existing.sku,
        title: existing.title,
        unitPrice: existing.unitPrice,
        quantity: nextQty,
      });
      lines = cart.lines.map((line, index) => (index === existingIndex ? updatedLine : line));
    } else {
      const newLine = this.buildLine({
        id: this.createId(),
        productId,
        variantId,
        sku,
        title,
        unitPrice,
        quantity,
      });
      lines = [...cart.lines, newLine];
    }

    return this.persistCart({ ...cart, lines });
  }

  async setLineQuantity(input: SetCartLineQuantityInput): Promise<Cart> {
    const tenantId = this.requireTenantId(input.tenantId);
    const cart = await this.requireCart(tenantId, input.cartId);
    const lineId = input.lineId.trim();
    if (!lineId) {
      throw new CartValidationException('lineId cannot be empty.');
    }

    if (
      input.quantity < 0 ||
      !Number.isFinite(input.quantity) ||
      !Number.isInteger(input.quantity)
    ) {
      throw new CartValidationException('quantity must be a non-negative integer.');
    }

    const index = cart.lines.findIndex((line) => line.id === lineId);
    if (index < 0) {
      throw new CartLineNotFoundException(tenantId, cart.id, lineId);
    }

    if (input.quantity === 0) {
      const lines = cart.lines.filter((line) => line.id !== lineId);
      return this.persistCart({ ...cart, lines });
    }

    const existing = cart.lines[index]!;
    const updatedLine = this.buildLine({
      id: existing.id,
      productId: existing.productId,
      variantId: existing.variantId,
      sku: existing.sku,
      title: existing.title,
      unitPrice: existing.unitPrice,
      quantity: input.quantity,
    });
    const lines = cart.lines.map((line, i) => (i === index ? updatedLine : line));
    return this.persistCart({ ...cart, lines });
  }

  async removeLine(input: RemoveCartLineInput): Promise<Cart> {
    return this.setLineQuantity({
      tenantId: input.tenantId,
      cartId: input.cartId,
      lineId: input.lineId,
      quantity: 0,
    });
  }

  async clearCart(tenantId: string, cartId: string): Promise<Cart> {
    const cart = await this.requireCart(this.requireTenantId(tenantId), cartId);
    return this.persistCart({ ...cart, lines: [] });
  }

  private async persistCart(cart: Cart): Promise<Cart> {
    const updated: Cart = {
      ...cart,
      lines: [...cart.lines],
      subtotal: this.computeSubtotal(cart.lines, cart.currency),
      updatedAt: this.now(),
    };
    await this.deps.repository.update(updated);
    return updated;
  }

  private buildLine(input: {
    id: string;
    productId: string;
    variantId: string;
    sku: string;
    title: string;
    unitPrice: Money;
    quantity: number;
  }): CartLine {
    return {
      id: input.id,
      productId: input.productId,
      variantId: input.variantId,
      sku: input.sku,
      title: input.title,
      unitPrice: { ...input.unitPrice },
      quantity: input.quantity,
      lineTotal: {
        amount: roundMoney(input.unitPrice.amount * input.quantity),
        currency: input.unitPrice.currency,
      },
    };
  }

  private computeSubtotal(lines: readonly CartLine[], currency: string): Money {
    const amount = roundMoney(lines.reduce((sum, line) => sum + line.lineTotal.amount, 0));
    return { amount, currency };
  }

  private async requireCart(tenantId: string, cartId: string): Promise<Cart> {
    const trimmedId = cartId.trim();
    if (!trimmedId) {
      throw new CartValidationException('cartId cannot be empty.');
    }
    const cart = await this.deps.repository.findById(tenantId, trimmedId);
    if (!cart) {
      throw new CartNotFoundException(tenantId, trimmedId);
    }
    return cart;
  }

  private requireTenantId(tenantId: string): string {
    const trimmed = tenantId.trim();
    if (!trimmed) {
      throw new CartValidationException('tenantId cannot be empty.');
    }
    return trimmed;
  }

  private requireCurrency(currency: string): string {
    const trimmed = currency.trim();
    if (!trimmed) {
      throw new CartValidationException('currency cannot be empty.');
    }
    return trimmed;
  }

  private requirePositiveQuantity(quantity: number): void {
    if (!Number.isFinite(quantity) || !Number.isInteger(quantity) || quantity < 1) {
      throw new CartValidationException('quantity must be a positive integer.');
    }
  }

  private requireMoney(money: Money, field: string): Money {
    if (!money || typeof money !== 'object') {
      throw new CartValidationException(`${field} is required.`);
    }
    if (typeof money.amount !== 'number' || !Number.isFinite(money.amount) || money.amount < 0) {
      throw new CartValidationException(`${field}.amount must be a non-negative number.`);
    }
    const currency = money.currency?.trim();
    if (!currency) {
      throw new CartValidationException(`${field}.currency cannot be empty.`);
    }
    return { amount: money.amount, currency };
  }
}

function roundMoney(amount: number): number {
  return Math.round(amount * 100) / 100;
}
