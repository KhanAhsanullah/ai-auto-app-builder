import type { Tenant } from '@ai-commerce/config-schema';
import type { ConfigLayer } from '@ai-commerce/config-runtime';

import ecommerceSeed from '../../../../modules/verticals/ecommerce/seeds/onboarding.template.json' with { type: 'json' };
import electronicsSeed from '../../../../modules/verticals/electronics/seeds/onboarding.template.json' with { type: 'json' };
import fashionSeed from '../../../../modules/verticals/fashion/seeds/onboarding.template.json' with { type: 'json' };
import grocerySeed from '../../../../modules/verticals/grocery/seeds/onboarding.template.json' with { type: 'json' };
import pharmacySeed from '../../../../modules/verticals/pharmacy/seeds/onboarding.template.json' with { type: 'json' };
import restaurantSeed from '../../../../modules/verticals/restaurant/seeds/onboarding.template.json' with { type: 'json' };

const FORBIDDEN_SEED_KEYS = new Set(['meta', 'tenant', 'environment']);

const ALLOWED_SEED_KEYS = new Set([
  'branding',
  'theme',
  'navigation',
  'webStore',
  'adminDashboard',
  'languages',
  'currency',
  'company',
]);

const VERTICAL_SEED_IMPORTS: Record<Tenant['vertical'], Record<string, unknown>> = {
  ecommerce: ecommerceSeed,
  grocery: grocerySeed,
  restaurant: restaurantSeed,
  pharmacy: pharmacySeed,
  fashion: fashionSeed,
  electronics: electronicsSeed,
};

/** Loads and sanitizes vertical onboarding seed partials for tenant provisioning. */
export class VerticalSeedLoader {
  /** Return sanitized seed partial for a vertical, or `{}` when unavailable. */
  load(vertical: Tenant['vertical']): ConfigLayer {
    const raw = VERTICAL_SEED_IMPORTS[vertical];

    if (!raw) {
      return {};
    }

    return sanitizeSeed(raw);
  }
}

function sanitizeSeed(raw: Record<string, unknown>): ConfigLayer {
  const sanitized: ConfigLayer = {};

  for (const [key, value] of Object.entries(raw)) {
    if (FORBIDDEN_SEED_KEYS.has(key) || !ALLOWED_SEED_KEYS.has(key)) {
      continue;
    }

    sanitized[key as keyof ConfigLayer] = value as ConfigLayer[keyof ConfigLayer];
  }

  return sanitized;
}
