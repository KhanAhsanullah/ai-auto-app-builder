import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { Cart } from '@ai-commerce/module-cart';

import type { MobileApp } from '../../domain/mobile-app.js';

export interface MobileCartScreenProps {
  app: MobileApp;
  /** Guest session id for getOrCreateBySession. */
  sessionId: string;
  /** Navigate to checkout when cart has lines. */
  onCheckout?: () => void;
}

/**
 * Mobile cart screen — session cart lines via `cartSurface`.
 */
export function MobileCartScreen(props: MobileCartScreenProps): ReactNode {
  const { app, sessionId, onCheckout } = props;
  const [cart, setCart] = useState<Cart | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

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
      {cart.lines.map((line) => (
        <View key={line.id} testID={`mobile-cart-line-${line.sku}`} style={styles.item}>
          <View style={styles.itemText}>
            <Text style={styles.name}>{line.title}</Text>
            <Text style={styles.meta}>
              {line.sku} · {line.unitPrice.currency} {line.unitPrice.amount}
            </Text>
          </View>
          <View style={styles.qtyRow}>
            <Pressable
              testID={`mobile-cart-dec-${line.sku}`}
              disabled={busy}
              onPress={() => void changeQty(line.id, line.quantity - 1)}
              style={styles.qtyBtn}
            >
              <Text>−</Text>
            </Pressable>
            <Text testID={`mobile-cart-qty-${line.sku}`}>{line.quantity}</Text>
            <Pressable
              testID={`mobile-cart-inc-${line.sku}`}
              disabled={busy}
              onPress={() => void changeQty(line.id, line.quantity + 1)}
              style={styles.qtyBtn}
            >
              <Text>+</Text>
            </Pressable>
          </View>
        </View>
      ))}
      <Text testID="mobile-cart-subtotal" style={styles.subtotal}>
        Subtotal: {cart.subtotal.currency} {cart.subtotal.amount}
      </Text>
      {onCheckout ? (
        <Pressable
          testID="mobile-cart-checkout"
          disabled={busy}
          onPress={onCheckout}
          style={styles.checkout}
        >
          <Text style={styles.checkoutLabel}>Checkout</Text>
        </Pressable>
      ) : null}
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
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  qtyBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#e2e8f0',
  },
  subtotal: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: '600',
  },
  checkout: {
    marginTop: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#0f172a',
    alignItems: 'center',
  },
  checkoutLabel: {
    color: '#fff',
    fontWeight: '600',
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
