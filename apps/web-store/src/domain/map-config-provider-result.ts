import type { ConfigProviderResult } from '@ai-commerce/config-runtime';
import type { TenantConfiguration } from '@ai-commerce/config-schema';

import type { ResolveWebStoreShellInput } from '../types.js';

/** Structural config input (Config Runtime result or raw tenant config). */
export type WebStoreConfigSource =
  Pick<ConfigProviderResult, 'config'> | { config: TenantConfiguration } | TenantConfiguration;

/**
 * Map Config Runtime / tenant config into WebStoreShellResolver input.
 */
export function toResolveWebStoreShellInput(
  source: WebStoreConfigSource,
): ResolveWebStoreShellInput {
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
    navigationWeb: config.navigation.web,
    featureFlags: config.featureFlags,
    webStore: config.webStore,
  };
}
