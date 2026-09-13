import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import {
  createPlatformApi,
  resolveConfigStorePath,
  resolveTenantStorePath,
} from '../src/infrastructure/create-platform-api.js';

describe('createPlatformApi durable store', () => {
  const dirs: string[] = [];

  afterEach(async () => {
    while (dirs.length > 0) {
      const dir = dirs.pop();
      if (dir) {
        await rm(dir, { recursive: true, force: true });
      }
    }
  });

  it('resolves TENANT_STORE_PATH from env', () => {
    const resolved = resolveTenantStorePath(undefined, {
      TENANT_STORE_PATH: 'relative/tenants.json',
    });
    expect(resolved).toMatch(/tenants\.json$/);
  });

  it('resolves CONFIG_STORE_PATH from env', () => {
    const resolved = resolveConfigStorePath(undefined, {
      CONFIG_STORE_PATH: 'relative/configs.json',
    });
    expect(resolved).toMatch(/configs\.json$/);
  });

  it('survives process restarts via file stores', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'platform-api-store-'));
    dirs.push(dir);
    const tenantStorePath = join(dir, 'tenants.json');
    const configStorePath = join(dir, 'configs.json');

    const first = createPlatformApi({
      tenantStorePath,
      configStorePath,
      clock: () => '2026-09-10T00:00:00.000Z',
      createPublishId: () => 'durable-publish-1',
    });
    const launched = await first.launchBoom({
      businessName: 'Durable Mart',
      vertical: 'grocery',
      tenantId: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
    });
    expect(launched.status).toBe('active');

    const second = createPlatformApi({ tenantStorePath, configStorePath });
    const tenant = await second.getTenant(launched.tenantId);
    expect(tenant).toMatchObject({
      tenantId: launched.tenantId,
      slug: 'durable-mart',
      status: 'active',
      name: 'Durable Mart',
    });

    const config = await second.getTenantConfig(launched.tenantId);
    expect(config).toMatchObject({
      tenantId: launched.tenantId,
      configVersion: 1,
      publishId: 'durable-publish-1',
    });
    expect(config.document).toMatchObject({
      tenant: { name: 'Durable Mart', vertical: 'grocery' },
      meta: { configVersion: 1 },
    });
  });
});
