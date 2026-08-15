import { describe, expect, it } from 'vitest';

import { InMemoryTenantPluginRepository } from '../src/infrastructure/in-memory-tenant-plugin-repository.js';
import { PluginNotInstalledException, TenantPluginDuplicateException } from '../src/errors.js';
import type { TenantPluginRecord } from '../src/types.js';
import { FIXED_CLOCK, TENANT_ID, VALID_PLUGIN_MANIFEST } from './helpers.js';

function createRecord(pluginId = VALID_PLUGIN_MANIFEST.id): TenantPluginRecord {
  return {
    tenantId: TENANT_ID,
    pluginId,
    version: '1.0.0',
    status: 'installed',
    resolvedDependencies: [],
    installFingerprint: 'abc123',
    installedAt: FIXED_CLOCK,
    updatedAt: FIXED_CLOCK,
  };
}

describe('InMemoryTenantPluginRepository', () => {
  it('saves and finds a tenant plugin binding', async () => {
    const repository = new InMemoryTenantPluginRepository();
    const record = createRecord();

    await repository.save(record);

    await expect(repository.findByTenantAndPlugin(TENANT_ID, record.pluginId)).resolves.toEqual(
      record,
    );
  });

  it('rejects duplicate tenant and plugin id pairs', async () => {
    const repository = new InMemoryTenantPluginRepository();
    const record = createRecord();

    await repository.save(record);

    await expect(repository.save(record)).rejects.toThrow(TenantPluginDuplicateException);
  });

  it('updates an existing binding', async () => {
    const repository = new InMemoryTenantPluginRepository();
    const record = createRecord();

    await repository.save(record);
    await repository.update({
      ...record,
      status: 'enabled',
      updatedAt: '2026-08-17T00:00:00.000Z',
    });

    const updated = await repository.findByTenantAndPlugin(TENANT_ID, record.pluginId);
    expect(updated?.status).toBe('enabled');
  });

  it('throws when updating a missing binding', async () => {
    const repository = new InMemoryTenantPluginRepository();

    await expect(repository.update(createRecord())).rejects.toThrow(PluginNotInstalledException);
  });

  it('lists bindings for a tenant', async () => {
    const repository = new InMemoryTenantPluginRepository();

    await repository.save(createRecord());
    await repository.save(createRecord('com.commerceos.other.plugin'));

    const records = await repository.listByTenant(TENANT_ID);
    expect(records).toHaveLength(2);
  });

  it('deletes an existing binding', async () => {
    const repository = new InMemoryTenantPluginRepository();
    const record = createRecord();

    await repository.save(record);
    await repository.delete(TENANT_ID, record.pluginId);

    await expect(
      repository.findByTenantAndPlugin(TENANT_ID, record.pluginId),
    ).resolves.toBeUndefined();
  });

  it('throws when deleting a missing binding', async () => {
    const repository = new InMemoryTenantPluginRepository();

    await expect(repository.delete(TENANT_ID, 'missing.plugin')).rejects.toThrow(
      PluginNotInstalledException,
    );
  });
});
