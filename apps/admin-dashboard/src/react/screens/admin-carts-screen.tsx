import { useEffect, useState, type ReactNode } from 'react';

import type { Cart } from '@ai-commerce/module-cart';

import type { AdminDashboard } from '../../domain/admin-dashboard.js';

export interface AdminCartsScreenProps {
  dashboard: AdminDashboard;
}

/**
 * Admin carts inspect screen — lists tenant carts via `cartSurface`.
 */
export function AdminCartsScreen(props: AdminCartsScreenProps): ReactNode {
  const { dashboard } = props;
  const [carts, setCarts] = useState<Cart[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setCarts(null);
    setError(null);

    if (!dashboard.isCartAvailable()) {
      setError('Cart is not available for this tenant.');
      return;
    }

    void dashboard.cartSurface
      .listCarts()
      .then((list) => {
        if (!cancelled) {
          setCarts(list);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load carts.');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [dashboard]);

  if (error) {
    return (
      <div data-testid="admin-carts-screen" data-state="error">
        <p data-testid="admin-carts-error" style={{ margin: 0, color: '#b91c1c' }}>
          {error}
        </p>
      </div>
    );
  }

  if (carts === null) {
    return (
      <div data-testid="admin-carts-screen" data-state="loading">
        <p
          data-testid="admin-carts-loading"
          style={{ margin: 0, color: 'var(--admin-text-muted, #64748b)' }}
        >
          Loading carts…
        </p>
      </div>
    );
  }

  if (carts.length === 0) {
    return (
      <div data-testid="admin-carts-screen" data-state="empty">
        <p
          data-testid="admin-carts-empty"
          style={{ margin: 0, color: 'var(--admin-text-muted, #64748b)' }}
        >
          No carts yet.
        </p>
      </div>
    );
  }

  return (
    <div data-testid="admin-carts-screen" data-state="ready">
      <table
        data-testid="admin-carts-table"
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: '0.9rem',
        }}
      >
        <thead>
          <tr style={{ textAlign: 'left', color: 'var(--admin-text-muted, #64748b)' }}>
            <th style={{ padding: '0.5rem 0.4rem', borderBottom: '1px solid #e2e8f0' }}>Cart ID</th>
            <th style={{ padding: '0.5rem 0.4rem', borderBottom: '1px solid #e2e8f0' }}>Session</th>
            <th style={{ padding: '0.5rem 0.4rem', borderBottom: '1px solid #e2e8f0' }}>Lines</th>
            <th style={{ padding: '0.5rem 0.4rem', borderBottom: '1px solid #e2e8f0' }}>
              Subtotal
            </th>
          </tr>
        </thead>
        <tbody>
          {carts.map((cart) => (
            <tr key={cart.id} data-testid={`admin-carts-row-${cart.id}`}>
              <td style={{ padding: '0.55rem 0.4rem', borderBottom: '1px solid #e2e8f0' }}>
                {cart.id}
              </td>
              <td style={{ padding: '0.55rem 0.4rem', borderBottom: '1px solid #e2e8f0' }}>
                {cart.sessionId ?? cart.customerId ?? '—'}
              </td>
              <td style={{ padding: '0.55rem 0.4rem', borderBottom: '1px solid #e2e8f0' }}>
                {cart.lines.length}
              </td>
              <td style={{ padding: '0.55rem 0.4rem', borderBottom: '1px solid #e2e8f0' }}>
                {cart.subtotal.currency} {cart.subtotal.amount}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
