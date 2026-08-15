import { ConfigProvider } from '@ai-commerce/config-runtime';
import { brandingSchema } from '@ai-commerce/config-schema';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

import {
  brandConfigSourceFromProviderResult,
  BrandCompiler,
  BrandResolver,
  toResolveBrandInput,
} from '../src/index.js';
import { FULL_ASSET_BRANDING_FIXTURE } from './helpers.js';
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
    properties: Record<string, unknown>;
  };

  for (const key of schema.required) {
    expect(result).toHaveProperty(key);
  }

  expect(result.metadata.brandHash).toMatch(/^[a-f0-9]{64}$/);
  expect(result.metadata.assetHash).toMatch(/^[a-f0-9]{64}$/);
  expect(result.manifest.version).toBe(1);
  expect(result.manifest.assets.every((entry) => entry.id && entry.url && entry.format)).toBe(true);

  for (const artifact of Object.values(result.artifacts)) {
    expect(artifact).toHaveProperty('surface');
  }
}

describe('BrandCompiler integration', () => {
  const configProvider = new ConfigProvider({ cache: false });
  const resolver = new BrandResolver();
  const compiler = new BrandCompiler();

  it('compiles branding from ConfigProvider result through resolver and compiler', async () => {
    const configResult = await configProvider.loadFromFile(FULL_EXAMPLE_PATH);
    const source = brandConfigSourceFromProviderResult(configResult);
    const resolved = resolver.resolve(toResolveBrandInput(source));
    const compiled = compiler.compileFromResolved({ resolved });

    expect(compiled.assets.logos.primary?.url).toBe('https://cdn.example.com/logo-primary.svg');
    expect(compiled.metadata.brandHash).toBe(resolved.metadata.hash);
    expect(brandingSchema.safeParse(resolved.branding).success).toBe(true);
    assertCompiledBrandSchemaCompliance(compiled);
  });

  it('changes brand hash when optional fonts are present', () => {
    const withFonts = resolver.resolve({ tenantBranding: FULL_ASSET_BRANDING_FIXTURE });
    const withoutFonts = resolver.resolve({
      tenantBranding: {
        ...FULL_ASSET_BRANDING_FIXTURE,
        fonts: undefined,
      },
    });

    expect(withFonts.metadata.hash).not.toBe(withoutFonts.metadata.hash);
  });

  it('compiler output matches compiled-brand schema contract', () => {
    const resolved = resolver.resolve({ tenantBranding: FULL_ASSET_BRANDING_FIXTURE });
    const compiled = compiler.compileFromResolved({ resolved });

    assertCompiledBrandSchemaCompliance(compiled);
    expect(compiled.artifacts.web.ogImageHref).toBe('https://cdn.example.com/og-image.png');
    expect(compiled.artifacts.mobile.appIconResolvedFrom).toBe('appIcon');
  });
});
