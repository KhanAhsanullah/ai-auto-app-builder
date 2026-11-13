import { describe, expect, it } from 'vitest';

import {
  clearGuestSession,
  createMemorySessionStore,
  resolveGuestSessionId,
  WEB_HOST_SESSION_KEY,
} from '../src/session-storage.js';
import { createLocalStorageKvStore } from '../src/local-storage-kv.js';

describe('resolveGuestSessionId', () => {
  it('reuses a persisted session id', async () => {
    const store = createMemorySessionStore({
      [WEB_HOST_SESSION_KEY]: 'existing-session',
    });
    await expect(resolveGuestSessionId({ store })).resolves.toBe('existing-session');
  });

  it('creates and persists a new session when missing', async () => {
    const store = createMemorySessionStore();
    const id = await resolveGuestSessionId({
      store,
      createId: () => 'fresh-session',
    });
    expect(id).toBe('fresh-session');
    await expect(store.getItem(WEB_HOST_SESSION_KEY)).resolves.toBe('fresh-session');
  });

  it('creates a new session after clearGuestSession', async () => {
    const store = createMemorySessionStore({
      [WEB_HOST_SESSION_KEY]: 'stale-session',
    });
    await clearGuestSession(store);
    await expect(store.getItem(WEB_HOST_SESSION_KEY)).resolves.toBeNull();
    const id = await resolveGuestSessionId({
      store,
      createId: () => 'after-clear',
    });
    expect(id).toBe('after-clear');
  });

  it('isolates guest sessions per tenant', async () => {
    const store = createMemorySessionStore();
    const a = await resolveGuestSessionId({
      store,
      tenantId: 'tenant-a',
      createId: () => 'session-a',
    });
    const b = await resolveGuestSessionId({
      store,
      tenantId: 'tenant-b',
      createId: () => 'session-b',
    });
    expect(a).toBe('session-a');
    expect(b).toBe('session-b');
    await clearGuestSession(store, { tenantId: 'tenant-a' });
    await expect(store.getItem(`${WEB_HOST_SESSION_KEY}:tenant-a`)).resolves.toBeNull();
    await expect(store.getItem(`${WEB_HOST_SESSION_KEY}:tenant-b`)).resolves.toBe('session-b');
  });
});

describe('createLocalStorageKvStore', () => {
  it('round-trips against an in-memory Storage shim', async () => {
    const map = new Map<string, string>();
    const storage = {
      getItem(key: string) {
        return map.get(key) ?? null;
      },
      setItem(key: string, value: string) {
        map.set(key, value);
      },
      removeItem(key: string) {
        map.delete(key);
      },
    };
    const kv = createLocalStorageKvStore(storage);
    await kv.setItem('a', '1');
    await expect(kv.getItem('a')).resolves.toBe('1');
    await kv.removeItem?.('a');
    await expect(kv.getItem('a')).resolves.toBeNull();
  });
});
