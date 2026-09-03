import { useCallback, useMemo, useState, type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { MobileApp } from '../domain/mobile-app.js';
import { MobileShellLayout } from './mobile-shell-layout.js';
import { MobileCatalogScreen } from './screens/mobile-catalog-screen.js';

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
  const { app, activeRoute: controlledRoute, onNavigate, renderScreen } = props;
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
  ) : viewModel.activeRoute === 'store.catalog' && app.isCatalogAvailable() ? (
    <MobileCatalogScreen app={app} />
  ) : (
    <BrandedDefaultScreen
      brandName={viewModel.shell.branding.displayName}
      title={viewModel.activeScreen.title}
      description={viewModel.activeScreen.description}
      route={viewModel.activeRoute}
      appName={viewModel.shell.identity.appName}
    />
  );

  return (
    <MobileShellLayout viewModel={viewModel} onNavigate={handleNavigate}>
      {content}
    </MobileShellLayout>
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
    fontSize: 15,
    lineHeight: 22,
    color: 'var(--mobile-text-muted, #64748b)',
  },
});
