import type { CatalogModule } from '@ai-commerce/module-catalog';
import type { CatalogProductLookup } from '@ai-commerce/module-cart';

/** Adapt CatalogModule → CartModule CatalogProductLookup. */
export function adaptCatalogProductLookup(catalog: CatalogModule): CatalogProductLookup {
  return {
    async findVariant(tenantId, productId, variantId) {
      try {
        const product = await catalog.getProduct(tenantId, productId);
        const variant = product.variants.find((entry) => entry.id === variantId);
        if (!variant) {
          return undefined;
        }
        return {
          productId,
          variantId,
          sku: variant.sku,
          title: `${product.name} — ${variant.title}`,
          unitPrice: variant.price,
          status: product.status,
        };
      } catch {
        return undefined;
      }
    },
  };
}
