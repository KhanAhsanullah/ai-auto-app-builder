import type { ProvisioningResult } from '@ai-commerce/config-schema';

import { TenantProvisioningException } from '../errors.js';
import type { TenantRecord } from '../types.js';

/** Map a persisted tenant registry record to a provisioning result summary. */
export function toProvisioningResult(record: TenantRecord, created: boolean): ProvisioningResult {
  const tenant = record.configDocument.tenant;

  if (
    !tenant?.id ||
    !tenant.slug ||
    !tenant.name ||
    !tenant.vertical ||
    (record.status !== 'draft' && record.status !== 'active')
  ) {
    throw new TenantProvisioningException(
      'Stored tenant record is missing required provisioning result fields.',
    );
  }

  return {
    tenantId: record.tenantId,
    slug: record.slug,
    name: tenant.name,
    vertical: tenant.vertical,
    status: record.status,
    configVersion: record.configDocument.meta?.configVersion ?? 1,
    requestFingerprint: record.requestFingerprint,
    created,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}
