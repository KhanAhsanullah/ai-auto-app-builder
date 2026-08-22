import { ConfigProvider } from '@ai-commerce/config-runtime';

import { CatalogService } from '../domain/catalog-service.js';
import { DependencyResolver } from '../domain/dependency-resolver.js';
import { DiscoveryService } from '../domain/discovery-service.js';
import { HookDispatcher } from '../domain/hook-dispatcher.js';
import { InstallService } from '../domain/install-service.js';
import { ManifestValidator } from '../domain/manifest-validator.js';
import { PluginActivationService } from '../domain/plugin-activation-service.js';
import { PluginHandlerRegistry } from '../domain/plugin-handler-registry.js';
import { PluginLifecycleService } from '../domain/plugin-lifecycle-service.js';
import { PluginRegistry } from '../domain/plugin-registry.js';
import { PluginSettingsValidator } from '../domain/plugin-settings-validator.js';
import type { PluginCatalogRepository } from '../domain/plugin-catalog-repository.js';
import type { TenantHandlerActivationStore } from '../domain/tenant-handler-activation-store.js';
import type { TenantPluginRepository } from '../domain/tenant-plugin-repository.js';
import { InMemoryPluginCatalogRepository } from './in-memory-plugin-catalog-repository.js';
import { InMemoryTenantHandlerActivationStore } from './in-memory-tenant-handler-activation-store.js';
import { InMemoryTenantPluginRepository } from './in-memory-tenant-plugin-repository.js';

export interface CreatePluginRegistryOptions {
  catalogRepository?: PluginCatalogRepository;
  tenantPluginRepository?: TenantPluginRepository;
  activationStore?: TenantHandlerActivationStore;
  handlerRegistry?: PluginHandlerRegistry;
  configProvider?: ConfigProvider;
  clock?: () => string;
}

/** Create a PluginRegistry with default domain and infrastructure wiring. */
export function createPluginRegistry(options: CreatePluginRegistryOptions = {}): PluginRegistry {
  const catalogRepository = options.catalogRepository ?? new InMemoryPluginCatalogRepository();
  const tenantPluginRepository =
    options.tenantPluginRepository ?? new InMemoryTenantPluginRepository();
  const activationStore = options.activationStore ?? new InMemoryTenantHandlerActivationStore();
  const handlerRegistry = options.handlerRegistry ?? new PluginHandlerRegistry();
  const configProvider = options.configProvider ?? new ConfigProvider({ cache: false });

  const catalogService = new CatalogService({
    validator: new ManifestValidator(),
    repository: catalogRepository,
    clock: options.clock,
  });

  const discoveryService = new DiscoveryService({
    catalogService,
  });

  const installService = new InstallService({
    catalogRepository,
    tenantPluginRepository,
    dependencyResolver: new DependencyResolver(catalogRepository),
    settingsValidator: new PluginSettingsValidator(),
    configProvider,
    clock: options.clock,
  });

  const lifecycleService = new PluginLifecycleService({
    tenantPluginRepository,
    configProvider,
    clock: options.clock,
  });

  const activationService = new PluginActivationService({
    catalogRepository,
    tenantPluginRepository,
    handlerRegistry,
    activationStore,
  });

  const hookDispatcher = new HookDispatcher({
    handlerRegistry,
    activationStore,
  });

  return new PluginRegistry(
    catalogService,
    discoveryService,
    installService,
    lifecycleService,
    activationService,
    handlerRegistry,
    hookDispatcher,
    tenantPluginRepository,
  );
}
