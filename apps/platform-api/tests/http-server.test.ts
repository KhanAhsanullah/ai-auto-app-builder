import { afterEach, describe, expect, it } from 'vitest';

import { createPlatformApi } from '../src/infrastructure/create-platform-api.js';
import { listenPlatformApi } from '../src/infrastructure/node-http-server.js';

describe('platform-api HTTP', () => {
  const closers: Array<() => Promise<void>> = [];

  afterEach(async () => {
    while (closers.length > 0) {
      const close = closers.pop();
      await close?.();
    }
  });

  it('serves health and Boom launch', async () => {
    const api = createPlatformApi({
      clock: () => '2026-09-09T00:00:00.000Z',
    });
    const listening = await listenPlatformApi(api, 0);
    closers.push(listening.close);

    const health = await fetch(`http://127.0.0.1:${listening.port}/health`);
    expect(health.status).toBe(200);
    await expect(health.json()).resolves.toEqual({ ok: true, service: 'platform-api' });

    const launch = await fetch(`http://127.0.0.1:${listening.port}/v1/boom/launch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        businessName: 'CarePlus',
        vertical: 'pharmacy',
        tenantId: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
      }),
    });
    expect(launch.status).toBe(201);
    const body = (await launch.json()) as { tenantId: string; status: string; slug: string };
    expect(body.status).toBe('active');
    expect(body.slug).toBe('careplus');

    const tenant = await fetch(`http://127.0.0.1:${listening.port}/v1/tenants/${body.tenantId}`);
    expect(tenant.status).toBe(200);
    await expect(tenant.json()).resolves.toMatchObject({
      tenantId: body.tenantId,
      vertical: 'pharmacy',
      status: 'active',
    });
  });

  it('returns 400 for invalid Boom payloads', async () => {
    const api = createPlatformApi();
    const listening = await listenPlatformApi(api, 0);
    closers.push(listening.close);

    const res = await fetch(`http://127.0.0.1:${listening.port}/v1/boom/launch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vertical: 'grocery' }),
    });
    expect(res.status).toBe(400);
  });
});
