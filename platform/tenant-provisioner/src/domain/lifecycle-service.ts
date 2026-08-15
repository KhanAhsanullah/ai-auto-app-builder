import type { ProvisioningResult } from '@ai-commerce/config-schema';
import type { ConfigLayer } from '@ai-commerce/config-runtime';
import type { ConfigProvider } from '@ai-commerce/config-runtime';

import { InvalidLifecycleTransitionException, TenantNotFoundException } from '../errors.js';
import type { TenantRepository } from './tenant-repository.js';
import { toProvisioningResult } from '../mappers/provisioning-result-mapper.js';
import type { TenantRecord } from '../types.js';

export interface LifecycleServiceDeps {
  repository: TenantRepository;
  configProvider: ConfigProvider;
  clock?: () => string;
}

export interface ActivateTenantInput {
  tenantId: string;
}

/** Orchestrates draft to active tenant lifecycle transitions. */
export class LifecycleService {
  private readonly clock: () => string;

  constructor(private readonly deps: LifecycleServiceDeps) {
    this.clock = deps.clock ?? (() => new Date().toISOString());
  }

  /** Activate a draft tenant after the Config Runtime validation gate. */
  async activate(input: ActivateTenantInput): Promise<ProvisioningResult> {
    const record = await this.deps.repository.findById(input.tenantId);

    if (!record) {
      throw new TenantNotFoundException(input.tenantId);
    }

    if (record.status === 'active') {
      return toProvisioningResult(record, false);
    }

    if (record.status !== 'draft') {
      throw new InvalidLifecycleTransitionException(record.tenantId, record.status, 'active');
    }

    const timestamp = this.clock();
    const updatedDocument = buildActivatedConfigDocument(record, timestamp);

    this.deps.configProvider.resolve({
      tenantConfig: updatedDocument,
      skipCache: true,
    });

    const updatedRecord: TenantRecord = {
      ...record,
      status: 'active',
      configDocument: updatedDocument,
      updatedAt: timestamp,
    };

    await this.deps.repository.update(updatedRecord);

    return toProvisioningResult(updatedRecord, false);
  }
}

function buildActivatedConfigDocument(record: TenantRecord, updatedAt: string): ConfigLayer {
  return {
    ...record.configDocument,
    meta: {
      ...record.configDocument.meta,
      updatedAt,
    },
    tenant: {
      ...record.configDocument.tenant,
      status: 'active',
    },
  };
}
