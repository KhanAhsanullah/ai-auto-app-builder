import { useCallback, useEffect, useState, type CSSProperties, type ReactNode } from 'react';

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
 * Storefront cart — line cards with qty controls and brand checkout CTA.
 */
export function WebCartScreen(props: WebCartScreenProps): ReactNode {
  const { store, sessionId, onCheckout } = props;
  const [cart, setCart] = useState<Cart | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [imageByProductId, setImageByProductId] = useState<Record<string, string>>({});

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

  useEffect(() => {
    if (!store.isCatalogAvailable()) {
      return;
    }
    let cancelled = false;
    void store.catalogSurface.listActiveProducts().then((list) => {
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
  }, [store]);

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
      <div data-testid="web-cart-screen" data-state="empty" style={{ padding: '1.5rem 0' }}>
        <p
          data-testid="web-cart-empty"
          style={{ margin: 0, fontSize: '1.05rem', color: 'var(--web-text-muted, #64748b)' }}
        >
          Your cart is empty.
        </p>
        <p style={{ margin: '0.5rem 0 0', color: 'var(--web-text-muted, #64748b)' }}>
          Browse the catalog and add a few items.
        </p>
      </div>
    );
  }

  const qtyBtnStyle: CSSProperties = {
    width: '2rem',
    height: '2rem',
    border: '1px solid var(--web-border, #e5e7eb)',
    borderRadius: '0.4rem',
    background: 'var(--web-surface, #f9fafb)',
    cursor: 'pointer',
    fontSize: '1rem',
    lineHeight: 1,
  };

  return (
    <div data-testid="web-cart-screen" data-state="ready" style={{ maxWidth: '40rem' }}>
      {error ? (
        <p data-testid="web-cart-error" style={{ margin: '0 0 0.75rem', color: '#b91c1c' }}>
          {error}
        </p>
      ) : null}
      <ul
        data-testid="web-cart-list"
        style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: '0.85rem' }}
      >
        {cart.lines.map((line) => {
          const imageUrl = imageByProductId[line.productId];
          const lineTotal = `${line.lineTotal.currency} ${formatMoney(line.lineTotal.amount, line.lineTotal.currency)}`;
          return (
            <li
              key={line.id}
              data-testid={`web-cart-line-${line.sku}`}
              style={{
                display: 'grid',
                gridTemplateColumns: '4.5rem 1fr auto',
                gap: '0.85rem',
                alignItems: 'center',
                padding: '0.85rem',
                borderRadius: '0.65rem',
                background: 'var(--web-surface, #f9fafb)',
                border: '1px solid var(--web-border, #e5e7eb)',
              }}
            >
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt=""
                  width={72}
                  height={72}
                  style={{
                    width: '4.5rem',
                    height: '4.5rem',
                    objectFit: 'cover',
                    borderRadius: '0.45rem',
                  }}
                />
              ) : (
                <div
                  aria-hidden
                  style={{
                    width: '4.5rem',
                    height: '4.5rem',
                    borderRadius: '0.45rem',
                    background: 'var(--web-brand, #16a34a)',
                    color: '#fff',
                    display: 'grid',
                    placeItems: 'center',
                    fontWeight: 700,
                  }}
                >
                  {line.title.slice(0, 2).toUpperCase()}
                </div>
              )}
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 650 }}>{line.title}</div>
                <div
                  style={{
                    marginTop: '0.2rem',
                    fontSize: '0.85rem',
                    color: 'var(--web-text-muted, #64748b)',
                  }}
                >
                  {line.unitPrice.currency}{' '}
                  {formatMoney(line.unitPrice.amount, line.unitPrice.currency)} each
                </div>
                <div
                  style={{
                    marginTop: '0.55rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                  }}
                >
                  <button
                    type="button"
                    data-testid={`web-cart-dec-${line.sku}`}
                    disabled={busy}
                    onClick={() => void changeQty(line.id, line.quantity - 1)}
                    style={qtyBtnStyle}
                  >
                    −
                  </button>
                  <span
                    data-testid={`web-cart-qty-${line.sku}`}
                    style={{ minWidth: '1.25rem', textAlign: 'center', fontWeight: 600 }}
                  >
                    {line.quantity}
                  </span>
                  <button
                    type="button"
                    data-testid={`web-cart-inc-${line.sku}`}
                    disabled={busy}
                    onClick={() => void changeQty(line.id, line.quantity + 1)}
                    style={qtyBtnStyle}
                  >
                    +
                  </button>
                </div>
              </div>
              <div style={{ fontWeight: 650, whiteSpace: 'nowrap' }}>{lineTotal}</div>
            </li>
          );
        })}
      </ul>
      <div
        style={{
          marginTop: '1.25rem',
          padding: '1rem',
          borderRadius: '0.65rem',
          border: '1px solid var(--web-border, #e5e7eb)',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          gap: '0.75rem',
          alignItems: 'center',
        }}
      >
        <p
          data-testid="web-cart-subtotal"
          style={{ margin: 0, fontWeight: 700, fontSize: '1.05rem' }}
        >
          Subtotal:{' '}
          <span style={{ color: 'var(--web-brand, #16a34a)' }}>
            {cart.subtotal.currency} {formatMoney(cart.subtotal.amount, cart.subtotal.currency)}
          </span>
        </p>
        {onCheckout ? (
          <button
            type="button"
            data-testid="web-cart-checkout"
            disabled={busy}
            onClick={onCheckout}
            style={{
              padding: '0.75rem 1.25rem',
              border: 'none',
              borderRadius: '0.5rem',
              background: 'var(--web-brand, #16a34a)',
              color: '#fff',
              cursor: 'pointer',
              fontWeight: 650,
              fontSize: '1rem',
            }}
          >
            Checkout
          </button>
        ) : null}
      </div>
    </div>
  );
}

function formatMoney(amount: number, currency: string): string {
  return amount.toFixed(currency === 'PKR' ? 0 : 2);
}
