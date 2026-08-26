import { describe, expect, it, vi } from 'vitest';

import { ConfigDocumentNotFoundException } from '../src/errors.js';
import { createConfigEngine } from '../src/infrastructure/create-config-engine.js';
import { loadFullTenantConfigLayer } from './helpers.js';

describe('ConfigEngine / createConfigEngine', () => {
  it('saves a draft and reads it back via the facade', async () => {
    const engine = createConfigEngine({
      now: () => '2026-08-27T01:00:00.000Z',
    });

    const saved = await engine.saveDraft({
      tenantId: 'tenant-fresh',
      document: loadFullTenantConfigLayer(),
    });

    expect(saved).toMatchObject({
      tenantId: 'tenant-fresh',
      version: 1,
      status: 'draft',
      createdAt: '2026-08-27T01:00:00.000Z',
    });

    await expect(engine.get({ tenantId: 'tenant-fresh', version: 1 })).resolves.toMatchObject({
      version: 1,
      status: 'draft',
    });
    await expect(engine.getLatest('tenant-fresh')).resolves.toMatchObject({ version: 1 });
    await expect(engine.list('tenant-fresh')).resolves.toHaveLength(1);
  });

  it('publishes a draft end-to-end and notifies listeners', async () => {
    const listener = vi.fn();
    const engine = createConfigEngine({
      now: () => '2026-08-27T01:30:00.000Z',
      createPublishId: () => 'pub-facade-1',
      onPublish: [listener],
    });

    await engine.saveDraft({
      tenantId: 'tenant-fresh',
      document: loadFullTenantConfigLayer(),
    });

    const result = await engine.publish({
      tenantId: 'tenant-fresh',
      surfaces: ['web', 'mobile'],
    });

    expect(result.document.status).toBe('published');
    expect(result.document.publishId).toBe('pub-facade-1');
    expect(result.document.document.meta?.configVersion).toBe(1);
    expect(result.event).toEqual({
      tenantId: 'tenant-fresh',
      configVersion: 1,
      publishId: 'pub-facade-1',
      surfaces: ['web', 'mobile'],
    });
    expect(listener).toHaveBeenCalledWith(result.event);

    await expect(engine.getLatestPublished('tenant-fresh')).resolves.toMatchObject({
      version: 1,
      status: 'published',
    });
  });

  it('getLatestPublished throws when nothing is published', async () => {
    const engine = createConfigEngine();
    await expect(engine.getLatestPublished('tenant-fresh')).rejects.toThrow(
      ConfigDocumentNotFoundException,
    );
  });
});
