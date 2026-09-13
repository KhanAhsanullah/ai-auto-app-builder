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

export interface CreatePlatformApiOptions extends CreateTenantProvisionerOptions {
  provisioner?: TenantProvisioner;
  configEngine?: ConfigEngine;
  configRepository?: ConfigRepository;
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
  const fromExplicit = explicit?.trim();
  if (fromExplicit) {
    return resolve(fromExplicit);
  }
  const fromEnv = env.TENANT_STORE_PATH?.trim();
  if (fromEnv) {
    return resolve(fromEnv);
  }
  return undefined;
}

/** Resolve the durable config store path (empty → in-memory). */
export function resolveConfigStorePath(
  explicit?: string,
  env: NodeJS.ProcessEnv = process.env,
): string | undefined {
  const fromExplicit = explicit?.trim();
  if (fromExplicit) {
    return resolve(fromExplicit);
  }
  const fromEnv = env.CONFIG_STORE_PATH?.trim();
  if (fromEnv) {
    return resolve(fromEnv);
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

/** Wire PlatformApi with TenantProvisioner + ConfigEngine (in-memory or file-backed). */
export function createPlatformApi(options: CreatePlatformApiOptions = {}): PlatformApi {
  const repository = createTenantRepository(options);
  const provisioner =
    options.provisioner ??
    createTenantProvisioner({
      repository,
      configProvider: options.configProvider,
      identityValidator: options.identityValidator,
      configBuilder: options.configBuilder,
      clock: options.clock,
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
    activateOnLaunch: options.activateOnLaunch,
  };

  return new PlatformApi(deps);
}
