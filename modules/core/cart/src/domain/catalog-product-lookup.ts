import type { Money } from '../types.js';

/** Sellable variant quote used to validate / fill cart line prices. */
export interface CatalogVariantQuote {
  productId: string;
  variantId: string;
  sku: string;
  title: string;
  unitPrice: Money;
  /** Only `active` variants may be added when lookup is enabled. */
  status: 'draft' | 'active' | 'archived';
}

/**
 * Optional port for catalog price validation (no hard dependency on module-catalog).
 * Host apps can adapt `@ai-commerce/module-catalog` to this interface.
 */
export interface CatalogProductLookup {
  findVariant(
    tenantId: string,
    productId: string,
    variantId: string,
  ): Promise<CatalogVariantQuote | undefined>;
}
