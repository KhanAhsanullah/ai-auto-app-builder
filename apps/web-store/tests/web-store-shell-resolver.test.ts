import { describe, expect, it } from 'vitest';

import { toResolveWebStoreShellInput } from '../src/domain/map-config-provider-result.js';
import { WebStoreShellResolver } from '../src/domain/web-store-shell-resolver.js';
import { WebStoreResolutionException } from '../src/errors.js';
import { loadResolvedTenantConfig } from './helpers.js';

describe('WebStoreShellResolver', () => {
  const resolver = new WebStoreShellResolver();

  it('resolves shell from ConfigProvider output', () => {
    const config = loadResolvedTenantConfig();
    const shell = resolver.resolve(toResolveWebStoreShellInput({ config }));

    expect(shell.enabled).toBe(true);
    expect(shell.tenant.slug).toBe(config.tenant.slug);
    expect(shell.branding.displayName).toBe(config.company.displayName);
    expect(shell.domain.primary).toBe(config.webStore.domain.primary);
    expect(shell.seo.title).toBe(config.webStore.seo.title);
    expect(shell.rendering.mode).toBe('ssr');
    expect(shell.navigation.style).toBe('top-bar');
    expect(shell.navigation.primary.length).toBeGreaterThan(0);
    expect(shell.defaultLandingRoute).toBe('store.home');
    expect(shell.pwa?.enabled).toBe(true);
    expect(shell.legal?.termsOfServiceUrl).toBeDefined();
  });

  it('throws when web store is disabled', () => {
    const config = loadResolvedTenantConfig();
    const disabled = {
      ...config,
      webStore: {
        ...config.webStore,
        enabled: false,
      },
    };

    expect(() => resolver.resolve(toResolveWebStoreShellInput(disabled))).toThrow(
      WebStoreResolutionException,
    );
  });

  it('throws when primary navigation resolves empty', () => {
    const config = loadResolvedTenantConfig();
    const input = toResolveWebStoreShellInput(config);
    const emptyPrimary = {
      ...input,
      navigationWeb: {
        ...input.navigationWeb,
        primary: input.navigationWeb.primary.map((item) => ({ ...item, visible: false })),
      },
    };

    expect(() => resolver.resolve(emptyPrimary)).toThrow(WebStoreResolutionException);
  });
});
