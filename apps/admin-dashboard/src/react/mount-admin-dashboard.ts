import { createRoot, type Root } from 'react-dom/client';
import { createElement } from 'react';

import type { AdminDashboard } from '../domain/admin-dashboard.js';
import { AdminDashboardApp, type AdminDashboardAppProps } from './admin-dashboard-app.js';

export interface MountAdminDashboardOptions {
  dashboard: AdminDashboard;
  /** DOM host element or CSS selector. */
  container: Element | string;
  activeRoute?: AdminDashboardAppProps['activeRoute'];
  onNavigate?: AdminDashboardAppProps['onNavigate'];
  renderScreen?: AdminDashboardAppProps['renderScreen'];
}

export interface MountedAdminDashboard {
  root: Root;
  unmount: () => void;
}

/**
 * Mount the admin dashboard React app into a DOM container (SPA / embed hosts).
 */
export function mountAdminDashboard(options: MountAdminDashboardOptions): MountedAdminDashboard {
  const element =
    typeof options.container === 'string'
      ? document.querySelector(options.container)
      : options.container;

  if (!element) {
    throw new Error(
      typeof options.container === 'string'
        ? `Admin dashboard mount container not found: '${options.container}'.`
        : 'Admin dashboard mount container element is required.',
    );
  }

  const root = createRoot(element);
  root.render(
    createElement(AdminDashboardApp, {
      dashboard: options.dashboard,
      activeRoute: options.activeRoute,
      onNavigate: options.onNavigate,
      renderScreen: options.renderScreen,
    }),
  );

  return {
    root,
    unmount: () => {
      root.unmount();
    },
  };
}
