import type { PluginCatalogRecord } from '../types.js';

/** Persistence port for the platform plugin catalog. */
export interface PluginCatalogRepository {
  /** Find a catalog record by plugin id and exact version. */
  findByIdAndVersion(pluginId: string, version: string): Promise<PluginCatalogRecord | undefined>;

  /** Find the highest semver version registered for a plugin id. */
  findLatestById(pluginId: string): Promise<PluginCatalogRecord | undefined>;

  /** List all catalog records. */
  list(): Promise<PluginCatalogRecord[]>;

  /** List all versions registered for a plugin id. */
  listById(pluginId: string): Promise<PluginCatalogRecord[]>;

  /**
   * Persist a new catalog record.
   * Must reject duplicate plugin id and version pairs without overwriting.
   */
  save(record: PluginCatalogRecord): Promise<void>;
}
