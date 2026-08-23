import type {
  AdminDashboardSettings,
  Branding,
  FeatureFlags,
  Navigation,
  Tenant,
} from '@ai-commerce/config-schema';

/** Nav item shape from the navigation schema (not re-exported by config-schema). */
export type AdminNavItem = Navigation['admin']['primary'][number];

/** Admin navigation layout style from the navigation schema. */
export type AdminNavStyle = 'tabs' | 'drawer' | 'sidebar' | 'bottom-bar' | 'top-bar';

/** Resolved nav item after visibility + feature-flag filtering. */
export interface ResolvedAdminNavItem {
  id: string;
  label: string;
  route: string;
  icon?: string;
  children?: readonly ResolvedAdminNavItem[];
}

/** Resolved admin navigation tree for the dashboard shell. */
export interface ResolvedAdminNavigation {
  style: AdminNavStyle;
  primary: readonly ResolvedAdminNavItem[];
  secondary: readonly ResolvedAdminNavItem[];
  footer: readonly ResolvedAdminNavItem[];
}

/** Branding slice consumed by the admin shell (not a full white-label compile). */
export interface ResolvedAdminBranding {
  appName: string;
  tagline: string;
  displayName: string;
  logoPrimary?: string;
  logoInverse?: string;
  favicon?: string;
  showPoweredBy: boolean;
}

/** Enabled dashboard widget after preference / RBAC filtering. */
export interface ResolvedAdminWidget {
  id: string;
  position: number;
  requiredRole?: string;
}

/** Fully resolved admin dashboard shell model (Sprint 8 Task 1). */
export interface ResolvedAdminDashboardShell {
  enabled: boolean;
  tenant: {
    id: string;
    slug: string;
    name: string;
    vertical: Tenant['vertical'];
  };
  branding: ResolvedAdminBranding;
  navigation: ResolvedAdminNavigation;
  layout: {
    sidebarStyle: AdminDashboardSettings['layout']['sidebarStyle'];
    defaultLandingRoute: string;
  };
  preferences: AdminDashboardSettings['preferences'];
  widgets: readonly ResolvedAdminWidget[];
  featureFlags: FeatureFlags;
  domain?: AdminDashboardSettings['domain'];
  onboarding?: AdminDashboardSettings['onboarding'];
}

/** Input for resolving the admin dashboard shell from tenant config. */
export interface ResolveAdminDashboardShellInput {
  tenant: Pick<Tenant, 'id' | 'slug' | 'name' | 'vertical'>;
  branding: Branding;
  /** Optional company display name fallback for branding. */
  companyDisplayName?: string;
  navigationAdmin: {
    primary: readonly AdminNavItem[];
    secondary?: readonly AdminNavItem[];
    footer?: readonly AdminNavItem[];
    style?: AdminNavStyle;
  };
  featureFlags: FeatureFlags;
  adminDashboard: AdminDashboardSettings;
  /**
   * Roles for the current admin user (widget `requiredRole` gating).
   * When omitted, widgets that declare `requiredRole` are excluded.
   */
  roles?: readonly string[];
}
