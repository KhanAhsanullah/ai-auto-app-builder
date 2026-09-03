import type { OrderModule } from '@ai-commerce/module-order';
import type { OrderLookup } from '@ai-commerce/module-payment';

export function adaptOrderLookup(orders: OrderModule): OrderLookup {
  return {
    async getOrder(tenantId, orderId) {
      try {
        const order = await orders.getOrder(tenantId, orderId);
        return {
          id: order.id,
          tenantId: order.tenantId,
          checkoutId: order.checkoutId,
          currency: order.currency,
          status: order.status,
          total: order.total,
          customerId: order.customerId,
        };
      } catch {
        return undefined;
      }
    },
  };
}
