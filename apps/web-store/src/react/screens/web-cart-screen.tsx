import { useCallback, useEffect, useState, type ReactNode } from 'react';

import type { Cart } from '@ai-commerce/module-cart';

import type { WebStore } from '../../domain/web-store.js';

export interface WebCartScreenProps {
  store: WebStore;
  /** Guest session id for getOrCreateBySession. */
  sessionId: string;
  /** Navigate to checkout after ready. */
  onCheckout?: () => void;
}

/**
 * Storefront cart screen — session cart lines via `cartSurface`.
 */
export function WebCartScreen(props: WebCartScreenProps): ReactNode {
  const { store, sessionId, onCheckout } = props;
  const [cart, setCart] = useState<Cart | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const reload = useCallback(async () => {
    if (!store.isCartAvailable()) {
      setError('Cart is not available for this store.');
      setCart(null);
      return;
    }
    setError(null);
    const loaded = await store.cartSurface.getOrCreateBySession({ sessionId });
    setCart(loaded);
  }, [store, sessionId]);

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
      const updated = await store.cartSurface.setLineQuantity({
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
      <div data-testid="web-cart-screen" data-state="error">
        <p data-testid="web-cart-error" style={{ margin: 0, color: '#b91c1c' }}>
          {error}
        </p>
      </div>
    );
  }

  if (cart === null) {
    return (
      <div data-testid="web-cart-screen" data-state="loading">
        <p
          data-testid="web-cart-loading"
          style={{ margin: 0, color: 'var(--web-text-muted, #64748b)' }}
        >
          Loading cart…
        </p>
      </div>
    );
  }

  if (cart.lines.length === 0) {
    return (
      <div data-testid="web-cart-screen" data-state="empty">
        <p
          data-testid="web-cart-empty"
          style={{ margin: 0, color: 'var(--web-text-muted, #64748b)' }}
        >
          Your cart is empty.
        </p>
      </div>
    );
  }

  return (
    <div data-testid="web-cart-screen" data-state="ready">
      {error ? (
        <p data-testid="web-cart-error" style={{ margin: '0 0 0.75rem', color: '#b91c1c' }}>
          {error}
        </p>
      ) : null}
      <ul
        data-testid="web-cart-list"
        style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: '0.75rem' }}
      >
        {cart.lines.map((line) => (
          <li
            key={line.id}
            data-testid={`web-cart-line-${line.sku}`}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: '1rem',
              padding: '0.75rem 0',
              borderBottom: '1px solid var(--web-border, #e2e8f0)',
            }}
          >
            <div>
              <div style={{ fontWeight: 600 }}>{line.title}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--web-text-muted, #64748b)' }}>
                {line.sku} · {line.unitPrice.currency} {line.unitPrice.amount}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button
                type="button"
                data-testid={`web-cart-dec-${line.sku}`}
                disabled={busy}
                onClick={() => void changeQty(line.id, line.quantity - 1)}
              >
                −
              </button>
              <span data-testid={`web-cart-qty-${line.sku}`}>{line.quantity}</span>
              <button
                type="button"
                data-testid={`web-cart-inc-${line.sku}`}
                disabled={busy}
                onClick={() => void changeQty(line.id, line.quantity + 1)}
              >
                +
              </button>
            </div>
          </li>
        ))}
      </ul>
      <p data-testid="web-cart-subtotal" style={{ margin: '1rem 0', fontWeight: 600 }}>
        Subtotal: {cart.subtotal.currency} {cart.subtotal.amount}
      </p>
      {onCheckout ? (
        <button
          type="button"
          data-testid="web-cart-checkout"
          disabled={busy}
          onClick={onCheckout}
          style={{
            padding: '0.6rem 1rem',
            border: 'none',
            borderRadius: '0.4rem',
            background: 'var(--web-text, #0f172a)',
            color: '#fff',
            cursor: 'pointer',
          }}
        >
          Checkout
        </button>
      ) : null}
    </div>
  );
}
