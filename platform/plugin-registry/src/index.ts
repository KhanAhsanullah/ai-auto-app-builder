export { PLUGIN_ENGINE_API_VERSION } from './constants.js';
export { CatalogService } from './domain/catalog-service.js';
export type { CatalogServiceDeps } from './domain/catalog-service.js';
export { HOOK_POINT_CATALOG, isKnownHookPoint } from './domain/hook-point-catalog.js';
export type { HookPointDefinition } from './domain/hook-point-catalog.js';
export { ManifestValidator } from './domain/manifest-validator.js';
export type { PluginCatalogRepository } from './domain/plugin-catalog-repository.js';
export { InMemoryPluginCatalogRepository } from './infrastructure/in-memory-plugin-catalog-repository.js';
export {
  PluginAlreadyRegisteredException,
  PluginCatalogDuplicateException,
  PluginManifestValidationException,
  PluginRegistryException,
} from './errors.js';
export type {
  CatalogRegistrationResult,
  PluginCatalogRecord,
  ValidatedPluginManifest,
} from './types.js';
export { computeManifestFingerprint } from './types.js';
export type { PluginManifest } from '@ai-commerce/config-schema';
