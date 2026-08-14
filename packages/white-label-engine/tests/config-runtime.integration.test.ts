import { ConfigProvider } from '@ai-commerce/config-runtime';
import { brandingSchema } from '@ai-commerce/config-schema';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

import { BrandResolver } from '../src/domain/brand-resolver.js';
import {
  brandConfigSourceFromProviderResult,
  toResolveBrandInput,
} from '../src/domain/map-config-brand-source.js';
import { BUNDLED_BRAND_DEFAULTS } from '../src/defaults/index.js';
import { VERTICAL_TAGLINES } from './helpers.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, '../../..');
const FULL_EXAMPLE_PATH = join(REPO_ROOT, 'schemas/tenant-config/v1/examples/full.example.json');
const SCHEMA_DEFAULTS = join(REPO_ROOT, 'schemas/white-label/v1/presets');

describe('Config Runtime integration', () => {
  const configProvider = new ConfigProvider({ cache: false });
  const resolver = new BrandResolver();

  it('resolves branding from ConfigProvider result without re-resolving config', async () => {
    const configResult = await configProvider.loadFromFile(FULL_EXAMPLE_PATH);
    const source = brandConfigSourceFromProviderResult(configResult);
    const result = resolver.resolve(toResolveBrandInput(source));

    expect(result.branding.appName).toBe('Fresh Grocery');
    expect(result.branding.tagline).toBe('Farm fresh delivered to your door');
    expect(result.branding.showPoweredBy).toBe(false);
    expect(result.branding.logo?.primary).toBe('https://cdn.example.com/logo-primary.svg');
    expect(result.branding.logo?.inverse).toBe('https://cdn.example.com/logo-inverse.svg');
    expect(result.vertical).toBe('grocery');
    expect(result.tenantId).toBe('a1b2c3d4-e5f6-7890-abcd-ef1234567890');
    expect(result.metadata.hash).toMatch(/^[a-f0-9]{64}$/);
    expect(brandingSchema.safeParse(result.branding).success).toBe(true);
  });

  it('keeps schema preset files in sync with bundled defaults', () => {
    const schemaDefault = JSON.parse(
      readFileSync(join(SCHEMA_DEFAULTS, 'default.json'), 'utf8'),
    ) as typeof BUNDLED_BRAND_DEFAULTS.platform;

    expect(schemaDefault).toEqual(BUNDLED_BRAND_DEFAULTS.platform);

    for (const vertical of Object.keys(VERTICAL_TAGLINES) as (keyof typeof VERTICAL_TAGLINES)[]) {
      const schemaFile = JSON.parse(
        readFileSync(join(SCHEMA_DEFAULTS, 'vertical', `${vertical}.json`), 'utf8'),
      ) as (typeof BUNDLED_BRAND_DEFAULTS.vertical)[typeof vertical];

      expect(schemaFile).toEqual(BUNDLED_BRAND_DEFAULTS.vertical[vertical]);
    }
  });
});
