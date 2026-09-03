import { describe, expect, it } from 'vitest';

import { AdminDashboardShellResolver } from '../src/domain/admin-dashboard-shell-resolver.js';
import {
  AdminScreenRegistry,
  createDefaultAdminScreenRegistry,
} from '../src/domain/admin-screen-registry.js';
import { buildAdminShellViewModel } from '../src/domain/build-admin-shell-view-model.js';
import { toResolveAdminDashboardShellInput } from '../src/domain/map-config-provider-result.js';
import { AdminDashboardResolutionException } from '../src/errors.js';
import { loadResolvedTenantConfig } from './helpers.js';

describe('AdminScreenRegistry', () => {
  it('registers and resolves default screens', () => {
    const registry = createDefaultAdminScreenRegistry();
    expect(registry.list()).toHaveLength(5);
    expect(registry.resolve('admin.orders').title).toBe('Orders');
    expect(registry.resolve('admin.carts').title).toBe('Carts');
  });

  it('throws for unknown routes', () => {
    const registry = new AdminScreenRegistry();
    expect(() => registry.resolve('admin.missing')).toThrow(AdminDashboardResolutionException);
  });

  it('resolves active screen from landing route', () => {
    const shell = new AdminDashboardShellResolver().resolve(
      toResolveAdminDashboardShellInput(loadResolvedTenantConfig(), {
        roles: ['manager'],
      }),
    );
    const registry = createDefaultAdminScreenRegistry();
    const active = registry.resolveActiveScreen(shell);
    expect(active.route).toBe('admin.dashboard');
  });

  it('prefers explicit activeRoute when registered', () => {
    const shell = new AdminDashboardShellResolver().resolve(
      toResolveAdminDashboardShellInput(loadResolvedTenantConfig()),
    );
    const registry = createDefaultAdminScreenRegistry();
    expect(registry.resolveActiveScreen(shell, 'admin.settings').route).toBe('admin.settings');
  });
});

describe('buildAdminShellViewModel', () => {
  it('intersects screen widgets with role-filtered shell widgets', () => {
    const shell = new AdminDashboardShellResolver().resolve(
      toResolveAdminDashboardShellInput(loadResolvedTenantConfig(), {
        roles: ['manager', 'staff'],
      }),
    );
    const viewModel = buildAdminShellViewModel(
      shell,
      createDefaultAdminScreenRegistry(),
      'admin.dashboard',
    );

    expect(viewModel.activeRoute).toBe('admin.dashboard');
    expect(viewModel.activeWidgets.map((widget) => widget.id)).toEqual([
      'orders-summary',
      'revenue-chart',
    ]);
  });
});
