import type { CatalogModule } from '@ai-commerce/module-catalog';

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
}): Promise<void> {
  for (const product of input.products) {
    await input.catalog.createProduct({
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
          attributes: { imageUrl: product.imageUrl },
        },
      ],
    });
  }
}
