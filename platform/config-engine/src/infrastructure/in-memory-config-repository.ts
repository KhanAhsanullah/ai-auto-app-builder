import {
  ConfigDocumentAlreadyExistsException,
  ConfigDocumentNotFoundException,
} from '../errors.js';
import type { ConfigRepository } from '../domain/config-repository.js';
import type { ConfigDocument } from '../types.js';

/** In-memory config revision store keyed by tenant + version. */
export class InMemoryConfigRepository implements ConfigRepository {
  private readonly byKey = new Map<string, ConfigDocument>();
  private readonly byTenant = new Map<string, Set<number>>();

  async save(document: ConfigDocument): Promise<void> {
    const key = this.key(document.tenantId, document.version);
    if (this.byKey.has(key)) {
      throw new ConfigDocumentAlreadyExistsException(document.tenantId, document.version);
    }

    this.byKey.set(key, structuredClone(document));
    const versions = this.byTenant.get(document.tenantId) ?? new Set<number>();
    versions.add(document.version);
    this.byTenant.set(document.tenantId, versions);
  }

  async update(document: ConfigDocument): Promise<void> {
    const key = this.key(document.tenantId, document.version);
    if (!this.byKey.has(key)) {
      throw new ConfigDocumentNotFoundException(document.tenantId, document.version);
    }

    this.byKey.set(key, structuredClone(document));
  }

  async findByTenantAndVersion(
    tenantId: string,
    version: number,
  ): Promise<ConfigDocument | undefined> {
    const doc = this.byKey.get(this.key(tenantId, version));
    return doc ? structuredClone(doc) : undefined;
  }

  async findLatestByTenant(tenantId: string): Promise<ConfigDocument | undefined> {
    const versions = this.byTenant.get(tenantId);
    if (!versions || versions.size === 0) {
      return undefined;
    }

    const latestVersion = Math.max(...versions);
    return this.findByTenantAndVersion(tenantId, latestVersion);
  }

  async findLatestDraftByTenant(tenantId: string): Promise<ConfigDocument | undefined> {
    return this.findLatestWithStatus(tenantId, 'draft');
  }

  async findLatestPublishedByTenant(tenantId: string): Promise<ConfigDocument | undefined> {
    return this.findLatestWithStatus(tenantId, 'published');
  }

  async listByTenant(tenantId: string): Promise<ConfigDocument[]> {
    const versions = this.byTenant.get(tenantId);
    if (!versions) {
      return [];
    }

    return [...versions]
      .sort((a, b) => a - b)
      .map((version) => this.byKey.get(this.key(tenantId, version)))
      .filter((doc): doc is ConfigDocument => doc !== undefined)
      .map((doc) => structuredClone(doc));
  }

  private async findLatestWithStatus(
    tenantId: string,
    status: ConfigDocument['status'],
  ): Promise<ConfigDocument | undefined> {
    const docs = await this.listByTenant(tenantId);
    const matching = docs.filter((doc) => doc.status === status);
    if (matching.length === 0) {
      return undefined;
    }
    return matching[matching.length - 1];
  }

  private key(tenantId: string, version: number): string {
    return `${tenantId}::${version}`;
  }
}
