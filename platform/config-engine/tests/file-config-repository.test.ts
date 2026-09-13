import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import { FileConfigRepository } from '../src/infrastructure/file-config-repository.js';
import type { ConfigDocument } from '../src/types.js';

describe('FileConfigRepository', () => {
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
    const dir = await mkdtemp(join(tmpdir(), 'config-store-'));
    dirs.push(dir);
    const filePath = join(dir, 'configs.json');
    return { filePath, repository: new FileConfigRepository({ filePath }) };
  }

  function createDocument(overrides: Partial<ConfigDocument> = {}): ConfigDocument {
    return {
      tenantId: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      version: 1,
      status: 'draft',
      document: {
        tenant: {
          id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
          name: 'Fresh Daily',
          status: 'active',
        },
      },
      createdAt: '2026-09-13T00:00:00.000Z',
      updatedAt: '2026-09-13T00:00:00.000Z',
      ...overrides,
    };
  }

  it('persists revisions across repository instances', async () => {
    const { filePath, repository } = await createRepo();
    const document = createDocument();

    await repository.save(document);
    const raw = await readFile(filePath, 'utf8');
    expect(JSON.parse(raw).documents).toHaveLength(1);

    const reloaded = new FileConfigRepository({ filePath });
    await expect(reloaded.findByTenantAndVersion(document.tenantId, 1)).resolves.toEqual(document);
    await expect(reloaded.findLatestByTenant(document.tenantId)).resolves.toMatchObject({
      version: 1,
      status: 'draft',
    });
  });

  it('updates published status on disk', async () => {
    const { filePath, repository } = await createRepo();
    const document = createDocument();
    await repository.save(document);

    const published = createDocument({
      status: 'published',
      publishedAt: '2026-09-13T01:00:00.000Z',
      publishId: 'pub-1',
      updatedAt: '2026-09-13T01:00:00.000Z',
      document: {
        tenant: { id: document.tenantId, name: 'Fresh Daily', status: 'active' },
        meta: { configVersion: 1 },
      },
    });
    await repository.update(published);

    const reloaded = new FileConfigRepository({ filePath });
    await expect(reloaded.findLatestPublishedByTenant(document.tenantId)).resolves.toMatchObject({
      status: 'published',
      publishId: 'pub-1',
    });
  });
});
