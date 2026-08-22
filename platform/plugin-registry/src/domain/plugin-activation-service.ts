import { DEFAULT_HOOK_PRIORITY } from '../constants.js';
import {
  PluginCatalogNotFoundException,
  PluginHandlerNotRegisteredException,
  PluginNotInstalledException,
} from '../errors.js';
import type { TenantHandlerActivation, TenantPluginRecord } from '../types.js';
import type { PluginCatalogRepository } from './plugin-catalog-repository.js';
import type { PluginHandlerRegistry } from './plugin-handler-registry.js';
import type { TenantHandlerActivationStore } from './tenant-handler-activation-store.js';
import type { TenantPluginRepository } from './tenant-plugin-repository.js';

export interface PluginActivationServiceDeps {
  catalogRepository: PluginCatalogRepository;
  tenantPluginRepository: TenantPluginRepository;
  handlerRegistry: PluginHandlerRegistry;
  activationStore: TenantHandlerActivationStore;
}

export interface PluginActivationTarget {
  tenantId: string;
  pluginId: string;
  version: string;
}

/**
 * Syncs tenant handler activations with plugin lifecycle.
 * Enable activates; disable/uninstall deactivate (T3-D1).
 */
export class PluginActivationService {
  constructor(private readonly deps: PluginActivationServiceDeps) {}

  /**
   * Ensure every manifest hook handler is registered globally.
   * Must run before persisting `enabled` (T3-D2).
   */
  async assertHandlersRegistered(target: PluginActivationTarget): Promise<void> {
    const manifest = await this.requireManifest(target.pluginId, target.version);

    for (const hook of manifest.hooks) {
      if (!this.deps.handlerRegistry.has(target.pluginId, hook.handler)) {
        throw new PluginHandlerNotRegisteredException(target.pluginId, hook.handler);
      }
    }
  }

  /** Activate handlers for an enabled tenant plugin binding. */
  async activate(target: PluginActivationTarget): Promise<void> {
    await this.assertHandlersRegistered(target);

    const binding = await this.requireBinding(target.tenantId, target.pluginId);
    const version = binding.version;

    const manifest = await this.requireManifest(target.pluginId, version);
    const activations: TenantHandlerActivation[] = manifest.hooks.map((hook) => ({
      tenantId: target.tenantId,
      pluginId: target.pluginId,
      version,
      hookPoint: hook.point,
      handlerId: hook.handler,
      priority: hook.priority ?? DEFAULT_HOOK_PRIORITY,
      permissions: [...manifest.permissions],
    }));

    await this.deps.activationStore.replaceForPlugin(target.tenantId, target.pluginId, activations);
  }

  /** Remove tenant activations for a plugin (handlers remain globally registered). */
  async deactivate(tenantId: string, pluginId: string): Promise<void> {
    await this.deps.activationStore.removeForPlugin(tenantId, pluginId);
  }

  private async requireBinding(tenantId: string, pluginId: string): Promise<TenantPluginRecord> {
    const binding = await this.deps.tenantPluginRepository.findByTenantAndPlugin(
      tenantId,
      pluginId,
    );

    if (!binding) {
      throw new PluginNotInstalledException(tenantId, pluginId);
    }

    return binding;
  }

  private async requireManifest(pluginId: string, version: string) {
    const catalog = await this.deps.catalogRepository.findByIdAndVersion(pluginId, version);

    if (!catalog) {
      throw new PluginCatalogNotFoundException(pluginId, version);
    }

    return catalog.manifest;
  }
}
