import { ConfigProvider, ConfigValidationException } from '@ai-commerce/config-runtime';
import { describe, expect, it, vi } from 'vitest';

import { ConfigBuilder } from '../src/domain/config-builder.js';
import { IdentityValidator } from '../src/domain/identity-validator.js';
import { LifecycleService } from '../src/domain/lifecycle-service.js';
import { ProvisioningService } from '../src/domain/provisioning-service.js';
import { InMemoryTenantRepository } from '../src/infrastructure/in-memory-tenant-repository.js';
import { InvalidLifecycleTransitionException, TenantNotFoundException } from '../src/errors.js';
import { VALID_PROVISIONING_REQUEST_WITH_ID } from './helpers.js';

const FIXED_CLOCK = '2026-08-16T12:00:00.000Z';

async function seedDraftTenant(repository: InMemoryTenantRepository) {
  const provisioningService = new ProvisioningService({
    identityValidator: new IdentityValidator(),
    configBuilder: new ConfigBuilder(),
    configProvider: new ConfigProvider({ cache: false }),
    repository,
    clock: () => '2026-08-16T00:00:00.000Z',
  });

  return provisioningService.provision(VALID_PROVISIONING_REQUEST_WITH_ID);
}

describe('LifecycleService', () => {
  it('activates a draft tenant', async () => {
    const repository = new InMemoryTenantRepository();
    const seeded = await seedDraftTenant(repository);

    const lifecycleService = new LifecycleService({
      repository,
      configProvider: new ConfigProvider({ cache: false }),
      clock: () => FIXED_CLOCK,
    });

    const result = await lifecycleService.activate({ tenantId: seeded.tenantId });

    expect(result.created).toBe(false);
    expect(result.status).toBe('active');
    expect(result.updatedAt).toBe(FIXED_CLOCK);

    const stored = await repository.findById(seeded.tenantId);
    expect(stored?.status).toBe('active');
    expect(stored?.configDocument.tenant?.status).toBe('active');
  });

  it('returns idempotent success when tenant is already active', async () => {
    const repository = new InMemoryTenantRepository();
    const seeded = await seedDraftTenant(repository);

    const lifecycleService = new LifecycleService({
      repository,
      configProvider: new ConfigProvider({ cache: false }),
      clock: () => FIXED_CLOCK,
    });

    const first = await lifecycleService.activate({ tenantId: seeded.tenantId });
    const second = await lifecycleService.activate({ tenantId: seeded.tenantId });

    expect(first.status).toBe('active');
    expect(second.created).toBe(false);
    expect(second.status).toBe('active');
  });

  it('throws when tenant is not found', async () => {
    const lifecycleService = new LifecycleService({
      repository: new InMemoryTenantRepository(),
      configProvider: new ConfigProvider({ cache: false }),
    });

    await expect(
      lifecycleService.activate({ tenantId: '00000000-0000-4000-8000-000000000099' }),
    ).rejects.toThrow(TenantNotFoundException);
  });

  it('rejects invalid lifecycle transitions', async () => {
    const repository = new InMemoryTenantRepository();
    const seeded = await seedDraftTenant(repository);
    const existing = (await repository.findById(seeded.tenantId))!;

    await repository.update({
      ...existing,
      status: 'suspended',
      configDocument: {
        ...existing.configDocument,
        tenant: {
          ...existing.configDocument.tenant,
          status: 'suspended',
        },
      },
    });

    const lifecycleService = new LifecycleService({
      repository,
      configProvider: new ConfigProvider({ cache: false }),
    });

    await expect(lifecycleService.activate({ tenantId: seeded.tenantId })).rejects.toThrow(
      InvalidLifecycleTransitionException,
    );
  });

  it('does not update when ConfigProvider validation fails during activation', async () => {
    const repository = new InMemoryTenantRepository();
    const seeded = await seedDraftTenant(repository);

    const lifecycleService = new LifecycleService({
      repository,
      configProvider: {
        resolve: vi.fn(() => {
          throw new ConfigValidationException([
            { path: 'tenant', message: 'Invalid tenant config', code: 'invalid_type' },
          ]);
        }),
      } as unknown as ConfigProvider,
    });

    await expect(lifecycleService.activate({ tenantId: seeded.tenantId })).rejects.toThrow(
      ConfigValidationException,
    );

    const stored = await repository.findById(seeded.tenantId);
    expect(stored?.status).toBe('draft');
  });
});
