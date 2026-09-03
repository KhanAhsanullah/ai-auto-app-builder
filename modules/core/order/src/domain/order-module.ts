import type { OrderService } from './order-service.js';
import type { CreateOrderFromCheckoutInput, ListOrdersOptions, Order } from '../types.js';

export interface OrderModuleDeps {
  service: OrderService;
}

/**
 * Public facade for tenant orders: create from checkout, status, and queries.
 */
export class OrderModule {
  constructor(private readonly deps: OrderModuleDeps) {}

  async createOrderFromCheckout(input: CreateOrderFromCheckoutInput): Promise<Order> {
    return this.deps.service.createOrderFromCheckout(input);
  }

  async getOrder(tenantId: string, orderId: string): Promise<Order> {
    return this.deps.service.getOrder(tenantId, orderId);
  }

  async getOrderByCheckoutId(tenantId: string, checkoutId: string): Promise<Order> {
    return this.deps.service.getOrderByCheckoutId(tenantId, checkoutId);
  }

  async listOrders(tenantId: string, options?: ListOrdersOptions): Promise<Order[]> {
    return this.deps.service.listOrders(tenantId, options);
  }

  async listOrdersByCart(tenantId: string, cartId: string): Promise<Order[]> {
    return this.deps.service.listOrdersByCart(tenantId, cartId);
  }

  async listOrdersByCustomer(tenantId: string, customerId: string): Promise<Order[]> {
    return this.deps.service.listOrdersByCustomer(tenantId, customerId);
  }

  async confirmOrder(tenantId: string, orderId: string): Promise<Order> {
    return this.deps.service.confirmOrder(tenantId, orderId);
  }

  async fulfillOrder(tenantId: string, orderId: string): Promise<Order> {
    return this.deps.service.fulfillOrder(tenantId, orderId);
  }

  async cancelOrder(tenantId: string, orderId: string): Promise<Order> {
    return this.deps.service.cancelOrder(tenantId, orderId);
  }
}
