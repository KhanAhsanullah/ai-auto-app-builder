import type { ReactNode } from 'react';

import type { AdminShellViewModel } from '../domain/build-admin-shell-view-model.js';
import { AdminHeader } from './admin-header.js';
import { AdminSidebar } from './admin-sidebar.js';

export interface AdminShellLayoutProps {
  viewModel: AdminShellViewModel;
  onNavigate?: (route: string) => void;
  /** Optional content override; defaults to screen title + widgets placeholder. */
  children?: ReactNode;
}

/**
 * React admin shell: sidebar + header + content region driven by shell view-model.
 */
export function AdminShellLayout(props: AdminShellLayoutProps): ReactNode {
  const { viewModel, onNavigate, children } = props;
  const { shell, activeScreen, primaryNav, activeWidgets } = viewModel;

  return (
    <div
      data-testid="admin-shell-layout"
      style={{
        display: 'flex',
        minHeight: '100vh',
        background: 'var(--admin-content-bg, #f8fafc)',
        color: 'var(--admin-text, #0f172a)',
        fontFamily: 'var(--admin-font-sans, system-ui, sans-serif)',
      }}
    >
      <AdminSidebar
        brandName={shell.branding.displayName}
        items={primaryNav}
        activeRoute={viewModel.activeRoute}
        sidebarStyle={shell.layout.sidebarStyle}
        onNavigate={onNavigate}
      />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <AdminHeader
          title={activeScreen.title}
          subtitle={activeScreen.description}
          tenantName={shell.tenant.name}
          logoUrl={shell.branding.logoPrimary}
        />
        <main
          data-testid="admin-shell-content"
          style={{ flex: 1, padding: '1.25rem', boxSizing: 'border-box' }}
        >
          {children ?? <DefaultScreenContent route={activeScreen.route} widgets={activeWidgets} />}
        </main>
      </div>
    </div>
  );
}

function DefaultScreenContent(props: {
  route: string;
  widgets: readonly { id: string; position: number }[];
}): ReactNode {
  return (
    <div data-testid="admin-default-screen" data-route={props.route}>
      {props.widgets.length > 0 ? (
        <ul data-testid="admin-widget-list" style={{ margin: 0, paddingLeft: '1.25rem' }}>
          {props.widgets.map((widget) => (
            <li key={widget.id} data-testid={`admin-widget-${widget.id}`}>
              {widget.id}
            </li>
          ))}
        </ul>
      ) : (
        <p data-testid="admin-empty-widgets" style={{ margin: 0, color: '#64748b' }}>
          No widgets configured for this screen.
        </p>
      )}
    </div>
  );
}
