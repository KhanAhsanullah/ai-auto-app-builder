import { describe, expect, it } from 'vitest';

import { AdminDashboardShellResolver } from '../src/domain/admin-dashboard-shell-resolver.js';
import { toResolveAdminDashboardShellInput } from '../src/domain/map-config-provider-result.js';
import { AdminDashboardResolutionException } from '../src/errors.js';
import { loadResolvedTenantConfig } from './helpers.js';

describe('AdminDashboardShellResolver', () => {
  const resolver = new AdminDashboardShellResolver();

  it('resolves shell from ConfigProvider output', () => {
    const config = loadResolvedTenantConfig();

    const shell = resolver.resolve(
      toResolveAdminDashboardShellInput({ config }, { roles: ['manager', 'staff'] }),
    );

    expect(shell.enabled).toBe(true);
    expect(shell.tenant.slug).toBe(config.tenant.slug);
    expect(shell.branding.displayName).toBe(config.company.displayName);
    expect(shell.branding.appName).toBe(config.branding.appName);
    expect(shell.navigation.primary.length).toBeGreaterThan(0);
    expect(shell.layout.defaultLandingRoute).toBe('admin.dashboard');
    expect(shell.layout.sidebarStyle).toBe('expanded');
    expect(shell.widgets.map((widget) => widget.id)).toEqual(['orders-summary', 'revenue-chart']);
  });

  it('excludes role-gated widgets when roles are missing', () => {
    const shell = resolver.resolve(toResolveAdminDashboardShellInput(loadResolvedTenantConfig()));
    expect(shell.widgets).toEqual([]);
  });

  it('throws when admin dashboard is disabled', () => {
    const config = loadResolvedTenantConfig();
    const disabled = {
      ...config,
      adminDashboard: {
        ...config.adminDashboard,
        enabled: false,
      },
    };

    expect(() => resolver.resolve(toResolveAdminDashboardShellInput(disabled))).toThrow(
      AdminDashboardResolutionException,
    );
  });
});
