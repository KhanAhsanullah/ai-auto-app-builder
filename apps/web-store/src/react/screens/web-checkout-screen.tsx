import {
  useCallback,
  useEffect,
  useState,
  type CSSProperties,
  type FormEvent,
  type ReactNode,
} from 'react';

import type { CheckoutSession } from '@ai-commerce/module-checkout';

import type { WebStore } from '../../domain/web-store.js';

export interface WebCheckoutScreenProps {
  store: WebStore;
  sessionId: string;
  onComplete?: (checkoutId: string) => void;
}

/**
 * Storefront checkout — order summary + shipping form with brand CTA.
 */
export function WebCheckoutScreen(props: WebCheckoutScreenProps): ReactNode {
  const { store, sessionId, onComplete } = props;
  const [session, setSession] = useState<CheckoutSession | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [line1, setLine1] = useState('123 Main St');
  const [city, setCity] = useState('Karachi');
  const [postalCode, setPostalCode] = useState('74000');
  const [country, setCountry] = useState('PK');

  const boot = useCallback(async () => {
    if (!store.isCartAvailable() || !store.isCheckoutAvailable()) {
      setError('Cart and checkout must be wired for this store.');
      return;
    }
    const cart = await store.cartSurface.getOrCreateBySession({ sessionId });
    if (cart.lines.length === 0) {
      setError('Cart is empty. Add products before checkout.');
      setSession(null);
      return;
    }
    const existing = await store.checkoutSurface.getActiveCheckoutByCart(cart.id);
    const started = existing ?? (await store.checkoutSurface.startCheckout(cart.id));
    setSession(started);
    setError(null);
  }, [store, sessionId]);

  useEffect(() => {
    let cancelled = false;
    setSession(null);
    void boot().catch((err: unknown) => {
      if (!cancelled) {
        setError(err instanceof Error ? err.message : 'Failed to start checkout.');
      }
    });
    return () => {
      cancelled = true;
    };
  }, [boot]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!session) {
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await store.checkoutSurface.updateShippingAddress(session.id, {
        line1: line1.trim(),
        city: city.trim(),
        postalCode: postalCode.trim(),
        country: country.trim(),
      });
      await store.checkoutSurface.selectShippingMethod(session.id, {
        id: 'standard',
        name: 'Standard',
        price: { amount: 0, currency: session.currency },
      });
      const completed = await store.checkoutSurface.completeCheckout(session.id);
      setSession(completed);
      onComplete?.(completed.id);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Checkout failed.');
    } finally {
      setBusy(false);
    }
  }

  if (error && !session) {
    return (
      <div data-testid="web-checkout-screen" data-state="error">
        <p data-testid="web-checkout-error" style={{ margin: 0, color: '#b91c1c' }}>
          {error}
        </p>
      </div>
    );
  }

  if (session === null) {
    return (
      <div data-testid="web-checkout-screen" data-state="loading">
        <p
          data-testid="web-checkout-loading"
          style={{ margin: 0, color: 'var(--web-text-muted, #64748b)' }}
        >
          Preparing checkout…
        </p>
      </div>
    );
  }

  if (session.status === 'completed') {
    return (
      <div
        data-testid="web-checkout-screen"
        data-state="completed"
        style={{
          padding: '1.25rem',
          borderRadius: '0.65rem',
          background: 'color-mix(in srgb, var(--web-brand, #16a34a) 12%, #fff)',
          border: '1px solid var(--web-border, #e5e7eb)',
          maxWidth: '28rem',
        }}
      >
        <p
          data-testid="web-checkout-done"
          style={{ margin: 0, fontWeight: 700, fontSize: '1.15rem' }}
        >
          Order placed
        </p>
        <p style={{ margin: '0.45rem 0 0', color: 'var(--web-text-muted, #64748b)' }}>
          Total: {session.total.currency}{' '}
          {formatMoney(session.total.amount, session.total.currency)}
        </p>
      </div>
    );
  }

  const fieldStyle: CSSProperties = {
    display: 'block',
    width: '100%',
    marginTop: '0.35rem',
    padding: '0.65rem 0.75rem',
    borderRadius: '0.45rem',
    border: '1px solid var(--web-border, #e5e7eb)',
    background: '#fff',
    fontSize: '1rem',
    boxSizing: 'border-box',
  };

  return (
    <div
      data-testid="web-checkout-screen"
      data-state="ready"
      style={{
        display: 'grid',
        gap: '1.25rem',
        maxWidth: '36rem',
      }}
    >
      <div
        style={{
          padding: '1rem',
          borderRadius: '0.65rem',
          background: 'var(--web-surface, #f9fafb)',
          border: '1px solid var(--web-border, #e5e7eb)',
        }}
      >
        <p data-testid="web-checkout-summary" style={{ margin: 0, fontWeight: 650 }}>
          {session.lines.length} item(s) · {session.subtotal.currency}{' '}
          {formatMoney(session.subtotal.amount, session.subtotal.currency)}
        </p>
        <ul
          style={{
            listStyle: 'none',
            margin: '0.75rem 0 0',
            padding: 0,
            display: 'grid',
            gap: '0.35rem',
          }}
        >
          {session.lines.map((line) => (
            <li
              key={line.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: '1rem',
                fontSize: '0.9rem',
                color: 'var(--web-text-muted, #64748b)',
              }}
            >
              <span>
                {line.title} × {line.quantity}
              </span>
              <span>
                {line.lineTotal.currency}{' '}
                {formatMoney(line.lineTotal.amount, line.lineTotal.currency)}
              </span>
            </li>
          ))}
        </ul>
      </div>
      {error ? (
        <p data-testid="web-checkout-error" style={{ margin: 0, color: '#b91c1c' }}>
          {error}
        </p>
      ) : null}
      <form data-testid="web-checkout-form" onSubmit={(e) => void onSubmit(e)}>
        <label
          style={{ display: 'block', marginBottom: '0.75rem', fontWeight: 600, fontSize: '0.9rem' }}
        >
          Address
          <input
            data-testid="web-checkout-line1"
            value={line1}
            onChange={(e) => setLine1(e.target.value)}
            required
            style={fieldStyle}
          />
        </label>
        <label
          style={{ display: 'block', marginBottom: '0.75rem', fontWeight: 600, fontSize: '0.9rem' }}
        >
          City
          <input
            data-testid="web-checkout-city"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            required
            style={fieldStyle}
          />
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <label
            style={{
              display: 'block',
              marginBottom: '0.75rem',
              fontWeight: 600,
              fontSize: '0.9rem',
            }}
          >
            Postal code
            <input
              data-testid="web-checkout-postal"
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
              required
              style={fieldStyle}
            />
          </label>
          <label
            style={{
              display: 'block',
              marginBottom: '0.75rem',
              fontWeight: 600,
              fontSize: '0.9rem',
            }}
          >
            Country
            <input
              data-testid="web-checkout-country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              required
              style={fieldStyle}
            />
          </label>
        </div>
        <button
          type="submit"
          data-testid="web-checkout-submit"
          disabled={busy}
          style={{
            marginTop: '0.5rem',
            padding: '0.85rem 1.35rem',
            border: 'none',
            borderRadius: '0.5rem',
            background: 'var(--web-brand, #16a34a)',
            color: '#fff',
            cursor: 'pointer',
            fontWeight: 650,
            fontSize: '1rem',
            opacity: busy ? 0.75 : 1,
          }}
        >
          {busy ? 'Placing…' : 'Place order'}
        </button>
      </form>
    </div>
  );
}

function formatMoney(amount: number, currency: string): string {
  return amount.toFixed(currency === 'PKR' ? 0 : 2);
}
