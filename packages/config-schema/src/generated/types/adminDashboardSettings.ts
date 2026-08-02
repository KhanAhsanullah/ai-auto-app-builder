/**
 * AUTO-GENERATED FILE — DO NOT EDIT DIRECTLY.
 * Source: schemas/ (JSON Schema v1)
 * Regenerate: pnpm --filter @ai-commerce/config-schema generate
 */

/**
 * Admin dashboard layout, widgets, RBAC visibility, and operational preferences.
 */
export interface AdminDashboardSettings {
  enabled: boolean;
  domain?: {
    /**
     * Admin portal domain (e.g. admin.merchant.com).
     */
    primary?: string;
    platformSubdomain?: string;
  };
  layout: {
    sidebarStyle: 'expanded' | 'collapsed' | 'mini';
    defaultLandingRoute: string;
    widgets?: {
      id: string;
      enabled: boolean;
      position?: number;
      requiredRole?: 'owner' | 'admin' | 'manager' | 'staff' | 'support';
    }[];
  };
  preferences: {
    dateFormat: 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD';
    timeFormat: '12h' | '24h';
    rowsPerPage?: 10 | 25 | 50 | 100;
    enableBulkActions?: boolean;
    enableExport?: boolean;
  };
  onboarding?: {
    showWizard?: boolean;
    completedSteps?: (
      'company_profile' | 'branding' | 'catalog' | 'payments' | 'shipping' | 'go_live'
    )[];
  };
}
