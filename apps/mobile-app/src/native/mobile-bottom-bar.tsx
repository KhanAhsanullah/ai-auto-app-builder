import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { ResolvedMobileNavItem } from '../types.js';

export interface MobileBottomBarProps {
  items: readonly ResolvedMobileNavItem[];
  activeRoute: string;
  onNavigate?: (route: string) => void;
  /** Tenant theme primary for active tab accent. */
  accentColor?: string;
}

/** Config-driven bottom tab bar for the consumer mobile shell. */
export function MobileBottomBar(props: MobileBottomBarProps): ReactNode {
  const accent = props.accentColor ?? '#16A34A';

  return (
    <View testID="mobile-bottom-bar" accessibilityRole="tablist" style={styles.bar}>
      {props.items.map((item) => {
        const active = item.route === props.activeRoute;
        return (
          <Pressable
            key={item.id}
            testID={`mobile-tab-${item.id}`}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            onPress={() => props.onNavigate?.(item.route)}
            style={styles.tab}
          >
            <Text
              testID={`mobile-tab-icon-${item.id}`}
              style={[styles.icon, active ? { color: accent } : null]}
            >
              {item.icon ?? item.label.slice(0, 1)}
            </Text>
            <Text
              testID={`mobile-tab-label-${item.id}`}
              style={[styles.label, active ? { color: accent, fontWeight: '600' } : null]}
              numberOfLines={1}
            >
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#e2e8f0',
    backgroundColor: '#ffffff',
    paddingBottom: 8,
    paddingTop: 6,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    gap: 2,
  },
  icon: {
    fontSize: 12,
    color: '#64748b',
  },
  label: {
    fontSize: 11,
    color: '#64748b',
  },
});
