import { resolve } from 'node:path';

import {
  createConfigEngine,
  FileConfigRepository,
  InMemoryConfigRepository,
  type ConfigEngine,
  type ConfigRepository,
  type CreateConfigEngineOptions,
} from '@ai-commerce/config-engine';
import {
  createTenantProvisioner,
  FileTenantRepository,
  InMemoryTenantRepository,
  type CreateTenantProvisionerOptions,
  type TenantProvisioner,
  type TenantRepository,
} from '@ai-commerce/tenant-provisioner';

import { PlatformApi, type PlatformApiDeps } from '../domain/platform-api.js';
import type { TenantCatalogRepository } from '../domain/tenant-catalog-repository.js';
import { FileTenantCatalogRepository } from './file-tenant-catalog-repository.js';
import { InMemoryTenantCatalogRepository } from './in-memory-tenant-catalog-repository.js';

export interface CreatePlatformApiOptions extends CreateTenantProvisionerOptions {
  provisioner?: TenantProvisioner;
  configEngine?: ConfigEngine;
  configRepository?: ConfigRepository;
  catalogRepository?: TenantCatalogRepository;
  activateOnLaunch?: boolean;
  /**
   * When set, use a JSON file tenant registry.
   * Defaults from `TENANT_STORE_PATH` in the process server entry.
   */
  tenantStorePath?: string;
  /**
   * When set, use a JSON file config revision store.
   * Defaults from `CONFIG_STORE_PATH` in the process server entry.
   */
  configStorePath?: string;
  /**
   * When set, use a JSON file catalog store.
   * Defaults from `CATALOG_STORE_PATH` in the process server entry.
   */
  catalogStorePath?: string;
  /** Forwarded to createConfigEngine when configEngine is not injected. */
  now?: CreateConfigEngineOptions['now'];
  createPublishId?: CreateConfigEngineOptions['createPublishId'];
  onPublish?: CreateConfigEngineOptions['onPublish'];
}

/** Resolve the durable tenant store path (empty → in-memory). */
export function resolveTenantStorePath(
  explicit?: string,
  env: NodeJS.ProcessEnv = process.env,
): string | undefined {
  return resolveOptionalPath(explicit, env.TENANT_STORE_PATH);
}

/** Resolve the durable config store path (empty → in-memory). */
export function resolveConfigStorePath(
  explicit?: string,
  env: NodeJS.ProcessEnv = process.env,
): string | undefined {
  return resolveOptionalPath(explicit, env.CONFIG_STORE_PATH);
}

/** Resolve the durable catalog store path (empty → in-memory). */
export function resolveCatalogStorePath(
  explicit?: string,
  env: NodeJS.ProcessEnv = process.env,
): string | undefined {
  return resolveOptionalPath(explicit, env.CATALOG_STORE_PATH);
}

function resolveOptionalPath(explicit?: string, fromEnv?: string): string | undefined {
  const fromExplicit = explicit?.trim();
  if (fromExplicit) {
    return resolve(fromExplicit);
  }
  const envValue = fromEnv?.trim();
  if (envValue) {
    return resolve(envValue);
  }
  return undefined;
}

function createTenantRepository(options: CreatePlatformApiOptions): TenantRepository {
  if (options.repository) {
    return options.repository;
  }
  const storePath = resolveTenantStorePath(options.tenantStorePath);
  if (storePath) {
    return new FileTenantRepository({ filePath: storePath });
  }
  return new InMemoryTenantRepository();
}

function createConfigRepository(options: CreatePlatformApiOptions): ConfigRepository {
  if (options.configRepository) {
    return options.configRepository;
  }
  const storePath = resolveConfigStorePath(options.configStorePath);
  if (storePath) {
    return new FileConfigRepository({ filePath: storePath });
  }
  return new InMemoryConfigRepository();
}

function createCatalogRepository(options: CreatePlatformApiOptions): TenantCatalogRepository {
  if (options.catalogRepository) {
    return options.catalogRepository;
  }
  const storePath = resolveCatalogStorePath(options.catalogStorePath);
  if (storePath) {
    return new FileTenantCatalogRepository({ filePath: storePath });
  }
  return new InMemoryTenantCatalogRepository();
}

/** Wire PlatformApi with TenantProvisioner + ConfigEngine + catalog store. */
export function createPlatformApi(options: CreatePlatformApiOptions = {}): PlatformApi {
  const repository = createTenantRepository(options);
  const clock = options.clock ?? options.now;
  const provisioner =
    options.provisioner ??
    createTenantProvisioner({
      repository,
      configProvider: options.configProvider,
      identityValidator: options.identityValidator,
      configBuilder: options.configBuilder,
      clock,
    });

  const configEngine =
    options.configEngine ??
    createConfigEngine({
      repository: createConfigRepository(options),
      configProvider: options.configProvider,
      now: options.now ?? options.clock,
      createPublishId: options.createPublishId,
      onPublish: options.onPublish,
    });

  const deps: PlatformApiDeps = {
    provisioner,
    configEngine,
    catalogRepository: createCatalogRepository(options),
    activateOnLaunch: options.activateOnLaunch,
    now: options.now ?? options.clock,
  };

  return new PlatformApi(deps);
}
