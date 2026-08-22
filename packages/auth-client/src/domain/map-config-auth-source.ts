import type { Authentication, Tenant } from '@ai-commerce/config-schema';

import type { AuthConfigSource, ResolveAuthPolicyInput } from '../types.js';

/** Input shape produced by ConfigProvider (structural; no config-runtime import). */
export interface ConfigProviderAuthInput {
  readonly config: Readonly<{
    authentication: Authentication;
    tenant?: Pick<Tenant, 'id'> | Tenant;
  }>;
}

/** Map an AuthConfigSource to AuthPolicyResolver input for a surface. */
export function toResolveAuthPolicyInput(
  source: AuthConfigSource,
  surface: ResolveAuthPolicyInput['surface'],
): ResolveAuthPolicyInput {
  return {
    authentication: source.config.authentication,
    surface,
    tenantId: source.config.tenant?.id,
  };
}

/** Normalize Config Runtime output into an AuthConfigSource. */
export function authConfigSourceFromProviderResult(
  result: ConfigProviderAuthInput,
): AuthConfigSource {
  return {
    config: {
      authentication: result.config.authentication,
      tenant: result.config.tenant ? { id: result.config.tenant.id } : undefined,
    },
  };
}
