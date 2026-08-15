import type { Tenant } from '@ai-commerce/config-schema';
import { describe, expect, it } from 'vitest';

import { BrandResolver } from '../src/domain/brand-resolver.js';
import { BRAND_PLATFORM_DEFAULTS } from '../src/defaults/platform-brand.js';
import { BrandResolutionException } from '../src/errors.js';
import type { BrandPatch } from '../src/types.js';
import {
  OTHER_TENANT_BRANDING_FIXTURE,
  TENANT_A_ID,
  TENANT_B_ID,
  TENANT_BRANDING_FIXTURE,
  VERTICAL_TAGLINES,
} from './helpers.js';

describe('BrandResolver', () => {
  const resolver = new BrandResolver();

  it('applies platform defaults when tenant branding is omitted', () => {
    const result = resolver.resolve({});

    expect(result.branding.appName).toBe(BRAND_PLATFORM_DEFAULTS.appName);
    expect(result.branding.tagline).toBe(BRAND_PLATFORM_DEFAULTS.tagline);
    expect(result.branding.showPoweredBy).toBe(true);
    expect(result.branding.logo?.primary).toBe(BRAND_PLATFORM_DEFAULTS.logo?.primary);
    expect(result.layers.platform).toEqual(BRAND_PLATFORM_DEFAULTS);
    expect(result.metadata.hash).toMatch(/^[a-f0-9]{64}$/);
    expect(result.metadata.compiledAt).toBeDefined();
    expect(result.metadata.brandVersion).toBe(0);
  });

  it('applies distinct vertical defaults for all six verticals', () => {
    const verticals = Object.keys(VERTICAL_TAGLINES) as Tenant['vertical'][];

    for (const vertical of verticals) {
      const result = resolver.resolve({ vertical });
      expect(result.branding.tagline).toBe(VERTICAL_TAGLINES[vertical]);
      expect(result.branding.appName).toBe(BRAND_PLATFORM_DEFAULTS.appName);
      expect(result.layers.vertical.tagline).toBe(VERTICAL_TAGLINES[vertical]);
      expect(result.vertical).toBe(vertical);
    }
  });

  it('lets tenant branding override platform and vertical defaults', () => {
    const result = resolver.resolve({
      vertical: 'grocery',
      tenantBranding: TENANT_BRANDING_FIXTURE,
    });

    expect(result.branding.appName).toBe('Acme Market');
    expect(result.branding.tagline).toBe('Tenant-specific tagline');
    expect(result.branding.showPoweredBy).toBe(false);
    expect(result.branding.copyrightText).toBe('© 2026 Acme Market');
  });

  it('deep-merges nested logo objects so tenant primary keeps platform inverse', () => {
    const result = resolver.resolve({
      tenantBranding: {
        logo: { primary: 'https://cdn.example.com/tenant-primary.svg' },
      },
    });

    expect(result.branding.logo?.primary).toBe('https://cdn.example.com/tenant-primary.svg');
    expect(result.branding.logo?.inverse).toBe(BRAND_PLATFORM_DEFAULTS.logo?.inverse);
    expect(result.branding.logo?.favicon).toBe(BRAND_PLATFORM_DEFAULTS.logo?.favicon);
  });

  it('applies environment branding as a shallow section overlay', () => {
    const result = resolver.resolve({
      tenantBranding: TENANT_BRANDING_FIXTURE,
      environmentBranding: {
        logo: { favicon: 'https://cdn.example.com/staging-favicon.ico' },
        tagline: 'Staging tagline',
      },
      environment: 'staging',
    });

    expect(result.branding.tagline).toBe('Staging tagline');
    expect(result.branding.logo?.favicon).toBe('https://cdn.example.com/staging-favicon.ico');
    expect(result.branding.logo?.primary).toBe(TENANT_BRANDING_FIXTURE.logo?.primary);
    expect(result.environment).toBe('staging');
    expect(result.layers.environment).toEqual({
      logo: { favicon: 'https://cdn.example.com/staging-favicon.ico' },
      tagline: 'Staging tagline',
    });
  });

  it('isolates multiple tenants with no shared mutable state', () => {
    const first = resolver.resolve({
      tenantId: TENANT_A_ID,
      tenantBranding: TENANT_BRANDING_FIXTURE,
    });
    const second = resolver.resolve({
      tenantId: TENANT_B_ID,
      tenantBranding: OTHER_TENANT_BRANDING_FIXTURE,
    });
    const firstAgain = resolver.resolve({
      tenantId: TENANT_A_ID,
      tenantBranding: TENANT_BRANDING_FIXTURE,
    });

    expect(first.tenantId).toBe(TENANT_A_ID);
    expect(second.tenantId).toBe(TENANT_B_ID);
    expect(first.branding.appName).toBe('Acme Market');
    expect(second.branding.appName).toBe('Beta Shop');
    expect(first.metadata.hash).not.toBe(second.metadata.hash);
    expect(firstAgain.metadata.hash).toBe(first.metadata.hash);
    expect(first.branding.appName).toBe('Acme Market');
  });

  it('produces a deterministic SHA-256 hash for identical input', () => {
    const input = { tenantBranding: TENANT_BRANDING_FIXTURE, vertical: 'grocery' as const };
    const first = resolver.resolve(input);
    const second = resolver.resolve(input);

    expect(first.metadata.hash).toBe(second.metadata.hash);
    expect(first.metadata.hash).toHaveLength(64);
  });

  it('changes hash when tenant branding changes', () => {
    const base = resolver.resolve({ tenantBranding: TENANT_BRANDING_FIXTURE });
    const changed = resolver.resolve({
      tenantBranding: { ...TENANT_BRANDING_FIXTURE, appName: 'Renamed Market' },
    });

    expect(base.metadata.hash).not.toBe(changed.metadata.hash);
  });

  it('fills optional fields from platform defaults for minimal tenant branding', () => {
    const result = resolver.resolve({
      tenantBranding: { appName: 'Minimal Shop' },
    });

    expect(result.branding.appName).toBe('Minimal Shop');
    expect(result.branding.tagline).toBe(BRAND_PLATFORM_DEFAULTS.tagline);
    expect(result.branding.showPoweredBy).toBe(true);
    expect(result.branding.logo?.primary).toBe(BRAND_PLATFORM_DEFAULTS.logo?.primary);
  });

  it('throws when merged branding fails schema validation', () => {
    expect(() =>
      resolver.resolve({
        platformDefaults: {},
        tenantBranding: {},
      }),
    ).toThrow(BrandResolutionException);
  });

  it('throws when tenant branding supplies an empty required field', () => {
    expect(() =>
      resolver.resolve({
        tenantBranding: { appName: '', tagline: 'Valid tagline' },
      }),
    ).toThrow(BrandResolutionException);
  });

  it('throws when tenant branding includes unknown properties', () => {
    expect(() =>
      resolver.resolve({
        tenantBranding: {
          appName: 'Acme',
          tagline: 'Hello',
          unknownField: true,
        } as BrandPatch,
      }),
    ).toThrow(BrandResolutionException);
  });

  it('copies brandVersion from branding metadata when present', () => {
    const result = resolver.resolve({
      tenantBranding: {
        ...TENANT_BRANDING_FIXTURE,
        metadata: { brandVersion: 4 },
      },
    });

    expect(result.metadata.brandVersion).toBe(4);
  });

  it('includes optional fonts in deterministic brand hash when present', () => {
    const withoutFonts = resolver.resolve({ tenantBranding: TENANT_BRANDING_FIXTURE });
    const withFonts = resolver.resolve({
      tenantBranding: {
        ...TENANT_BRANDING_FIXTURE,
        fonts: {
          body: {
            url: 'https://cdn.example.com/fonts/body.woff2',
            format: 'woff2',
          },
        },
      },
    });

    expect(withoutFonts.metadata.hash).not.toBe(withFonts.metadata.hash);
  });
});
