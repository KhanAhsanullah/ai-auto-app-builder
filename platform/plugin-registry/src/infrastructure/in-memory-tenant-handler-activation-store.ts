import { PluginActivationException } from '../errors.js';
import type { TenantHandlerActivationStore } from '../domain/tenant-handler-activation-store.js';
import type { TenantHandlerActivation } from '../types.js';

/** In-memory tenant handler activation store (D7). */
export class InMemoryTenantHandlerActivationStore implements TenantHandlerActivationStore {
  private readonly byTenantHook = new Map<string, TenantHandlerActivation[]>();
  private readonly byTenantPlugin = new Map<string, TenantHandlerActivation[]>();

  async listByTenantAndHook(
    tenantId: string,
    hookPoint: string,
  ): Promise<TenantHandlerActivation[]> {
    return [...(this.byTenantHook.get(this.hookKey(tenantId, hookPoint)) ?? [])];
  }

  async listByTenantAndPlugin(
    tenantId: string,
    pluginId: string,
  ): Promise<TenantHandlerActivation[]> {
    return [...(this.byTenantPlugin.get(this.pluginKey(tenantId, pluginId)) ?? [])];
  }

  async replaceForPlugin(
    tenantId: string,
    pluginId: string,
    activations: TenantHandlerActivation[],
  ): Promise<void> {
    for (const activation of activations) {
      if (activation.tenantId !== tenantId || activation.pluginId !== pluginId) {
        throw new PluginActivationException(
          `Activation tenant/plugin mismatch while replacing handlers for '${tenantId}' / '${pluginId}'.`,
        );
      }
    }

    const seen = new Set<string>();
    for (const activation of activations) {
      const identity = `${activation.hookPoint}:${activation.handlerId}`;
      if (seen.has(identity)) {
        throw new PluginActivationException(
          `Duplicate activation for plugin '${pluginId}' at '${identity}' on tenant '${tenantId}'.`,
        );
      }
      seen.add(identity);
    }

    await this.removeForPlugin(tenantId, pluginId);

    this.byTenantPlugin.set(this.pluginKey(tenantId, pluginId), [...activations]);

    for (const activation of activations) {
      const key = this.hookKey(tenantId, activation.hookPoint);
      const existing = this.byTenantHook.get(key) ?? [];
      this.byTenantHook.set(key, [...existing, activation]);
    }
  }

  async removeForPlugin(tenantId: string, pluginId: string): Promise<void> {
    const pluginKey = this.pluginKey(tenantId, pluginId);
    const existing = this.byTenantPlugin.get(pluginKey) ?? [];

    this.byTenantPlugin.delete(pluginKey);

    for (const activation of existing) {
      const key = this.hookKey(tenantId, activation.hookPoint);
      const remaining = (this.byTenantHook.get(key) ?? []).filter(
        (entry) => !(entry.pluginId === pluginId && entry.handlerId === activation.handlerId),
      );

      if (remaining.length === 0) {
        this.byTenantHook.delete(key);
      } else {
        this.byTenantHook.set(key, remaining);
      }
    }
  }

  private hookKey(tenantId: string, hookPoint: string): string {
    return `${tenantId}@${hookPoint}`;
  }

  private pluginKey(tenantId: string, pluginId: string): string {
    return `${tenantId}@${pluginId}`;
  }
}
