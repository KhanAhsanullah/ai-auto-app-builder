export { ConfigBuilder } from './domain/config-builder.js';
export { IdentityValidator } from './domain/identity-validator.js';
export { TenantProvisioner } from './domain/tenant-provisioner.js';
export type { TenantRepository } from './domain/tenant-repository.js';
export { createTenantProvisioner } from './infrastructure/create-tenant-provisioner.js';
export type { CreateTenantProvisionerOptions } from './infrastructure/create-tenant-provisioner.js';
export { InMemoryTenantRepository } from './infrastructure/in-memory-tenant-repository.js';
export {
  InvalidLifecycleTransitionException,
  TenantAlreadyExistsException,
  TenantIdentityValidationException,
  TenantNotFoundException,
  TenantProvisioningException,
} from './errors.js';
export type {
  ProvisioningConfigOverrides,
  ProvisioningRequestFingerprintInput,
  TenantRecord,
  ValidatedProvisioningIdentity,
} from './types.js';
export { computeRequestFingerprint } from './types.js';
export type { ProvisioningRequest, ProvisioningResult } from '@ai-commerce/config-schema';
