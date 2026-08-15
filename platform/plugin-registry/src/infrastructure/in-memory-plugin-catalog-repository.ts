import semver from 'semver';

import { PluginCatalogDuplicateException } from '../errors.js';
import type { PluginCatalogRepository } from '../domain/plugin-catalog-repository.js';
import type { PluginCatalogRecord } from '../types.js';

/** In-memory plugin catalog backed by composite id/version indexes. */
export class InMemoryPluginCatalogRepository implements PluginCatalogRepository {
  private readonly byKey = new Map<string, PluginCatalogRecord>();
  private readonly byPluginId = new Map<string, PluginCatalogRecord[]>();

  async findByIdAndVersion(
    pluginId: string,
    version: string,
  ): Promise<PluginCatalogRecord | undefined> {
    return this.byKey.get(this.key(pluginId, version));
  }

  async findLatestById(pluginId: string): Promise<PluginCatalogRecord | undefined> {
    const records = this.byPluginId.get(pluginId) ?? [];

    if (records.length === 0) {
      return undefined;
    }

    return [...records].sort((left, right) => semver.rcompare(left.version, right.version))[0];
  }

  async list(): Promise<PluginCatalogRecord[]> {
    return [...this.byKey.values()];
  }

  async listById(pluginId: string): Promise<PluginCatalogRecord[]> {
    return [...(this.byPluginId.get(pluginId) ?? [])];
  }

  async save(record: PluginCatalogRecord): Promise<void> {
    const compositeKey = this.key(record.pluginId, record.version);

    if (this.byKey.has(compositeKey)) {
      throw new PluginCatalogDuplicateException(record.pluginId, record.version);
    }

    this.byKey.set(compositeKey, record);

    const existing = this.byPluginId.get(record.pluginId) ?? [];
    this.byPluginId.set(record.pluginId, [...existing, record]);
  }

  private key(pluginId: string, version: string): string {
    return `${pluginId}@${version}`;
  }
}
