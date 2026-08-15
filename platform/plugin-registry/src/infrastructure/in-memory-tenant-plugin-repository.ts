import { PluginNotInstalledException, TenantPluginDuplicateException } from '../errors.js';
import type { TenantPluginRepository } from '../domain/tenant-plugin-repository.js';
import type { TenantPluginRecord } from '../types.js';

/** In-memory tenant plugin binding store keyed by tenant and plugin id. */
export class InMemoryTenantPluginRepository implements TenantPluginRepository {
  private readonly byKey = new Map<string, TenantPluginRecord>();
  private readonly byTenantId = new Map<string, TenantPluginRecord[]>();

  async findByTenantAndPlugin(
    tenantId: string,
    pluginId: string,
  ): Promise<TenantPluginRecord | undefined> {
    return this.byKey.get(this.key(tenantId, pluginId));
  }

  async listByTenant(tenantId: string): Promise<TenantPluginRecord[]> {
    return [...(this.byTenantId.get(tenantId) ?? [])];
  }

  async save(record: TenantPluginRecord): Promise<void> {
    const compositeKey = this.key(record.tenantId, record.pluginId);

    if (this.byKey.has(compositeKey)) {
      throw new TenantPluginDuplicateException(record.tenantId, record.pluginId);
    }

    this.byKey.set(compositeKey, record);

    const existing = this.byTenantId.get(record.tenantId) ?? [];
    this.byTenantId.set(record.tenantId, [...existing, record]);
  }

  async update(record: TenantPluginRecord): Promise<void> {
    const compositeKey = this.key(record.tenantId, record.pluginId);
    const existing = this.byKey.get(compositeKey);

    if (!existing) {
      throw new PluginNotInstalledException(record.tenantId, record.pluginId);
    }

    this.byKey.set(compositeKey, record);

    const tenantRecords = this.byTenantId.get(record.tenantId) ?? [];
    this.byTenantId.set(
      record.tenantId,
      tenantRecords.map((entry) => (entry.pluginId === record.pluginId ? record : entry)),
    );
  }

  async delete(tenantId: string, pluginId: string): Promise<void> {
    const compositeKey = this.key(tenantId, pluginId);

    if (!this.byKey.has(compositeKey)) {
      throw new PluginNotInstalledException(tenantId, pluginId);
    }

    this.byKey.delete(compositeKey);
    const tenantRecords = this.byTenantId.get(tenantId) ?? [];
    this.byTenantId.set(
      tenantId,
      tenantRecords.filter((entry) => entry.pluginId !== pluginId),
    );
  }

  private key(tenantId: string, pluginId: string): string {
    return `${tenantId}@${pluginId}`;
  }
}
