import { useEffect, useState, type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { Product } from '@ai-commerce/module-catalog';

import type { MobileApp } from '../../domain/mobile-app.js';

export interface MobileCatalogScreenProps {
  app: MobileApp;
}

/**
 * Mobile catalog screen — lists active products via `catalogSurface`.
 */
export function MobileCatalogScreen(props: MobileCatalogScreenProps): ReactNode {
  const { app } = props;
  const [products, setProducts] = useState<Product[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setProducts(null);
    setError(null);

    if (!app.isCatalogAvailable()) {
      setError('Catalog is not available for this store.');
      return;
    }

    void app.catalogSurface
      .listActiveProducts()
      .then((list) => {
        if (!cancelled) {
          setProducts(list);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load products.');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [app]);

  if (error) {
    return (
      <View testID="mobile-catalog-screen" accessibilityLabel="error">
        <Text testID="mobile-catalog-error" style={styles.error}>
          {error}
        </Text>
      </View>
    );
  }

  if (products === null) {
    return (
      <View testID="mobile-catalog-screen" accessibilityLabel="loading">
        <Text testID="mobile-catalog-loading" style={styles.muted}>
          Loading products…
        </Text>
      </View>
    );
  }

  if (products.length === 0) {
    return (
      <View testID="mobile-catalog-screen" accessibilityLabel="empty">
        <Text testID="mobile-catalog-empty" style={styles.muted}>
          No products yet.
        </Text>
      </View>
    );
  }

  return (
    <View testID="mobile-catalog-screen" accessibilityLabel="ready" style={styles.list}>
      {products.map((product) => {
        const price = product.variants[0]?.price;
        return (
          <View key={product.id} testID={`mobile-catalog-item-${product.slug}`} style={styles.item}>
            <Text style={styles.name}>{product.name}</Text>
            <Text style={styles.meta}>
              {product.slug}
              {price ? ` · ${price.currency} ${price.amount}` : ''}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 12,
  },
  item: {
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e2e8f0',
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: 'var(--mobile-text, #0f172a)',
  },
  meta: {
    marginTop: 4,
    fontSize: 13,
    color: 'var(--mobile-text-muted, #64748b)',
  },
  muted: {
    fontSize: 14,
    color: 'var(--mobile-text-muted, #64748b)',
  },
  error: {
    fontSize: 14,
    color: '#b91c1c',
  },
});
