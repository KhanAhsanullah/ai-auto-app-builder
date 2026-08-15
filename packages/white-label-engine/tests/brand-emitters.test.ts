import { describe, expect, it } from 'vitest';

import { AssetNormalizer } from '../src/domain/asset-normalizer.js';
import { AdminDashboardBrandEmitter } from '../src/infrastructure/emitters/admin-dashboard-emitter.js';
import { MobileBrandEmitter } from '../src/infrastructure/emitters/mobile-emitter.js';
import { WebBrandEmitter } from '../src/infrastructure/emitters/web-emitter.js';
import { BrandResolver } from '../src/domain/brand-resolver.js';
import { FULL_ASSET_BRANDING_FIXTURE } from './helpers.js';

describe('brand emitters', () => {
  const assets = new AssetNormalizer().normalize(
    new BrandResolver().resolve({ tenantBranding: FULL_ASSET_BRANDING_FIXTURE }),
  );

  it('emits web surface link descriptors and font-face CSS references', () => {
    const output = new WebBrandEmitter().emit(assets);

    expect(output.surface).toBe('web');
    expect(output.faviconHref).toBe('https://cdn.example.com/favicon.ico');
    expect(output.appIconSourceHref).toBe('https://cdn.example.com/app-icon.png');
    expect(output.appIconResolvedFrom).toBe('appIcon');
    expect(output.ogImageHref).toBe('https://cdn.example.com/og-image.png');
    expect(output.fontFaceCss).toContain('@font-face');
    expect(output.fontFaceCss).toContain('heading.woff2');
    expect(output.links.some((link) => link.rel === 'icon')).toBe(true);
  });

  it('emits mobile surface icon metadata without binary generation', () => {
    const output = new MobileBrandEmitter().emit(assets);

    expect(output.surface).toBe('mobile');
    expect(output.appIconSourceUrl).toBe('https://cdn.example.com/app-icon.png');
    expect(output.iconSizesSpec.length).toBeGreaterThan(0);
    expect(output.splash.backgroundColor).toBe('#112233');
    expect(output.splash.imageUrl).toBe('https://cdn.example.com/splash.png');
    expect(output.fonts?.heading?.format).toBe('woff2');
  });

  it('emits admin dashboard header and favicon references', () => {
    const output = new AdminDashboardBrandEmitter().emit(assets);

    expect(output.surface).toBe('admin-dashboard');
    expect(output.headerLogoUrl).toBe('https://cdn.example.com/logo-primary.svg');
    expect(output.headerLogoInverseUrl).toBe('https://cdn.example.com/logo-inverse.svg');
    expect(output.faviconHref).toBe('https://cdn.example.com/favicon.ico');
  });
});
