import type {
  Branding,
  FeatureFlags,
  MobileAppSettings,
  Navigation,
  Tenant,
} from '@ai-commerce/config-schema';

/** Mobile navigation layout style from the navigation schema. */
export type MobileNavStyle = 'tabs' | 'drawer' | 'sidebar' | 'bottom-bar' | 'top-bar';

/** Nav item shape from navigation.mobile (not re-exported by config-schema). */
export type MobileNavItem = Navigation['mobile']['primary'][number];

/** Resolved nav item after visibility + feature-flag filtering. */
export interface ResolvedMobileNavItem {
  id: string;
  label: string;
  route: string;
  icon?: string;
  children?: readonly ResolvedMobileNavItem[];
}

/** Resolved mobile navigation tree for the consumer shell. */
export interface ResolvedMobileNavigation {
  style: MobileNavStyle;
  primary: readonly ResolvedMobileNavItem[];
  secondary: readonly ResolvedMobileNavItem[];
  footer: readonly ResolvedMobileNavItem[];
}

/** Branding slice for the mobile shell. */
export interface ResolvedMobileBranding {
  appName: string;
  tagline: string;
  displayName: string;
  logoPrimary?: string;
  logoInverse?: string;
  appIcon?: string;
  splashBackgroundColor?: string;
  splashImageUrl?: string;
  showPoweredBy: boolean;
}

/** Fully resolved mobile app shell model (Sprint 9 Task 1). */
export interface ResolvedMobileAppShell {
  enabled: boolean;
  tenant: {
    id: string;
    slug: string;
    name: string;
    vertical: Tenant['vertical'];
  };
  branding: ResolvedMobileBranding;
  navigation: ResolvedMobileNavigation;
  identity: MobileAppSettings['identity'];
  runtime: MobileAppSettings['runtime'];
  storeListing?: MobileAppSettings['storeListing'];
  /** Default landing route — first visible primary nav item. */
  defaultLandingRoute: string;
  featureFlags: FeatureFlags;
}

/** Input for resolving the mobile app shell from tenant config. */
export interface ResolveMobileAppShellInput {
  tenant: Pick<Tenant, 'id' | 'slug' | 'name' | 'vertical'>;
  branding: Branding;
  companyDisplayName?: string;
  navigationMobile: {
    primary: readonly MobileNavItem[];
    secondary?: readonly MobileNavItem[];
    footer?: readonly MobileNavItem[];
    style?: MobileNavStyle;
  };
  featureFlags: FeatureFlags;
  mobileApp: MobileAppSettings;
}
