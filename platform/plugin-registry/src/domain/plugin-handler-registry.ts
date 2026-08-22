import { PluginHandlerNotRegisteredException, PluginRegistryException } from '../errors.js';
import type { PluginHandlerFn, RegisterHandlerInput } from '../types.js';

interface RegisteredHandler {
  pluginId: string;
  handlerId: string;
  handler: PluginHandlerFn;
}

/**
 * Global in-process handler registry keyed by (pluginId, handlerId).
 * Host code registers implementations; manifests only declare handler identifiers (D5).
 */
export class PluginHandlerRegistry {
  private readonly handlers = new Map<string, RegisteredHandler>();

  /** Register a trusted in-process handler function. */
  register(input: RegisterHandlerInput): void {
    const key = this.key(input.pluginId, input.handlerId);

    if (this.handlers.has(key)) {
      throw new PluginRegistryException(
        `Handler '${input.handlerId}' is already registered for plugin '${input.pluginId}'.`,
      );
    }

    this.handlers.set(key, {
      pluginId: input.pluginId,
      handlerId: input.handlerId,
      handler: input.handler as PluginHandlerFn,
    });
  }

  /** Return true when a handler is registered for the given keys. */
  has(pluginId: string, handlerId: string): boolean {
    return this.handlers.has(this.key(pluginId, handlerId));
  }

  /** Resolve a registered handler or throw. */
  get(pluginId: string, handlerId: string): PluginHandlerFn {
    const entry = this.handlers.get(this.key(pluginId, handlerId));

    if (!entry) {
      throw new PluginHandlerNotRegisteredException(pluginId, handlerId);
    }

    return entry.handler;
  }

  /** Unregister a handler. Returns true when an entry was removed. */
  unregister(pluginId: string, handlerId: string): boolean {
    return this.handlers.delete(this.key(pluginId, handlerId));
  }

  /** List registered handler keys as `pluginId:handlerId`. */
  list(): string[] {
    return [...this.handlers.keys()].sort((a, b) => a.localeCompare(b));
  }

  private key(pluginId: string, handlerId: string): string {
    return `${pluginId}:${handlerId}`;
  }
}
