import { describe, expect, it } from 'vitest';

import { BrandCompilationException } from '../src/errors.js';
import {
  createBrandCompiler,
  FULL_ASSET_BRANDING_FIXTURE,
  OTHER_TENANT_BRANDING_FIXTURE,
  TENANT_A_ID,
  TENANT_B_ID,
  TENANT_BRANDING_FIXTURE,
} from './helpers.js';
import type { CompiledBrandResult } from '../src/types.js';

function assertCompiledBrandShape(result: CompiledBrandResult): void {
  expect(result.assets).toBeDefined();
  expect(result.metadata.brandHash).toMatch(/^[a-f0-9]{64}$/);
  expect(result.metadata.assetHash).toMatch(/^[a-f0-9]{64}$/);
  expect(result.manifest.version).toBe(1);
  expect(result.manifest.brandHash).toBe(result.metadata.brandHash);
  expect(result.manifest.assetHash).toBe(result.metadata.assetHash);
  expect(Array.isArray(result.manifest.assets)).toBe(true);
  expect(result.compiledAt).toBeDefined();
}

describe('BrandCompiler', () => {
  const compiler = createBrandCompiler();

  it('compiles all default surfaces from resolver input', () => {
    const result = compiler.compile({ tenantBranding: FULL_ASSET_BRANDING_FIXTURE });

    assertCompiledBrandShape(result);
    expect(result.artifacts.web.surface).toBe('web');
    expect(result.artifacts.mobile.surface).toBe('mobile');
    expect(result.artifacts['admin-dashboard'].surface).toBe('admin-dashboard');
    expect(result.assets.appIconSource?.resolvedFrom).toBe('appIcon');
  });

  it('compiles selected surfaces only', () => {
    const result = compiler.compile({
      tenantBranding: FULL_ASSET_BRANDING_FIXTURE,
      surfaces: ['web', 'mobile'],
    });

    expect(result.artifacts.web).toBeDefined();
    expect(result.artifacts.mobile).toBeDefined();
    expect(result.artifacts['admin-dashboard']).toBeUndefined();
  });

  it('compileFromResolved matches compile output', () => {
    const resolved = compiler
      .getResolver()
      .resolve({ tenantBranding: FULL_ASSET_BRANDING_FIXTURE });

    const direct = compiler.compileFromResolved({ resolved });
    const viaConfig = compiler.compile({ tenantBranding: FULL_ASSET_BRANDING_FIXTURE });

    expect(direct.metadata.assetHash).toBe(viaConfig.metadata.assetHash);
    expect(direct.manifest.assets).toEqual(viaConfig.manifest.assets);
    expect(direct.artifacts.web.links).toEqual(viaConfig.artifacts.web.links);
  });

  it('uses cache for repeated compilations with same asset hash', () => {
    const cachedCompiler = createBrandCompiler({ cache: { maxEntries: 10 } });
    const input = { tenantBranding: FULL_ASSET_BRANDING_FIXTURE };

    const first = cachedCompiler.compile(input);
    const second = cachedCompiler.compile(input);

    expect(first).toBe(second);
    expect(cachedCompiler.getCached(first.metadata.assetHash)).toEqual(first);
  });

  it('produces different cache entries for different surface selections', () => {
    const cachedCompiler = createBrandCompiler({ cache: {} });
    const resolved = compiler
      .getResolver()
      .resolve({ tenantBranding: FULL_ASSET_BRANDING_FIXTURE });

    const allSurfaces = cachedCompiler.compileFromResolved({ resolved });
    const webOnly = cachedCompiler.compileFromResolved({ resolved, surfaces: ['web'] });

    expect(allSurfaces).not.toBe(webOnly);
    expect(webOnly.artifacts.web).toBeDefined();
    expect(webOnly.artifacts.mobile).toBeUndefined();
  });

  it('produces deterministic asset hashes for identical normalized input', () => {
    const first = compiler.compile({ tenantBranding: FULL_ASSET_BRANDING_FIXTURE });
    const second = compiler.compile({ tenantBranding: FULL_ASSET_BRANDING_FIXTURE });

    expect(first.metadata.assetHash).toBe(second.metadata.assetHash);
    expect(first.manifest).toEqual(second.manifest);
  });

  it('changes asset hash when asset references change', () => {
    const base = compiler.compile({ tenantBranding: FULL_ASSET_BRANDING_FIXTURE });
    const changed = compiler.compile({
      tenantBranding: {
        ...FULL_ASSET_BRANDING_FIXTURE,
        logo: {
          ...FULL_ASSET_BRANDING_FIXTURE.logo,
          appIcon: 'https://cdn.example.com/other-app-icon.png',
        },
      },
    });

    expect(base.metadata.assetHash).not.toBe(changed.metadata.assetHash);
  });

  it('isolates multiple tenants with no shared mutable state', () => {
    const first = compiler.compile({
      tenantId: TENANT_A_ID,
      tenantBranding: TENANT_BRANDING_FIXTURE,
    });
    const second = compiler.compile({
      tenantId: TENANT_B_ID,
      tenantBranding: OTHER_TENANT_BRANDING_FIXTURE,
    });

    expect(first.metadata.assetHash).not.toBe(second.metadata.assetHash);
    expect(first.assets.logos.primary?.url).not.toBe(second.assets.logos.primary?.url);
  });

  it('remains backward compatible for branding without new optional fields', () => {
    const result = compiler.compile({ tenantBranding: TENANT_BRANDING_FIXTURE });

    assertCompiledBrandShape(result);
    expect(result.assets.fonts).toBeUndefined();
    expect(result.assets.social).toBeUndefined();
    expect(result.assets.appIconSource?.resolvedFrom).toBe('primary');
  });

  it('clearCache removes cached compilations', () => {
    const cachedCompiler = createBrandCompiler({ cache: {} });
    const result = cachedCompiler.compile({ tenantBranding: TENANT_BRANDING_FIXTURE });

    expect(cachedCompiler.getCached(result.metadata.assetHash)).toBeDefined();

    cachedCompiler.clearCache();

    expect(cachedCompiler.getCached(result.metadata.assetHash)).toBeUndefined();
  });

  it('throws when no surfaces are requested', () => {
    expect(() =>
      compiler.compileFromResolved({
        resolved: compiler.getResolver().resolve({ tenantBranding: TENANT_BRANDING_FIXTURE }),
        surfaces: [],
      }),
    ).toThrow(BrandCompilationException);
  });
});
