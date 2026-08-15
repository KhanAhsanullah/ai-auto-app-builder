import { provisioningResultSchema } from '@ai-commerce/config-schema';
import { describe, expect, it } from 'vitest';

import { TenantAlreadyExistsException } from '../src/errors.js';
import {
  createTestTenantProvisioner,
  RETRY_SAFE_PROVISIONING_REQUEST,
  VALID_PROVISIONING_REQUEST_WITH_ID,
} from './helpers.js';

describe('TenantProvisioner', () => {
  it('delegates provision and activate through the facade', async () => {
    const provisioner = createTestTenantProvisioner();

    const provisioned = await provisioner.provision(VALID_PROVISIONING_REQUEST_WITH_ID);
    expect(() => provisioningResultSchema.parse(provisioned)).not.toThrow();

    const activated = await provisioner.activate({ tenantId: provisioned.tenantId });
    expect(activated.status).toBe('active');
    expect(activated.created).toBe(false);
  });

  it('exposes repository lookups', async () => {
    const provisioner = createTestTenantProvisioner();
    const result = await provisioner.provision(RETRY_SAFE_PROVISIONING_REQUEST);

    const byId = await provisioner.findById(result.tenantId);
    const bySlug = await provisioner.findBySlug(result.slug);

    expect(byId?.tenantId).toBe(result.tenantId);
    expect(bySlug?.slug).toBe(result.slug);
  });

  it('returns provisioning results that validate against the result schema', async () => {
    const provisioner = createTestTenantProvisioner();
    const result = await provisioner.provision(RETRY_SAFE_PROVISIONING_REQUEST);

    expect(provisioningResultSchema.parse(result)).toEqual(result);
  });

  it('supports explicit-id retry idempotency', async () => {
    const provisioner = createTestTenantProvisioner();

    const first = await provisioner.provision(RETRY_SAFE_PROVISIONING_REQUEST);
    const second = await provisioner.provision(RETRY_SAFE_PROVISIONING_REQUEST);

    expect(first.created).toBe(true);
    expect(second.created).toBe(false);
  });

  it('rejects duplicate tenant ids with different requests', async () => {
    const provisioner = createTestTenantProvisioner();

    await provisioner.provision(RETRY_SAFE_PROVISIONING_REQUEST);

    await expect(
      provisioner.provision({
        ...RETRY_SAFE_PROVISIONING_REQUEST,
        name: 'Different Name',
      }),
    ).rejects.toThrow(TenantAlreadyExistsException);
  });
});
