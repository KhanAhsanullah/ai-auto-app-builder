import type { ProvisioningRequest, ProvisioningResult } from '@ai-commerce/config-schema';
import type { ConfigProvider } from '@ai-commerce/config-runtime';

import { TenantAlreadyExistsException } from '../errors.js';
import type { ConfigBuilder } from './config-builder.js';
import type { IdentityValidator } from './identity-validator.js';
import type { TenantRepository } from './tenant-repository.js';
import { toProvisioningResult } from '../mappers/provisioning-result-mapper.js';
import { computeRequestFingerprint } from '../types.js';

export interface ProvisioningServiceDeps {
  identityValidator: IdentityValidator;
  configBuilder: ConfigBuilder;
  configProvider: ConfigProvider;
  repository: TenantRepository;
  clock?: () => string;
}

/** Orchestrates tenant creation, validation, and registry persistence. */
export class ProvisioningService {
  private readonly clock: () => string;

  constructor(private readonly deps: ProvisioningServiceDeps) {
    this.clock = deps.clock ?? (() => new Date().toISOString());
  }

  /** Provision a new tenant or return an existing record on idempotent replay. */
  async provision(request: ProvisioningRequest): Promise<ProvisioningResult> {
    const identity = this.deps.identityValidator.validate(request);
    const fingerprint = computeRequestFingerprint(identity);

    const existingById = await this.deps.repository.findById(identity.id);

    if (existingById) {
      if (existingById.requestFingerprint === fingerprint) {
        return toProvisioningResult(existingById, false);
      }

      throw new TenantAlreadyExistsException(
        `Tenant already exists with id '${identity.id}' and a different provisioning request.`,
        { tenantId: identity.id },
      );
    }

    const existingBySlug = await this.deps.repository.findBySlug(identity.slug);

    if (existingBySlug) {
      throw new TenantAlreadyExistsException(
        `Tenant already exists with slug '${identity.slug}'.`,
        { slug: identity.slug },
      );
    }

    const configDocument = this.deps.configBuilder.build(identity);

    this.deps.configProvider.resolve({
      tenantConfig: configDocument,
      skipCache: true,
    });

    const timestamp = this.clock();

    const record = {
      tenantId: identity.id,
      slug: identity.slug,
      status: 'draft' as const,
      configDocument,
      requestFingerprint: fingerprint,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    await this.deps.repository.save(record);

    return toProvisioningResult(record, true);
  }
}
