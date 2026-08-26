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
    navigationWeb: config.navigation.web,
    featureFlags: config.featureFlags,
    webStore: config.webStore,
  };
}
