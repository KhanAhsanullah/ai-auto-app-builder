import { useCallback, useEffect, useState, type ReactNode } from 'react';

import type { Order } from '@ai-commerce/module-order';

import type { WebStore } from '../../domain/web-store.js';

export interface WebOrdersScreenProps {
  store: WebStore;
  sessionId: string;
}

/**
 * Storefront orders screen — lists orders for the session cart via `orderSurface`.
 */
export function WebOrdersScreen(props: WebOrdersScreenProps): ReactNode {
  const { store, sessionId } = props;
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!store.isOrderAvailable() || !store.isCartAvailable()) {
      setError('Orders require cart and order modules to be wired.');
      setOrders(null);
      return;
    }
    const cart = await store.cartSurface.getOrCreateBySession({ sessionId });
    const list = await store.orderSurface.listOrdersByCart(cart.id);
    setOrders(list);
    setError(null);
  }, [store, sessionId]);

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
      <div data-testid="web-orders-screen" data-state="error">
        <p data-testid="web-orders-error" style={{ margin: 0, color: '#b91c1c' }}>
          {error}
        </p>
      </div>
    );
  }

  if (orders === null) {
    return (
      <div data-testid="web-orders-screen" data-state="loading">
        <p
          data-testid="web-orders-loading"
          style={{ margin: 0, color: 'var(--web-text-muted, #64748b)' }}
        >
          Loading orders…
        </p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div data-testid="web-orders-screen" data-state="empty">
        <p
          data-testid="web-orders-empty"
          style={{ margin: 0, color: 'var(--web-text-muted, #64748b)' }}
        >
          No orders yet.
        </p>
      </div>
    );
  }

  return (
    <div data-testid="web-orders-screen" data-state="ready">
      <ul
        data-testid="web-orders-list"
        style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: '0.75rem' }}
      >
        {orders.map((order) => (
          <li
            key={order.id}
            data-testid={`web-orders-item-${order.id}`}
            style={{
              padding: '0.85rem 0',
              borderBottom: '1px solid var(--web-border, #e2e8f0)',
            }}
          >
            <div style={{ fontWeight: 600, color: 'var(--web-text, #0f172a)' }}>
              Order {order.id}
            </div>
            <div
              style={{
                marginTop: '0.25rem',
                fontSize: '0.85rem',
                color: 'var(--web-text-muted, #64748b)',
              }}
            >
              {order.status} · {order.total.currency} {order.total.amount} · {order.lines.length}{' '}
              item(s)
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
