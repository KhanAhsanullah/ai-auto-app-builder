import type { ProvisioningRequest, ProvisioningResult } from '@ai-commerce/config-schema';

import type { LifecycleService } from './lifecycle-service.js';
import type { ProvisioningService } from './provisioning-service.js';
import type { TenantRepository } from './tenant-repository.js';
import type { TenantRecord } from '../types.js';

/** Public facade for tenant provisioning and activation workflows. */
export class TenantProvisioner {
  constructor(
    private readonly provisioningService: ProvisioningService,
    private readonly lifecycleService: LifecycleService,
    private readonly repository: TenantRepository,
  ) {}

  /** Create a tenant or return an existing record on idempotent replay. */
  async provision(request: ProvisioningRequest): Promise<ProvisioningResult> {
    return this.provisioningService.provision(request);
  }

  /** Activate a draft tenant by canonical tenant ID. */
  async activate(input: { tenantId: string }): Promise<ProvisioningResult> {
    return this.lifecycleService.activate(input);
  }

  /** Find a tenant registry record by ID. */
  async findById(tenantId: string): Promise<TenantRecord | undefined> {
    return this.repository.findById(tenantId);
  }

  /** Find a tenant registry record by slug. */
  async findBySlug(slug: string): Promise<TenantRecord | undefined> {
    return this.repository.findBySlug(slug);
  }
}
