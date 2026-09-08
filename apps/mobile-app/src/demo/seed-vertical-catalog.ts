import type { CatalogModule } from '@ai-commerce/module-catalog';

import type { DemoLaunchVertical } from './build-launch-config.js';

interface SeedProduct {
  slug: string;
  name: string;
  sku: string;
  title: string;
  amount: number;
  /** Public demo image (Unsplash) — shown on catalog cards. */
  imageUrl: string;
}

const SEEDS: Record<DemoLaunchVertical, readonly SeedProduct[]> = {
  grocery: [
    {
      slug: 'atta',
      name: 'Atta Flour',
      sku: 'ATTA-5KG',
      title: '5kg',
      amount: 1200,
      imageUrl:
        'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=640&h=480&q=80',
    },
    {
      slug: 'milk',
      name: 'Fresh Milk',
      sku: 'MILK-1L',
      title: '1L',
      amount: 280,
      imageUrl:
        'https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=640&h=480&q=80',
    },
    {
      slug: 'eggs',
      name: 'Farm Eggs',
      sku: 'EGG-12',
      title: 'Dozen',
      amount: 450,
      imageUrl:
        'https://images.unsplash.com/photo-1582722878920-8aa2740b54d2?auto=format&fit=crop&w=640&h=480&q=80',
    },
  ],
  restaurant: [
    {
      slug: 'biryani',
      name: 'Chicken Biryani',
      sku: 'BRY-1',
      title: 'Plate',
      amount: 650,
      imageUrl:
        'https://images.unsplash.com/photo-1563379091339-03b544bad65d?auto=format&fit=crop&w=640&h=480&q=80',
    },
    {
      slug: 'burger',
      name: 'Smash Burger',
      sku: 'BRG-1',
      title: 'Single',
      amount: 890,
      imageUrl:
        'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=640&h=480&q=80',
    },
    {
      slug: 'chai',
      name: 'Karak Chai',
      sku: 'CHAI-1',
      title: 'Cup',
      amount: 150,
      imageUrl:
        'https://images.unsplash.com/photo-1571934811356-5cc061b6821f?auto=format&fit=crop&w=640&h=480&q=80',
    },
  ],
  pharmacy: [
    {
      slug: 'paracetamol',
      name: 'Paracetamol 500mg',
      sku: 'PCM-500',
      title: 'Pack',
      amount: 120,
      imageUrl:
        'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=640&h=480&q=80',
    },
    {
      slug: 'vitamin-c',
      name: 'Vitamin C',
      sku: 'VITC-1',
      title: 'Bottle',
      amount: 450,
      imageUrl:
        'https://images.unsplash.com/photo-1550572017-edd951b55104?auto=format&fit=crop&w=640&h=480&q=80',
    },
    {
      slug: 'sanitizer',
      name: 'Hand Sanitizer',
      sku: 'SAN-1',
      title: '250ml',
      amount: 320,
      imageUrl:
        'https://images.unsplash.com/photo-1583947215259-38e31be8741a?auto=format&fit=crop&w=640&h=480&q=80',
    },
  ],
  ecommerce: [
    {
      slug: 'mug',
      name: 'Ceramic Mug',
      sku: 'MUG-1',
      title: 'Standard',
      amount: 799,
      imageUrl:
        'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=640&h=480&q=80',
    },
    {
      slug: 'backpack',
      name: 'Daypack',
      sku: 'BAG-1',
      title: 'One size',
      amount: 3499,
      imageUrl:
        'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=640&h=480&q=80',
    },
    {
      slug: 'bottle',
      name: 'Water Bottle',
      sku: 'BTL-1',
      title: '750ml',
      amount: 1299,
      imageUrl:
        'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=640&h=480&q=80',
    },
  ],
  fashion: [
    {
      slug: 'tee',
      name: 'Classic Tee',
      sku: 'TEE-M',
      title: 'M',
      amount: 1499,
      imageUrl:
        'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=640&h=480&q=80',
    },
    {
      slug: 'jeans',
      name: 'Slim Jeans',
      sku: 'JNS-32',
      title: '32',
      amount: 3999,
      imageUrl:
        'https://images.unsplash.com/photo-1542272454315-4c01d7e91c1d?auto=format&fit=crop&w=640&h=480&q=80',
    },
    {
      slug: 'sneakers',
      name: 'City Sneakers',
      sku: 'SNK-42',
      title: '42',
      amount: 5499,
      imageUrl:
        'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=640&h=480&q=80',
    },
  ],
  electronics: [
    {
      slug: 'earbuds',
      name: 'Wireless Earbuds',
      sku: 'EAR-1',
      title: 'Pair',
      amount: 4999,
      imageUrl:
        'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=640&h=480&q=80',
    },
    {
      slug: 'charger',
      name: 'USB-C Charger',
      sku: 'CHG-30',
      title: '30W',
      amount: 2199,
      imageUrl:
        'https://images.unsplash.com/photo-1583863780914-42ea22473562?auto=format&fit=crop&w=640&h=480&q=80',
    },
    {
      slug: 'case',
      name: 'Phone Case',
      sku: 'CSE-1',
      title: 'Universal',
      amount: 999,
      imageUrl:
        'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?auto=format&fit=crop&w=640&h=480&q=80',
    },
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
          attributes: { imageUrl: product.imageUrl },
        },
      ],
    });
  }
}
