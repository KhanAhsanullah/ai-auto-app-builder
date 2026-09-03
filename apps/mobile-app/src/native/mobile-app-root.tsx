import { useCallback, useMemo, useState, type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { MobileApp } from '../domain/mobile-app.js';
import { MobileShellLayout } from './mobile-shell-layout.js';
import { MobileCartScreen } from './screens/mobile-cart-screen.js';
import { MobileCatalogScreen } from './screens/mobile-catalog-screen.js';
import { MobileCheckoutScreen } from './screens/mobile-checkout-screen.js';

export interface MobileAppRootProps {
  /** Facade instance from `createMobileApp`. */
  app: MobileApp;
  /**
   * Controlled active route. When omitted, the root owns navigation state
   * starting at `app.initialRoute`.
   */
  activeRoute?: string;
  /** Called on tab navigation (always). Use with controlled `activeRoute`. */
  onNavigate?: (route: string) => void;
  /**
   * Guest session id for cart / checkout.
   * Defaults to `mobile-guest`.
   */
  sessionId?: string;
  /**
   * Optional per-screen content. When omitted, commerce screens or a branded default.
   */
  renderScreen?: (input: {
    route: string;
    title: string;
    description?: string;
    brandName: string;
  }) => ReactNode;
}

/**
 * Stateful React Native app entry for the mobile facade.
 * Tab navigation updates the active screen; hosts can control the route externally.
 */
export function MobileAppRoot(props: MobileAppRootProps): ReactNode {
  const {
    app,
    activeRoute: controlledRoute,
    onNavigate,
    renderScreen,
    sessionId = 'mobile-guest',
  } = props;
  const [internalRoute, setInternalRoute] = useState(app.initialRoute);
  const activeRoute = controlledRoute ?? internalRoute;

  const viewModel = useMemo(() => app.getViewModel(activeRoute), [app, activeRoute]);

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
    })
  ) : (
    <DefaultCommerceContent
      app={app}
      route={viewModel.activeRoute}
      sessionId={sessionId}
      brandName={viewModel.shell.branding.displayName}
      title={viewModel.activeScreen.title}
      description={viewModel.activeScreen.description}
      appName={viewModel.shell.identity.appName}
      onNavigate={handleNavigate}
    />
  );

  return (
    <MobileShellLayout viewModel={viewModel} onNavigate={handleNavigate}>
      {content}
    </MobileShellLayout>
  );
}

function DefaultCommerceContent(props: {
  app: MobileApp;
  route: string;
  sessionId: string;
  brandName: string;
  title: string;
  description?: string;
  appName: string;
  onNavigate: (route: string) => void;
}): ReactNode {
  const { app, route, sessionId, onNavigate } = props;

  if (route === 'store.catalog' && app.isCatalogAvailable()) {
    return <MobileCatalogScreen app={app} />;
  }
  if (route === 'store.cart' && app.isCartAvailable()) {
    return (
      <MobileCartScreen
        app={app}
        sessionId={sessionId}
        onCheckout={app.isCheckoutAvailable() ? () => onNavigate('store.checkout') : undefined}
      />
    );
  }
  if (route === 'store.checkout' && app.isCheckoutAvailable() && app.isCartAvailable()) {
    return (
      <MobileCheckoutScreen
        app={app}
        sessionId={sessionId}
        onComplete={() => onNavigate('store.orders')}
      />
    );
  }

  return (
    <BrandedDefaultScreen
      brandName={props.brandName}
      title={props.title}
      description={props.description}
      route={route}
      appName={props.appName}
    />
  );
}

function BrandedDefaultScreen(props: {
  brandName: string;
  title: string;
  description?: string;
  route: string;
  appName: string;
}): ReactNode {
  return (
    <View testID="mobile-app-default-screen" accessibilityLabel={props.route} style={styles.screen}>
      <Text testID="mobile-app-welcome" style={styles.welcome}>
        Welcome to {props.brandName}
      </Text>
      <Text testID="mobile-app-store-name" style={styles.storeName}>
        {props.appName}
      </Text>
      <Text testID="mobile-app-screen-title" style={styles.title}>
        {props.title}
      </Text>
      {props.description ? (
        <Text testID="mobile-app-screen-description" style={styles.description}>
          {props.description}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    gap: 8,
  },
  welcome: {
    fontSize: 14,
    color: 'var(--mobile-text-muted, #64748b)',
  },
  storeName: {
    fontSize: 13,
    fontWeight: '600',
    color: 'var(--mobile-brand, #2563eb)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: 'var(--mobile-text, #0f172a)',
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    color: 'var(--mobile-text-muted, #64748b)',
  },
});
