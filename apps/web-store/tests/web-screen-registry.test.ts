import { describe, expect, it } from 'vitest';

import { buildWebShellViewModel } from '../src/domain/build-web-shell-view-model.js';
import { toResolveWebStoreShellInput } from '../src/domain/map-config-provider-result.js';
import {
  WebScreenRegistry,
  createDefaultWebScreenRegistry,
} from '../src/domain/web-screen-registry.js';
import { WebStoreShellResolver } from '../src/domain/web-store-shell-resolver.js';
import { WebStoreResolutionException } from '../src/errors.js';
import { loadResolvedTenantConfig } from './helpers.js';

describe('WebScreenRegistry', () => {
  it('registers and resolves default screens', () => {
    const registry = createDefaultWebScreenRegistry();
    expect(registry.list().length).toBeGreaterThanOrEqual(4);
    expect(registry.resolve('store.catalog').title).toBe('Shop');
  });

  it('throws for unknown routes', () => {
    const registry = new WebScreenRegistry();
    expect(() => registry.resolve('store.missing')).toThrow(WebStoreResolutionException);
  });

  it('resolves active screen from landing route', () => {
    const shell = new WebStoreShellResolver().resolve(
      toResolveWebStoreShellInput(loadResolvedTenantConfig()),
    );
    const registry = createDefaultWebScreenRegistry();
    const active = registry.resolveActiveScreen(shell);
    expect(active.route).toBe('store.home');
  });

  it('prefers explicit activeRoute when registered', () => {
    const shell = new WebStoreShellResolver().resolve(
      toResolveWebStoreShellInput(loadResolvedTenantConfig()),
    );
    const registry = createDefaultWebScreenRegistry();
    expect(registry.resolveActiveScreen(shell, 'store.cart').route).toBe('store.cart');
  });
});

describe('buildWebShellViewModel', () => {
  it('exposes primary and footer nav from the resolved shell', () => {
    const shell = new WebStoreShellResolver().resolve(
      toResolveWebStoreShellInput(loadResolvedTenantConfig()),
    );
    const viewModel = buildWebShellViewModel(shell, createDefaultWebScreenRegistry(), 'store.home');

    expect(viewModel.activeRoute).toBe('store.home');
    expect(viewModel.primaryNav.length).toBeGreaterThan(0);
    expect(viewModel.footerNav.length).toBeGreaterThan(0);
    expect(viewModel.activeScreen.title).toBe('Home');
  });
});
