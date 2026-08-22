import type { TenantHandlerActivation } from '../types.js';

/** Persistence port for tenant-scoped active hook handler bindings. */
export interface TenantHandlerActivationStore {
  /** List active handlers for a tenant and hook point. */
  listByTenantAndHook(tenantId: string, hookPoint: string): Promise<TenantHandlerActivation[]>;

  /** List all active handlers for a tenant plugin binding. */
  listByTenantAndPlugin(tenantId: string, pluginId: string): Promise<TenantHandlerActivation[]>;

  /**
   * Replace all activations for a tenant plugin with the provided set.
   * Callers must pass the complete activation list for that binding.
   */
  replaceForPlugin(
    tenantId: string,
    pluginId: string,
    activations: TenantHandlerActivation[],
  ): Promise<void>;

  /** Remove all activations for a tenant plugin binding. */
  removeForPlugin(tenantId: string, pluginId: string): Promise<void>;
}
