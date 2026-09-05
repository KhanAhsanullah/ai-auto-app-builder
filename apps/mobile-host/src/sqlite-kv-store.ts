/**
 * Minimal SQL surface used by the demo KV store (matches expo-sqlite async API).
 */
export interface SqliteKvDatabase {
  execAsync(source: string): Promise<void>;
  getFirstAsync<T>(source: string, params?: unknown[]): Promise<T | null>;
  runAsync(source: string, params?: unknown[]): Promise<unknown>;
}

export interface DemoKvStore {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

const CREATE_KV_SQL = `
CREATE TABLE IF NOT EXISTS kv (
  key TEXT PRIMARY KEY NOT NULL,
  value TEXT NOT NULL
);
`;

/** Ensure the kv table exists. */
export async function ensureKvSchema(db: SqliteKvDatabase): Promise<void> {
  await db.execAsync(CREATE_KV_SQL);
}

/**
 * Key/value DemoSnapshotStore + SessionStore backed by a SQLite `kv` table.
 */
export function createSqliteKvStore(db: SqliteKvDatabase): DemoKvStore {
  return {
    async getItem(key) {
      const row = await db.getFirstAsync<{ value: string }>('SELECT value FROM kv WHERE key = ?', [
        key,
      ]);
      return row?.value ?? null;
    },
    async setItem(key, value) {
      await db.runAsync('INSERT OR REPLACE INTO kv (key, value) VALUES (?, ?)', [key, value]);
    },
    async removeItem(key) {
      await db.runAsync('DELETE FROM kv WHERE key = ?', [key]);
    },
  };
}

/**
 * In-memory SQLite-shaped driver for unit tests (no native module).
 */
export function createMemorySqliteKvDatabase(seed: Record<string, string> = {}): SqliteKvDatabase {
  const map = new Map<string, string>(Object.entries(seed));
  return {
    async execAsync() {
      // schema is implicit for the memory driver
    },
    async getFirstAsync<T>(source: string, params: unknown[] = []) {
      if (!/SELECT value FROM kv WHERE key = \?/i.test(source)) {
        return null;
      }
      const key = String(params[0] ?? '');
      const value = map.get(key);
      return value === undefined ? null : ({ value } as T);
    },
    async runAsync(source: string, params: unknown[] = []) {
      if (/INSERT OR REPLACE INTO kv/i.test(source)) {
        map.set(String(params[0]), String(params[1]));
        return;
      }
      if (/DELETE FROM kv WHERE key = \?/i.test(source)) {
        map.delete(String(params[0]));
      }
    },
  };
}

/**
 * Copy keys from AsyncStorage (or any KV) into SQLite when the target key is empty.
 * Removes the source key after a successful copy.
 */
export async function migrateKvKeys(
  from: {
    getItem(key: string): Promise<string | null>;
    setItem(key: string, value: string): Promise<void>;
    removeItem?(key: string): Promise<void>;
  },
  to: DemoKvStore,
  keys: string[],
): Promise<string[]> {
  const migrated: string[] = [];
  for (const key of keys) {
    const existing = (await to.getItem(key))?.trim();
    if (existing) {
      continue;
    }
    const value = (await from.getItem(key))?.trim();
    if (!value) {
      continue;
    }
    await to.setItem(key, value);
    if (typeof from.removeItem === 'function') {
      await from.removeItem(key);
    } else {
      await from.setItem(key, '');
    }
    migrated.push(key);
  }
  return migrated;
}
