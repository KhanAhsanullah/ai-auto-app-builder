import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { buildMobileShellViewModel } from '../../src/domain/build-mobile-shell-view-model.js';
import { toResolveMobileAppShellInput } from '../../src/domain/map-config-provider-result.js';
import { MobileAppShellResolver } from '../../src/domain/mobile-app-shell-resolver.js';
import { createDefaultMobileScreenRegistry } from '../../src/domain/mobile-screen-registry.js';
import { MobileShellLayout } from '../../src/native/mobile-shell-layout.js';
import { loadResolvedTenantConfig } from '../helpers.js';

afterEach(() => {
  cleanup();
});

describe('MobileShellLayout', () => {
  function renderShell(activeRoute?: string) {
    const shell = new MobileAppShellResolver().resolve(
      toResolveMobileAppShellInput(loadResolvedTenantConfig()),
    );
    const viewModel = buildMobileShellViewModel(
      shell,
      createDefaultMobileScreenRegistry(),
      activeRoute,
    );
    const onNavigate = vi.fn();
    render(<MobileShellLayout viewModel={viewModel} onNavigate={onNavigate} />);
    return { onNavigate, viewModel };
  }

  it('renders branding, title, and bottom tabs', () => {
    const { viewModel } = renderShell();

    expect(screen.getByTestId('mobile-shell-layout')).toBeTruthy();
    expect(screen.getByTestId('mobile-header-brand').textContent).toBe(
      viewModel.shell.branding.displayName,
    );
    expect(screen.getByTestId('mobile-header-title').textContent).toBe('Home');
    expect(screen.getByTestId('mobile-bottom-bar')).toBeTruthy();
    expect(screen.getByTestId('mobile-tab-home').getAttribute('aria-selected')).toBe('true');
  });

  it('invokes onNavigate when a tab is pressed', () => {
    const { onNavigate } = renderShell('store.home');
    fireEvent.click(screen.getByTestId('mobile-tab-shop'));
    expect(onNavigate).toHaveBeenCalledWith('store.catalog');
  });

  it('shows the active screen content for profile', () => {
    renderShell('store.profile');
    expect(screen.getByTestId('mobile-header-title').textContent).toBe('Profile');
    expect(screen.getByTestId('mobile-welcome').textContent).toContain('Welcome to');
  });
});
