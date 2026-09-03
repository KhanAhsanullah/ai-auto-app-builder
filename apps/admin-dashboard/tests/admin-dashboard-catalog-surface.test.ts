import { describe, expect, it } from 'vitest';

import { createCatalogModule } from '@ai-commerce/module-catalog';

import { createAdminDashboard } from '../src/infrastructure/create-admin-dashboard.js';
import { AdminDashboardCatalogUnavailableException } from '../src/errors.js';
import { loadResolvedTenantConfig } from './helpers.js';

const TENANT_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

describe('AdminDashboard catalog surface', () => {
  it('creates and lists products when catalog is wired', async () => {
    const catalog = createCatalogModule({
      now: () => '2026-09-04T04:00:00.000Z',
      createId: (() => {
        let n = 0;
        return () => `id-${++n}`;
      })(),
    });

    const admin = createAdminDashboard({
      config: loadResolvedTenantConfig(),
      catalog,
    });

    expect(admin.isCatalogAvailable()).toBe(true);

    const product = await admin.catalogSurface.createProduct({
      slug: 'rice',
      name: 'Basmati Rice',
      status: 'draft',
      variants: [{ sku: 'RICE-1', title: '5kg', price: { amount: 10, currency: 'PKR' } }],
    });
    expect(product.tenantId).toBe(TENANT_ID);
    expect(product.status).toBe('draft');

    const listed = await admin.catalogSurface.listProducts();
    expect(listed).toHaveLength(1);
  });

  it('throws when catalog is not wired', async () => {
    const admin = createAdminDashboard({ config: loadResolvedTenantConfig() });
    expect(admin.isCatalogAvailable()).toBe(false);
    await expect(admin.catalogSurface.listProducts()).rejects.toBeInstanceOf(
      AdminDashboardCatalogUnavailableException,
    );
  });
});
