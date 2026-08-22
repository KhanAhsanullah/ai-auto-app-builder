export { HookDispatcher } from './domain/hook-dispatcher.js';
export type { HookDispatcherDeps } from './domain/hook-dispatcher.js';
export { PluginActivationService } from './domain/plugin-activation-service.js';
export type {
  PluginActivationServiceDeps,
  PluginActivationTarget,
} from './domain/plugin-activation-service.js';
export { PluginHandlerRegistry } from './domain/plugin-handler-registry.js';
export type { TenantHandlerActivationStore } from './domain/tenant-handler-activation-store.js';
export { InMemoryTenantHandlerActivationStore } from './infrastructure/in-memory-tenant-handler-activation-store.js';
