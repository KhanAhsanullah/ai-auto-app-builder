import { describe, expect, it } from 'vitest';

import {
  clearLaunchProfile,
  parseLaunchProfile,
  saveLaunchProfile,
  MOBILE_HOST_LAUNCH_KEY,
} from '../src/launch-profile.js';
import { createMemorySessionStore } from '../src/session-storage.js';

describe('mobile launch profile', () => {
  it('round-trips a saved profile', async () => {
    const store = createMemorySessionStore();
    await saveLaunchProfile(store, {
      businessName: 'Spice Route',
      vertical: 'restaurant',
      tenantId: '11111111-1111-4111-8111-111111111111',
      createdAt: '2026-09-08T00:00:00.000Z',
    });
    const parsed = parseLaunchProfile(await store.getItem(MOBILE_HOST_LAUNCH_KEY));
    expect(parsed?.vertical).toBe('restaurant');
  });

  it('clears the profile', async () => {
    const store = createMemorySessionStore({
      [MOBILE_HOST_LAUNCH_KEY]: JSON.stringify({
        businessName: 'X',
        vertical: 'grocery',
        tenantId: '11111111-1111-4111-8111-111111111111',
        createdAt: '2026-09-08T00:00:00.000Z',
      }),
    });
    await clearLaunchProfile(store);
    await expect(store.getItem(MOBILE_HOST_LAUNCH_KEY)).resolves.toBeNull();
  });
});
