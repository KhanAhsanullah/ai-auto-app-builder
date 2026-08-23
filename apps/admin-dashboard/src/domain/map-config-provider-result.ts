import type { ConfigProviderResult } from '@ai-commerce/config-runtime';
import type { TenantConfiguration } from '@ai-commerce/config-schema';

import type { ResolveAdminDashboardShellInput } from '../types.js';

/** Structural config input (Config Runtime result or raw tenant config). */
export type AdminDashboardConfigSource =
  Pick<ConfigProviderResult, 'config'> | { config: TenantConfiguration } | TenantConfiguration;

/**
 * Map Config Runtime / tenant config into AdminDashboardShellResolver input.
 */
export function toResolveAdminDashboardShellInput(
  source: AdminDashboardConfigSource,
  options: { roles?: readonly string[] } = {},
): ResolveAdminDashboardShellInput {
  const config = 'config' in source ? source.config : source;

  return {
    tenant: {
      id: config.tenant.id,
      slug: config.tenant.slug,
      name: config.tenant.name,
      vertical: config.tenant.vertical,
    },
    branding: config.branding,
    companyDisplayName: config.company?.displayName,
    navigationAdmin: config.navigation.admin,
    featureFlags: config.featureFlags,
    adminDashboard: config.adminDashboard,
    ...(options.roles ? { roles: options.roles } : {}),
  };
}
