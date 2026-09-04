import { useEffect, useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { Product } from '@ai-commerce/module-catalog';

import type { MobileApp } from '../../domain/mobile-app.js';

export interface MobileCatalogScreenProps {
  app: MobileApp;
  /** When set with cart wired, shows Add buttons. */
  sessionId?: string;
}

/**
 * Mobile catalog screen — lists active products via `catalogSurface`.
 */
export function MobileCatalogScreen(props: MobileCatalogScreenProps): ReactNode {
  const { app, sessionId } = props;
  const [products, setProducts] = useState<Product[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [busySku, setBusySku] = useState<string | null>(null);
  const canAdd = Boolean(sessionId) && app.isCartAvailable();

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

  async function addToCart(product: Product) {
    if (!sessionId || !product.variants[0]) {
      return;
    }
    const variant = product.variants[0];
    setBusySku(variant.sku);
    setMessage(null);
    try {
      const cart = await app.cartSurface.getOrCreateBySession({ sessionId });
      await app.cartSurface.addItemFromCatalog({
        cartId: cart.id,
        productId: product.id,
        variantId: variant.id,
      });
      setMessage(`Added ${product.name}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to add to cart.');
    } finally {
      setBusySku(null);
    }
  }

  if (error && products === null) {
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
      {message ? (
        <Text testID="mobile-catalog-toast" style={styles.toast}>
          {message}
        </Text>
      ) : null}
      {products.map((product) => {
        const price = product.variants[0]?.price;
        const sku = product.variants[0]?.sku;
        return (
          <View key={product.id} testID={`mobile-catalog-item-${product.slug}`} style={styles.item}>
            <View style={styles.itemText}>
              <Text style={styles.name}>{product.name}</Text>
              <Text style={styles.meta}>
                {product.slug}
                {price ? ` · ${price.currency} ${price.amount}` : ''}
              </Text>
            </View>
            {canAdd && sku ? (
              <Pressable
                testID={`mobile-catalog-add-${product.slug}`}
                disabled={busySku === sku}
                onPress={() => void addToCart(product)}
                style={styles.addBtn}
              >
                <Text style={styles.addLabel}>Add</Text>
              </Pressable>
            ) : null}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e2e8f0',
  },
  itemText: {
    flex: 1,
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
  addBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#e2e8f0',
  },
  addLabel: {
    fontWeight: '600',
  },
  toast: {
    fontSize: 13,
    color: '#047857',
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
