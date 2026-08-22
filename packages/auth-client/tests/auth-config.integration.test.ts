import { ConfigProvider } from '@ai-commerce/config-runtime';
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

import { AuthPolicyResolver } from '../src/domain/auth-policy-resolver.js';
import {
  authConfigSourceFromProviderResult,
  toResolveAuthPolicyInput,
} from '../src/domain/map-config-auth-source.js';
import { FULL_TENANT_CONFIG_PATH } from './helpers.js';

describe('Config Runtime → AuthPolicyResolver integration', () => {
  it('maps ConfigProvider output to a customer auth policy', () => {
    const tenantConfig = JSON.parse(readFileSync(FULL_TENANT_CONFIG_PATH, 'utf8'));
    const provider = new ConfigProvider({ cache: false });
    const result = provider.resolve({ tenantConfig, skipCache: true });

    expect(result.validation.success).toBe(true);

    const source = authConfigSourceFromProviderResult(result);
    const input = toResolveAuthPolicyInput(source, 'customer');
    const policy = new AuthPolicyResolver().resolve(input);

    expect(policy.surface).toBe('customer');
    expect(policy.tenantId).toBe(result.config.tenant.id);
    expect(policy.enabledMethods.length).toBeGreaterThan(0);
    expect(policy.session.tokenTtlMinutes).toBeGreaterThanOrEqual(5);
  });

  it('maps ConfigProvider output to an admin auth policy', () => {
    const tenantConfig = JSON.parse(readFileSync(FULL_TENANT_CONFIG_PATH, 'utf8'));
    const provider = new ConfigProvider({ cache: false });
    const result = provider.resolve({ tenantConfig, skipCache: true });

    const source = authConfigSourceFromProviderResult(result);
    const policy = new AuthPolicyResolver().resolve(toResolveAuthPolicyInput(source, 'admin'));

    expect(policy.surface).toBe('admin');
    expect(policy.mfa).toBeDefined();
    expect(policy.enabledMethods).toContain('email');
  });
});
