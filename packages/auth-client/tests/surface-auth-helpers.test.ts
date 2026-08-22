import { describe, expect, it } from 'vitest';

import { AuthPolicyResolver } from '../src/domain/auth-policy-resolver.js';
import {
  listEnabledMethodsBySurface,
  resolveAllSurfacePolicies,
  sessionStorageKey,
} from '../src/domain/surface-auth-helpers.js';
import { loadAuthExample } from './helpers.js';

describe('surface auth helpers', () => {
  it('resolves all surfaces and flattens enabled methods', () => {
    const policies = resolveAllSurfacePolicies(new AuthPolicyResolver(), loadAuthExample(), 't1');
    expect(policies.customer.tenantId).toBe('t1');
    expect(policies.admin.surface).toBe('admin');
    expect(policies.api.surface).toBe('api');

    const methods = listEnabledMethodsBySurface(policies);
    expect(methods.length).toBeGreaterThan(0);
    expect(methods.every((entry) => entry.surface && entry.method)).toBe(true);
  });

  it('builds surface session keys', () => {
    expect(sessionStorageKey('admin')).toBe('session.admin.tokens');
  });
});
