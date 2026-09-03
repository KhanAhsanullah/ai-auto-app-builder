import { useCallback, useMemo, useState, type ReactNode } from 'react';

import type { WebStore } from '../domain/web-store.js';
import { WebCartScreen } from './screens/web-cart-screen.js';
import { WebCatalogScreen } from './screens/web-catalog-screen.js';
import { WebCheckoutScreen } from './screens/web-checkout-screen.js';
import { WebOrdersScreen } from './screens/web-orders-screen.js';
import { WebPaymentConfirmScreen } from './screens/web-payment-confirm-screen.js';
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
   * Guest session id for cart / checkout / add-to-cart.
   * Defaults to `web-guest`.
   */
  sessionId?: string;
  /**
   * Optional completed checkout id for payment confirmation.
   * When omitted, the app remembers the last checkout completed in-session.
   */
  checkoutId?: string;
  /**
   * Optional per-screen content.
   * When omitted, commerce screens or a branded default is shown.
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
  const {
    store,
    activeRoute: controlledRoute,
    onNavigate,
    renderScreen,
    sessionId = 'web-guest',
    checkoutId: controlledCheckoutId,
  } = props;
  const [internalRoute, setInternalRoute] = useState(store.initialRoute);
  const [lastCheckoutId, setLastCheckoutId] = useState<string | undefined>();
  const activeRoute = controlledRoute ?? internalRoute;
  const checkoutId = controlledCheckoutId ?? lastCheckoutId;

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
    <DefaultCommerceContent
      store={store}
      route={viewModel.activeRoute}
      sessionId={sessionId}
      checkoutId={checkoutId}
      brandName={viewModel.shell.branding.displayName}
      title={viewModel.activeScreen.title}
      description={viewModel.activeScreen.description}
      seoTitle={viewModel.shell.seo.title}
      onNavigate={handleNavigate}
      onCheckoutComplete={(id) => {
        setLastCheckoutId(id);
        handleNavigate(store.isOrderAvailable() ? 'store.payment' : 'store.orders');
      }}
    />
  );

  return (
    <WebShellLayout viewModel={viewModel} onNavigate={handleNavigate}>
      {content}
    </WebShellLayout>
  );
}

function DefaultCommerceContent(props: {
  store: WebStore;
  route: string;
  sessionId: string;
  checkoutId?: string;
  brandName: string;
  title: string;
  description?: string;
  seoTitle: string;
  onNavigate: (route: string) => void;
  onCheckoutComplete: (checkoutId: string) => void;
}): ReactNode {
  const { store, route, sessionId, checkoutId, onNavigate, onCheckoutComplete } = props;

  if (route === 'store.catalog' && store.isCatalogAvailable()) {
    return <WebCatalogScreen store={store} sessionId={sessionId} />;
  }
  if (route === 'store.cart' && store.isCartAvailable()) {
    return (
      <WebCartScreen
        store={store}
        sessionId={sessionId}
        onCheckout={store.isCheckoutAvailable() ? () => onNavigate('store.checkout') : undefined}
      />
    );
  }
  if (route === 'store.checkout' && store.isCheckoutAvailable() && store.isCartAvailable()) {
    return (
      <WebCheckoutScreen store={store} sessionId={sessionId} onComplete={onCheckoutComplete} />
    );
  }
  if (route === 'store.payment' && store.isOrderAvailable() && checkoutId) {
    return (
      <WebPaymentConfirmScreen
        store={store}
        checkoutId={checkoutId}
        onDone={() => onNavigate('store.orders')}
      />
    );
  }
  if (route === 'store.orders' && store.isOrderAvailable() && store.isCartAvailable()) {
    return <WebOrdersScreen store={store} sessionId={sessionId} />;
  }

  return (
    <BrandedDefaultScreen
      brandName={props.brandName}
      title={props.title}
      description={props.description}
      route={route}
      seoTitle={props.seoTitle}
    />
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
