import type { CheckoutModule } from '@ai-commerce/module-checkout';
import type { CheckoutLookup } from '@ai-commerce/module-order';

export function adaptCheckoutLookup(checkout: CheckoutModule): CheckoutLookup {
  return {
    async getCheckout(tenantId, checkoutId) {
      try {
        const session = await checkout.getCheckout(tenantId, checkoutId);
        if (
          session.status !== 'completed' ||
          !session.shipping ||
          !session.shippingAddress ||
          !session.shippingMethod
        ) {
          return undefined;
        }
        return {
          id: session.id,
          tenantId: session.tenantId,
          cartId: session.cartId,
          currency: session.currency,
          status: session.status,
          lines: session.lines.map((line) => ({ ...line })),
          subtotal: session.subtotal,
          shipping: session.shipping,
          total: session.total,
          shippingAddress: { ...session.shippingAddress },
          shippingMethod: { ...session.shippingMethod },
          completedAt: session.completedAt,
        };
      } catch {
        return undefined;
      }
    },
  };
}
