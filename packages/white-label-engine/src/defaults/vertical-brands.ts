import type { Tenant } from '@ai-commerce/config-schema';

import type { BrandPatch } from '../types.js';
import ecommerce from './presets/vertical/ecommerce.json' with { type: 'json' };
import electronics from './presets/vertical/electronics.json' with { type: 'json' };
import fashion from './presets/vertical/fashion.json' with { type: 'json' };
import grocery from './presets/vertical/grocery.json' with { type: 'json' };
import pharmacy from './presets/vertical/pharmacy.json' with { type: 'json' };
import restaurant from './presets/vertical/restaurant.json' with { type: 'json' };

/** Vertical-specific branding partials keyed by tenant vertical. */
export const BRAND_VERTICAL_DEFAULTS: Record<Tenant['vertical'], BrandPatch> = {
  ecommerce,
  grocery,
  restaurant,
  pharmacy,
  fashion,
  electronics,
};

/** Resolve vertical brand defaults for a tenant vertical identifier. */
export function getVerticalBrandDefaults(vertical: Tenant['vertical']): BrandPatch {
  return BRAND_VERTICAL_DEFAULTS[vertical] ?? {};
}
