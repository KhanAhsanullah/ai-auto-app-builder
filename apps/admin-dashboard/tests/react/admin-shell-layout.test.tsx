import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { AdminDashboardShellResolver } from '../../src/domain/admin-dashboard-shell-resolver.js';
import { createDefaultAdminScreenRegistry } from '../../src/domain/admin-screen-registry.js';
import { buildAdminShellViewModel } from '../../src/domain/build-admin-shell-view-model.js';
import { toResolveAdminDashboardShellInput } from '../../src/domain/map-config-provider-result.js';
import { AdminShellLayout } from '../../src/react/admin-shell-layout.js';
import { loadResolvedTenantConfig } from '../helpers.js';

afterEach(() => {
  cleanup();
});

describe('AdminShellLayout', () => {
  function renderShell(activeRoute?: string) {
    const shell = new AdminDashboardShellResolver().resolve(
      toResolveAdminDashboardShellInput(loadResolvedTenantConfig(), {
        roles: ['manager', 'staff'],
      }),
    );
    const viewModel = buildAdminShellViewModel(
      shell,
      createDefaultAdminScreenRegistry(),
      activeRoute,
    );
    const onNavigate = vi.fn();
    render(<AdminShellLayout viewModel={viewModel} onNavigate={onNavigate} />);
    return { onNavigate, viewModel };
  }

  it('renders branding, header title, and dashboard widgets', () => {
    const { viewModel } = renderShell();

    expect(screen.getByTestId('admin-shell-layout')).toBeTruthy();
    expect(screen.getByTestId('admin-sidebar-brand').textContent).toBe(
      viewModel.shell.branding.displayName,
    );
    expect(screen.getByTestId('admin-header-title').textContent).toBe('Dashboard');
    expect(screen.getByTestId('admin-widget-orders-summary')).toBeTruthy();
    expect(screen.getByTestId('admin-nav-dashboard').getAttribute('data-active')).toBe('true');
  });

  it('invokes onNavigate when a sidebar item is clicked', () => {
    const { onNavigate } = renderShell('admin.dashboard');
    fireEvent.click(screen.getByTestId('admin-nav-orders'));
    expect(onNavigate).toHaveBeenCalledWith('admin.orders');
  });

  it('shows empty widgets state for non-dashboard screens', () => {
    renderShell('admin.settings');
    expect(screen.getByTestId('admin-header-title').textContent).toBe('Settings');
    expect(screen.getByTestId('admin-empty-widgets')).toBeTruthy();
  });
});
