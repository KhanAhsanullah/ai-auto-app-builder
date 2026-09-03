import { useCallback, useEffect, useState, type ReactNode } from 'react';

import type { Order } from '@ai-commerce/module-order';

import type { AdminDashboard } from '../../domain/admin-dashboard.js';

export interface AdminOrdersScreenProps {
  dashboard: AdminDashboard;
}

/**
 * Admin orders screen — list + confirm via `orderSurface`.
 */
export function AdminOrdersScreen(props: AdminOrdersScreenProps): ReactNode {
  const { dashboard } = props;
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!dashboard.isOrderAvailable()) {
      setError('Order module is not available for this tenant.');
      setOrders(null);
      return;
    }
    const list = await dashboard.orderSurface.listOrders();
    setOrders(list);
    setError(null);
  }, [dashboard]);

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

  async function confirm(orderId: string) {
    setBusyId(orderId);
    setError(null);
    try {
      await dashboard.orderSurface.confirmOrder(orderId);
      await load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Confirm failed.');
    } finally {
      setBusyId(null);
    }
  }

  if (error && orders === null) {
    return (
      <div data-testid="admin-orders-screen" data-state="error">
        <p data-testid="admin-orders-error" style={{ margin: 0, color: '#b91c1c' }}>
          {error}
        </p>
      </div>
    );
  }

  if (orders === null) {
    return (
      <div data-testid="admin-orders-screen" data-state="loading">
        <p
          data-testid="admin-orders-loading"
          style={{ margin: 0, color: 'var(--admin-text-muted, #64748b)' }}
        >
          Loading orders…
        </p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div data-testid="admin-orders-screen" data-state="empty">
        <p
          data-testid="admin-orders-empty"
          style={{ margin: 0, color: 'var(--admin-text-muted, #64748b)' }}
        >
          No orders yet.
        </p>
      </div>
    );
  }

  return (
    <div data-testid="admin-orders-screen" data-state="ready">
      {error ? (
        <p data-testid="admin-orders-error" style={{ margin: '0 0 0.75rem', color: '#b91c1c' }}>
          {error}
        </p>
      ) : null}
      <table
        data-testid="admin-orders-table"
        style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}
      >
        <thead>
          <tr style={{ textAlign: 'left', color: 'var(--admin-text-muted, #64748b)' }}>
            <th style={{ padding: '0.5rem 0.4rem', borderBottom: '1px solid #e2e8f0' }}>Order</th>
            <th style={{ padding: '0.5rem 0.4rem', borderBottom: '1px solid #e2e8f0' }}>Status</th>
            <th style={{ padding: '0.5rem 0.4rem', borderBottom: '1px solid #e2e8f0' }}>Total</th>
            <th style={{ padding: '0.5rem 0.4rem', borderBottom: '1px solid #e2e8f0' }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id} data-testid={`admin-orders-row-${order.id}`}>
              <td style={{ padding: '0.55rem 0.4rem', borderBottom: '1px solid #e2e8f0' }}>
                {order.id}
              </td>
              <td style={{ padding: '0.55rem 0.4rem', borderBottom: '1px solid #e2e8f0' }}>
                {order.status}
              </td>
              <td style={{ padding: '0.55rem 0.4rem', borderBottom: '1px solid #e2e8f0' }}>
                {order.total.currency} {order.total.amount}
              </td>
              <td style={{ padding: '0.55rem 0.4rem', borderBottom: '1px solid #e2e8f0' }}>
                {order.status === 'placed' ? (
                  <button
                    type="button"
                    data-testid={`admin-orders-confirm-${order.id}`}
                    disabled={busyId === order.id}
                    onClick={() => void confirm(order.id)}
                  >
                    Confirm
                  </button>
                ) : (
                  '—'
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
