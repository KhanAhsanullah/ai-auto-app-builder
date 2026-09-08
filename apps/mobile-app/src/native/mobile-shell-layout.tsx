import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { MobileShellViewModel } from '../domain/build-mobile-shell-view-model.js';
import { MobileBottomBar } from './mobile-bottom-bar.js';
import { MobileHeader } from './mobile-header.js';

export interface MobileShellLayoutProps {
  viewModel: MobileShellViewModel;
  onNavigate?: (route: string) => void;
  /** Optional content override; defaults to branded screen placeholder. */
  children?: ReactNode;
}

/**
 * React Native mobile shell: header + content + config-driven bottom bar.
 * Theme colors come from resolved tenant theme (Sprint 25).
 */
export function MobileShellLayout(props: MobileShellLayoutProps): ReactNode {
  const { viewModel, onNavigate, children } = props;
  const { shell, activeScreen, tabItems } = viewModel;
  const { theme } = shell;

  return (
    <View testID="mobile-shell-layout" style={[styles.root, { backgroundColor: theme.background }]}>
      <MobileHeader
        brandName={shell.branding.displayName}
        title={activeScreen.title}
        subtitle={activeScreen.description}
      />
      <View testID="mobile-shell-content" style={styles.content}>
        {children ?? (
          <DefaultScreenContent
            brandName={shell.branding.displayName}
            route={activeScreen.route}
            title={activeScreen.title}
            description={activeScreen.description}
          />
        )}
      </View>
      <MobileBottomBar
        items={tabItems}
        activeRoute={viewModel.activeRoute}
        onNavigate={onNavigate}
        accentColor={theme.primary}
      />
    </View>
  );
}

function DefaultScreenContent(props: {
  brandName: string;
  route: string;
  title: string;
  description?: string;
}): ReactNode {
  return (
    <View testID="mobile-default-screen" accessibilityLabel={props.route} style={styles.screen}>
      <Text testID="mobile-welcome" style={styles.welcome}>
        Welcome to {props.brandName}
      </Text>
      <Text testID="mobile-screen-title" style={styles.screenTitle}>
        {props.title}
      </Text>
      {props.description ? (
        <Text testID="mobile-screen-description" style={styles.description}>
          {props.description}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  screen: {
    gap: 8,
  },
  welcome: {
    fontSize: 14,
    color: '#64748b',
  },
  screenTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    color: '#64748b',
  },
});
