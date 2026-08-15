import { describe, expect, it } from 'vitest';

import { InMemoryPluginCatalogRepository } from '../src/infrastructure/in-memory-plugin-catalog-repository.js';
import { PluginCatalogDuplicateException } from '../src/errors.js';
import type { PluginCatalogRecord } from '../src/types.js';
import { VALID_PLUGIN_MANIFEST, VALID_PLUGIN_MANIFEST_V2 } from './helpers.js';

const FIXED_TIMESTAMP = '2026-08-16T00:00:00.000Z';

function createRecord(manifest = VALID_PLUGIN_MANIFEST): PluginCatalogRecord {
  return {
    pluginId: manifest.id,
    version: manifest.version,
    manifest,
    registeredAt: FIXED_TIMESTAMP,
  };
}

describe('InMemoryPluginCatalogRepository', () => {
  it('saves and finds a record by id and version', async () => {
    const repository = new InMemoryPluginCatalogRepository();
    const record = createRecord();

    await repository.save(record);

    await expect(repository.findByIdAndVersion(record.pluginId, record.version)).resolves.toEqual(
      record,
    );
  });

  it('rejects duplicate id and version pairs', async () => {
    const repository = new InMemoryPluginCatalogRepository();
    const record = createRecord();

    await repository.save(record);

    await expect(repository.save(record)).rejects.toThrow(PluginCatalogDuplicateException);
  });

  it('lists all records', async () => {
    const repository = new InMemoryPluginCatalogRepository();

    await repository.save(createRecord());
    await repository.save(createRecord(VALID_PLUGIN_MANIFEST_V2));

    const records = await repository.list();

    expect(records).toHaveLength(2);
  });

  it('lists records for a plugin id', async () => {
    const repository = new InMemoryPluginCatalogRepository();

    await repository.save(createRecord());
    await repository.save(createRecord(VALID_PLUGIN_MANIFEST_V2));

    const records = await repository.listById(VALID_PLUGIN_MANIFEST.id);

    expect(records).toHaveLength(2);
    expect(records.map((record) => record.version).sort()).toEqual(['1.0.0', '2.0.0']);
  });

  it('finds the latest semver version for a plugin id', async () => {
    const repository = new InMemoryPluginCatalogRepository();

    await repository.save(createRecord());
    await repository.save(createRecord(VALID_PLUGIN_MANIFEST_V2));

    const latest = await repository.findLatestById(VALID_PLUGIN_MANIFEST.id);

    expect(latest?.version).toBe('2.0.0');
  });

  it('returns undefined for missing records', async () => {
    const repository = new InMemoryPluginCatalogRepository();

    await expect(repository.findByIdAndVersion('missing.plugin', '1.0.0')).resolves.toBeUndefined();
    await expect(repository.findLatestById('missing.plugin')).resolves.toBeUndefined();
  });
});
