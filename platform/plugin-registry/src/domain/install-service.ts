import type { ConfigLayer } from '@ai-commerce/config-runtime';
import type { ConfigProvider } from '@ai-commerce/config-runtime';

import {
  PluginCatalogNotFoundException,
  TenantPluginAlreadyInstalledException,
  TenantPluginConfigMismatchException,
} from '../errors.js';
import {
  computeInstallFingerprint,
  type InstallResult,
  type PluginSettings,
  type TenantPluginRecord,
} from '../types.js';
import type { DependencyResolver } from './dependency-resolver.js';
import type { PluginCatalogRepository } from './plugin-catalog-repository.js';
import type { PluginSettingsValidator } from './plugin-settings-validator.js';
import type { TenantPluginRepository } from './tenant-plugin-repository.js';
import {
  findPluginConfigEntry,
  resolveEffectiveSettings,
} from './tenant-config-plugin-alignment.js';

export interface InstallPluginInput {
  tenantId: string;
  pluginId: string;
  version: string;
  settings?: PluginSettings;
  tenantConfig: ConfigLayer;
}

export interface InstallServiceDeps {
  catalogRepository: PluginCatalogRepository;
  tenantPluginRepository: TenantPluginRepository;
  dependencyResolver: DependencyResolver;
  settingsValidator: PluginSettingsValidator;
  configProvider: ConfigProvider;
  clock?: () => string;
}

/** Orchestrates tenant plugin installation with dependency and config validation gates. */
export class InstallService {
  private readonly clock: () => string;

  constructor(private readonly deps: InstallServiceDeps) {
    this.clock = deps.clock ?? (() => new Date().toISOString());
  }

  /** Install a plugin binding for a tenant. */
  async install(input: InstallPluginInput): Promise<InstallResult> {
    const catalogRecord = await this.deps.catalogRepository.findByIdAndVersion(
      input.pluginId,
      input.version,
    );

    if (!catalogRecord) {
      throw new PluginCatalogNotFoundException(input.pluginId, input.version);
    }

    const configEntry = findPluginConfigEntry(input.tenantConfig, input.pluginId, input.version);

    if (!configEntry) {
      throw new TenantPluginConfigMismatchException(input.tenantId, input.pluginId, input.version);
    }

    const dependencyResolution = await this.deps.dependencyResolver.resolve(
      input.pluginId,
      input.version,
    );

    const effectiveSettings = resolveEffectiveSettings(
      input.tenantId,
      input.pluginId,
      input.settings,
      configEntry.settings,
    );

    this.deps.settingsValidator.validate(catalogRecord.manifest, effectiveSettings);

    this.deps.configProvider.resolve({
      tenantConfig: input.tenantConfig,
      skipCache: true,
    });

    const fingerprint = computeInstallFingerprint({
      tenantId: input.tenantId,
      pluginId: input.pluginId,
      version: input.version,
      settings: effectiveSettings,
      resolvedDependencies: dependencyResolution.resolved,
    });

    const existing = await this.deps.tenantPluginRepository.findByTenantAndPlugin(
      input.tenantId,
      input.pluginId,
    );

    if (existing) {
      if (existing.installFingerprint === fingerprint) {
        return this.toResult(existing, false);
      }

      throw new TenantPluginAlreadyInstalledException(input.tenantId, input.pluginId);
    }

    const timestamp = this.clock();
    const record: TenantPluginRecord = {
      tenantId: input.tenantId,
      pluginId: input.pluginId,
      version: input.version,
      status: 'installed',
      settings: effectiveSettings,
      resolvedDependencies: dependencyResolution.resolved,
      installFingerprint: fingerprint,
      installedAt: timestamp,
      updatedAt: timestamp,
    };

    await this.deps.tenantPluginRepository.save(record);

    return this.toResult(record, true);
  }

  private toResult(record: TenantPluginRecord, created: boolean): InstallResult {
    return {
      tenantId: record.tenantId,
      pluginId: record.pluginId,
      version: record.version,
      status: 'installed',
      resolvedDependencies: record.resolvedDependencies,
      installFingerprint: record.installFingerprint,
      created,
      installedAt: record.installedAt,
    };
  }
}
