import { useCallback, useMemo, useState, type ReactNode } from 'react';

import type { WebStore } from '../domain/web-store.js';
import { WebShellLayout } from './web-shell-layout.js';

export interface WebStoreAppProps {
  /** Facade instance from `createWebStore`. */
  store: WebStore;
  /**
   * Controlled active route. When omitted, the app owns navigation state
   * starting at `store.initialRoute`.
   */
  activeRoute?: string;
  /** Called on navigation (always). Use with controlled `activeRoute`. */
  onNavigate?: (route: string) => void;
  /**
   * Optional per-screen content.
   * When omitted, a branded default screen is shown.
   */
  renderScreen?: (input: {
    route: string;
    title: string;
    description?: string;
    brandName: string;
    seoTitle: string;
  }) => ReactNode;
}

/**
 * Stateful React app entry for the web storefront facade.
 * Navigation updates the active screen; hosts can control the route externally.
 */
export function WebStoreApp(props: WebStoreAppProps): ReactNode {
  const { store, activeRoute: controlledRoute, onNavigate, renderScreen } = props;
  const [internalRoute, setInternalRoute] = useState(store.initialRoute);
  const activeRoute = controlledRoute ?? internalRoute;

  const viewModel = useMemo(() => store.getViewModel(activeRoute), [store, activeRoute]);

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
      brandName: viewModel.shell.branding.displayName,
      seoTitle: viewModel.shell.seo.title,
    })
  ) : (
    <BrandedDefaultScreen
      brandName={viewModel.shell.branding.displayName}
      title={viewModel.activeScreen.title}
      description={viewModel.activeScreen.description}
      route={viewModel.activeRoute}
      seoTitle={viewModel.shell.seo.title}
    />
  );

  return (
    <WebShellLayout viewModel={viewModel} onNavigate={handleNavigate}>
      {content}
    </WebShellLayout>
  );
}

function BrandedDefaultScreen(props: {
  brandName: string;
  title: string;
  description?: string;
  route: string;
  seoTitle: string;
}): ReactNode {
  return (
    <div data-testid="web-app-default-screen" data-route={props.route}>
      <p
        data-testid="web-app-welcome"
        style={{
          margin: '0 0 1.25rem',
          fontSize: '1.05rem',
          color: 'var(--web-text-muted, #64748b)',
        }}
      >
        Welcome to <strong style={{ color: 'var(--web-text, #0f172a)' }}>{props.brandName}</strong>
        {' — '}
        {props.title}
      </p>
      {props.description ? (
        <p
          data-testid="web-app-screen-description"
          style={{ margin: '0 0 1rem', maxWidth: '40rem', lineHeight: 1.5 }}
        >
          {props.description}
        </p>
      ) : null}
      <p
        data-testid="web-app-seo-title"
        style={{ margin: 0, fontSize: '0.85rem', color: 'var(--web-text-muted, #64748b)' }}
      >
        {props.seoTitle}
      </p>
    </div>
  );
}
