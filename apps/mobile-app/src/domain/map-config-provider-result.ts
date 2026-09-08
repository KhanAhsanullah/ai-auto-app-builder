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
    theme: {
      primary: config.theme.colors.primary,
      secondary: config.theme.colors.secondary,
      background: config.theme.colors.background,
      surface: config.theme.colors.surface,
      text: config.theme.colors.text,
      textMuted: config.theme.colors.textMuted ?? '#6B7280',
      border: config.theme.colors.border ?? '#E5E7EB',
    },
    navigationMobile: config.navigation.mobile,
    featureFlags: config.featureFlags,
    mobileApp: config.mobileApp,
  };
}
