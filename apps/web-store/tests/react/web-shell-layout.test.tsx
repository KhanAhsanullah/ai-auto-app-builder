import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { buildWebShellViewModel } from '../../src/domain/build-web-shell-view-model.js';
import { toResolveWebStoreShellInput } from '../../src/domain/map-config-provider-result.js';
import { createDefaultWebScreenRegistry } from '../../src/domain/web-screen-registry.js';
import { WebStoreShellResolver } from '../../src/domain/web-store-shell-resolver.js';
import { WebShellLayout } from '../../src/react/web-shell-layout.js';
import { loadResolvedTenantConfig } from '../helpers.js';

afterEach(() => {
  cleanup();
});

describe('WebShellLayout', () => {
  function renderShell(activeRoute?: string) {
    const shell = new WebStoreShellResolver().resolve(
      toResolveWebStoreShellInput(loadResolvedTenantConfig()),
    );
    const viewModel = buildWebShellViewModel(shell, createDefaultWebScreenRegistry(), activeRoute);
    const onNavigate = vi.fn();
    render(<WebShellLayout viewModel={viewModel} onNavigate={onNavigate} />);
    return { onNavigate, viewModel };
  }

  it('renders branding, header title, top nav, and footer', () => {
    const { viewModel } = renderShell();

    expect(screen.getByTestId('web-shell-layout')).toBeTruthy();
    expect(screen.getByTestId('web-header-brand').textContent).toBe(
      viewModel.shell.branding.displayName,
    );
    expect(screen.getByTestId('web-header-title').textContent).toBe('Home');
    expect(screen.getByTestId('web-nav-home').getAttribute('data-active')).toBe('true');
    expect(screen.getByTestId('web-footer')).toBeTruthy();
  });

  it('invokes onNavigate when a top-nav item is clicked', () => {
    const { onNavigate } = renderShell('store.home');
    fireEvent.click(screen.getByTestId('web-nav-shop'));
    expect(onNavigate).toHaveBeenCalledWith('store.catalog');
  });

  it('shows the active screen description by default', () => {
    renderShell('store.cart');
    expect(screen.getByTestId('web-header-title').textContent).toBe('Cart');
    expect(screen.getByTestId('web-default-screen').getAttribute('data-route')).toBe('store.cart');
  });
});
