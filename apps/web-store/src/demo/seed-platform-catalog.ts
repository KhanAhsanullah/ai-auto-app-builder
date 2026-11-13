import type { CatalogModule } from '@ai-commerce/module-catalog';

import type { DemoLaunchVertical } from './build-launch-config.js';
import {
  categorySlugForVerticalProduct,
  ensureVerticalCategories,
} from './seed-vertical-catalog.js';

/** Platform catalog product row (GET /v1/tenants/:id/catalog/products). */
export interface PlatformSeedProduct {
  id: string;
  slug: string;
  name: string;
  sku: string;
  title: string;
  amount: number;
  currency: string;
  imageUrl: string;
}

/** Seed catalog from platform-owned product rows. */
export async function seedPlatformDemoCatalog(input: {
  catalog: CatalogModule;
  tenantId: string;
  products: readonly PlatformSeedProduct[];
  /** When set, attaches vertical category chips for known demo slugs. */
  vertical?: DemoLaunchVertical;
}): Promise<void> {
  const categoryIds = input.vertical
    ? await ensureVerticalCategories({
        catalog: input.catalog,
        tenantId: input.tenantId,
        vertical: input.vertical,
      })
    : new Map<string, string>();

  for (const product of input.products) {
    const categorySlug =
      input.vertical !== undefined
        ? categorySlugForVerticalProduct(input.vertical, product.slug)
        : undefined;
    const categoryId = categorySlug ? categoryIds.get(categorySlug) : undefined;

    await input.catalog.createProduct({
      tenantId: input.tenantId,
      id: product.id,
      slug: product.slug,
      name: product.name,
      status: 'active',
      categoryIds: categoryId ? [categoryId] : undefined,
      variants: [
        {
          sku: product.sku,
          title: product.title,
          price: { amount: product.amount, currency: product.currency },
          attributes: { imageUrl: product.imageUrl },
        },
      ],
    });
  }
}
