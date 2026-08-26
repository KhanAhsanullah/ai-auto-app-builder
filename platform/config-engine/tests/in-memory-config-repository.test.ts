import { describe, expect, it } from 'vitest';

import { InMemoryConfigRepository } from '../src/infrastructure/in-memory-config-repository.js';
import { ConfigDocumentAlreadyExistsException } from '../src/errors.js';
import type { ConfigDocument } from '../src/types.js';
import { loadFullTenantConfigLayer } from './helpers.js';

function doc(version: number): ConfigDocument {
  return {
    tenantId: 'tenant-fresh',
    version,
    status: 'draft',
    document: loadFullTenantConfigLayer(),
    createdAt: '2026-08-26T18:00:00.000Z',
    updatedAt: '2026-08-26T18:00:00.000Z',
  };
}

describe('InMemoryConfigRepository', () => {
  it('saves and finds by version and latest', async () => {
    const repo = new InMemoryConfigRepository();
    await repo.save(doc(1));
    await repo.save(doc(2));

    await expect(repo.findByTenantAndVersion('tenant-fresh', 1)).resolves.toMatchObject({
      version: 1,
    });
    await expect(repo.findLatestByTenant('tenant-fresh')).resolves.toMatchObject({ version: 2 });
    await expect(repo.listByTenant('tenant-fresh')).resolves.toHaveLength(2);
  });

  it('rejects duplicate tenant/version', async () => {
    const repo = new InMemoryConfigRepository();
    await repo.save(doc(1));
    await expect(repo.save(doc(1))).rejects.toThrow(ConfigDocumentAlreadyExistsException);
  });

  it('updates an existing revision and finds latest draft/published', async () => {
    const repo = new InMemoryConfigRepository();
    await repo.save(doc(1));
    await repo.update({
      ...doc(1),
      status: 'published',
      publishedAt: '2026-08-26T19:00:00.000Z',
    });

    await expect(repo.findLatestPublishedByTenant('tenant-fresh')).resolves.toMatchObject({
      status: 'published',
      version: 1,
    });
    await expect(repo.findLatestDraftByTenant('tenant-fresh')).resolves.toBeUndefined();
  });
});
