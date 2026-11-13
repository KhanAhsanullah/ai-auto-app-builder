import { describe, expect, it } from 'vitest';

import {
  DEMO_LAUNCH_VERTICAL_THEME,
  LAUNCH_VERTICAL_OPTIONS,
  WEB_HOST_LAUNCH_KEY,
  WEB_HOST_LAUNCH_PROFILES_KEY,
  clearActiveLaunchProfile,
  clearLaunchProfile,
  listLaunchProfiles,
  loadLaunchProfile,
  loadLaunchProfileRegistry,
  parseLaunchProfile,
  removeLaunchProfile,
  setActiveLaunchProfile,
  upsertLaunchProfile,
} from '../src/launch-profile.js';
import { createMemorySessionStore } from '../src/session-storage.js';

describe('launch profile', () => {
  it('exposes vertical brand accents and theme tokens for the wizard', () => {
    expect(LAUNCH_VERTICAL_OPTIONS.find((o) => o.id === 'grocery')?.accent).toBe('#16A34A');
    expect(LAUNCH_VERTICAL_OPTIONS.find((o) => o.id === 'restaurant')?.accent).toBe('#DC2626');
    expect(DEMO_LAUNCH_VERTICAL_THEME.restaurant.secondary).toMatch(/^#/);
    expect(LAUNCH_VERTICAL_OPTIONS.find((o) => o.id === 'pharmacy')?.theme.primary).toBe(
      DEMO_LAUNCH_VERTICAL_THEME.pharmacy.primary,
    );
  });

  it('round-trips a saved profile in the multi-profile registry', async () => {
    const store = createMemorySessionStore();
    await upsertLaunchProfile(store, {
      businessName: 'Spice Route',
      vertical: 'restaurant',
      tenantId: '11111111-1111-4111-8111-111111111111',
      createdAt: '2026-09-08T00:00:00.000Z',
    });
    const parsed = await loadLaunchProfile(store);
    expect(parsed?.businessName).toBe('Spice Route');
    expect(parsed?.vertical).toBe('restaurant');
    const registry = await loadLaunchProfileRegistry(store);
    expect(registry.profiles).toHaveLength(1);
    expect(registry.activeTenantId).toBe('11111111-1111-4111-8111-111111111111');
  });

  it('migrates legacy single-profile key into the registry', async () => {
    const store = createMemorySessionStore({
      [WEB_HOST_LAUNCH_KEY]: JSON.stringify({
        businessName: 'Legacy Mart',
        vertical: 'grocery',
        tenantId: '22222222-2222-4222-8222-222222222222',
        createdAt: '2026-09-08T00:00:00.000Z',
      }),
    });
    const profile = await loadLaunchProfile(store);
    expect(profile?.businessName).toBe('Legacy Mart');
    const registryRaw = await store.getItem(WEB_HOST_LAUNCH_PROFILES_KEY);
    expect(registryRaw).toBeTruthy();
    await expect(store.getItem(WEB_HOST_LAUNCH_KEY)).resolves.toBeNull();
  });

  it('switches active profile without dropping others', async () => {
    const store = createMemorySessionStore();
    await upsertLaunchProfile(store, {
      businessName: 'A',
      vertical: 'grocery',
      tenantId: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      createdAt: '2026-09-08T01:00:00.000Z',
    });
    await upsertLaunchProfile(store, {
      businessName: 'B',
      vertical: 'restaurant',
      tenantId: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
      createdAt: '2026-09-08T02:00:00.000Z',
    });
    expect(await listLaunchProfiles(store)).toHaveLength(2);
    const active = await setActiveLaunchProfile(store, 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa');
    expect(active?.businessName).toBe('A');
    expect((await loadLaunchProfile(store))?.businessName).toBe('A');
  });

  it('clearActiveLaunchProfile keeps saved profiles for the wizard', async () => {
    const store = createMemorySessionStore();
    await upsertLaunchProfile(store, {
      businessName: 'Keep Me',
      vertical: 'fashion',
      tenantId: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
      createdAt: '2026-09-08T03:00:00.000Z',
    });
    await clearActiveLaunchProfile(store);
    const registry = await loadLaunchProfileRegistry(store);
    expect(registry.activeTenantId).toBeNull();
    expect(registry.profiles).toHaveLength(1);
    expect(await listLaunchProfiles(store)).toHaveLength(1);
  });

  it('removes one profile and clears all when asked', async () => {
    const store = createMemorySessionStore();
    await upsertLaunchProfile(store, {
      businessName: 'One',
      vertical: 'ecommerce',
      tenantId: 'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
      createdAt: '2026-09-08T04:00:00.000Z',
    });
    await upsertLaunchProfile(store, {
      businessName: 'Two',
      vertical: 'electronics',
      tenantId: 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',
      createdAt: '2026-09-08T05:00:00.000Z',
    });
    await removeLaunchProfile(store, 'dddddddd-dddd-4ddd-8ddd-dddddddddddd');
    expect(await listLaunchProfiles(store)).toHaveLength(1);
    await clearLaunchProfile(store);
    expect(await listLaunchProfiles(store)).toHaveLength(0);
    expect(parseLaunchProfile(null)).toBeUndefined();
  });
});
