import { describe, expect, it, vi } from 'vitest';

import { InMemoryConfigPublishEmitter } from '../src/domain/config-publish-emitter.js';
import { PublishConfigService } from '../src/domain/publish-config-service.js';
import { ConfigPublishException } from '../src/errors.js';
import { createDraftConfigService, loadFullTenantConfigLayer } from './helpers.js';

describe('PublishConfigService', () => {
  function createPublisher() {
    const { repository, validation, drafts } = createDraftConfigService(
      () => '2026-08-26T19:00:00.000Z',
    );
    const emitter = new InMemoryConfigPublishEmitter();
    const publish = new PublishConfigService({
      repository,
      validation,
      emitter,
      now: () => '2026-08-26T19:30:00.000Z',
      createPublishId: () => 'pub-test-1',
    });
    return { drafts, publish, emitter, repository };
  }

  it('publishes the latest draft, stamps configVersion, and emits an event', async () => {
    const { drafts, publish, emitter } = createPublisher();
    await drafts.saveDraft({
      tenantId: 'tenant-fresh',
      document: loadFullTenantConfigLayer(),
    });

    const result = await publish.publish({
      tenantId: 'tenant-fresh',
      surfaces: ['web', 'admin'],
    });

    expect(result.document.status).toBe('published');
    expect(result.document.publishId).toBe('pub-test-1');
    expect(result.document.publishedAt).toBe('2026-08-26T19:30:00.000Z');
    expect(result.document.document.meta?.configVersion).toBe(1);
    expect(result.event).toEqual({
      tenantId: 'tenant-fresh',
      configVersion: 1,
      publishId: 'pub-test-1',
      surfaces: ['web', 'admin'],
    });
    expect(emitter.events).toEqual([result.event]);

    await expect(publish.getLatestPublished('tenant-fresh')).resolves.toMatchObject({
      version: 1,
      status: 'published',
    });
  });

  it('publishes an explicit draft version', async () => {
    const { drafts, publish } = createPublisher();
    await drafts.saveDraft({
      tenantId: 'tenant-fresh',
      document: loadFullTenantConfigLayer(),
    });
    await drafts.saveDraft({
      tenantId: 'tenant-fresh',
      document: loadFullTenantConfigLayer(),
    });

    const result = await publish.publish({ tenantId: 'tenant-fresh', version: 1 });
    expect(result.document.version).toBe(1);
    expect(result.event.configVersion).toBe(1);
  });

  it('rejects publishing an already published revision', async () => {
    const { drafts, publish } = createPublisher();
    await drafts.saveDraft({
      tenantId: 'tenant-fresh',
      document: loadFullTenantConfigLayer(),
    });
    await publish.publish({ tenantId: 'tenant-fresh' });

    await expect(publish.publish({ tenantId: 'tenant-fresh', version: 1 })).rejects.toThrow(
      ConfigPublishException,
    );
  });

  it('rejects when no draft exists', async () => {
    const { publish } = createPublisher();
    await expect(publish.publish({ tenantId: 'tenant-fresh' })).rejects.toThrow(
      ConfigPublishException,
    );
  });

  it('notifies optional listeners via the emitter', async () => {
    const listener = vi.fn();
    const { repository, validation, drafts } = createDraftConfigService();
    const emitter = new InMemoryConfigPublishEmitter([listener]);
    const publish = new PublishConfigService({
      repository,
      validation,
      emitter,
      createPublishId: () => 'pub-2',
      now: () => '2026-08-26T20:00:00.000Z',
    });

    await drafts.saveDraft({
      tenantId: 'tenant-fresh',
      document: loadFullTenantConfigLayer(),
    });
    await publish.publish({ tenantId: 'tenant-fresh' });

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener.mock.calls[0]?.[0]).toMatchObject({
      tenantId: 'tenant-fresh',
      configVersion: 1,
      publishId: 'pub-2',
    });
  });
});
