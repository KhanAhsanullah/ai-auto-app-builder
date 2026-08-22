import {
  PluginHandlerDispatchException,
  PluginHandlerNotRegisteredException,
  UnknownHookPointException,
} from '../errors.js';
import type {
  HookDispatchInput,
  HookDispatchResult,
  HookHandlerOutcome,
  HookInvocationContext,
} from '../types.js';
import { isKnownHookPoint } from './hook-point-catalog.js';
import type { PluginHandlerRegistry } from './plugin-handler-registry.js';
import type { TenantHandlerActivationStore } from './tenant-handler-activation-store.js';

export interface HookDispatcherDeps {
  handlerRegistry: PluginHandlerRegistry;
  activationStore: TenantHandlerActivationStore;
}

/**
 * Synchronous, tenant-scoped hook dispatcher (D6).
 * Invokes only enabled activations in deterministic priority order; fail-fast (T3-D4).
 */
export class HookDispatcher {
  constructor(private readonly deps: HookDispatcherDeps) {}

  /** Dispatch a hook point for a tenant. */
  async dispatch<TContext = unknown>(
    input: HookDispatchInput<TContext>,
  ): Promise<HookDispatchResult> {
    if (!isKnownHookPoint(input.hookPoint)) {
      throw new UnknownHookPointException(input.hookPoint);
    }

    const activations = await this.deps.activationStore.listByTenantAndHook(
      input.tenantId,
      input.hookPoint,
    );

    const ordered = [...activations].sort((a, b) => {
      if (a.priority !== b.priority) {
        return a.priority - b.priority;
      }
      const pluginCmp = a.pluginId.localeCompare(b.pluginId);
      if (pluginCmp !== 0) {
        return pluginCmp;
      }
      return a.handlerId.localeCompare(b.handlerId);
    });

    const outcomes: HookHandlerOutcome[] = [];

    for (const activation of ordered) {
      let handler;
      try {
        handler = this.deps.handlerRegistry.get(activation.pluginId, activation.handlerId);
      } catch (error) {
        if (error instanceof PluginHandlerNotRegisteredException) {
          const outcome: HookHandlerOutcome = {
            pluginId: activation.pluginId,
            handlerId: activation.handlerId,
            success: false,
            error: error.message,
          };
          outcomes.push(outcome);
          throw new PluginHandlerDispatchException(
            input.tenantId,
            input.hookPoint,
            activation.pluginId,
            activation.handlerId,
            outcomes,
            error,
          );
        }
        throw error;
      }

      const invocation: HookInvocationContext<TContext> = {
        tenantId: input.tenantId,
        hookPoint: input.hookPoint,
        pluginId: activation.pluginId,
        handlerId: activation.handlerId,
        version: activation.version,
        permissions: activation.permissions,
        context: input.context,
      };

      try {
        await handler(invocation);
        outcomes.push({
          pluginId: activation.pluginId,
          handlerId: activation.handlerId,
          success: true,
        });
      } catch (error) {
        const detail = error instanceof Error ? error.message : String(error);
        outcomes.push({
          pluginId: activation.pluginId,
          handlerId: activation.handlerId,
          success: false,
          error: detail,
        });
        throw new PluginHandlerDispatchException(
          input.tenantId,
          input.hookPoint,
          activation.pluginId,
          activation.handlerId,
          outcomes,
          error,
        );
      }
    }

    return {
      tenantId: input.tenantId,
      hookPoint: input.hookPoint,
      invoked: outcomes.length,
      outcomes,
    };
  }
}
