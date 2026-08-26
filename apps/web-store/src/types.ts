import type {
  Branding,
  FeatureFlags,
  Navigation,
  Tenant,
  WebStoreSettings,
} from '@ai-commerce/config-schema';

/** Web navigation layout style from the navigation schema. */
export type WebNavStyle = 'tabs' | 'drawer' | 'sidebar' | 'bottom-bar' | 'top-bar';

/** Nav item shape from navigation.web. */
export type WebNavItem = Navigation['web']['primary'][number];

/** Resolved nav item after visibility + feature-flag filtering. */
export interface ResolvedWebNavItem {
  id: string;
  label: string;
  route: string;
  icon?: string;
  children?: readonly ResolvedWebNavItem[];
}

/** Resolved web navigation tree for the storefront shell. */
export interface ResolvedWebNavigation {
  style: WebNavStyle;
  primary: readonly ResolvedWebNavItem[];
  secondary: readonly ResolvedWebNavItem[];
  footer: readonly ResolvedWebNavItem[];
}

/** Branding slice for the web storefront shell. */
export interface ResolvedWebBranding {
  appName: string;
  tagline: string;
  displayName: string;
  logoPrimary?: string;
  logoInverse?: string;
  favicon?: string;
  appleTouchIcon?: string;
  ogImageUrl?: string;
  twitterHandle?: string;
  copyrightText?: string;
  showPoweredBy: boolean;
}

/** Fully resolved web store shell model (Sprint 11 Task 1). */
export interface ResolvedWebStoreShell {
  enabled: boolean;
  tenant: {
    id: string;
    slug: string;
    name: string;
    vertical: Tenant['vertical'];
  };
  branding: ResolvedWebBranding;
  navigation: ResolvedWebNavigation;
  domain: WebStoreSettings['domain'];
  seo: WebStoreSettings['seo'];
  rendering: WebStoreSettings['rendering'];
  pwa?: WebStoreSettings['pwa'];
  legal?: WebStoreSettings['legal'];
  /** Default landing route — first visible primary nav item. */
  defaultLandingRoute: string;
  featureFlags: FeatureFlags;
}

/** Input for resolving the web store shell from tenant config. */
export interface ResolveWebStoreShellInput {
  tenant: Pick<Tenant, 'id' | 'slug' | 'name' | 'vertical'>;
  branding: Branding;
  companyDisplayName?: string;
  navigationWeb: {
    primary: readonly WebNavItem[];
    secondary?: readonly WebNavItem[];
    footer?: readonly WebNavItem[];
    style?: WebNavStyle;
  };
  featureFlags: FeatureFlags;
  webStore: WebStoreSettings;
}
