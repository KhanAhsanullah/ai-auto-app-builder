import { ConfigProvider } from '@ai-commerce/config-runtime';

import { ConfigBuilder } from '../domain/config-builder.js';
import { IdentityValidator } from '../domain/identity-validator.js';
import { LifecycleService } from '../domain/lifecycle-service.js';
import { ProvisioningService } from '../domain/provisioning-service.js';
import { TenantProvisioner } from '../domain/tenant-provisioner.js';
import { InMemoryTenantRepository } from './in-memory-tenant-repository.js';
import type { TenantRepository } from '../domain/tenant-repository.js';

export interface CreateTenantProvisionerOptions {
  repository?: TenantRepository;
  configProvider?: ConfigProvider;
  identityValidator?: IdentityValidator;
  configBuilder?: ConfigBuilder;
  clock?: () => string;
}

/** Create a TenantProvisioner with default domain and infrastructure wiring. */
export function createTenantProvisioner(
  options: CreateTenantProvisionerOptions = {},
): TenantProvisioner {
  const repository = options.repository ?? new InMemoryTenantRepository();
  const configProvider = options.configProvider ?? new ConfigProvider({ cache: false });
  const identityValidator = options.identityValidator ?? new IdentityValidator();
  const configBuilder = options.configBuilder ?? new ConfigBuilder();

  const provisioningService = new ProvisioningService({
    identityValidator,
    configBuilder,
    configProvider,
    repository,
    clock: options.clock,
  });

  const lifecycleService = new LifecycleService({
    repository,
    configProvider,
    clock: options.clock,
  });

  return new TenantProvisioner(provisioningService, lifecycleService, repository);
}
