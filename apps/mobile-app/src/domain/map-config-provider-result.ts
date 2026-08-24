import type { ConfigProviderResult } from '@ai-commerce/config-runtime';
import type { TenantConfiguration } from '@ai-commerce/config-schema';

import type { ResolveMobileAppShellInput } from '../types.js';

/** Structural config input (Config Runtime result or raw tenant config). */
export type MobileAppConfigSource =
  Pick<ConfigProviderResult, 'config'> | { config: TenantConfiguration } | TenantConfiguration;

/**
 * Map Config Runtime / tenant config into MobileAppShellResolver input.
 */
export function toResolveMobileAppShellInput(
  source: MobileAppConfigSource,
): ResolveMobileAppShellInput {
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
    navigationMobile: config.navigation.mobile,
    featureFlags: config.featureFlags,
    mobileApp: config.mobileApp,
  };
}
