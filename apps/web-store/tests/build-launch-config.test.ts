import { describe, expect, it } from 'vitest';

import { buildDemoLaunchConfig, slugifyBusinessName } from '../src/demo/build-launch-config.js';
import { createDemoWebStore } from '../src/infrastructure/create-demo-web-store.js';

describe('buildDemoLaunchConfig', () => {
  it('slugifies business names', () => {
    expect(slugifyBusinessName('Spice Route Kitchen')).toBe('spice-route-kitchen');
  });

  it('builds a restaurant tenant layer with branding', () => {
    const built = buildDemoLaunchConfig({
      businessName: 'Spice Route',
      vertical: 'restaurant',
      logoUrl: 'https://cdn.example.com/logo.png',
      tenantId: '11111111-1111-4111-8111-111111111111',
    });
    expect(built.slug).toBe('spice-route');
    expect(built.vertical).toBe('restaurant');
    expect(built.tenantLayer.tenant?.vertical).toBe('restaurant');
    expect(built.tenantLayer.branding?.appName).toBe('Spice Route');
    expect(built.tenantLayer.branding?.logo?.primary).toBe('https://cdn.example.com/logo.png');
    expect(built.tenantLayer.theme?.colors?.primary).toBe('#DC2626');
  });
});

describe('createDemoWebStore launch', () => {
  it('seeds restaurant catalog when launch vertical is restaurant', async () => {
    const { store, businessName, vertical, restoredFromSnapshot } = await createDemoWebStore({
      launch: {
        businessName: 'Spice Route',
        vertical: 'restaurant',
        tenantId: '22222222-2222-4222-8222-222222222222',
      },
      now: () => '2026-09-08T00:00:00.000Z',
      createId: (() => {
        let n = 0;
        return () => `id-${++n}`;
      })(),
    });

    expect(restoredFromSnapshot).toBe(false);
    expect(businessName).toBe('Spice Route');
    expect(vertical).toBe('restaurant');
    expect(store.getViewModel('store.catalog').shell.branding.displayName).toBe('Spice Route');

    const products = await store.catalogSurface.listActiveProducts();
    expect(products.some((p) => p.slug === 'biryani')).toBe(true);
    expect(products.some((p) => p.slug === 'atta')).toBe(false);
  });

  it('seeds pharmacy catalog for pharmacy vertical', async () => {
    const { store, vertical } = await createDemoWebStore({
      launch: {
        businessName: 'CarePlus Pharmacy',
        vertical: 'pharmacy',
        tenantId: '33333333-3333-4333-8333-333333333333',
      },
      now: () => '2026-09-08T00:00:00.000Z',
    });
    expect(vertical).toBe('pharmacy');
    const products = await store.catalogSurface.listActiveProducts();
    expect(products.some((p) => p.slug === 'paracetamol')).toBe(true);
  });
});
