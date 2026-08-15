import type { TenantPluginRecord } from '../types.js';

/** Persistence port for tenant plugin runtime bindings. */
export interface TenantPluginRepository {
  /** Find a tenant plugin binding by tenant and plugin id. */
  findByTenantAndPlugin(
    tenantId: string,
    pluginId: string,
  ): Promise<TenantPluginRecord | undefined>;

  /** List all plugin bindings for a tenant. */
  listByTenant(tenantId: string): Promise<TenantPluginRecord[]>;

  /**
   * Persist a new tenant plugin binding.
   * Must reject duplicate tenant and plugin id pairs without overwriting.
   */
  save(record: TenantPluginRecord): Promise<void>;

  /**
   * Update an existing tenant plugin binding.
   * Must reject unknown bindings.
   */
  update(record: TenantPluginRecord): Promise<void>;

  /** Remove a tenant plugin binding. Must reject unknown bindings. */
  delete(tenantId: string, pluginId: string): Promise<void>;
}
