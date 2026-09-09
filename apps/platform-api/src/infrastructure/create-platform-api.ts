import { resolve } from 'node:path';

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
  activateOnLaunch?: boolean;
  /**
   * When set, use a JSON file tenant registry.
   * Defaults from `TENANT_STORE_PATH` in the process server entry.
   */
  tenantStorePath?: string;
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

function createRepository(options: CreatePlatformApiOptions): TenantRepository {
  if (options.repository) {
    return options.repository;
  }
  const storePath = resolveTenantStorePath(options.tenantStorePath);
  if (storePath) {
    return new FileTenantRepository({ filePath: storePath });
  }
  return new InMemoryTenantRepository();
}

/** Wire PlatformApi with in-memory or file-backed TenantProvisioner. */
export function createPlatformApi(options: CreatePlatformApiOptions = {}): PlatformApi {
  const repository = createRepository(options);
  const provisioner =
    options.provisioner ??
    createTenantProvisioner({
      repository,
      configProvider: options.configProvider,
      identityValidator: options.identityValidator,
      configBuilder: options.configBuilder,
      clock: options.clock,
    });

  const deps: PlatformApiDeps = {
    provisioner,
    activateOnLaunch: options.activateOnLaunch,
  };

  return new PlatformApi(deps);
}
