import { describe, expect, it } from 'vitest';

import { createAdminDashboard } from '../src/infrastructure/create-admin-dashboard.js';
import { loadResolvedTenantConfig } from './helpers.js';

describe('createAdminDashboard', () => {
  it('resolves shell and default screens from tenant config', () => {
    const dashboard = createAdminDashboard({
      config: loadResolvedTenantConfig(),
      roles: ['manager', 'staff'],
    });

    expect(dashboard.shell.tenant.slug).toBeTruthy();
    expect(dashboard.initialRoute).toBe('admin.dashboard');
    expect(dashboard.hasScreen('admin.orders')).toBe(true);

    const viewModel = dashboard.getViewModel();
    expect(viewModel.activeScreen.title).toBe('Dashboard');
    expect(viewModel.activeWidgets.length).toBeGreaterThan(0);
  });

  it('honors initialRoute override', () => {
    const dashboard = createAdminDashboard({
      config: loadResolvedTenantConfig(),
      initialRoute: 'admin.settings',
    });

    expect(dashboard.initialRoute).toBe('admin.settings');
    expect(dashboard.getViewModel().activeRoute).toBe('admin.settings');
  });

  it('registers extra screens', () => {
    const dashboard = createAdminDashboard({
      config: loadResolvedTenantConfig(),
      extraScreens: [
        {
          route: 'admin.reports',
          title: 'Reports',
          description: 'Merchant analytics.',
        },
      ],
    });

    expect(dashboard.hasScreen('admin.reports')).toBe(true);
    expect(dashboard.getViewModel('admin.reports').activeScreen.title).toBe('Reports');
  });
});
