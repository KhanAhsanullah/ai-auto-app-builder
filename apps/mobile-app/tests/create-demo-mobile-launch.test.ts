import { describe, expect, it } from 'vitest';

import { createDemoMobileApp } from '../src/infrastructure/create-demo-mobile-app.js';
import { buildDemoLaunchConfig } from '../src/demo/build-launch-config.js';

describe('mobile Boom launch', () => {
  it('builds restaurant branding from launch input', () => {
    const built = buildDemoLaunchConfig({
      businessName: 'Spice Route',
      vertical: 'restaurant',
      tenantId: '11111111-1111-4111-8111-111111111111',
    });
    expect(built.vertical).toBe('restaurant');
    expect(built.tenantLayer.branding?.appName).toBe('Spice Route');
  });

  it('seeds restaurant catalog via createDemoMobileApp launch', async () => {
    const { app, vertical, businessName } = await createDemoMobileApp({
      launch: {
        businessName: 'Spice Route',
        vertical: 'restaurant',
        tenantId: '22222222-2222-4222-8222-222222222222',
      },
      now: () => '2026-09-08T00:00:00.000Z',
    });
    expect(vertical).toBe('restaurant');
    expect(businessName).toBe('Spice Route');
    const products = await app.catalogSurface.listActiveProducts();
    expect(products.some((p) => p.slug === 'biryani')).toBe(true);
    const biryani = products.find((p) => p.slug === 'biryani');
    expect(biryani?.variants[0]?.attributes?.imageUrl).toMatch(/^https:\/\//);
  });

  it('boots from platform tenantConfig even when mobileApp is disabled', async () => {
    const built = buildDemoLaunchConfig({
      businessName: 'Platform Spice',
      vertical: 'restaurant',
      tenantId: '44444444-4444-4444-8444-444444444444',
    });
    const platformLayer = {
      ...built.tenantLayer,
      mobileApp: { ...built.tenantLayer.mobileApp, enabled: false },
    };

    const { app, businessName, vertical } = await createDemoMobileApp({
      tenantConfig: platformLayer,
      launch: {
        businessName: 'Should Not Win',
        vertical: 'grocery',
        tenantId: '55555555-5555-4555-8555-555555555555',
      },
      now: () => '2026-09-08T00:00:00.000Z',
    });

    expect(businessName).toBe('Platform Spice');
    expect(vertical).toBe('restaurant');
    expect(app.getViewModel('store.catalog').shell.branding.displayName).toBe('Platform Spice');
    const products = await app.catalogSurface.listActiveProducts();
    expect(products.some((p) => p.slug === 'biryani')).toBe(true);
  });
});
