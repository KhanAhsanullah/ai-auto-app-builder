import type { Tenant } from '@ai-commerce/config-schema';

import ecommerce from './presets/vertical-brand/ecommerce.json' with { type: 'json' };
import electronics from './presets/vertical-brand/electronics.json' with { type: 'json' };
import fashion from './presets/vertical-brand/fashion.json' with { type: 'json' };
import grocery from './presets/vertical-brand/grocery.json' with { type: 'json' };
import pharmacy from './presets/vertical-brand/pharmacy.json' with { type: 'json' };
import restaurant from './presets/vertical-brand/restaurant.json' with { type: 'json' };

export interface VerticalBrandDefaults {
  tagline?: string;
  showPoweredBy?: boolean;
}

/** Local copies of white-label vertical brand presets for the browser demo host. */
export const VERTICAL_BRAND_DEFAULTS: Record<Tenant['vertical'], VerticalBrandDefaults> = {
  ecommerce,
  grocery,
  restaurant,
  pharmacy,
  fashion,
  electronics,
};

export function getVerticalBrandDefaults(vertical: Tenant['vertical']): VerticalBrandDefaults {
  return VERTICAL_BRAND_DEFAULTS[vertical] ?? {};
}
