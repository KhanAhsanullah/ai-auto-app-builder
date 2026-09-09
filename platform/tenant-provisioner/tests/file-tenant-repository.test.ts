import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import { ConfigBuilder } from '../src/domain/config-builder.js';
import { IdentityValidator } from '../src/domain/identity-validator.js';
import { FileTenantRepository } from '../src/infrastructure/file-tenant-repository.js';
import { TenantAlreadyExistsException } from '../src/errors.js';
import { computeRequestFingerprint } from '../src/types.js';
import { VALID_PROVISIONING_REQUEST_WITH_ID } from './helpers.js';

describe('FileTenantRepository', () => {
  const validator = new IdentityValidator();
  const builder = new ConfigBuilder();
  const dirs: string[] = [];

  afterEach(async () => {
    while (dirs.length > 0) {
      const dir = dirs.pop();
      if (dir) {
        await rm(dir, { recursive: true, force: true });
      }
    }
  });

  async function createRepo() {
    const dir = await mkdtemp(join(tmpdir(), 'tenant-store-'));
    dirs.push(dir);
    const filePath = join(dir, 'tenants.json');
    return { filePath, repository: new FileTenantRepository({ filePath }) };
  }

  function createRecord() {
    const identity = validator.validate(VALID_PROVISIONING_REQUEST_WITH_ID);
    const configDocument = builder.build(identity);
    const timestamp = '2026-09-09T00:00:00.000Z';
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

  it('persists tenants across repository instances', async () => {
    const { filePath, repository } = await createRepo();
    const record = createRecord();

    await repository.save(record);
    const raw = await readFile(filePath, 'utf8');
    expect(JSON.parse(raw).tenants).toHaveLength(1);

    const reloaded = new FileTenantRepository({ filePath });
    await expect(reloaded.findById(record.tenantId)).resolves.toEqual(record);
    await expect(reloaded.findBySlug(record.slug)).resolves.toMatchObject({
      tenantId: record.tenantId,
    });
  });

  it('updates status on disk', async () => {
    const { filePath, repository } = await createRepo();
    const record = createRecord();
    await repository.save(record);

    const activated = {
      ...record,
      status: 'active' as const,
      updatedAt: '2026-09-09T01:00:00.000Z',
    };
    await repository.update(activated);

    const reloaded = new FileTenantRepository({ filePath });
    await expect(reloaded.findById(record.tenantId)).resolves.toMatchObject({
      status: 'active',
    });
  });

  it('rejects duplicate ids like the in-memory store', async () => {
    const { repository } = await createRepo();
    const record = createRecord();
    await repository.save(record);
    await expect(repository.save(record)).rejects.toThrow(TenantAlreadyExistsException);
  });
});
