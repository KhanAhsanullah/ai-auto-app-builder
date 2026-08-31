import type { OrderRepository } from '../domain/order-repository.js';
import { OrderException, OrderNotFoundException } from '../errors.js';
import type { Order } from '../types.js';

function orderKey(tenantId: string, orderId: string): string {
  return `${tenantId}::${orderId}`;
}

/** In-memory OrderRepository for tests and local development. */
export class InMemoryOrderRepository implements OrderRepository {
  private readonly orders = new Map<string, Order>();

  async save(order: Order): Promise<void> {
    const key = orderKey(order.tenantId, order.id);
    if (this.orders.has(key)) {
      throw new OrderException(
        `Order '${order.id}' already exists for tenant '${order.tenantId}'.`,
      );
    }
    this.orders.set(key, structuredClone(order));
  }

  async update(order: Order): Promise<void> {
    const key = orderKey(order.tenantId, order.id);
    if (!this.orders.has(key)) {
      throw new OrderNotFoundException(order.tenantId, order.id);
    }
    this.orders.set(key, structuredClone(order));
  }

  async findById(tenantId: string, orderId: string): Promise<Order | undefined> {
    const found = this.orders.get(orderKey(tenantId, orderId));
    return found ? structuredClone(found) : undefined;
  }

  async findByCheckoutId(tenantId: string, checkoutId: string): Promise<Order | undefined> {
    for (const order of this.orders.values()) {
      if (order.tenantId === tenantId && order.checkoutId === checkoutId) {
        return structuredClone(order);
      }
    }
    return undefined;
  }

  async listByTenant(tenantId: string): Promise<Order[]> {
    return [...this.orders.values()]
      .filter((order) => order.tenantId === tenantId)
      .map((order) => structuredClone(order));
  }
}
