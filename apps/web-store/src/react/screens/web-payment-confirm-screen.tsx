import { useCallback, useEffect, useState, type ReactNode } from 'react';

import type { Order } from '@ai-commerce/module-order';
import type { PaymentIntent } from '@ai-commerce/module-payment';

import type { WebStore } from '../../domain/web-store.js';

export interface WebPaymentConfirmScreenProps {
  store: WebStore;
  /** Completed checkout id to convert into order + payment. */
  checkoutId: string;
  onDone?: () => void;
}

/**
 * Storefront payment confirmation — create order from checkout, then pay/capture.
 */
export function WebPaymentConfirmScreen(props: WebPaymentConfirmScreenProps): ReactNode {
  const { store, checkoutId, onDone } = props;
  const [order, setOrder] = useState<Order | null>(null);
  const [intent, setIntent] = useState<PaymentIntent | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const boot = useCallback(async () => {
    if (!store.isOrderAvailable()) {
      setError('Order module is not wired for this store.');
      return;
    }
    let loaded: Order;
    try {
      loaded = await store.orderSurface.getOrderByCheckoutId(checkoutId);
    } catch {
      loaded = await store.orderSurface.createOrderFromCheckout(checkoutId);
    }
    setOrder(loaded);

    if (!store.isPaymentAvailable()) {
      setError(null);
      return;
    }

    let payment: PaymentIntent;
    try {
      payment = await store.paymentSurface.getPaymentIntentByOrderId(loaded.id);
    } catch {
      payment = await store.paymentSurface.createPaymentIntent({
        orderId: loaded.id,
        method: 'card',
      });
    }

    if (payment.status === 'pending' && payment.captureStrategy === 'immediate') {
      payment = await store.paymentSurface.capturePaymentIntent(payment.id);
    } else if (
      payment.status === 'pending' &&
      payment.captureStrategy === 'authorize_then_capture'
    ) {
      payment = await store.paymentSurface.authorizePaymentIntent(payment.id);
      payment = await store.paymentSurface.capturePaymentIntent(payment.id);
    }

    setIntent(payment);
    setError(null);
  }, [store, checkoutId]);

  useEffect(() => {
    let cancelled = false;
    setOrder(null);
    setIntent(null);
    void boot().catch((err: unknown) => {
      if (!cancelled) {
        setError(err instanceof Error ? err.message : 'Payment confirmation failed.');
      }
    });
    return () => {
      cancelled = true;
    };
  }, [boot]);

  async function captureManual() {
    if (!intent) {
      return;
    }
    setBusy(true);
    setError(null);
    try {
      let next = intent;
      if (next.status === 'pending' && next.captureStrategy === 'authorize_then_capture') {
        next = await store.paymentSurface.authorizePaymentIntent(next.id);
      }
      if (next.status === 'pending' || next.status === 'authorized') {
        next = await store.paymentSurface.capturePaymentIntent(next.id);
      }
      setIntent(next);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Capture failed.');
    } finally {
      setBusy(false);
    }
  }

  if (error && !order) {
    return (
      <div data-testid="web-payment-screen" data-state="error">
        <p data-testid="web-payment-error" style={{ margin: 0, color: '#b91c1c' }}>
          {error}
        </p>
      </div>
    );
  }

  if (!order) {
    return (
      <div data-testid="web-payment-screen" data-state="loading">
        <p
          data-testid="web-payment-loading"
          style={{ margin: 0, color: 'var(--web-text-muted, #64748b)' }}
        >
          Confirming payment…
        </p>
      </div>
    );
  }

  const paid = intent?.status === 'captured';

  return (
    <div data-testid="web-payment-screen" data-state={paid ? 'captured' : 'ready'}>
      {error ? (
        <p data-testid="web-payment-error" style={{ margin: '0 0 0.75rem', color: '#b91c1c' }}>
          {error}
        </p>
      ) : null}
      <p data-testid="web-payment-order" style={{ margin: '0 0 0.5rem', fontWeight: 600 }}>
        Order {order.id} · {order.status}
      </p>
      <p
        data-testid="web-payment-total"
        style={{ margin: '0 0 1rem', color: 'var(--web-text-muted, #64748b)' }}
      >
        Total: {order.total.currency} {order.total.amount}
      </p>
      {intent ? (
        <p data-testid="web-payment-intent" style={{ margin: '0 0 1rem' }}>
          Payment {intent.id}: {intent.status} ({intent.gateway} / {intent.captureStrategy})
        </p>
      ) : (
        <p data-testid="web-payment-no-gateway" style={{ margin: '0 0 1rem' }}>
          Order placed. Payment module not wired — pay offline.
        </p>
      )}
      {intent && (intent.status === 'pending' || intent.status === 'authorized') ? (
        <button
          type="button"
          data-testid="web-payment-capture"
          disabled={busy}
          onClick={() => void captureManual()}
          style={{
            padding: '0.6rem 1rem',
            border: 'none',
            borderRadius: '0.4rem',
            background: 'var(--web-text, #0f172a)',
            color: '#fff',
            cursor: 'pointer',
            marginRight: '0.5rem',
          }}
        >
          {busy ? 'Paying…' : 'Pay now'}
        </button>
      ) : null}
      {paid ? (
        <p data-testid="web-payment-done" style={{ margin: '0 0 1rem', color: '#047857' }}>
          Payment captured.
        </p>
      ) : null}
      {onDone ? (
        <button
          type="button"
          data-testid="web-payment-view-orders"
          onClick={onDone}
          style={{
            padding: '0.6rem 1rem',
            border: '1px solid var(--web-border, #e2e8f0)',
            borderRadius: '0.4rem',
            background: '#fff',
            cursor: 'pointer',
          }}
        >
          View orders
        </button>
      ) : null}
    </div>
  );
}
