import type { Tenant } from '@ai-commerce/config-schema';

import { BrandResolver } from '../src/domain/brand-resolver.js';
import type { BrandPatch } from '../src/types.js';

/** Minimal tenant branding overlay for tests. */
export const TENANT_BRANDING_FIXTURE: BrandPatch = {
  appName: 'Acme Market',
  tagline: 'Tenant-specific tagline',
  logo: {
    primary: 'https://cdn.example.com/acme-logo.svg',
  },
  showPoweredBy: false,
  copyrightText: '© 2026 Acme Market',
};

/** Second tenant overlay used for isolation tests. */
export const OTHER_TENANT_BRANDING_FIXTURE: BrandPatch = {
  appName: 'Beta Shop',
  tagline: 'Another tenant',
  logo: {
    primary: 'https://cdn.example.com/beta-logo.svg',
  },
};

export const TENANT_A_ID = '11111111-1111-1111-1111-111111111111';
export const TENANT_B_ID = '22222222-2222-2222-2222-222222222222';

/** BrandResolver instance for tests. */
export function createBrandResolver(): BrandResolver {
  return new BrandResolver();
}

export const VERTICAL_TAGLINES: Record<Tenant['vertical'], string> = {
  ecommerce: 'Shop quality products online',
  grocery: 'Fresh essentials, delivered',
  restaurant: 'Order from the menu you love',
  pharmacy: 'Trusted care, delivered with confidence',
  fashion: 'Curated style for every season',
  electronics: 'The latest tech, ready to ship',
};
