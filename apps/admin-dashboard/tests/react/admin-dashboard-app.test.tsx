import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { createAdminDashboard } from '../../src/infrastructure/create-admin-dashboard.js';
import { AdminDashboardApp } from '../../src/react/admin-dashboard-app.js';
import { loadResolvedTenantConfig } from '../helpers.js';

afterEach(() => {
  cleanup();
});

describe('AdminDashboardApp', () => {
  it('renders branded welcome and navigates between screens', () => {
    const dashboard = createAdminDashboard({
      config: loadResolvedTenantConfig(),
      roles: ['manager', 'staff'],
    });
    const onNavigate = vi.fn();

    render(<AdminDashboardApp dashboard={dashboard} onNavigate={onNavigate} />);

    expect(screen.getByTestId('admin-app-welcome').textContent).toContain(
      dashboard.shell.branding.displayName,
    );
    expect(screen.getByTestId('admin-app-widget-orders-summary')).toBeTruthy();

    fireEvent.click(screen.getByTestId('admin-nav-settings'));
    expect(onNavigate).toHaveBeenCalledWith('admin.settings');
    expect(screen.getByTestId('admin-header-title').textContent).toBe('Settings');
    expect(screen.getByTestId('admin-app-empty-widgets')).toBeTruthy();
  });

  it('supports controlled activeRoute', () => {
    const dashboard = createAdminDashboard({
      config: loadResolvedTenantConfig(),
    });

    const { rerender } = render(
      <AdminDashboardApp dashboard={dashboard} activeRoute="admin.catalog" />,
    );

    expect(screen.getByTestId('admin-header-title').textContent).toBe('Catalog');

    rerender(<AdminDashboardApp dashboard={dashboard} activeRoute="admin.orders" />);
    expect(screen.getByTestId('admin-header-title').textContent).toBe('Orders');
  });
});
