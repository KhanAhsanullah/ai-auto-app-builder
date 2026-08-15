export { ConfigBuilder } from './domain/config-builder.js';
export { IdentityValidator } from './domain/identity-validator.js';
export type { TenantRepository } from './domain/tenant-repository.js';
export { InMemoryTenantRepository } from './infrastructure/in-memory-tenant-repository.js';
export {
  TenantAlreadyExistsException,
  TenantIdentityValidationException,
  TenantProvisioningException,
} from './errors.js';
export type {
  ProvisioningConfigOverrides,
  ProvisioningRequestFingerprintInput,
  TenantRecord,
  ValidatedProvisioningIdentity,
} from './types.js';
export { computeRequestFingerprint } from './types.js';
