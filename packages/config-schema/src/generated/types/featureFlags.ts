/**
 * AUTO-GENERATED FILE — DO NOT EDIT DIRECTLY.
 * Source: schemas/ (JSON Schema v1)
 * Regenerate: pnpm --filter @ai-commerce/config-schema generate
 */

/**
 * Tenant-level feature toggles and module activation flags.
 */
export interface FeatureFlags {
  /**
   * Core and vertical module activation map.
   */
  modules: {
    catalog?: boolean;
    cart?: boolean;
    checkout?: boolean;
    order?: boolean;
    payment?: boolean;
    customer?: boolean;
    inventory?: boolean;
    notification?: boolean;
    media?: boolean;
    reviews?: boolean;
    wishlist?: boolean;
    subscriptions?: boolean;
    loyalty?: boolean;
  };
  /**
   * Arbitrary feature flag key-value map.
   */
  flags: {
    [k: string]: boolean;
  };
  experiments?: {
    key: string;
    enabled: boolean;
    variants: {
      [k: string]: number;
    };
  }[];
}
