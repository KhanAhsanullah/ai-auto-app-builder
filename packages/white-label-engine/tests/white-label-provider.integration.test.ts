import { ConfigProvider } from '@ai-commerce/config-runtime';
import { brandingSchema } from '@ai-commerce/config-schema';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

import {
  brandConfigSourceFromProviderResult,
  toResolveBrandInput,
} from '../src/domain/map-config-brand-source.js';
import {
  createTestWhiteLabelProvider,
  FULL_ASSET_BRANDING_FIXTURE,
  TENANT_A_ID,
  TENANT_B_ID,
} from './helpers.js';
import type { CompiledBrandResult } from '../src/types.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, '../../..');
const FULL_EXAMPLE_PATH = join(REPO_ROOT, 'schemas/tenant-config/v1/examples/full.example.json');
const COMPILED_BRAND_SCHEMA_PATH = join(
  REPO_ROOT,
  'schemas/white-label/v1/compiled-brand.schema.json',
);

function assertCompiledBrandSchemaCompliance(result: CompiledBrandResult): void {
  const schema = JSON.parse(readFileSync(COMPILED_BRAND_SCHEMA_PATH, 'utf8')) as {
    required: string[];
  };

  for (const key of schema.required) {
    expect(result).toHaveProperty(key);
  }

  expect(result.metadata.brandHash).toMatch(/^[a-f0-9]{64}$/);
  expect(result.metadata.assetHash).toMatch(/^[a-f0-9]{64}$/);
  expect(result.manifest.version).toBe(1);
}

describe('WhiteLabelProvider integration', () => {
  const configProvider = new ConfigProvider({ cache: false });

  it('loads branding from ConfigProvider result without re-resolving config', async () => {
    const configResult = await configProvider.loadFromFile(FULL_EXAMPLE_PATH);
    const provider = createTestWhiteLabelProvider();
    const result = provider.provideFromProviderResult(configResult);

    expect(result.resolved.branding.appName).toBe('Fresh Grocery');
    expect(result.artifacts.web.surface).toBe('web');
    expect(result.artifacts.mobile.surface).toBe('mobile');
    expect(result.artifacts['admin-dashboard'].surface).toBe('admin-dashboard');
    expect(result.fromCache).toBe(false);
    assertCompiledBrandSchemaCompliance(result);
  });

  it('compiles selected surfaces through BrandCompiler', async () => {
    const configResult = await configProvider.loadFromFile(FULL_EXAMPLE_PATH);
    const provider = createTestWhiteLabelProvider();
    const result = provider.provideFromProviderResult(configResult, {
      surfaces: ['web', 'mobile'],
    });

    expect(result.artifacts.web.logoPrimaryHref).toBe('https://cdn.example.com/logo-primary.svg');
    expect(result.artifacts.mobile.appIconResolvedFrom).toBeDefined();
    expect(result.artifacts['admin-dashboard']).toBeUndefined();
  });

  it('returns cached compilations on repeated provide calls', async () => {
    const configResult = await configProvider.loadFromFile(FULL_EXAMPLE_PATH);
    const provider = createTestWhiteLabelProvider({ cache: { maxEntries: 10 } });

    const first = provider.provideFromProviderResult(configResult);
    const second = provider.provideFromProviderResult(configResult);

    expect(first.fromCache).toBe(false);
    expect(second.fromCache).toBe(true);
    expect(first.compiledAt).toBe(second.compiledAt);
    expect(second.resolved.metadata.hash).toBe(first.resolved.metadata.hash);
  });

  it('skips cache when skipCache is true', async () => {
    const configResult = await configProvider.loadFromFile(FULL_EXAMPLE_PATH);
    const provider = createTestWhiteLabelProvider({ cache: { maxEntries: 10 } });

    provider.provideFromProviderResult(configResult);
    const second = provider.provideFromProviderResult(configResult, { skipCache: true });

    expect(second.fromCache).toBe(false);
  });

  it('produces distinct branding for multiple tenants', () => {
    const provider = createTestWhiteLabelProvider();

    const tenantA = provider.provide({
      tenantId: TENANT_A_ID,
      tenantBranding: { appName: 'Tenant A', logo: { primary: 'https://cdn.example.com/a.svg' } },
      surfaces: ['web'],
    });
    const tenantB = provider.provide({
      tenantId: TENANT_B_ID,
      tenantBranding: { appName: 'Tenant B', logo: { primary: 'https://cdn.example.com/b.svg' } },
      surfaces: ['web'],
    });

    expect(tenantA.resolved.metadata.hash).not.toBe(tenantB.resolved.metadata.hash);
    expect(tenantA.metadata.assetHash).not.toBe(tenantB.metadata.assetHash);
    expect(tenantA.artifacts.web.logoPrimaryHref).toBe('https://cdn.example.com/a.svg');
    expect(tenantB.artifacts.web.logoPrimaryHref).toBe('https://cdn.example.com/b.svg');
  });

  it('shares compiled cache for identical branding while preserving tenant metadata', () => {
    const provider = createTestWhiteLabelProvider({ cache: { maxEntries: 10 } });

    const tenantA = provider.provide({
      tenantId: TENANT_A_ID,
      tenantBranding: FULL_ASSET_BRANDING_FIXTURE,
      surfaces: ['web'],
    });
    const tenantB = provider.provide({
      tenantId: TENANT_B_ID,
      tenantBranding: FULL_ASSET_BRANDING_FIXTURE,
      surfaces: ['web'],
    });

    expect(tenantB.fromCache).toBe(true);
    expect(tenantA.resolved.tenantId).toBe(TENANT_A_ID);
    expect(tenantB.resolved.tenantId).toBe(TENANT_B_ID);
    expect(tenantA.compiledAt).toBe(tenantB.compiledAt);
  });

  it('clearCache forces recompilation', async () => {
    const configResult = await configProvider.loadFromFile(FULL_EXAMPLE_PATH);
    const provider = createTestWhiteLabelProvider({ cache: { maxEntries: 10 } });

    const first = provider.provideFromProviderResult(configResult);
    expect(provider.getCachedCompiled(first.metadata.assetHash)).toBeDefined();

    provider.clearCache();
    expect(provider.getCachedCompiled(first.metadata.assetHash)).toBeUndefined();

    const second = provider.provideFromProviderResult(configResult);

    expect(first.fromCache).toBe(false);
    expect(second.fromCache).toBe(false);
  });

  it('validates resolved branding against brandingSchema', async () => {
    const configResult = await configProvider.loadFromFile(FULL_EXAMPLE_PATH);
    const provider = createTestWhiteLabelProvider();
    const result = provider.provideFromProviderResult(configResult);

    expect(brandingSchema.safeParse(result.resolved.branding).success).toBe(true);
  });
});

describe('toResolveBrandInput integration', () => {
  const configProvider = new ConfigProvider({ cache: false });

  it('maps ConfigProvider layers to brand resolver input', async () => {
    const configResult = await configProvider.loadFromFile(FULL_EXAMPLE_PATH);
    const provider = createTestWhiteLabelProvider();

    const resolvedOnly = provider.resolve({
      tenantId: configResult.config.tenant?.id,
      environment: configResult.environment,
      vertical: configResult.vertical,
      tenantBranding: configResult.config.branding,
      environmentBranding: configResult.layers.environment?.branding as never,
    });

    const fromConfig = provider.provideFromConfig({
      source: brandConfigSourceFromProviderResult(configResult),
      surfaces: ['web'],
    });

    expect(fromConfig.resolved.metadata.hash).toBe(resolvedOnly.metadata.hash);
    expect(fromConfig.resolved.branding.appName).toBe(resolvedOnly.branding.appName);
  });

  it('provideFromConfig matches toResolveBrandInput mapping', async () => {
    const configResult = await configProvider.loadFromFile(FULL_EXAMPLE_PATH);
    const provider = createTestWhiteLabelProvider();
    const source = brandConfigSourceFromProviderResult(configResult);

    const viaMapper = provider.provide({
      ...toResolveBrandInput(source),
      surfaces: ['web'],
    });
    const viaConfig = provider.provideFromConfig({ source, surfaces: ['web'] });

    expect(viaConfig.resolved.metadata.hash).toBe(viaMapper.resolved.metadata.hash);
    expect(viaConfig.metadata.assetHash).toBe(viaMapper.metadata.assetHash);
  });
});
