import { PluginAlreadyRegisteredException } from '../errors.js';
import {
  computeManifestFingerprint,
  type CatalogRegistrationResult,
  type PluginCatalogRecord,
} from '../types.js';
import type { ManifestValidator } from './manifest-validator.js';
import type { PluginCatalogRepository } from './plugin-catalog-repository.js';

export interface CatalogServiceDeps {
  validator: ManifestValidator;
  repository: PluginCatalogRepository;
  clock?: () => string;
}

/** Orchestrates plugin manifest validation and catalog registration. */
export class CatalogService {
  private readonly clock: () => string;

  constructor(private readonly deps: CatalogServiceDeps) {
    this.clock = deps.clock ?? (() => new Date().toISOString());
  }

  /** Register a plugin manifest in the platform catalog. */
  async register(manifestInput: unknown): Promise<CatalogRegistrationResult> {
    const manifest = this.deps.validator.validate(manifestInput);
    const fingerprint = computeManifestFingerprint(manifest);

    const existing = await this.deps.repository.findByIdAndVersion(manifest.id, manifest.version);

    if (existing) {
      const existingFingerprint = computeManifestFingerprint(existing.manifest);

      if (existingFingerprint === fingerprint) {
        return this.toResult(existing, fingerprint, false);
      }

      throw new PluginAlreadyRegisteredException(manifest.id, manifest.version);
    }

    const timestamp = this.clock();
    const record: PluginCatalogRecord = {
      pluginId: manifest.id,
      version: manifest.version,
      manifest,
      registeredAt: timestamp,
    };

    await this.deps.repository.save(record);

    return this.toResult(record, fingerprint, true);
  }

  private toResult(
    record: PluginCatalogRecord,
    fingerprint: string,
    created: boolean,
  ): CatalogRegistrationResult {
    return {
      pluginId: record.pluginId,
      version: record.version,
      manifestFingerprint: fingerprint,
      registeredAt: record.registeredAt,
      created,
    };
  }
}
