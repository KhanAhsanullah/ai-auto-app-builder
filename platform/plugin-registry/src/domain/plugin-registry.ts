import type { PluginManifest } from '@ai-commerce/config-schema';
import type { ConfigLayer } from '@ai-commerce/config-runtime';

import type { CatalogService } from './catalog-service.js';
import type { DiscoveryService } from './discovery-service.js';
import type { HookDispatcher } from './hook-dispatcher.js';
import type { InstallPluginInput, InstallService } from './install-service.js';
import type { PluginActivationService } from './plugin-activation-service.js';
import type { PluginHandlerRegistry } from './plugin-handler-registry.js';
import type {
  EnablePluginLifecycleInput,
  PluginLifecycleInput,
  PluginLifecycleService,
} from './plugin-lifecycle-service.js';
import type { TenantPluginRepository } from './tenant-plugin-repository.js';
import type {
  CatalogRegistrationResult,
  DiscoveryResult,
  HookDispatchInput,
  HookDispatchResult,
  InstallResult,
  LifecycleResult,
  RegisterHandlerInput,
  TenantPluginRecord,
} from '../types.js';

/**
 * Public facade for plugin catalog, install/lifecycle, handler registration, and hook dispatch.
 * Orchestrates Task 1–3 workflows; Task 2 services remain usable directly (T3-D1).
 */
export class PluginRegistry {
  constructor(
    private readonly catalogService: CatalogService,
    private readonly discoveryService: DiscoveryService,
    private readonly installService: InstallService,
    private readonly lifecycleService: PluginLifecycleService,
    private readonly activationService: PluginActivationService,
    private readonly handlerRegistry: PluginHandlerRegistry,
    private readonly hookDispatcher: HookDispatcher,
    private readonly tenantPluginRepository: TenantPluginRepository,
  ) {}

  /** Register a plugin manifest in the platform catalog. */
  async registerManifest(manifest: PluginManifest | unknown): Promise<CatalogRegistrationResult> {
    return this.catalogService.register(manifest);
  }

  /** Discover and register manifests from a filesystem root. */
  async discoverFromDirectory(rootPath: string): Promise<DiscoveryResult> {
    return this.discoveryService.discoverFromDirectory(rootPath);
  }

  /** Install a tenant plugin binding (`installed` — handlers inactive). */
  async install(input: InstallPluginInput): Promise<InstallResult> {
    return this.installService.install(input);
  }

  /**
   * Enable a tenant plugin and activate its handlers.
   * Order: handler completeness → lifecycle enable (ConfigProvider gate) → activate (T3-D2).
   */
  async enable(input: EnablePluginLifecycleInput): Promise<LifecycleResult> {
    const binding = await this.tenantPluginRepository.findByTenantAndPlugin(
      input.tenantId,
      input.pluginId,
    );

    if (!binding) {
      return this.lifecycleService.enable(input);
    }

    const target = {
      tenantId: binding.tenantId,
      pluginId: binding.pluginId,
      version: binding.version,
    };

    await this.activationService.assertHandlersRegistered(target);

    if (binding.status === 'enabled') {
      await this.activationService.activate(target);
      return {
        tenantId: binding.tenantId,
        pluginId: binding.pluginId,
        version: binding.version,
        status: 'enabled',
        changed: false,
        updatedAt: binding.updatedAt,
      };
    }

    const result = await this.lifecycleService.enable(input);

    try {
      await this.activationService.activate({
        tenantId: result.tenantId,
        pluginId: result.pluginId,
        version: result.version,
      });
    } catch (error) {
      await this.activationService.deactivate(result.tenantId, result.pluginId);
      await this.lifecycleService.disable({
        tenantId: result.tenantId,
        pluginId: result.pluginId,
      });
      throw error;
    }

    return result;
  }

  /** Deactivate handlers then disable the tenant plugin binding. */
  async disable(input: PluginLifecycleInput): Promise<LifecycleResult> {
    await this.activationService.deactivate(input.tenantId, input.pluginId);
    return this.lifecycleService.disable(input);
  }

  /** Deactivate handlers then uninstall the tenant plugin binding. */
  async uninstall(input: PluginLifecycleInput): Promise<LifecycleResult> {
    await this.activationService.deactivate(input.tenantId, input.pluginId);
    return this.lifecycleService.uninstall(input);
  }

  /** Register a trusted in-process handler implementation. */
  registerHandler(input: RegisterHandlerInput): void {
    this.handlerRegistry.register(input);
  }

  /** Dispatch a hook point for a tenant (enabled activations only). */
  async dispatch<TContext = unknown>(
    input: HookDispatchInput<TContext>,
  ): Promise<HookDispatchResult> {
    return this.hookDispatcher.dispatch(input);
  }

  /** Find a tenant plugin binding. */
  async findTenantBinding(
    tenantId: string,
    pluginId: string,
  ): Promise<TenantPluginRecord | undefined> {
    return this.tenantPluginRepository.findByTenantAndPlugin(tenantId, pluginId);
  }

  /** List all plugin bindings for a tenant. */
  async listTenantBindings(tenantId: string): Promise<TenantPluginRecord[]> {
    return this.tenantPluginRepository.listByTenant(tenantId);
  }
}

/** Re-export ConfigLayer for facade consumers documenting enable inputs. */
export type { ConfigLayer };
