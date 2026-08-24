import { describe, expect, it } from 'vitest';

import { createMobileApp } from '../src/infrastructure/create-mobile-app.js';
import { loadResolvedTenantConfig } from './helpers.js';

describe('createMobileApp', () => {
  it('resolves shell and default screens from tenant config', () => {
    const app = createMobileApp({
      config: loadResolvedTenantConfig(),
    });

    expect(app.shell.tenant.slug).toBeTruthy();
    expect(app.initialRoute).toBe('store.home');
    expect(app.hasScreen('store.catalog')).toBe(true);

    const viewModel = app.getViewModel();
    expect(viewModel.activeScreen.title).toBe('Home');
    expect(viewModel.tabItems.length).toBeGreaterThan(0);
  });

  it('honors initialRoute override', () => {
    const app = createMobileApp({
      config: loadResolvedTenantConfig(),
      initialRoute: 'store.profile',
    });

    expect(app.initialRoute).toBe('store.profile');
    expect(app.getViewModel().activeRoute).toBe('store.profile');
  });

  it('registers extra screens', () => {
    const app = createMobileApp({
      config: loadResolvedTenantConfig(),
      extraScreens: [
        {
          route: 'store.wishlist',
          title: 'Wishlist',
          description: 'Saved products.',
        },
      ],
    });

    expect(app.hasScreen('store.wishlist')).toBe(true);
    expect(app.getViewModel('store.wishlist').activeScreen.title).toBe('Wishlist');
  });
});
