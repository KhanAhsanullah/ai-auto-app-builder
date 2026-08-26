import { describe, expect, it } from 'vitest';

import { createWebStore } from '../src/infrastructure/create-web-store.js';
import { createWebStoreFromShell, WebStore } from '../src/domain/web-store.js';
import { WebStoreShellResolver } from '../src/domain/web-store-shell-resolver.js';
import { toResolveWebStoreShellInput } from '../src/domain/map-config-provider-result.js';
import { loadResolvedTenantConfig } from './helpers.js';

describe('createWebStore', () => {
  it('resolves shell and default screens from tenant config', () => {
    const store = createWebStore({ config: loadResolvedTenantConfig() });

    expect(store).toBeInstanceOf(WebStore);
    expect(store.shell.enabled).toBe(true);
    expect(store.initialRoute).toBe('store.home');
    expect(store.hasScreen('store.catalog')).toBe(true);

    const viewModel = store.getViewModel();
    expect(viewModel.activeRoute).toBe('store.home');
    expect(viewModel.shell.seo.title).toContain('Fresh Grocery');
  });

  it('supports createWebStoreFromShell and extra screens', () => {
    const shell = new WebStoreShellResolver().resolve(
      toResolveWebStoreShellInput(loadResolvedTenantConfig()),
    );
    const store = createWebStoreFromShell({
      shell,
      extraScreens: [
        {
          route: 'store.about',
          title: 'About',
          description: 'Our story',
        },
      ],
      initialRoute: 'store.cart',
    });

    expect(store.initialRoute).toBe('store.cart');
    expect(store.hasScreen('store.about')).toBe(true);
    store.registerScreen({ route: 'store.contact', title: 'Contact' });
    expect(store.hasScreen('store.contact')).toBe(true);
  });
});
