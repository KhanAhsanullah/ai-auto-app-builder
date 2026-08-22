import { describe, expect, it } from 'vitest';

import { AuthProviderRegistry } from '../src/domain/auth-provider-registry.js';
import { AuthPolicyResolver } from '../src/domain/auth-policy-resolver.js';
import { StubAuthProvider } from '../src/infrastructure/stub-auth-provider.js';
import { InMemoryTokenStore } from '../src/infrastructure/in-memory-token-store.js';
import { AuthMethodNotEnabledException } from '../src/errors.js';
import { loadAuthExample } from './helpers.js';

describe('AuthProviderRegistry', () => {
  it('returns registered providers that match the resolved policy', () => {
    const resolver = new AuthPolicyResolver();
    const policy = resolver.resolve({
      authentication: loadAuthExample(),
      surface: 'customer',
    });

    const registry = new AuthProviderRegistry();
    registry.register(new StubAuthProvider('email', ['customer']));
    registry.register(new StubAuthProvider('google', ['customer']));
    registry.register(new StubAuthProvider('facebook', ['customer']));

    const matched = registry.resolveForPolicy(policy);
    expect(matched.map((provider) => provider.id)).toEqual(['email', 'google']);
  });

  it('throws when a requested method is not enabled on the policy', () => {
    const resolver = new AuthPolicyResolver();
    const policy = resolver.resolve({
      authentication: loadAuthExample(),
      surface: 'customer',
    });

    const registry = new AuthProviderRegistry();
    registry.register(new StubAuthProvider('facebook', ['customer']));

    expect(() => registry.resolveForPolicy(policy, 'facebook')).toThrow(
      AuthMethodNotEnabledException,
    );
  });

  it('lists and unregisters providers', () => {
    const registry = new AuthProviderRegistry();
    registry.register(new StubAuthProvider('email', ['customer', 'admin']));
    expect(registry.list()).toEqual(['email']);
    expect(registry.unregister('email')).toBe(true);
    expect(registry.list()).toEqual([]);
  });
});

describe('InMemoryTokenStore', () => {
  it('stores, reads, and deletes tokens', async () => {
    const store = new InMemoryTokenStore();
    await store.set('access', 'token-1');
    await expect(store.get('access')).resolves.toBe('token-1');
    await store.delete('access');
    await expect(store.get('access')).resolves.toBeUndefined();
  });
});
