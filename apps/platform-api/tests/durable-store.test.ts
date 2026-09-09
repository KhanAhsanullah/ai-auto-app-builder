import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import {
  createPlatformApi,
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

  it('survives process restarts via file store', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'platform-api-store-'));
    dirs.push(dir);
    const tenantStorePath = join(dir, 'tenants.json');

    const first = createPlatformApi({
      tenantStorePath,
      clock: () => '2026-09-10T00:00:00.000Z',
    });
    const launched = await first.launchBoom({
      businessName: 'Durable Mart',
      vertical: 'grocery',
      tenantId: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
    });
    expect(launched.status).toBe('active');

    const second = createPlatformApi({ tenantStorePath });
    const tenant = await second.getTenant(launched.tenantId);
    expect(tenant).toMatchObject({
      tenantId: launched.tenantId,
      slug: 'durable-mart',
      status: 'active',
      name: 'Durable Mart',
    });
  });
});
