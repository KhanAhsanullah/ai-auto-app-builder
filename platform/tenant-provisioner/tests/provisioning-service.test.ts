import type { ProvisioningRequest } from '@ai-commerce/config-schema';
import { ConfigProvider, ConfigValidationException } from '@ai-commerce/config-runtime';
import { describe, expect, it, vi } from 'vitest';

import { ConfigBuilder } from '../src/domain/config-builder.js';
import { IdentityValidator } from '../src/domain/identity-validator.js';
import { ProvisioningService } from '../src/domain/provisioning-service.js';
import { InMemoryTenantRepository } from '../src/infrastructure/in-memory-tenant-repository.js';
import { TenantAlreadyExistsException } from '../src/errors.js';
import {
  RETRY_SAFE_PROVISIONING_REQUEST,
  VALID_PROVISIONING_REQUEST,
  VALID_PROVISIONING_REQUEST_WITH_ID,
} from './helpers.js';

const FIXED_CLOCK = '2026-08-16T00:00:00.000Z';

function createService(options?: {
  configProvider?: ConfigProvider;
  configBuilder?: ConfigBuilder;
}) {
  const repository = new InMemoryTenantRepository();

  return {
    repository,
    service: new ProvisioningService({
      identityValidator: new IdentityValidator(),
      configBuilder: options?.configBuilder ?? new ConfigBuilder(),
      configProvider: options?.configProvider ?? new ConfigProvider({ cache: false }),
      repository,
      clock: () => FIXED_CLOCK,
    }),
  };
}

describe('ProvisioningService', () => {
  it('provisions a new tenant successfully', async () => {
    const { service } = createService();
    const result = await service.provision(VALID_PROVISIONING_REQUEST_WITH_ID);

    expect(result.created).toBe(true);
    expect(result.status).toBe('draft');
    expect(result.tenantId).toBe(VALID_PROVISIONING_REQUEST_WITH_ID.id);
    expect(result.slug).toBe(VALID_PROVISIONING_REQUEST_WITH_ID.slug);
    expect(result.createdAt).toBe(FIXED_CLOCK);
  });

  it('returns idempotent success for the same explicit tenant id and request', async () => {
    const { service } = createService();

    const first = await service.provision(RETRY_SAFE_PROVISIONING_REQUEST);
    const second = await service.provision(RETRY_SAFE_PROVISIONING_REQUEST);

    expect(first.created).toBe(true);
    expect(second.created).toBe(false);
    expect(second.tenantId).toBe(first.tenantId);
    expect(second.requestFingerprint).toBe(first.requestFingerprint);
  });

  it('throws when the same tenant id is reused with a different request', async () => {
    const { service } = createService();

    await service.provision(RETRY_SAFE_PROVISIONING_REQUEST);

    const changedRequest: ProvisioningRequest = {
      ...RETRY_SAFE_PROVISIONING_REQUEST,
      name: 'Changed Name',
    };

    await expect(service.provision(changedRequest)).rejects.toThrow(TenantAlreadyExistsException);
  });

  it('throws when the same slug is reused with a different tenant id', async () => {
    const { service } = createService();

    await service.provision(RETRY_SAFE_PROVISIONING_REQUEST);

    await expect(
      service.provision({
        ...VALID_PROVISIONING_REQUEST,
        id: '44444444-4444-4444-8444-444444444444',
        slug: RETRY_SAFE_PROVISIONING_REQUEST.slug,
      }),
    ).rejects.toThrow(TenantAlreadyExistsException);
  });

  it('does not guarantee idempotency when id is omitted on retry', async () => {
    const { service } = createService();

    await service.provision({
      ...VALID_PROVISIONING_REQUEST,
      slug: 'omitted-id-shop',
    });

    await expect(
      service.provision({
        ...VALID_PROVISIONING_REQUEST,
        slug: 'omitted-id-shop',
      }),
    ).rejects.toThrow(TenantAlreadyExistsException);
  });

  it('does not persist when ConfigProvider validation fails', async () => {
    const { service, repository } = createService({
      configProvider: {
        resolve: vi.fn(() => {
          throw new ConfigValidationException([
            { path: 'tenant', message: 'Invalid tenant config', code: 'invalid_type' },
          ]);
        }),
      } as unknown as ConfigProvider,
    });

    await expect(service.provision(VALID_PROVISIONING_REQUEST_WITH_ID)).rejects.toThrow(
      ConfigValidationException,
    );

    await expect(
      repository.findBySlug(VALID_PROVISIONING_REQUEST_WITH_ID.slug),
    ).resolves.toBeUndefined();
  });
});
