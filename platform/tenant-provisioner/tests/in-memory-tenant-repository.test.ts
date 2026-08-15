import { describe, expect, it } from 'vitest';

import { ConfigBuilder } from '../src/domain/config-builder.js';
import { IdentityValidator } from '../src/domain/identity-validator.js';
import { InMemoryTenantRepository } from '../src/infrastructure/in-memory-tenant-repository.js';
import { TenantAlreadyExistsException } from '../src/errors.js';
import { computeRequestFingerprint } from '../src/types.js';
import {
  OTHER_TENANT_ID,
  OTHER_TENANT_SLUG,
  VALID_PROVISIONING_REQUEST,
  VALID_PROVISIONING_REQUEST_WITH_ID,
} from './helpers.js';

describe('InMemoryTenantRepository', () => {
  const validator = new IdentityValidator();
  const builder = new ConfigBuilder();

  function createRecord(request = VALID_PROVISIONING_REQUEST_WITH_ID) {
    const identity = validator.validate(request);
    const configDocument = builder.build(identity);
    const timestamp = '2026-08-16T00:00:00.000Z';

    return {
      tenantId: identity.id,
      slug: identity.slug,
      status: 'draft' as const,
      configDocument,
      requestFingerprint: computeRequestFingerprint(identity),
      createdAt: timestamp,
      updatedAt: timestamp,
    };
  }

  it('saves and finds a tenant by ID', async () => {
    const repository = new InMemoryTenantRepository();
    const record = createRecord();

    await repository.save(record);

    const found = await repository.findById(record.tenantId);

    expect(found).toEqual(record);
  });

  it('saves and finds a tenant by slug', async () => {
    const repository = new InMemoryTenantRepository();
    const record = createRecord();

    await repository.save(record);

    const found = await repository.findBySlug(record.slug);

    expect(found).toEqual(record);
  });

  it('returns undefined when a tenant ID is missing', async () => {
    const repository = new InMemoryTenantRepository();

    await expect(
      repository.findById('00000000-0000-4000-8000-000000000099'),
    ).resolves.toBeUndefined();
  });

  it('returns undefined when a slug is missing', async () => {
    const repository = new InMemoryTenantRepository();

    await expect(repository.findBySlug('missing-slug')).resolves.toBeUndefined();
  });

  it('rejects duplicate tenant IDs', async () => {
    const repository = new InMemoryTenantRepository();
    const record = createRecord();

    await repository.save(record);

    await expect(
      repository.save({
        ...record,
        slug: OTHER_TENANT_SLUG,
      }),
    ).rejects.toThrow(TenantAlreadyExistsException);
  });

  it('rejects duplicate slugs', async () => {
    const repository = new InMemoryTenantRepository();
    const first = createRecord(VALID_PROVISIONING_REQUEST_WITH_ID);
    const second = createRecord({
      ...VALID_PROVISIONING_REQUEST,
      id: OTHER_TENANT_ID,
      slug: VALID_PROVISIONING_REQUEST_WITH_ID.slug,
    });

    await repository.save(first);

    await expect(repository.save(second)).rejects.toThrow(TenantAlreadyExistsException);
  });

  it('never overwrites an existing tenant record', async () => {
    const repository = new InMemoryTenantRepository();
    const record = createRecord();

    await repository.save(record);

    await expect(
      repository.save({
        ...record,
        configDocument: {
          ...record.configDocument,
          branding: {
            appName: 'Changed',
            tagline: 'Changed',
          },
        },
      }),
    ).rejects.toThrow(TenantAlreadyExistsException);

    const found = await repository.findById(record.tenantId);
    expect(found?.configDocument.branding?.appName).toBe(record.configDocument.branding?.appName);
  });

  it('stores the request fingerprint on the saved record', async () => {
    const repository = new InMemoryTenantRepository();
    const record = createRecord({
      ...VALID_PROVISIONING_REQUEST,
      configOverrides: {
        branding: {
          tagline: 'Fingerprint tagline',
        },
      },
    });

    await repository.save(record);

    const found = await repository.findById(record.tenantId);

    expect(found?.requestFingerprint).toMatch(/^[a-f0-9]{64}$/);
    expect(found?.requestFingerprint).toBe(record.requestFingerprint);
  });
});

describe('computeRequestFingerprint', () => {
  it('is deterministic for identical resolved identity input', () => {
    const input = {
      id: '11111111-1111-4111-8111-111111111111',
      slug: 'acme-market',
      name: 'Acme Market',
      vertical: 'ecommerce' as const,
      defaultLocale: 'en',
      defaultTimezone: 'UTC',
      configOverrides: {
        branding: {
          tagline: 'Same tagline',
        },
      },
    };

    expect(computeRequestFingerprint(input)).toBe(computeRequestFingerprint(input));
  });

  it('changes when configOverrides change', () => {
    const base = {
      id: '11111111-1111-4111-8111-111111111111',
      slug: 'acme-market',
      name: 'Acme Market',
      vertical: 'ecommerce' as const,
      defaultLocale: 'en',
      defaultTimezone: 'UTC',
    };

    const withOverrides = computeRequestFingerprint({
      ...base,
      configOverrides: {
        branding: {
          tagline: 'A',
        },
      },
    });

    const withDifferentOverrides = computeRequestFingerprint({
      ...base,
      configOverrides: {
        branding: {
          tagline: 'B',
        },
      },
    });

    expect(withOverrides).not.toBe(withDifferentOverrides);
  });
});
