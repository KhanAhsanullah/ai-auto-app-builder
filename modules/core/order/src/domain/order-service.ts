import { randomUUID } from 'node:crypto';

import type { CheckoutLookup } from './checkout-lookup.js';
import type { OrderRepository } from './order-repository.js';
import {
  OrderCheckoutException,
  OrderNotFoundException,
  OrderStatusException,
  OrderValidationException,
} from '../errors.js';
import type {
  CreateOrderFromCheckoutInput,
  ListOrdersOptions,
  Money,
  Order,
  OrderStatus,
} from '../types.js';

export interface OrderServiceDeps {
  repository: OrderRepository;
  checkoutLookup: CheckoutLookup;
  now?: () => string;
  createId?: () => string;
}

const CANCELABLE: readonly OrderStatus[] = ['placed', 'confirmed'];

/**
 * Tenant-scoped orders: create from completed checkout, status transitions, queries.
 */
export class OrderService {
  private readonly now: () => string;
  private readonly createId: () => string;

  constructor(private readonly deps: OrderServiceDeps) {
    this.now = deps.now ?? (() => new Date().toISOString());
    this.createId = deps.createId ?? (() => randomUUID());
  }

  /** Create an order from a completed checkout (idempotent per checkout). */
  async createOrderFromCheckout(input: CreateOrderFromCheckoutInput): Promise<Order> {
    const tenantId = this.requireTenantId(input.tenantId);
    const checkoutId = input.checkoutId.trim();
    if (!checkoutId) {
      throw new OrderValidationException('checkoutId cannot be empty.');
    }

    const existing = await this.deps.repository.findByCheckoutId(tenantId, checkoutId);
    if (existing) {
      return existing;
    }

    const checkout = await this.deps.checkoutLookup.getCheckout(tenantId, checkoutId);
    if (!checkout) {
      throw new OrderCheckoutException(
        `Checkout '${checkoutId}' not found for tenant '${tenantId}'.`,
        tenantId,
        checkoutId,
      );
    }
    if (checkout.status !== 'completed') {
      throw new OrderCheckoutException(
        `Checkout '${checkoutId}' must be completed before creating an order (status: ${checkout.status}).`,
        tenantId,
        checkoutId,
      );
    }
    if (checkout.lines.length === 0) {
      throw new OrderCheckoutException(
        `Checkout '${checkoutId}' has no lines.`,
        tenantId,
        checkoutId,
      );
    }

    const customerId = input.customerId?.trim() || checkout.customerId?.trim() || undefined;

    const timestamp = this.now();
    const order: Order = {
      tenantId,
      id: input.id?.trim() || this.createId(),
      checkoutId,
      cartId: checkout.cartId,
      status: 'placed',
      currency: checkout.currency,
      lines: checkout.lines.map((line) => structuredClone(line)),
      subtotal: this.roundMoney(checkout.subtotal),
      shipping: this.roundMoney(checkout.shipping),
      total: this.roundMoney(checkout.total),
      shippingAddress: structuredClone(checkout.shippingAddress),
      shippingMethod: structuredClone(checkout.shippingMethod),
      createdAt: timestamp,
      updatedAt: timestamp,
      ...(customerId ? { customerId } : {}),
    };

    await this.deps.repository.save(order);
    return order;
  }

  async getOrder(tenantId: string, orderId: string): Promise<Order> {
    return this.requireOrder(this.requireTenantId(tenantId), orderId);
  }

  async getOrderByCheckoutId(tenantId: string, checkoutId: string): Promise<Order> {
    const trimmedTenant = this.requireTenantId(tenantId);
    const trimmedCheckout = checkoutId.trim();
    if (!trimmedCheckout) {
      throw new OrderValidationException('checkoutId cannot be empty.');
    }
    const order = await this.deps.repository.findByCheckoutId(trimmedTenant, trimmedCheckout);
    if (!order) {
      throw new OrderNotFoundException(trimmedTenant, `checkout:${trimmedCheckout}`);
    }
    return order;
  }

  async listOrders(tenantId: string, options: ListOrdersOptions = {}): Promise<Order[]> {
    const trimmedTenant = this.requireTenantId(tenantId);
    let list: Order[];

    if (options.cartId !== undefined) {
      const cartId = options.cartId.trim();
      if (!cartId) {
        throw new OrderValidationException('cartId cannot be empty.');
      }
      list = await this.deps.repository.listByCartId(trimmedTenant, cartId);
    } else if (options.customerId !== undefined) {
      const customerId = options.customerId.trim();
      if (!customerId) {
        throw new OrderValidationException('customerId cannot be empty.');
      }
      list = await this.deps.repository.listByCustomerId(trimmedTenant, customerId);
    } else {
      list = await this.deps.repository.listByTenant(trimmedTenant);
    }

    const statuses = this.resolveStatusFilter(options.status);
    if (statuses) {
      list = list.filter((order) => statuses.has(order.status));
    }

    return [...list].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }

  async listOrdersByCart(tenantId: string, cartId: string): Promise<Order[]> {
    return this.listOrders(tenantId, { cartId });
  }

  async listOrdersByCustomer(tenantId: string, customerId: string): Promise<Order[]> {
    return this.listOrders(tenantId, { customerId });
  }

  /** placed → confirmed */
  async confirmOrder(tenantId: string, orderId: string): Promise<Order> {
    const trimmedTenant = this.requireTenantId(tenantId);
    const order = await this.requireOrder(trimmedTenant, orderId);

    if (order.status === 'confirmed') {
      return order;
    }
    if (order.status !== 'placed') {
      throw new OrderStatusException(
        `Order '${orderId}' must be placed before confirmation (status: ${order.status}).`,
        trimmedTenant,
        orderId,
        order.status,
      );
    }

    const confirmedAt = this.now();
    const updated: Order = {
      ...order,
      status: 'confirmed',
      updatedAt: confirmedAt,
      confirmedAt,
    };
    await this.deps.repository.update(updated);
    return updated;
  }

  /** confirmed → fulfilled */
  async fulfillOrder(tenantId: string, orderId: string): Promise<Order> {
    const trimmedTenant = this.requireTenantId(tenantId);
    const order = await this.requireOrder(trimmedTenant, orderId);

    if (order.status === 'fulfilled') {
      return order;
    }
    if (order.status !== 'confirmed') {
      throw new OrderStatusException(
        `Order '${orderId}' must be confirmed before fulfillment (status: ${order.status}).`,
        trimmedTenant,
        orderId,
        order.status,
      );
    }

    const fulfilledAt = this.now();
    const updated: Order = {
      ...order,
      status: 'fulfilled',
      updatedAt: fulfilledAt,
      fulfilledAt,
    };
    await this.deps.repository.update(updated);
    return updated;
  }

  /** placed | confirmed → cancelled (not fulfilled). */
  async cancelOrder(tenantId: string, orderId: string): Promise<Order> {
    const trimmedTenant = this.requireTenantId(tenantId);
    const order = await this.requireOrder(trimmedTenant, orderId);

    if (order.status === 'cancelled') {
      return order;
    }
    if (!CANCELABLE.includes(order.status)) {
      throw new OrderStatusException(
        `Order '${orderId}' cannot be cancelled (status: ${order.status}).`,
        trimmedTenant,
        orderId,
        order.status,
      );
    }

    const cancelledAt = this.now();
    const updated: Order = {
      ...order,
      status: 'cancelled',
      updatedAt: cancelledAt,
      cancelledAt,
    };

    await this.deps.repository.update(updated);
    return updated;
  }

  private resolveStatusFilter(status: ListOrdersOptions['status']): Set<OrderStatus> | undefined {
    if (status === undefined) {
      return undefined;
    }
    const list = typeof status === 'string' ? [status] : [...status];
    if (list.length === 0) {
      throw new OrderValidationException('status filter cannot be empty.');
    }
    return new Set(list);
  }

  private async requireOrder(tenantId: string, orderId: string): Promise<Order> {
    const trimmedId = orderId.trim();
    if (!trimmedId) {
      throw new OrderValidationException('orderId cannot be empty.');
    }
    const order = await this.deps.repository.findById(tenantId, trimmedId);
    if (!order) {
      throw new OrderNotFoundException(tenantId, trimmedId);
    }
    return order;
  }

  private requireTenantId(tenantId: string): string {
    const trimmed = tenantId.trim();
    if (!trimmed) {
      throw new OrderValidationException('tenantId cannot be empty.');
    }
    return trimmed;
  }

  private roundMoney(money: Money): Money {
    return {
      amount: Math.round(money.amount * 100) / 100,
      currency: money.currency,
    };
  }
}
