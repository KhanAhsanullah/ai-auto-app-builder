import { describe, expect, it } from 'vitest';

import { AssetNormalizer } from '../src/domain/asset-normalizer.js';
import { AssetValidationException } from '../src/errors.js';
import { BRAND_PLATFORM_DEFAULTS } from '../src/defaults/platform-brand.js';
import { BrandResolver } from '../src/domain/brand-resolver.js';
import { FULL_ASSET_BRANDING_FIXTURE, TENANT_BRANDING_FIXTURE } from './helpers.js';

describe('AssetNormalizer', () => {
  const resolver = new BrandResolver();
  const normalizer = new AssetNormalizer();

  it('normalizes platform default logo and favicon assets', () => {
    const resolved = resolver.resolve({});
    const assets = normalizer.normalize(resolved);

    expect(assets.logos.primary?.url).toBe(BRAND_PLATFORM_DEFAULTS.logo?.primary);
    expect(assets.logos.primary?.format).toBe('svg');
    expect(assets.logos.favicon?.format).toBe('ico');
    expect(assets.metadata.hash).toMatch(/^[a-f0-9]{64}$/);
  });

  it('prefers logo.appIcon over appleTouchIcon and primary for appIconSource', () => {
    const resolved = resolver.resolve({ tenantBranding: FULL_ASSET_BRANDING_FIXTURE });
    const assets = normalizer.normalize(resolved);

    expect(assets.appIconSource?.resolvedFrom).toBe('appIcon');
    expect(assets.appIconSource?.source.url).toBe('https://cdn.example.com/app-icon.png');
  });

  it('falls back to appleTouchIcon when appIcon is absent', () => {
    const resolved = resolver.resolve({
      tenantBranding: {
        logo: {
          primary: 'https://cdn.example.com/logo-primary.svg',
          appleTouchIcon: 'https://cdn.example.com/apple-touch.png',
        },
      },
    });
    const assets = normalizer.normalize(resolved);

    expect(assets.appIconSource?.resolvedFrom).toBe('appleTouchIcon');
    expect(assets.appIconSource?.source.url).toBe('https://cdn.example.com/apple-touch.png');
  });

  it('falls back to primary when only primary logo is present', () => {
    const resolved = resolver.resolve({ tenantBranding: TENANT_BRANDING_FIXTURE });
    const assets = normalizer.normalize(resolved);

    expect(assets.appIconSource?.resolvedFrom).toBe('primary');
    expect(assets.appIconSource?.source.url).toBe('https://cdn.example.com/acme-logo.svg');
  });

  it('normalizes optional fonts as reference metadata only', () => {
    const resolved = resolver.resolve({ tenantBranding: FULL_ASSET_BRANDING_FIXTURE });
    const assets = normalizer.normalize(resolved);

    expect(assets.fonts?.heading?.format).toBe('woff2');
    expect(assets.fonts?.heading?.weight).toBe(700);
    expect(assets.fonts?.body?.url).toBe('https://cdn.example.com/fonts/body.woff2');
  });

  it('normalizes optional splash and OG image assets', () => {
    const resolved = resolver.resolve({ tenantBranding: FULL_ASSET_BRANDING_FIXTURE });
    const assets = normalizer.normalize(resolved);

    expect(assets.splash?.backgroundColor).toBe('#112233');
    expect(assets.splash?.image?.format).toBe('png');
    expect(assets.social?.ogImage?.role).toBe('og-image');
  });

  it('supports minimal branding using inherited platform defaults', () => {
    const resolved = resolver.resolve({ tenantBranding: { appName: 'Minimal Shop' } });
    const assets = normalizer.normalize(resolved);

    expect(assets.logos.primary?.url).toBe(BRAND_PLATFORM_DEFAULTS.logo?.primary);
    expect(assets.appIconSource?.resolvedFrom).toBe('primary');
  });

  it('throws for invalid asset references', () => {
    const resolved = resolver.resolve({
      tenantBranding: {
        logo: {
          primary: 'https://cdn.example.com/logo.bmp',
        },
      },
    });

    expect(() => normalizer.normalize(resolved)).toThrow(AssetValidationException);
  });
});
