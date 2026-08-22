import { describe, expect, it } from 'vitest';

import { TenantResolver } from '../src/domain/tenant-resolver.js';
import { InMemoryTenantDirectory } from '../src/infrastructure/in-memory-tenant-directory.js';
import { TENANT } from './helpers.js';

describe('TenantResolver', () => {
  function createResolver() {
    const directory = new InMemoryTenantDirectory();
    directory.seed([TENANT]);
    return new TenantResolver({ directory });
  }

  it('resolves by x-tenant-id', async () => {
    const resolver = createResolver();
    await expect(resolver.resolve({ 'x-tenant-id': TENANT.id })).resolves.toEqual(TENANT);
  });

  it('resolves by x-tenant-slug', async () => {
    const resolver = createResolver();
    await expect(resolver.resolve({ 'x-tenant-slug': 'Demo-Grocery' })).resolves.toEqual(TENANT);
  });

  it('resolves by subdomain host', async () => {
    const resolver = createResolver();
    await expect(resolver.resolve({ host: 'demo-grocery.api.example.com' })).resolves.toEqual(
      TENANT,
    );
  });

  it('ignores reserved subdomains', async () => {
    const resolver = createResolver();
    await expect(resolver.resolve({ host: 'www.example.com' })).resolves.toBeUndefined();
  });
});
