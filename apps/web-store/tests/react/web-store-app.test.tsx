import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { createWebStore } from '../../src/infrastructure/create-web-store.js';
import { WebStoreApp } from '../../src/react/web-store-app.js';
import { loadResolvedTenantConfig } from '../helpers.js';

afterEach(() => {
  cleanup();
});

describe('WebStoreApp', () => {
  it('renders branded welcome and navigates between screens', () => {
    const store = createWebStore({ config: loadResolvedTenantConfig() });
    const onNavigate = vi.fn();

    render(<WebStoreApp store={store} onNavigate={onNavigate} />);

    expect(screen.getByTestId('web-app-welcome').textContent).toContain(
      store.shell.branding.displayName,
    );
    expect(screen.getByTestId('web-app-seo-title').textContent).toBe(store.shell.seo.title);

    fireEvent.click(screen.getByTestId('web-nav-shop'));
    expect(onNavigate).toHaveBeenCalledWith('store.catalog');
    expect(screen.getByTestId('web-header-title').textContent).toBe('Shop');
  });

  it('supports controlled activeRoute', () => {
    const store = createWebStore({ config: loadResolvedTenantConfig() });

    const { rerender } = render(<WebStoreApp store={store} activeRoute="store.cart" />);

    expect(screen.getByTestId('web-header-title').textContent).toBe('Cart');

    rerender(<WebStoreApp store={store} activeRoute="store.orders" />);
    expect(screen.getByTestId('web-header-title').textContent).toBe('Orders');
  });
});
