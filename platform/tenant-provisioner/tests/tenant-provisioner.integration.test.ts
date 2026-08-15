import { provisioningResultSchema } from '@ai-commerce/config-schema';
import { ConfigProvider } from '@ai-commerce/config-runtime';
import { createThemeProvider } from '@ai-commerce/theme-engine';
import { createWhiteLabelProvider } from '@ai-commerce/white-label-engine';
import { describe, expect, it } from 'vitest';

import { createTestTenantProvisioner } from './helpers.js';

describe('TenantProvisioner integration', () => {
  const provisioner = createTestTenantProvisioner();
  const configProvider = new ConfigProvider({ cache: false });

  it('produces resolved configuration that validates through ConfigProvider', async () => {
    const result = await provisioner.provision({
      id: '55555555-5555-4555-8555-555555555555',
      slug: 'integration-grocery',
      name: 'Integration Grocery',
      vertical: 'grocery',
      defaultLocale: 'en',
      defaultTimezone: 'UTC',
    });

    expect(() => provisioningResultSchema.parse(result)).not.toThrow();
    expect(result.status).toBe('draft');

    const record = await provisioner.findById(result.tenantId);
    expect(record).toBeDefined();

    const resolved = configProvider.resolve({
      tenantConfig: record!.configDocument,
      skipCache: true,
    });

    expect(resolved.validation.success).toBe(true);
    expect(resolved.vertical).toBe('grocery');
    expect(resolved.config.branding?.tagline).toBe('Fresh essentials, delivered');
    expect(resolved.config.environment?.targets.staging?.apiBaseUrl).toBe(
      'https://api-staging.integration-grocery.platform.local',
    );
  });

  it('differentiates ecommerce and grocery resolved configuration', async () => {
    const ecommerce = await provisioner.provision({
      id: '66666666-6666-4666-8666-666666666666',
      slug: 'integration-ecommerce',
      name: 'Integration Ecommerce',
      vertical: 'ecommerce',
      defaultLocale: 'en',
      defaultTimezone: 'UTC',
    });

    const grocery = await provisioner.provision({
      id: '77777777-7777-4777-8777-777777777777',
      slug: 'integration-grocery-b',
      name: 'Integration Grocery B',
      vertical: 'grocery',
      defaultLocale: 'en',
      defaultTimezone: 'UTC',
    });

    const ecommerceResolved = configProvider.resolve({
      tenantConfig: (await provisioner.findById(ecommerce.tenantId))!.configDocument,
      skipCache: true,
    });

    const groceryResolved = configProvider.resolve({
      tenantConfig: (await provisioner.findById(grocery.tenantId))!.configDocument,
      skipCache: true,
    });

    expect(ecommerceResolved.config.branding?.tagline).not.toBe(
      groceryResolved.config.branding?.tagline,
    );
    expect(ecommerceResolved.config.featureFlags).toBeDefined();
    expect(groceryResolved.config.featureFlags?.flags?.weightedItems).toBe(true);
  });

  it('activates a tenant and resolves active status through ConfigProvider', async () => {
    const provisioned = await provisioner.provision({
      id: '88888888-8888-4888-8888-888888888888',
      slug: 'integration-activate',
      name: 'Integration Activate',
      vertical: 'pharmacy',
      defaultLocale: 'en',
      defaultTimezone: 'UTC',
    });

    const activated = await provisioner.activate({ tenantId: provisioned.tenantId });
    expect(activated.status).toBe('active');

    const record = await provisioner.findById(provisioned.tenantId);
    const resolved = configProvider.resolve({
      tenantConfig: record!.configDocument,
      skipCache: true,
    });

    expect(resolved.config.tenant.status).toBe('active');
  });

  it('allows ThemeProvider to consume ConfigProvider output from a provisioned tenant', async () => {
    const result = await provisioner.provision({
      id: '99999999-9999-4999-8999-999999999999',
      slug: 'integration-theme',
      name: 'Integration Theme',
      vertical: 'fashion',
      defaultLocale: 'en',
      defaultTimezone: 'UTC',
    });

    const record = await provisioner.findById(result.tenantId);
    const configResult = configProvider.resolve({
      tenantConfig: record!.configDocument,
      skipCache: true,
    });

    const themeProvider = createThemeProvider();
    const themeResult = themeProvider.provideFromProviderResult(configResult, {
      surfaces: ['css'],
    });

    expect(themeResult.resolved.theme.colors.primary).toBe('#18181B');
    expect(themeResult.artifacts.css.surface).toBe('css');
  });

  it('allows WhiteLabelProvider to consume ConfigProvider output from a provisioned tenant', async () => {
    const result = await provisioner.provision({
      id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaab',
      slug: 'integration-brand',
      name: 'Integration Brand',
      vertical: 'electronics',
      defaultLocale: 'en',
      defaultTimezone: 'UTC',
    });

    const record = await provisioner.findById(result.tenantId);
    const configResult = configProvider.resolve({
      tenantConfig: record!.configDocument,
      skipCache: true,
    });

    const whiteLabelProvider = createWhiteLabelProvider();
    const brandResult = whiteLabelProvider.provideFromProviderResult(configResult, {
      surfaces: ['web'],
    });

    expect(brandResult.resolved.branding.tagline).toBe('The latest tech, ready to ship');
    expect(brandResult.artifacts.web.surface).toBe('web');
  });
});
