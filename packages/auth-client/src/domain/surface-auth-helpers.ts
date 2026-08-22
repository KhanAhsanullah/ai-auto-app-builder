import type { Authentication } from '@ai-commerce/config-schema';

import type { AuthMethodId, AuthSurface, ResolvedAuthPolicy } from '../types.js';
import type { AuthPolicyResolver } from './auth-policy-resolver.js';

/** Policies resolved for every auth surface. */
export interface MultiSurfaceAuthPolicies {
  customer: ResolvedAuthPolicy;
  admin: ResolvedAuthPolicy;
  api: ResolvedAuthPolicy;
}

/** Resolve customer, admin, and api policies from one authentication config. */
export function resolveAllSurfacePolicies(
  resolver: AuthPolicyResolver,
  authentication: Authentication,
  tenantId?: string,
): MultiSurfaceAuthPolicies {
  return {
    customer: resolver.resolve({ authentication, surface: 'customer', tenantId }),
    admin: resolver.resolve({ authentication, surface: 'admin', tenantId }),
    api: resolver.resolve({ authentication, surface: 'api', tenantId }),
  };
}

/** Flatten enabled methods across all surfaces with surface tags. */
export function listEnabledMethodsBySurface(
  policies: MultiSurfaceAuthPolicies,
): ReadonlyArray<{ surface: AuthSurface; method: AuthMethodId }> {
  const entries: Array<{ surface: AuthSurface; method: AuthMethodId }> = [];
  for (const surface of ['customer', 'admin', 'api'] as const) {
    for (const method of policies[surface].enabledMethods) {
      entries.push({ surface, method });
    }
  }
  return entries;
}

/** TokenStore key for a surface-scoped session. */
export function sessionStorageKey(surface: AuthSurface): string {
  return `session.${surface}.tokens`;
}
