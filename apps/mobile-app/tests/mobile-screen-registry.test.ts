import { describe, expect, it } from 'vitest';

import { buildMobileShellViewModel } from '../src/domain/build-mobile-shell-view-model.js';
import { toResolveMobileAppShellInput } from '../src/domain/map-config-provider-result.js';
import { MobileAppShellResolver } from '../src/domain/mobile-app-shell-resolver.js';
import {
  createDefaultMobileScreenRegistry,
  MobileScreenRegistry,
} from '../src/domain/mobile-screen-registry.js';
import { MobileAppResolutionException } from '../src/errors.js';
import { loadResolvedTenantConfig } from './helpers.js';

describe('MobileScreenRegistry', () => {
  it('registers and resolves default screens', () => {
    const registry = createDefaultMobileScreenRegistry();
    expect(registry.list()).toHaveLength(4);
    expect(registry.resolve('store.catalog').title).toBe('Shop');
  });

  it('throws for unknown routes', () => {
    const registry = new MobileScreenRegistry();
    expect(() => registry.resolve('store.missing')).toThrow(MobileAppResolutionException);
  });

  it('resolves active screen from landing route', () => {
    const shell = new MobileAppShellResolver().resolve(
      toResolveMobileAppShellInput(loadResolvedTenantConfig()),
    );
    const registry = createDefaultMobileScreenRegistry();
    expect(registry.resolveActiveScreen(shell).route).toBe('store.home');
  });

  it('prefers explicit activeRoute when registered', () => {
    const shell = new MobileAppShellResolver().resolve(
      toResolveMobileAppShellInput(loadResolvedTenantConfig()),
    );
    const registry = createDefaultMobileScreenRegistry();
    expect(registry.resolveActiveScreen(shell, 'store.profile').route).toBe('store.profile');
  });
});

describe('buildMobileShellViewModel', () => {
  it('builds tab items from primary navigation', () => {
    const shell = new MobileAppShellResolver().resolve(
      toResolveMobileAppShellInput(loadResolvedTenantConfig()),
    );
    const viewModel = buildMobileShellViewModel(
      shell,
      createDefaultMobileScreenRegistry(),
      'store.orders',
    );

    expect(viewModel.activeRoute).toBe('store.orders');
    expect(viewModel.activeScreen.title).toBe('Orders');
    expect(viewModel.tabItems.map((item) => item.id)).toEqual([
      'home',
      'shop',
      'orders',
      'profile',
    ]);
  });
});
