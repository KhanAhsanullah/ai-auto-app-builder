import type { ConfigLayer } from '@ai-commerce/config-runtime';
import type { ConfigProvider } from '@ai-commerce/config-runtime';

import {
  InvalidPluginLifecycleTransitionException,
  PluginNotInstalledException,
  PluginRegistryException,
} from '../errors.js';
import type { LifecycleResult, TenantPluginRecord, TenantPluginStatus } from '../types.js';
import type { TenantPluginRepository } from './tenant-plugin-repository.js';

export interface PluginLifecycleInput {
  tenantId: string;
  pluginId: string;
}

/** Input for enable — tenantConfig is required for the ConfigProvider validation gate. */
export interface EnablePluginLifecycleInput extends PluginLifecycleInput {
  tenantConfig: ConfigLayer;
}

export interface PluginLifecycleServiceDeps {
  tenantPluginRepository: TenantPluginRepository;
  configProvider: ConfigProvider;
  clock?: () => string;
}

/** Orchestrates tenant plugin enable, disable, and uninstall lifecycle transitions. */
export class PluginLifecycleService {
  private readonly clock: () => string;

  constructor(private readonly deps: PluginLifecycleServiceDeps) {
    this.clock = deps.clock ?? (() => new Date().toISOString());
  }

  /** Enable an installed or disabled plugin binding. */
  async enable(input: EnablePluginLifecycleInput): Promise<LifecycleResult> {
    const record = await this.requireBinding(input.tenantId, input.pluginId);

    if (record.status === 'enabled') {
      return this.toResult(record, false);
    }

    if (input.tenantConfig === undefined) {
      throw new PluginRegistryException(
        `Tenant config is required to enable plugin '${input.pluginId}' for tenant '${input.tenantId}'.`,
      );
    }

    if (record.status !== 'installed' && record.status !== 'disabled') {
      throw new InvalidPluginLifecycleTransitionException(
        input.tenantId,
        input.pluginId,
        record.status,
        'enabled',
      );
    }

    this.deps.configProvider.resolve({
      tenantConfig: input.tenantConfig,
      skipCache: true,
    });

    return this.transition(record, 'enabled');
  }

  /** Disable an enabled plugin binding. */
  async disable(input: PluginLifecycleInput): Promise<LifecycleResult> {
    const record = await this.requireBinding(input.tenantId, input.pluginId);

    if (record.status === 'disabled') {
      return this.toResult(record, false);
    }

    if (record.status !== 'enabled') {
      throw new InvalidPluginLifecycleTransitionException(
        input.tenantId,
        input.pluginId,
        record.status,
        'disabled',
      );
    }

    return this.transition(record, 'disabled');
  }

  /** Remove a tenant plugin binding. */
  async uninstall(input: PluginLifecycleInput): Promise<LifecycleResult> {
    const record = await this.requireBinding(input.tenantId, input.pluginId);

    await this.deps.tenantPluginRepository.delete(input.tenantId, input.pluginId);

    return {
      tenantId: record.tenantId,
      pluginId: record.pluginId,
      version: record.version,
      status: record.status,
      changed: true,
      updatedAt: this.clock(),
    };
  }

  private async requireBinding(tenantId: string, pluginId: string): Promise<TenantPluginRecord> {
    const record = await this.deps.tenantPluginRepository.findByTenantAndPlugin(tenantId, pluginId);

    if (!record) {
      throw new PluginNotInstalledException(tenantId, pluginId);
    }

    return record;
  }

  private async transition(
    record: TenantPluginRecord,
    status: TenantPluginStatus,
  ): Promise<LifecycleResult> {
    const timestamp = this.clock();
    const updated: TenantPluginRecord = {
      ...record,
      status,
      updatedAt: timestamp,
    };

    await this.deps.tenantPluginRepository.update(updated);

    return this.toResult(updated, true);
  }

  private toResult(record: TenantPluginRecord, changed: boolean): LifecycleResult {
    return {
      tenantId: record.tenantId,
      pluginId: record.pluginId,
      version: record.version,
      status: record.status,
      changed,
      updatedAt: record.updatedAt,
    };
  }
}
