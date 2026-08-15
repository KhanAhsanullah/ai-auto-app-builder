import { describe, expect, it } from 'vitest';

import {
  brandConfigSourceFromProviderResult,
  toResolveBrandInput,
} from '../src/domain/map-config-brand-source.js';
import { WebBrandEmitter } from '../src/infrastructure/emitters/web-emitter.js';
import { DefaultBrandEmitterRegistry } from '../src/infrastructure/brand-emitter-registry.js';
import { BrandResolver } from '../src/domain/brand-resolver.js';
import { createWhiteLabelProvider } from '../src/infrastructure/create-white-label-provider.js';
import { AssetValidationException, BrandResolutionException } from '../src/errors.js';
import type { BrandSurface } from '../src/types.js';
import {
  createTestWhiteLabelProvider,
  FULL_ASSET_BRANDING_FIXTURE,
  OTHER_TENANT_BRANDING_FIXTURE,
  TENANT_A_ID,
  TENANT_B_ID,
  TENANT_BRANDING_FIXTURE,
} from './helpers.js';

describe('createWhiteLabelProvider', () => {
  it('creates provider with default dependencies', () => {
    const provider = createWhiteLabelProvider();

    expect(provider.getResolver()).toBeInstanceOf(BrandResolver);
    expect(provider.getCompiler().getResolver()).toBe(provider.getResolver());
  });

  it('accepts injected resolver and cache options', () => {
    const resolver = new BrandResolver();
    const provider = createWhiteLabelProvider({
      resolver,
      cache: { maxEntries: 5 },
    });

    expect(provider.getResolver()).toBe(resolver);
    expect(provider.getCompiler().getResolver()).toBe(resolver);
  });

  it('accepts custom emitterRegistry', () => {
    const registry = new DefaultBrandEmitterRegistry([new WebBrandEmitter()]);

    const provider = createWhiteLabelProvider({ emitterRegistry: registry });

    expect(provider.getCompiler().getEmitterRegistry()).toBe(registry);
  });
});

describe('WhiteLabelProvider', () => {
  const provider = createTestWhiteLabelProvider();

  it('resolve returns resolved branding without compiling artifacts', () => {
    const resolved = provider.resolve({ tenantBranding: TENANT_BRANDING_FIXTURE });

    expect(resolved.branding.appName).toBe('Acme Market');
    expect(resolved.metadata.hash).toMatch(/^[a-f0-9]{64}$/);
  });

  it('provide returns resolved branding and compiled artifacts', () => {
    const result = provider.provide({
      tenantBranding: FULL_ASSET_BRANDING_FIXTURE,
      surfaces: ['web'],
    });

    expect(result.resolved.branding.appName).toBe('Asset Shop');
    expect(result.artifacts.web.surface).toBe('web');
    expect(result.fromCache).toBe(false);
  });

  it('provideFromConfig accepts normalized BrandConfigSource', () => {
    const result = provider.provideFromConfig({
      source: brandConfigSourceFromProviderResult({
        config: {
          branding: FULL_ASSET_BRANDING_FIXTURE as never,
          tenant: { id: TENANT_A_ID } as never,
        },
        layers: {},
        environment: 'production',
        vertical: 'fashion',
      }),
      surfaces: ['mobile'],
    });

    expect(result.resolved.branding.appName).toBe('Asset Shop');
    expect(result.artifacts.mobile.surface).toBe('mobile');
    expect(result.resolved.tenantId).toBe(TENANT_A_ID);
  });

  it('maps config source fields through toResolveBrandInput', () => {
    const input = toResolveBrandInput(
      brandConfigSourceFromProviderResult({
        config: {
          branding: TENANT_BRANDING_FIXTURE as never,
          tenant: { id: TENANT_A_ID } as never,
        },
        layers: {
          environment: { branding: { tagline: 'Env override' } },
        },
        environment: 'staging',
        vertical: 'grocery',
      }),
    );

    expect(input.tenantId).toBe(TENANT_A_ID);
    expect(input.environment).toBe('staging');
    expect(input.vertical).toBe('grocery');
    expect(input.tenantBranding?.appName).toBe('Acme Market');
    expect(input.environmentBranding?.tagline).toBe('Env override');
  });

  it('getCachedCompiled retrieves cached artifacts by assetHash', () => {
    const cachedProvider = createTestWhiteLabelProvider({ cache: { maxEntries: 10 } });
    const result = cachedProvider.provide({
      tenantBranding: FULL_ASSET_BRANDING_FIXTURE,
      surfaces: ['web'],
    });

    const cached = cachedProvider.getCachedCompiled(result.metadata.assetHash, ['web']);

    expect(cached).toBeDefined();
    expect(cached?.artifacts.web.links).toEqual(result.artifacts.web.links);
  });

  it('getCachedCompiled uses assetHash not brandHash', () => {
    const cachedProvider = createTestWhiteLabelProvider({ cache: { maxEntries: 10 } });
    const result = cachedProvider.provide({
      tenantBranding: FULL_ASSET_BRANDING_FIXTURE,
      surfaces: ['web'],
    });

    expect(result.metadata.brandHash).toBe(result.resolved.metadata.hash);
    expect(cachedProvider.getCachedCompiled(result.metadata.brandHash, ['web'])).toBeUndefined();
    expect(cachedProvider.getCachedCompiled(result.metadata.assetHash, ['web'])).toBeDefined();
  });

  it('getResolver and getCompiler expose shared instances', () => {
    expect(provider.getResolver()).toBe(provider.getCompiler().getResolver());
  });

  it('propagates BrandResolutionException for invalid branding', () => {
    expect(() =>
      provider.provide({
        tenantBranding: { appName: '' },
      }),
    ).toThrow(BrandResolutionException);
  });

  it('propagates AssetValidationException for invalid asset URLs', () => {
    expect(() =>
      provider.provide({
        tenantBranding: {
          ...TENANT_BRANDING_FIXTURE,
          logo: { primary: 'not-a-valid-url' },
        },
      }),
    ).toThrow(AssetValidationException);
  });

  it('supports minimal branding through platform defaults', () => {
    const result = provider.provide({ surfaces: ['web'] });

    expect(result.resolved.branding.appName).toBeDefined();
    expect(result.artifacts.web.surface).toBe('web');
  });

  it('returns cached compilations on repeated provide calls', () => {
    const cachedProvider = createTestWhiteLabelProvider({ cache: { maxEntries: 10 } });
    const input = {
      tenantBranding: FULL_ASSET_BRANDING_FIXTURE,
      surfaces: ['web'] as BrandSurface[],
    };

    const first = cachedProvider.provide(input);
    const second = cachedProvider.provide(input);

    expect(first.fromCache).toBe(false);
    expect(second.fromCache).toBe(true);
    expect(first.compiledAt).toBe(second.compiledAt);
  });

  it('skips cache when skipCache is true', () => {
    const cachedProvider = createTestWhiteLabelProvider({ cache: { maxEntries: 10 } });
    const input = {
      tenantBranding: FULL_ASSET_BRANDING_FIXTURE,
      surfaces: ['web'] as BrandSurface[],
    };

    cachedProvider.provide(input);
    const second = cachedProvider.provide({ ...input, skipCache: true });

    expect(second.fromCache).toBe(false);
  });

  it('clearCache forces recompilation', () => {
    const cachedProvider = createTestWhiteLabelProvider({ cache: { maxEntries: 10 } });
    const input = {
      tenantBranding: FULL_ASSET_BRANDING_FIXTURE,
      surfaces: ['web'] as BrandSurface[],
    };

    const first = cachedProvider.provide(input);
    expect(cachedProvider.getCachedCompiled(first.metadata.assetHash, ['web'])).toBeDefined();

    cachedProvider.clearCache();
    expect(cachedProvider.getCachedCompiled(first.metadata.assetHash, ['web'])).toBeUndefined();

    const second = cachedProvider.provide(input);

    expect(first.fromCache).toBe(false);
    expect(second.fromCache).toBe(false);
  });

  it('produces distinct branding for multiple tenants', () => {
    const tenantA = provider.provide({
      tenantId: TENANT_A_ID,
      tenantBranding: TENANT_BRANDING_FIXTURE,
      surfaces: ['web'],
    });
    const tenantB = provider.provide({
      tenantId: TENANT_B_ID,
      tenantBranding: OTHER_TENANT_BRANDING_FIXTURE,
      surfaces: ['web'],
    });

    expect(tenantA.resolved.metadata.hash).not.toBe(tenantB.resolved.metadata.hash);
    expect(tenantA.metadata.assetHash).not.toBe(tenantB.metadata.assetHash);
    expect(tenantA.artifacts.web.logoPrimaryHref).not.toBe(tenantB.artifacts.web.logoPrimaryHref);
  });

  it('shares compiled cache for identical branding across tenants', () => {
    const cachedProvider = createTestWhiteLabelProvider({ cache: { maxEntries: 10 } });
    const sharedBranding = FULL_ASSET_BRANDING_FIXTURE;

    const tenantA = cachedProvider.provide({
      tenantId: TENANT_A_ID,
      tenantBranding: sharedBranding,
      surfaces: ['web'],
    });
    const tenantB = cachedProvider.provide({
      tenantId: TENANT_B_ID,
      tenantBranding: sharedBranding,
      surfaces: ['web'],
    });

    expect(tenantA.metadata.assetHash).toBe(tenantB.metadata.assetHash);
    expect(tenantA.compiledAt).toBe(tenantB.compiledAt);
    expect(tenantB.fromCache).toBe(true);
    expect(tenantA.resolved.tenantId).toBe(TENANT_A_ID);
    expect(tenantB.resolved.tenantId).toBe(TENANT_B_ID);
  });

  it('compiles selected surfaces only', () => {
    const result = provider.provide({
      tenantBranding: FULL_ASSET_BRANDING_FIXTURE,
      surfaces: ['web', 'mobile'],
    });

    expect(result.artifacts.web).toBeDefined();
    expect(result.artifacts.mobile).toBeDefined();
    expect(result.artifacts['admin-dashboard']).toBeUndefined();
  });

  it('uses custom emitterRegistry when provided', () => {
    const registry = new DefaultBrandEmitterRegistry([new WebBrandEmitter()]);
    const customProvider = createTestWhiteLabelProvider({ emitterRegistry: registry });
    const result = customProvider.provide({
      tenantBranding: TENANT_BRANDING_FIXTURE,
      surfaces: ['web'],
    });

    expect(result.artifacts.web.surface).toBe('web');
  });
});
