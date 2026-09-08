import {
  createTenantProvisioner,
  type CreateTenantProvisionerOptions,
  type TenantProvisioner,
} from '@ai-commerce/tenant-provisioner';

import { PlatformApi, type PlatformApiDeps } from '../domain/platform-api.js';

export interface CreatePlatformApiOptions extends CreateTenantProvisionerOptions {
  provisioner?: TenantProvisioner;
  activateOnLaunch?: boolean;
}

/** Wire PlatformApi with a default in-memory TenantProvisioner. */
export function createPlatformApi(options: CreatePlatformApiOptions = {}): PlatformApi {
  const provisioner =
    options.provisioner ??
    createTenantProvisioner({
      repository: options.repository,
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
