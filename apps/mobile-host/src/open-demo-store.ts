import { DEMO_SNAPSHOT_KEY } from '@ai-commerce/mobile-app';
import type { DemoSnapshotStore } from '@ai-commerce/mobile-app';

import { MOBILE_HOST_SESSION_KEY, type SessionStore } from './session-storage.js';
import {
  createSqliteKvStore,
  ensureKvSchema,
  migrateKvKeys,
  type DemoKvStore,
  type SqliteKvDatabase,
} from './sqlite-kv-store.js';

export type DemoDurableBackend = 'sqlite' | 'async-storage';

export interface OpenDemoDurableStoreResult {
  store: SessionStore & DemoSnapshotStore;
  backend: DemoDurableBackend;
  migratedKeys: string[];
}

export interface OpenDemoDurableStoreOptions {
  /** Previous AsyncStorage-backed store (migration source + fallback). */
  asyncStorage: SessionStore & DemoSnapshotStore;
  /** Override SQLite open (tests / custom DB). */
  openDatabase?: () => Promise<SqliteKvDatabase>;
  /** Database file name when using expo-sqlite. */
  databaseName?: string;
}

const DEFAULT_DB_NAME = 'ai-commerce-demo.db';

async function openExpoSqliteDatabase(name: string): Promise<SqliteKvDatabase> {
  const sqlite = await import('expo-sqlite');
  return sqlite.openDatabaseAsync(name) as Promise<SqliteKvDatabase>;
}

/**
 * Prefer SQLite for durable demo state; migrate once from AsyncStorage; fall back if open fails.
 */
export async function openDemoDurableStore(
  options: OpenDemoDurableStoreOptions,
): Promise<OpenDemoDurableStoreResult> {
  const { asyncStorage } = options;
  const databaseName = options.databaseName ?? DEFAULT_DB_NAME;

  try {
    const open = options.openDatabase ?? (() => openExpoSqliteDatabase(databaseName));
    const db = await open();
    await ensureKvSchema(db);
    const store = createSqliteKvStore(db) as DemoKvStore & SessionStore & DemoSnapshotStore;
    const migratedKeys = await migrateKvKeys(asyncStorage, store, [
      DEMO_SNAPSHOT_KEY,
      MOBILE_HOST_SESSION_KEY,
    ]);
    return { store, backend: 'sqlite', migratedKeys };
  } catch {
    return { store: asyncStorage, backend: 'async-storage', migratedKeys: [] };
  }
}
