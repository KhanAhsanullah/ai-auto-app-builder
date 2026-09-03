import type { CartModule } from '@ai-commerce/module-cart';
import type { CartLookup } from '@ai-commerce/module-checkout';

/** Adapt CartModule → CheckoutModule CartLookup. */
export function adaptCartLookup(cart: CartModule): CartLookup {
  return {
    async getCart(tenantId, cartId) {
      try {
        const loaded = await cart.getCart(tenantId, cartId);
        return {
          id: loaded.id,
          tenantId: loaded.tenantId,
          currency: loaded.currency,
          subtotal: loaded.subtotal,
          lines: loaded.lines.map((line) => ({ ...line })),
        };
      } catch {
        return undefined;
      }
    },
  };
}
