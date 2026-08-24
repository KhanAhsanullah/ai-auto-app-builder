import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

export interface MobileHeaderProps {
  title: string;
  brandName: string;
  subtitle?: string;
}

/** Top header for the mobile shell. */
export function MobileHeader(props: MobileHeaderProps): ReactNode {
  return (
    <View testID="mobile-header" style={styles.header}>
      <Text testID="mobile-header-brand" style={styles.brand}>
        {props.brandName}
      </Text>
      <Text testID="mobile-header-title" style={styles.title}>
        {props.title}
      </Text>
      {props.subtitle ? (
        <Text testID="mobile-header-subtitle" style={styles.subtitle}>
          {props.subtitle}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: 'var(--mobile-header-bg, #ffffff)',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'var(--mobile-border, #e2e8f0)',
  },
  brand: {
    fontSize: 12,
    fontWeight: '600',
    color: 'var(--mobile-brand, #2563eb)',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: 'var(--mobile-text, #0f172a)',
  },
  subtitle: {
    marginTop: 4,
    fontSize: 14,
    color: 'var(--mobile-text-muted, #64748b)',
  },
});
