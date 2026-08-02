/**
 * AUTO-GENERATED FILE — DO NOT EDIT DIRECTLY.
 * Source: schemas/ (JSON Schema v1)
 * Regenerate: pnpm --filter @ai-commerce/config-schema generate
 */

/**
 * Cross-surface navigation definitions for web store, mobile app, and admin dashboard.
 */
export interface Navigation {
  web: SurfaceNavigation;
  mobile: SurfaceNavigation;
  admin: SurfaceNavigation;
}
/**
 * This interface was referenced by `Navigation`'s JSON-Schema
 * via the `definition` "surfaceNavigation".
 */
export interface SurfaceNavigation {
  /**
   * @minItems 1
   */
  primary: [NavItem, ...NavItem[]];
  secondary?: NavItem[];
  footer?: NavItem[];
  /**
   * Layout style hint for the surface renderer.
   */
  style?: 'tabs' | 'drawer' | 'sidebar' | 'bottom-bar' | 'top-bar';
}
/**
 * This interface was referenced by `Navigation`'s JSON-Schema
 * via the `definition` "navItem".
 */
export interface NavItem {
  id: string;
  label: string;
  /**
   * Route key resolved by the screen-map registry.
   */
  route: string;
  /**
   * Icon identifier from the platform icon set.
   */
  icon?: string;
  visible?: boolean;
  /**
   * Optional feature flag key required for this item to appear.
   */
  featureFlag?: string;
  children?: NavItem[];
}
