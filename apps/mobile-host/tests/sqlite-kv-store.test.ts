import { describe, expect, it } from 'vitest';

import { DEMO_SNAPSHOT_KEY, createMemoryDemoSnapshotStore } from '@ai-commerce/mobile-app';

import { openDemoDurableStore } from '../src/open-demo-store.js';
import { MOBILE_HOST_SESSION_KEY, createMemorySessionStore } from '../src/session-storage.js';
import {
  createMemorySqliteKvDatabase,
  createSqliteKvStore,
  ensureKvSchema,
  migrateKvKeys,
} from '../src/sqlite-kv-store.js';

function createMemoryKv(seed: Record<string, string> = {}) {
  const map = new Map<string, string>(Object.entries(seed));
  return {
    async getItem(key: string) {
      return map.get(key) ?? null;
    },
    async setItem(key: string, value: string) {
      map.set(key, value);
    },
    async removeItem(key: string) {
      map.delete(key);
    },
  };
}

describe('sqlite kv store', () => {
  it('round-trips get/set/remove', async () => {
    const db = createMemorySqliteKvDatabase();
    await ensureKvSchema(db);
    const store = createSqliteKvStore(db);

    await store.setItem('a', 'one');
    await expect(store.getItem('a')).resolves.toBe('one');
    await store.setItem('a', 'two');
    await expect(store.getItem('a')).resolves.toBe('two');
    await store.removeItem('a');
    await expect(store.getItem('a')).resolves.toBeNull();
  });

  it('migrates snapshot + session from AsyncStorage once', async () => {
    const snapshot = JSON.stringify({
      version: 1,
      idSeq: 3,
      products: [{ id: 'p1' }],
      categories: [],
      carts: [],
      checkouts: [],
      orders: [],
      payments: [],
    });
    const asyncLike = createMemoryKv({
      [MOBILE_HOST_SESSION_KEY]: 'sess-1',
      [DEMO_SNAPSHOT_KEY]: snapshot,
    });

    const db = createMemorySqliteKvDatabase();
    await ensureKvSchema(db);
    const sqlite = createSqliteKvStore(db);

    const migrated = await migrateKvKeys(asyncLike, sqlite, [
      DEMO_SNAPSHOT_KEY,
      MOBILE_HOST_SESSION_KEY,
    ]);
    expect(migrated).toEqual([DEMO_SNAPSHOT_KEY, MOBILE_HOST_SESSION_KEY]);
    await expect(sqlite.getItem(MOBILE_HOST_SESSION_KEY)).resolves.toBe('sess-1');
    await expect(sqlite.getItem(DEMO_SNAPSHOT_KEY)).resolves.toContain('"idSeq":3');
    await expect(asyncLike.getItem(DEMO_SNAPSHOT_KEY)).resolves.toBeNull();
    await expect(asyncLike.getItem(MOBILE_HOST_SESSION_KEY)).resolves.toBeNull();

    await asyncLike.setItem(DEMO_SNAPSHOT_KEY, 'should-not-overwrite');
    const again = await migrateKvKeys(asyncLike, sqlite, [DEMO_SNAPSHOT_KEY]);
    expect(again).toEqual([]);
    await expect(sqlite.getItem(DEMO_SNAPSHOT_KEY)).resolves.toContain('"idSeq":3');
  });
});

describe('openDemoDurableStore', () => {
  it('uses sqlite when openDatabase succeeds', async () => {
    const asyncStorage = Object.assign(createMemoryDemoSnapshotStore(), createMemorySessionStore());

    const result = await openDemoDurableStore({
      asyncStorage,
      openDatabase: async () => createMemorySqliteKvDatabase(),
    });
    expect(result.backend).toBe('sqlite');
    await result.store.setItem('k', 'v');
    await expect(result.store.getItem('k')).resolves.toBe('v');
  });

  it('falls back to AsyncStorage when sqlite open fails', async () => {
    const asyncStorage = Object.assign(createMemoryDemoSnapshotStore(), createMemorySessionStore());

    const result = await openDemoDurableStore({
      asyncStorage,
      openDatabase: async () => {
        throw new Error('native module missing');
      },
    });
    expect(result.backend).toBe('async-storage');
    expect(result.migratedKeys).toEqual([]);
    await result.store.setItem('k', 'v');
    await expect(result.store.getItem('k')).resolves.toBe('v');
  });

  it('migrates keys during sqlite open', async () => {
    const asyncStorage = createMemoryKv({
      [MOBILE_HOST_SESSION_KEY]: 'legacy-sess',
    });

    const result = await openDemoDurableStore({
      asyncStorage,
      openDatabase: async () => createMemorySqliteKvDatabase(),
    });
    expect(result.backend).toBe('sqlite');
    expect(result.migratedKeys).toContain(MOBILE_HOST_SESSION_KEY);
    await expect(result.store.getItem(MOBILE_HOST_SESSION_KEY)).resolves.toBe('legacy-sess');
    await expect(asyncStorage.getItem(MOBILE_HOST_SESSION_KEY)).resolves.toBeNull();
  });
});
