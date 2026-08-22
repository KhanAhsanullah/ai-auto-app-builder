import { describe, expect, it } from 'vitest';

import { TokenRefreshService } from '../src/domain/token-refresh-service.js';
import { AuthTokenException } from '../src/errors.js';
import { InMemoryTokenStore } from '../src/infrastructure/in-memory-token-store.js';
import {
  InMemoryKeyValueStore,
  PrefixedSecureTokenStore,
} from '../src/infrastructure/prefixed-secure-token-store.js';
import { ScriptedHttpJsonClient } from '../src/infrastructure/scripted-http-json-client.js';
import type { AuthTokenSet } from '../src/domain/auth-flow-types.js';

describe('TokenRefreshService', () => {
  const session = { tokenTtlMinutes: 60, refreshEnabled: true };

  it('returns tokens unchanged when not near expiry', async () => {
    const http = new ScriptedHttpJsonClient();
    const service = new TokenRefreshService({
      http,
      client: { clientId: 'c1', tokenEndpoint: 'https://idp.example.com/token' },
      clock: () => 1_000,
    });

    const tokens: AuthTokenSet = {
      accessToken: 'a',
      refreshToken: 'r',
      expiresAt: 1_000 + 120_000,
    };

    await expect(service.ensureFresh(tokens, session)).resolves.toBe(tokens);
  });

  it('refreshes tokens when near expiry', async () => {
    const http = new ScriptedHttpJsonClient();
    http.enqueue({
      status: 200,
      body: {
        access_token: 'new-access',
        refresh_token: 'new-refresh',
        expires_in: 3600,
        token_type: 'Bearer',
      },
    });

    const service = new TokenRefreshService({
      http,
      client: { clientId: 'c1', tokenEndpoint: 'https://idp.example.com/token' },
      clock: () => 10_000,
      refreshSkewMs: 60_000,
    });

    const tokens: AuthTokenSet = {
      accessToken: 'old',
      refreshToken: 'old-refresh',
      expiresAt: 10_000 + 30_000,
    };

    const fresh = await service.ensureFresh(tokens, session);
    expect(fresh.accessToken).toBe('new-access');
    expect(fresh.refreshToken).toBe('new-refresh');
    expect(fresh.expiresAt).toBe(10_000 + 3_600_000);
  });

  it('fails when refresh is disabled by policy', async () => {
    const service = new TokenRefreshService({
      http: new ScriptedHttpJsonClient(),
      client: { clientId: 'c1', tokenEndpoint: 'https://idp.example.com/token' },
      clock: () => 10_000,
    });

    await expect(
      service.ensureFresh(
        { accessToken: 'a', refreshToken: 'r', expiresAt: 10_000 },
        { tokenTtlMinutes: 60, refreshEnabled: false },
      ),
    ).rejects.toThrow(AuthTokenException);
  });

  it('loads, refreshes, and persists tokens in a TokenStore', async () => {
    const http = new ScriptedHttpJsonClient();
    http.enqueue({
      status: 200,
      body: { access_token: 'persisted', expires_in: 120 },
    });

    const store = new InMemoryTokenStore();
    const service = new TokenRefreshService({
      http,
      client: { clientId: 'c1', tokenEndpoint: 'https://idp.example.com/token' },
      clock: () => 50_000,
    });

    await service.saveToStore(store, {
      accessToken: 'old',
      refreshToken: 'r1',
      expiresAt: 50_000,
    });

    const fresh = await service.ensureFreshInStore(store, session);
    expect(fresh?.accessToken).toBe('persisted');
    expect(fresh?.refreshToken).toBe('r1');

    const raw = await store.get('session.tokens');
    expect(raw).toContain('persisted');
  });
});

describe('PrefixedSecureTokenStore', () => {
  it('prefixes keys in a SyncKeyValueStore', async () => {
    const kv = new InMemoryKeyValueStore();
    const store = new PrefixedSecureTokenStore(kv, 'tenant.auth.');

    await store.set('access', 'tok');
    expect(kv.getItem('tenant.auth.access')).toBe('tok');
    await expect(store.get('access')).resolves.toBe('tok');
    await store.delete('access');
    expect(kv.getItem('tenant.auth.access')).toBeNull();
  });
});
