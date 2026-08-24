import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { createMobileApp } from '../../src/infrastructure/create-mobile-app.js';
import { MobileAppRoot } from '../../src/native/mobile-app-root.js';
import { loadResolvedTenantConfig } from '../helpers.js';

afterEach(() => {
  cleanup();
});

describe('MobileAppRoot', () => {
  it('renders branded welcome and navigates between tabs', () => {
    const app = createMobileApp({
      config: loadResolvedTenantConfig(),
    });
    const onNavigate = vi.fn();

    render(<MobileAppRoot app={app} onNavigate={onNavigate} />);

    expect(screen.getByTestId('mobile-app-welcome').textContent).toContain(
      app.shell.branding.displayName,
    );
    expect(screen.getByTestId('mobile-app-store-name').textContent).toBe(
      app.shell.identity.appName,
    );
    expect(screen.getByTestId('mobile-header-title').textContent).toBe('Home');

    fireEvent.click(screen.getByTestId('mobile-tab-orders'));
    expect(onNavigate).toHaveBeenCalledWith('store.orders');
    expect(screen.getByTestId('mobile-header-title').textContent).toBe('Orders');
  });

  it('supports controlled activeRoute', () => {
    const app = createMobileApp({
      config: loadResolvedTenantConfig(),
    });

    const { rerender } = render(<MobileAppRoot app={app} activeRoute="store.catalog" />);
    expect(screen.getByTestId('mobile-header-title').textContent).toBe('Shop');

    rerender(<MobileAppRoot app={app} activeRoute="store.profile" />);
    expect(screen.getByTestId('mobile-header-title').textContent).toBe('Profile');
  });
});
