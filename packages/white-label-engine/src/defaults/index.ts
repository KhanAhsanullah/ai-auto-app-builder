export { BRAND_PLATFORM_DEFAULTS } from './platform-brand.js';
export { BRAND_VERTICAL_DEFAULTS, getVerticalBrandDefaults } from './vertical-brands.js';

import ecommerce from './presets/vertical/ecommerce.json' with { type: 'json' };
import electronics from './presets/vertical/electronics.json' with { type: 'json' };
import fashion from './presets/vertical/fashion.json' with { type: 'json' };
import grocery from './presets/vertical/grocery.json' with { type: 'json' };
import pharmacy from './presets/vertical/pharmacy.json' with { type: 'json' };
import restaurant from './presets/vertical/restaurant.json' with { type: 'json' };
import platformBrand from './presets/default.json' with { type: 'json' };

/** Bundled brand default templates for schema/runtime drift checks. */
export const BUNDLED_BRAND_DEFAULTS = {
  platform: platformBrand,
  vertical: {
    ecommerce,
    grocery,
    restaurant,
    pharmacy,
    fashion,
    electronics,
  },
} as const;
