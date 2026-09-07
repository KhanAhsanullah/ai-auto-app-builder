import type { CatalogModule } from '@ai-commerce/module-catalog';

import type { DemoLaunchVertical } from './build-launch-config.js';

interface SeedProduct {
  slug: string;
  name: string;
  sku: string;
  title: string;
  amount: number;
}

const SEEDS: Record<DemoLaunchVertical, readonly SeedProduct[]> = {
  grocery: [
    { slug: 'atta', name: 'Atta Flour', sku: 'ATTA-5KG', title: '5kg', amount: 1200 },
    { slug: 'milk', name: 'Fresh Milk', sku: 'MILK-1L', title: '1L', amount: 280 },
    { slug: 'eggs', name: 'Farm Eggs', sku: 'EGG-12', title: 'Dozen', amount: 450 },
  ],
  restaurant: [
    { slug: 'biryani', name: 'Chicken Biryani', sku: 'BRY-1', title: 'Plate', amount: 650 },
    { slug: 'burger', name: 'Smash Burger', sku: 'BRG-1', title: 'Single', amount: 890 },
    { slug: 'chai', name: 'Karak Chai', sku: 'CHAI-1', title: 'Cup', amount: 150 },
  ],
  pharmacy: [
    { slug: 'paracetamol', name: 'Paracetamol 500mg', sku: 'PCM-500', title: 'Pack', amount: 120 },
    { slug: 'vitamin-c', name: 'Vitamin C', sku: 'VITC-1', title: 'Bottle', amount: 450 },
    { slug: 'sanitizer', name: 'Hand Sanitizer', sku: 'SAN-1', title: '250ml', amount: 320 },
  ],
  ecommerce: [
    { slug: 'mug', name: 'Ceramic Mug', sku: 'MUG-1', title: 'Standard', amount: 799 },
    { slug: 'backpack', name: 'Daypack', sku: 'BAG-1', title: 'One size', amount: 3499 },
    { slug: 'bottle', name: 'Water Bottle', sku: 'BTL-1', title: '750ml', amount: 1299 },
  ],
  fashion: [
    { slug: 'tee', name: 'Classic Tee', sku: 'TEE-M', title: 'M', amount: 1499 },
    { slug: 'jeans', name: 'Slim Jeans', sku: 'JNS-32', title: '32', amount: 3999 },
    { slug: 'sneakers', name: 'City Sneakers', sku: 'SNK-42', title: '42', amount: 5499 },
  ],
  electronics: [
    { slug: 'earbuds', name: 'Wireless Earbuds', sku: 'EAR-1', title: 'Pair', amount: 4999 },
    { slug: 'charger', name: 'USB-C Charger', sku: 'CHG-30', title: '30W', amount: 2199 },
    { slug: 'case', name: 'Phone Case', sku: 'CSE-1', title: 'Universal', amount: 999 },
  ],
};

/** Seed three demo catalog products for the selected vertical. */
export async function seedVerticalDemoCatalog(input: {
  catalog: CatalogModule;
  tenantId: string;
  vertical: DemoLaunchVertical;
}): Promise<void> {
  for (const product of SEEDS[input.vertical]) {
    await input.catalog.createProduct({
      tenantId: input.tenantId,
      slug: product.slug,
      name: product.name,
      status: 'active',
      variants: [
        {
          sku: product.sku,
          title: product.title,
          price: { amount: product.amount, currency: 'PKR' },
        },
      ],
    });
  }
}
