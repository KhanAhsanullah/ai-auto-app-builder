export {
  DEFAULT_HOOK_PRIORITY,
  PLUGIN_ENGINE_API_VERSION,
  PLUGIN_MANIFEST_FILE_SUFFIX,
} from './constants.js';
export { CatalogService } from './domain/catalog-service.js';
export type { CatalogServiceDeps } from './domain/catalog-service.js';
export { DependencyResolver } from './domain/dependency-resolver.js';
export type { DependencyResolutionResult } from './domain/dependency-resolver.js';
export { DiscoveryService } from './domain/discovery-service.js';
export type { DiscoveryServiceDeps } from './domain/discovery-service.js';
export { HOOK_POINT_CATALOG, isKnownHookPoint } from './domain/hook-point-catalog.js';
export type { HookPointDefinition } from './domain/hook-point-catalog.js';
export { InstallService } from './domain/install-service.js';
export type { InstallPluginInput, InstallServiceDeps } from './domain/install-service.js';
export { ManifestValidator } from './domain/manifest-validator.js';
export { PluginLifecycleService } from './domain/plugin-lifecycle-service.js';
export type {
  EnablePluginLifecycleInput,
  PluginLifecycleInput,
  PluginLifecycleServiceDeps,
} from './domain/plugin-lifecycle-service.js';
export { PluginRegistry } from './domain/plugin-registry.js';
export { PluginSettingsValidator } from './domain/plugin-settings-validator.js';
export type { PluginCatalogRepository } from './domain/plugin-catalog-repository.js';
export type { TenantPluginRepository } from './domain/tenant-plugin-repository.js';
export {
  findPluginConfigEntry,
  resolveEffectiveSettings,
} from './domain/tenant-config-plugin-alignment.js';
export type { TenantPluginConfigEntry } from './domain/tenant-config-plugin-alignment.js';
export { createPluginRegistry } from './infrastructure/create-plugin-registry.js';
export type { CreatePluginRegistryOptions } from './infrastructure/create-plugin-registry.js';
export {
  DefaultFilesystemManifestScanner,
  readManifestFile,
} from './infrastructure/filesystem-manifest-scanner.js';
export type { FilesystemManifestScanner } from './infrastructure/filesystem-manifest-scanner.js';
export { InMemoryPluginCatalogRepository } from './infrastructure/in-memory-plugin-catalog-repository.js';
export { InMemoryTenantPluginRepository } from './infrastructure/in-memory-tenant-plugin-repository.js';
export {
  InvalidPluginLifecycleTransitionException,
  PluginActivationException,
  PluginAlreadyRegisteredException,
  PluginCatalogDuplicateException,
  PluginCatalogNotFoundException,
  PluginDependencyCycleException,
  PluginDependencyUnresolvedException,
  PluginDiscoveryException,
  PluginHandlerDispatchException,
  PluginHandlerNotRegisteredException,
  PluginManifestValidationException,
  PluginNotInstalledException,
  PluginRegistryException,
  PluginSettingsConflictException,
  PluginSettingsValidationException,
  TenantPluginAlreadyInstalledException,
  TenantPluginConfigMismatchException,
  TenantPluginDuplicateException,
  UnknownHookPointException,
} from './errors.js';
export type {
  CatalogRegistrationResult,
  ConfigValidateAfterContext,
  DiscoveryEntry,
  DiscoveryEntryStatus,
  DiscoveryResult,
  HookDispatchInput,
  HookDispatchResult,
  HookHandlerOutcome,
  HookInvocationContext,
  InstallFingerprintInput,
  InstallResult,
  LifecycleResult,
  PluginCatalogRecord,
  PluginHandlerFn,
  PluginSettings,
  RegisterHandlerInput,
  ResolvedPluginDependency,
  ScannedManifestFile,
  TenantHandlerActivation,
  TenantPluginRecord,
  TenantPluginStatus,
  TenantProvisionAfterContext,
  ThemePresetsExtendContext,
  ThemeResolveAfterContext,
  ValidatedPluginManifest,
} from './types.js';
export { computeInstallFingerprint, computeManifestFingerprint, stableStringify } from './types.js';
export type { PluginManifest } from '@ai-commerce/config-schema';
