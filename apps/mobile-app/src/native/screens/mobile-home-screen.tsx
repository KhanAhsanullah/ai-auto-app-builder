import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export interface MobileHomeScreenProps {
  brandName: string;
  tagline?: string;
  verticalLabel?: string;
  accentColor?: string;
  onShop?: () => void;
}

/**
 * Mobile home — brand-first hero with a single CTA into the catalog.
 */
export function MobileHomeScreen(props: MobileHomeScreenProps): ReactNode {
  const accent = props.accentColor ?? '#16A34A';

  return (
    <View testID="mobile-home-screen" style={styles.root}>
      <View style={[styles.mark, { backgroundColor: accent }]}>
        <Text testID="mobile-home-mark" style={styles.markText}>
          {initials(props.brandName)}
        </Text>
      </View>
      <Text testID="mobile-home-brand" style={styles.brand}>
        {props.brandName}
      </Text>
      {props.tagline ? (
        <Text testID="mobile-home-tagline" style={styles.tagline}>
          {props.tagline}
        </Text>
      ) : null}
      {props.verticalLabel ? (
        <Text testID="mobile-home-vertical" style={[styles.vertical, { color: accent }]}>
          {props.verticalLabel}
        </Text>
      ) : null}
      {props.onShop ? (
        <Pressable
          testID="mobile-home-shop"
          onPress={props.onShop}
          style={[styles.cta, { backgroundColor: accent }]}
        >
          <Text style={styles.ctaLabel}>Shop catalog</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return '?';
  }
  if (parts.length === 1) {
    return parts[0]!.slice(0, 2).toUpperCase();
  }
  return `${parts[0]![0] ?? ''}${parts[1]![0] ?? ''}`.toUpperCase();
}

const styles = StyleSheet.create({
  root: {
    gap: 12,
    paddingVertical: 8,
  },
  mark: {
    width: 56,
    height: 56,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 20,
  },
  brand: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.5,
    color: '#111827',
  },
  tagline: {
    fontSize: 16,
    lineHeight: 22,
    color: '#6b7280',
    maxWidth: 320,
  },
  vertical: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  cta: {
    marginTop: 8,
    alignSelf: 'flex-start',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 8,
  },
  ctaLabel: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});
