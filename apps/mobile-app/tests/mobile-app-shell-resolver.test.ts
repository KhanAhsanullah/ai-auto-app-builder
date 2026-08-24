import { describe, expect, it } from 'vitest';

import { toResolveMobileAppShellInput } from '../src/domain/map-config-provider-result.js';
import { MobileAppShellResolver } from '../src/domain/mobile-app-shell-resolver.js';
import { MobileAppResolutionException } from '../src/errors.js';
import { loadResolvedTenantConfig } from './helpers.js';

describe('MobileAppShellResolver', () => {
  const resolver = new MobileAppShellResolver();

  it('resolves shell from ConfigProvider output', () => {
    const config = loadResolvedTenantConfig();
    const shell = resolver.resolve(toResolveMobileAppShellInput({ config }));

    expect(shell.enabled).toBe(true);
    expect(shell.tenant.slug).toBe(config.tenant.slug);
    expect(shell.branding.displayName).toBe(config.company.displayName);
    expect(shell.identity.bundleId).toBe(config.mobileApp.identity.bundleId);
    expect(shell.identity.appName).toBe(config.mobileApp.identity.appName);
    expect(shell.navigation.style).toBe('bottom-bar');
    expect(shell.navigation.primary.length).toBeGreaterThan(0);
    expect(shell.defaultLandingRoute).toBe('store.home');
    expect(shell.runtime.deepLinking?.scheme).toBe('freshgrocery');
  });

  it('throws when mobile app is disabled', () => {
    const config = loadResolvedTenantConfig();
    const disabled = {
      ...config,
      mobileApp: {
        ...config.mobileApp,
        enabled: false,
      },
    };

    expect(() => resolver.resolve(toResolveMobileAppShellInput(disabled))).toThrow(
      MobileAppResolutionException,
    );
  });
});
