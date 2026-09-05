import { describe, expect, it } from 'vitest';

import {
  clearGuestSession,
  createMemorySessionStore,
  MOBILE_HOST_SESSION_KEY,
  resolveGuestSessionId,
} from '../src/session-storage.js';

describe('resolveGuestSessionId', () => {
  it('reuses a persisted session id', async () => {
    const store = createMemorySessionStore({
      [MOBILE_HOST_SESSION_KEY]: 'existing-session',
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
    await expect(store.getItem(MOBILE_HOST_SESSION_KEY)).resolves.toBe('fresh-session');
  });

  it('prefers an explicit session id', async () => {
    const store = createMemorySessionStore({
      [MOBILE_HOST_SESSION_KEY]: 'old',
    });
    const id = await resolveGuestSessionId({
      store,
      preferred: 'preferred-session',
    });
    expect(id).toBe('preferred-session');
    await expect(store.getItem(MOBILE_HOST_SESSION_KEY)).resolves.toBe('preferred-session');
  });

  it('creates a new session after clearGuestSession', async () => {
    const store = createMemorySessionStore({
      [MOBILE_HOST_SESSION_KEY]: 'stale-session',
    });
    await clearGuestSession(store);
    await expect(store.getItem(MOBILE_HOST_SESSION_KEY)).resolves.toBeNull();
    const id = await resolveGuestSessionId({
      store,
      createId: () => 'after-clear',
    });
    expect(id).toBe('after-clear');
  });
});
