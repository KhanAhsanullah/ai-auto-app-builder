import type { Tenant } from '@ai-commerce/config-schema';

import type { ConfigLayer } from '../types.js';

/** Vertical-specific preset defaults keyed by `tenant.vertical`. */
export const VERTICAL_DEFAULTS: Record<Tenant['vertical'], ConfigLayer> = {
  ecommerce: {
    featureFlags: {
      modules: {
        wishlist: true,
        reviews: true,
      },
      flags: {
        productRecommendations: true,
      },
    },
  },
  grocery: {
    featureFlags: {
      modules: {
        inventory: true,
      },
      flags: {
        weightedItems: true,
        deliverySlots: true,
        substitutions: true,
      },
    },
    payments: {
      methods: ['card', 'cash_on_delivery'],
      checkout: {
        codEnabled: true,
      },
    },
  },
  restaurant: {
    featureFlags: {
      flags: {
        menuModifiers: true,
        kitchenRouting: true,
      },
    },
    payments: {
      methods: ['card', 'cash_on_delivery'],
      checkout: {
        codEnabled: true,
      },
    },
  },
  pharmacy: {
    featureFlags: {
      flags: {
        prescriptionRequired: true,
        complianceChecks: true,
      },
    },
    authentication: {
      customer: {
        mfa: {
          required: true,
          methods: ['sms', 'email'],
        },
      },
    },
  },
  fashion: {
    featureFlags: {
      flags: {
        sizeCharts: true,
        lookbooks: true,
      },
    },
  },
  electronics: {
    featureFlags: {
      flags: {
        specSheets: true,
        warranties: true,
        compatibilityMatrix: true,
      },
    },
  },
};

/** Resolve vertical defaults for a tenant vertical identifier. */
export function getVerticalDefaults(vertical: Tenant['vertical']): ConfigLayer {
  return VERTICAL_DEFAULTS[vertical] ?? {};
}
