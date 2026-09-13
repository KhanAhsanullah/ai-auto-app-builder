import { describe, expect, it } from 'vitest';

import {
  ConfigDocumentNotFoundException,
  createConfigEngine,
  InMemoryConfigRepository,
} from '@ai-commerce/config-engine';
import { InMemoryTenantRepository } from '@ai-commerce/tenant-provisioner';

import { createPlatformApi } from '../src/infrastructure/create-platform-api.js';
import { TenantNotFoundException } from '../src/errors.js';
import { PlatformApi } from '../src/domain/platform-api.js';
import { createTenantProvisioner } from '@ai-commerce/tenant-provisioner';

describe('PlatformApi', () => {
  it('provisions, activates, and publishes a Boom launch', async () => {
    const api = createPlatformApi({
      clock: () => '2026-09-09T00:00:00.000Z',
      createPublishId: () => 'publish-test-1',
    });

    const result = await api.launchBoom({
      businessName: 'Fresh Daily',
      vertical: 'grocery',
      tenantId: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    });

    expect(result.created).toBe(true);
    expect(result.status).toBe('active');
    expect(result.slug).toBe('fresh-daily');
    expect(result.vertical).toBe('grocery');

    const tenant = await api.getTenant(result.tenantId);
    expect(tenant.status).toBe('active');
    expect(tenant.name).toBe('Fresh Daily');

    const config = await api.getTenantConfig(result.tenantId);
    expect(config.configVersion).toBe(1);
    expect(config.publishId).toBe('publish-test-1');
    expect(config.document).toMatchObject({
      tenant: { name: 'Fresh Daily', vertical: 'grocery', status: 'active' },
      meta: { configVersion: 1 },
    });
  });

  it('is idempotent on relaunch — does not fail when already published', async () => {
    const api = createPlatformApi({
      clock: () => '2026-09-09T00:00:00.000Z',
    });

    const first = await api.launchBoom({
      businessName: 'Fresh Daily',
      vertical: 'grocery',
      tenantId: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    });
    const second = await api.launchBoom({
      businessName: 'Fresh Daily',
      vertical: 'grocery',
      tenantId: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    });

    expect(first.created).toBe(true);
    expect(second.created).toBe(false);

    const config = await api.getTenantConfig(first.tenantId);
    expect(config.configVersion).toBe(1);
  });

  it('prefers published ConfigEngine document over registry fallback', async () => {
    const repository = new InMemoryTenantRepository();
    const provisioner = createTenantProvisioner({
      repository,
      clock: () => '2026-09-09T00:00:00.000Z',
    });
    const configRepository = new InMemoryConfigRepository();
    const configEngine = createConfigEngine({
      repository: configRepository,
      now: () => '2026-09-09T00:00:00.000Z',
      createPublishId: () => 'pub-prefer',
    });
    const api = new PlatformApi({ provisioner, configEngine });

    const launched = await api.launchBoom({
      businessName: 'Byte Hub',
      vertical: 'electronics',
      tenantId: 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',
    });

    const published = await configEngine.getLatestPublished(launched.tenantId);
    expect(published.document.meta?.configVersion).toBe(1);

    // Mutate registry copy so it diverges from published
    const record = await provisioner.findById(launched.tenantId);
    expect(record).toBeDefined();
    await repository.update({
      ...record!,
      configDocument: {
        ...record!.configDocument,
        tenant: {
          ...record!.configDocument.tenant,
          name: 'Registry Drift',
        },
      },
      updatedAt: '2026-09-09T02:00:00.000Z',
    });

    const config = await api.getTenantConfig(launched.tenantId);
    expect(config.document).toMatchObject({
      tenant: { name: 'Byte Hub' },
      meta: { configVersion: 1 },
    });
    expect(config.document).not.toMatchObject({
      tenant: { name: 'Registry Drift' },
    });
  });

  it('falls back to registry when nothing is published', async () => {
    const repository = new InMemoryTenantRepository();
    const provisioner = createTenantProvisioner({
      repository,
      clock: () => '2026-09-09T00:00:00.000Z',
    });
    const configEngine = createConfigEngine({
      now: () => '2026-09-09T00:00:00.000Z',
    });
    const api = new PlatformApi({
      provisioner,
      configEngine,
      activateOnLaunch: true,
    });

    const provisioned = await provisioner.provision({
      id: 'ffffffff-ffff-4fff-8fff-ffffffffffff',
      slug: 'registry-only',
      name: 'Registry Only',
      vertical: 'fashion',
      defaultLocale: 'en',
      defaultTimezone: 'UTC',
    });
    await provisioner.activate({ tenantId: provisioned.tenantId });

    await expect(configEngine.getLatestPublished(provisioned.tenantId)).rejects.toThrow(
      ConfigDocumentNotFoundException,
    );

    const config = await api.getTenantConfig(provisioned.tenantId);
    expect(config.configVersion).toBeUndefined();
    expect(config.document).toMatchObject({
      tenant: { name: 'Registry Only', vertical: 'fashion' },
    });
  });

  it('throws when tenant is missing', async () => {
    const api = createPlatformApi();
    await expect(api.getTenant('missing-tenant')).rejects.toThrow(TenantNotFoundException);
  });

  it('lists tenants and returns config documents', async () => {
    const api = createPlatformApi({
      clock: () => '2026-09-12T00:00:00.000Z',
    });

    const empty = await api.listTenants();
    expect(empty.tenants).toEqual([]);

    const launched = await api.launchBoom({
      businessName: 'Byte Hub',
      vertical: 'electronics',
      tenantId: 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',
    });

    const listed = await api.listTenants();
    expect(listed.tenants).toHaveLength(1);
    expect(listed.tenants[0]).toMatchObject({
      tenantId: launched.tenantId,
      slug: 'byte-hub',
      vertical: 'electronics',
      name: 'Byte Hub',
    });

    const config = await api.getTenantConfig(launched.tenantId);
    expect(config).toMatchObject({
      tenantId: launched.tenantId,
      slug: 'byte-hub',
      status: 'active',
      configVersion: 1,
    });
    expect(config.document).toMatchObject({
      tenant: { name: 'Byte Hub', vertical: 'electronics' },
    });
  });
});
