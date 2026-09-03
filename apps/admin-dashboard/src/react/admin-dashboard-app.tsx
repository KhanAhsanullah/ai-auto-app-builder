import { useCallback, useMemo, useState, type ReactNode } from 'react';

import type { AdminDashboard } from '../domain/admin-dashboard.js';
import { AdminShellLayout } from './admin-shell-layout.js';
import { AdminCartsScreen } from './screens/admin-carts-screen.js';
import { AdminCatalogScreen } from './screens/admin-catalog-screen.js';
import { AdminOrdersScreen } from './screens/admin-orders-screen.js';

export interface AdminDashboardAppProps {
  /** Facade instance from `createAdminDashboard`. */
  dashboard: AdminDashboard;
  /**
   * Controlled active route. When omitted, the app owns navigation state
   * starting at `dashboard.initialRoute`.
   */
  activeRoute?: string;
  /** Called on sidebar navigation (always). Use with controlled `activeRoute`. */
  onNavigate?: (route: string) => void;
  /**
   * Optional per-screen content. Receives the active route and view-model widgets.
   * When omitted, commerce screens (e.g. catalog) or a branded default is shown.
   */
  renderScreen?: (input: {
    route: string;
    title: string;
    description?: string;
    widgets: readonly { id: string; position: number }[];
    brandName: string;
  }) => ReactNode;
}

/**
 * Stateful React app entry for the admin dashboard facade.
 * Navigation updates the active screen; hosts can control the route externally.
 */
export function AdminDashboardApp(props: AdminDashboardAppProps): ReactNode {
  const { dashboard, activeRoute: controlledRoute, onNavigate, renderScreen } = props;
  const [internalRoute, setInternalRoute] = useState(dashboard.initialRoute);
  const activeRoute = controlledRoute ?? internalRoute;

  const viewModel = useMemo(() => dashboard.getViewModel(activeRoute), [dashboard, activeRoute]);

  const handleNavigate = useCallback(
    (route: string) => {
      if (controlledRoute === undefined) {
        setInternalRoute(route);
      }
      onNavigate?.(route);
    },
    [controlledRoute, onNavigate],
  );

  const content = renderScreen ? (
    renderScreen({
      route: viewModel.activeRoute,
      title: viewModel.activeScreen.title,
      description: viewModel.activeScreen.description,
      widgets: viewModel.activeWidgets,
      brandName: viewModel.shell.branding.displayName,
    })
  ) : viewModel.activeRoute === 'admin.catalog' && dashboard.isCatalogAvailable() ? (
    <AdminCatalogScreen dashboard={dashboard} />
  ) : viewModel.activeRoute === 'admin.carts' && dashboard.isCartAvailable() ? (
    <AdminCartsScreen dashboard={dashboard} />
  ) : viewModel.activeRoute === 'admin.orders' && dashboard.isOrderAvailable() ? (
    <AdminOrdersScreen dashboard={dashboard} />
  ) : (
    <BrandedDefaultScreen
      brandName={viewModel.shell.branding.displayName}
      title={viewModel.activeScreen.title}
      description={viewModel.activeScreen.description}
      route={viewModel.activeRoute}
      widgets={viewModel.activeWidgets}
    />
  );

  return (
    <AdminShellLayout viewModel={viewModel} onNavigate={handleNavigate}>
      {content}
    </AdminShellLayout>
  );
}

function BrandedDefaultScreen(props: {
  brandName: string;
  title: string;
  description?: string;
  route: string;
  widgets: readonly { id: string; position: number }[];
}): ReactNode {
  return (
    <div data-testid="admin-app-default-screen" data-route={props.route}>
      <p
        data-testid="admin-app-welcome"
        style={{
          margin: '0 0 1.25rem',
          fontSize: '1.05rem',
          color: 'var(--admin-text-muted, #64748b)',
        }}
      >
        Welcome to{' '}
        <strong style={{ color: 'var(--admin-text, #0f172a)' }}>{props.brandName}</strong>
        {' — '}
        {props.title}
      </p>
      {props.description ? (
        <p
          data-testid="admin-app-screen-description"
          style={{ margin: '0 0 1.5rem', maxWidth: '40rem', lineHeight: 1.5 }}
        >
          {props.description}
        </p>
      ) : null}
      {props.widgets.length > 0 ? (
        <div
          data-testid="admin-app-widget-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(14rem, 1fr))',
            gap: '1rem',
          }}
        >
          {props.widgets.map((widget) => (
            <article
              key={widget.id}
              data-testid={`admin-app-widget-${widget.id}`}
              style={{
                background: 'var(--admin-surface, #ffffff)',
                border: '1px solid var(--admin-border, #e2e8f0)',
                borderRadius: '0.75rem',
                padding: '1rem 1.1rem',
                boxShadow: '0 1px 2px rgb(15 23 42 / 6%)',
              }}
            >
              <h2 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600 }}>{widget.id}</h2>
              <p
                style={{
                  margin: '0.4rem 0 0',
                  fontSize: '0.8rem',
                  color: 'var(--admin-text-muted, #64748b)',
                }}
              >
                Widget slot ready for merchant data.
              </p>
            </article>
          ))}
        </div>
      ) : (
        <p data-testid="admin-app-empty-widgets" style={{ margin: 0, color: '#64748b' }}>
          This screen is ready — plug in merchant workflows next.
        </p>
      )}
    </div>
  );
}
