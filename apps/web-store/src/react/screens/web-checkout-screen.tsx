import { useCallback, useEffect, useState, type FormEvent, type ReactNode } from 'react';

import type { CheckoutSession } from '@ai-commerce/module-checkout';

import type { WebStore } from '../../domain/web-store.js';

export interface WebCheckoutScreenProps {
  store: WebStore;
  sessionId: string;
  onComplete?: (checkoutId: string) => void;
}

/**
 * Storefront checkout screen — address + shipping + complete via `checkoutSurface`.
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
      <div data-testid="web-checkout-screen" data-state="completed">
        <p data-testid="web-checkout-done" style={{ margin: 0, fontWeight: 600 }}>
          Checkout complete ({session.id}).
        </p>
        <p style={{ margin: '0.5rem 0 0', color: 'var(--web-text-muted, #64748b)' }}>
          Total: {session.total.currency} {session.total.amount}
        </p>
      </div>
    );
  }

  return (
    <div data-testid="web-checkout-screen" data-state="ready">
      <p data-testid="web-checkout-summary" style={{ margin: '0 0 1rem' }}>
        {session.lines.length} item(s) · {session.subtotal.currency} {session.subtotal.amount}
      </p>
      {error ? (
        <p data-testid="web-checkout-error" style={{ margin: '0 0 0.75rem', color: '#b91c1c' }}>
          {error}
        </p>
      ) : null}
      <form data-testid="web-checkout-form" onSubmit={(e) => void onSubmit(e)}>
        <label style={{ display: 'block', marginBottom: '0.5rem' }}>
          Address
          <input
            data-testid="web-checkout-line1"
            value={line1}
            onChange={(e) => setLine1(e.target.value)}
            required
            style={{ display: 'block', width: '100%', marginTop: '0.25rem' }}
          />
        </label>
        <label style={{ display: 'block', marginBottom: '0.5rem' }}>
          City
          <input
            data-testid="web-checkout-city"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            required
            style={{ display: 'block', width: '100%', marginTop: '0.25rem' }}
          />
        </label>
        <label style={{ display: 'block', marginBottom: '0.5rem' }}>
          Postal code
          <input
            data-testid="web-checkout-postal"
            value={postalCode}
            onChange={(e) => setPostalCode(e.target.value)}
            required
            style={{ display: 'block', width: '100%', marginTop: '0.25rem' }}
          />
        </label>
        <label style={{ display: 'block', marginBottom: '0.75rem' }}>
          Country
          <input
            data-testid="web-checkout-country"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            required
            style={{ display: 'block', width: '100%', marginTop: '0.25rem' }}
          />
        </label>
        <button
          type="submit"
          data-testid="web-checkout-submit"
          disabled={busy}
          style={{
            padding: '0.6rem 1rem',
            border: 'none',
            borderRadius: '0.4rem',
            background: 'var(--web-text, #0f172a)',
            color: '#fff',
            cursor: 'pointer',
          }}
        >
          {busy ? 'Placing…' : 'Place order'}
        </button>
      </form>
    </div>
  );
}
