import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import type { Cart } from '@ai-commerce/module-cart';

import type { MobileApp } from '../../domain/mobile-app.js';

export interface MobileCartScreenProps {
  app: MobileApp;
  /** Guest session id for getOrCreateBySession. */
  sessionId: string;
  /** Navigate to checkout when cart has lines. */
  onCheckout?: () => void;
  /** Tenant theme primary for CTA. */
  accentColor?: string;
}

/**
 * Mobile cart — line cards with qty controls and brand checkout CTA.
 */
export function MobileCartScreen(props: MobileCartScreenProps): ReactNode {
  const { app, sessionId, onCheckout } = props;
  const accent = props.accentColor ?? '#16A34A';
  const [cart, setCart] = useState<Cart | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [imageByProductId, setImageByProductId] = useState<Record<string, string>>({});

  const reload = useCallback(async () => {
    if (!app.isCartAvailable()) {
      setError('Cart is not available for this store.');
      setCart(null);
      return;
    }
    setError(null);
    const loaded = await app.cartSurface.getOrCreateBySession({ sessionId });
    setCart(loaded);
  }, [app, sessionId]);

  useEffect(() => {
    let cancelled = false;
    setCart(null);
    void reload().catch((err: unknown) => {
      if (!cancelled) {
        setError(err instanceof Error ? err.message : 'Failed to load cart.');
      }
    });
    return () => {
      cancelled = true;
    };
  }, [reload]);

  useEffect(() => {
    if (!app.isCatalogAvailable()) {
      return;
    }
    let cancelled = false;
    void app.catalogSurface.listActiveProducts().then((list) => {
      if (cancelled) {
        return;
      }
      const next: Record<string, string> = {};
      for (const product of list) {
        const url = product.variants[0]?.attributes?.imageUrl;
        if (url) {
          next[product.id] = url;
        }
      }
      setImageByProductId(next);
    });
    return () => {
      cancelled = true;
    };
  }, [app]);

  async function changeQty(lineId: string, quantity: number) {
    if (!cart) {
      return;
    }
    setBusy(true);
    try {
      const updated = await app.cartSurface.setLineQuantity({
        cartId: cart.id,
        lineId,
        quantity,
      });
      setCart(updated);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update line.');
    } finally {
      setBusy(false);
    }
  }

  if (error && !cart) {
    return (
      <View testID="mobile-cart-screen" accessibilityLabel="error">
        <Text testID="mobile-cart-error" style={styles.error}>
          {error}
        </Text>
      </View>
    );
  }

  if (cart === null) {
    return (
      <View testID="mobile-cart-screen" accessibilityLabel="loading">
        <Text testID="mobile-cart-loading" style={styles.muted}>
          Loading cart…
        </Text>
      </View>
    );
  }

  if (cart.lines.length === 0) {
    return (
      <View testID="mobile-cart-screen" accessibilityLabel="empty">
        <Text testID="mobile-cart-empty" style={styles.muted}>
          Your cart is empty.
        </Text>
      </View>
    );
  }

  return (
    <View testID="mobile-cart-screen" accessibilityLabel="ready" style={styles.list}>
      {error ? (
        <Text testID="mobile-cart-error" style={styles.error}>
          {error}
        </Text>
      ) : null}
      {cart.lines.map((line) => {
        const imageUrl = imageByProductId[line.productId];
        return (
          <View key={line.id} testID={`mobile-cart-line-${line.sku}`} style={styles.card}>
            {imageUrl ? (
              <Image
                source={{ uri: imageUrl }}
                style={styles.thumb}
                accessibilityIgnoresInvertColors
              />
            ) : (
              <View style={[styles.thumbFallback, { backgroundColor: accent }]}>
                <Text style={styles.thumbText}>{line.title.slice(0, 2).toUpperCase()}</Text>
              </View>
            )}
            <View style={styles.itemText}>
              <Text style={styles.name}>{line.title}</Text>
              <Text style={styles.meta}>
                {line.unitPrice.currency} {line.unitPrice.amount} each
              </Text>
              <View style={styles.qtyRow}>
                <Pressable
                  testID={`mobile-cart-dec-${line.sku}`}
                  disabled={busy}
                  onPress={() => void changeQty(line.id, line.quantity - 1)}
                  style={styles.qtyBtn}
                >
                  <Text style={styles.qtyLabel}>−</Text>
                </Pressable>
                <Text testID={`mobile-cart-qty-${line.sku}`} style={styles.qtyValue}>
                  {line.quantity}
                </Text>
                <Pressable
                  testID={`mobile-cart-inc-${line.sku}`}
                  disabled={busy}
                  onPress={() => void changeQty(line.id, line.quantity + 1)}
                  style={styles.qtyBtn}
                >
                  <Text style={styles.qtyLabel}>+</Text>
                </Pressable>
              </View>
            </View>
            <Text style={styles.lineTotal}>
              {line.lineTotal.currency} {line.lineTotal.amount}
            </Text>
          </View>
        );
      })}
      <View style={styles.footer}>
        <Text testID="mobile-cart-subtotal" style={styles.subtotal}>
          Subtotal:{' '}
          <Text style={{ color: accent }}>
            {cart.subtotal.currency} {cart.subtotal.amount}
          </Text>
        </Text>
        {onCheckout ? (
          <Pressable
            testID="mobile-cart-checkout"
            disabled={busy}
            onPress={onCheckout}
            style={[styles.checkout, { backgroundColor: accent }]}
          >
            <Text style={styles.checkoutLabel}>Checkout</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
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
  thumb: {
    width: 64,
    height: 64,
    borderRadius: 10,
    backgroundColor: '#e5e7eb',
  },
  thumbFallback: {
    width: 64,
    height: 64,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbText: {
    color: '#fff',
    fontWeight: '700',
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
  meta: {
    fontSize: 13,
    color: '#64748b',
  },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  qtyBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  qtyLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  qtyValue: {
    minWidth: 20,
    textAlign: 'center',
    fontWeight: '600',
  },
  lineTotal: {
    fontWeight: '600',
    fontSize: 14,
  },
  footer: {
    marginTop: 4,
    gap: 12,
  },
  subtotal: {
    fontSize: 16,
    fontWeight: '700',
  },
  checkout: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  checkoutLabel: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
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
