import { useEffect, useState, type ReactNode } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import type { Product } from '@ai-commerce/module-catalog';

import type { MobileApp } from '../../domain/mobile-app.js';

export interface MobileCatalogScreenProps {
  app: MobileApp;
  /** When set with cart wired, shows Add buttons. */
  sessionId?: string;
  /** Tenant theme primary for buttons / accents. */
  accentColor?: string;
}

/**
 * Mobile catalog — product cards with images when seeded, initials fallback.
 */
export function MobileCatalogScreen(props: MobileCatalogScreenProps): ReactNode {
  const { app, sessionId } = props;
  const accent = props.accentColor ?? '#16A34A';
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
        const imageUrl = product.variants[0]?.attributes?.imageUrl;
        const priceLabel = price ? `${price.currency} ${price.amount}` : null;
        return (
          <View key={product.id} testID={`mobile-catalog-item-${product.slug}`} style={styles.card}>
            {imageUrl ? (
              <Image
                testID={`mobile-catalog-image-${product.slug}`}
                source={{ uri: imageUrl }}
                style={styles.image}
                accessibilityIgnoresInvertColors
              />
            ) : (
              <View style={[styles.swatch, { backgroundColor: mixAccent(accent, product.slug) }]}>
                <Text style={styles.swatchText}>{initials(product.name)}</Text>
              </View>
            )}
            <View style={styles.itemText}>
              <Text style={styles.name}>{product.name}</Text>
              {priceLabel ? (
                <Text style={[styles.price, { color: accent }]}>{priceLabel}</Text>
              ) : null}
            </View>
            {canAdd && sku ? (
              <Pressable
                testID={`mobile-catalog-add-${product.slug}`}
                disabled={busySku === sku}
                onPress={() => void addToCart(product)}
                style={[
                  styles.addBtn,
                  { backgroundColor: accent, opacity: busySku === sku ? 0.7 : 1 },
                ]}
              >
                <Text style={styles.addLabel}>{busySku === sku ? '…' : 'Add'}</Text>
              </Pressable>
            ) : null}
          </View>
        );
      })}
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

function mixAccent(accent: string, slug: string): string {
  let hash = 0;
  for (let i = 0; i < slug.length; i += 1) {
    hash = (hash * 31 + slug.charCodeAt(i)) >>> 0;
  }
  const opacity = 0.55 + (hash % 30) / 100;
  return accent.length === 7
    ? `${accent}${Math.round(opacity * 255)
        .toString(16)
        .padStart(2, '0')}`
    : accent;
}

const styles = StyleSheet.create({
  list: {
    gap: 12,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#f9fafb',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#e5e7eb',
  },
  image: {
    width: 64,
    height: 64,
    borderRadius: 10,
    backgroundColor: '#e5e7eb',
  },
  swatch: {
    width: 64,
    height: 64,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  swatchText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  itemText: {
    flex: 1,
    gap: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
  },
  price: {
    fontSize: 14,
    fontWeight: '600',
  },
  addBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
  },
  addLabel: {
    fontWeight: '600',
    color: '#fff',
  },
  toast: {
    fontSize: 13,
    color: '#047857',
  },
  muted: {
    fontSize: 14,
    color: '#64748b',
  },
  error: {
    fontSize: 14,
    color: '#b91c1c',
  },
});
