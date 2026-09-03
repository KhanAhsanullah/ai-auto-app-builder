import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { Order } from '@ai-commerce/module-order';

import type { MobileApp } from '../../domain/mobile-app.js';

export interface MobileOrdersScreenProps {
  app: MobileApp;
  sessionId: string;
}

/**
 * Mobile orders screen — lists orders for the session cart via `orderSurface`.
 */
export function MobileOrdersScreen(props: MobileOrdersScreenProps): ReactNode {
  const { app, sessionId } = props;
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!app.isOrderAvailable() || !app.isCartAvailable()) {
      setError('Orders require cart and order modules to be wired.');
      setOrders(null);
      return;
    }
    const cart = await app.cartSurface.getOrCreateBySession({ sessionId });
    const list = await app.orderSurface.listOrdersByCart(cart.id);
    setOrders(list);
    setError(null);
  }, [app, sessionId]);

  useEffect(() => {
    let cancelled = false;
    setOrders(null);
    void load().catch((err: unknown) => {
      if (!cancelled) {
        setError(err instanceof Error ? err.message : 'Failed to load orders.');
      }
    });
    return () => {
      cancelled = true;
    };
  }, [load]);

  if (error && orders === null) {
    return (
      <View testID="mobile-orders-screen" accessibilityLabel="error">
        <Text testID="mobile-orders-error" style={styles.error}>
          {error}
        </Text>
      </View>
    );
  }

  if (orders === null) {
    return (
      <View testID="mobile-orders-screen" accessibilityLabel="loading">
        <Text testID="mobile-orders-loading" style={styles.muted}>
          Loading orders…
        </Text>
      </View>
    );
  }

  if (orders.length === 0) {
    return (
      <View testID="mobile-orders-screen" accessibilityLabel="empty">
        <Text testID="mobile-orders-empty" style={styles.muted}>
          No orders yet.
        </Text>
      </View>
    );
  }

  return (
    <View testID="mobile-orders-screen" accessibilityLabel="ready" style={styles.list}>
      {orders.map((order) => (
        <View key={order.id} testID={`mobile-orders-item-${order.id}`} style={styles.item}>
          <Text style={styles.name}>Order {order.id}</Text>
          <Text style={styles.meta}>
            {order.status} · {order.total.currency} {order.total.amount} · {order.lines.length}{' '}
            item(s)
          </Text>
        </View>
      ))}
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
