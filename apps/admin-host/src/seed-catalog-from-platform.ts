import { createCatalogModule, type CatalogModule } from '@ai-commerce/module-catalog';

import type { PlatformCatalogProduct } from './platform-client.js';

/** Seed an in-memory catalog module from platform-api product rows. */
export async function seedCatalogFromPlatformProducts(input: {
  tenantId: string;
  products: readonly PlatformCatalogProduct[];
  now?: () => string;
}): Promise<CatalogModule> {
  const now = input.now ?? (() => new Date().toISOString());
  const catalog = createCatalogModule({ now });

  for (const product of input.products) {
    await catalog.createProduct({
      tenantId: input.tenantId,
      id: product.id,
      slug: product.slug,
      name: product.name,
      status: 'active',
      variants: [
        {
          sku: product.sku,
          title: product.title,
          price: { amount: product.amount, currency: product.currency },
        },
      ],
    });
  }

  return catalog;
}
