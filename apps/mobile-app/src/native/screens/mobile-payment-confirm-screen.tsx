import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { Order } from '@ai-commerce/module-order';
import type { PaymentIntent } from '@ai-commerce/module-payment';

import type { MobileApp } from '../../domain/mobile-app.js';

export interface MobilePaymentConfirmScreenProps {
  app: MobileApp;
  checkoutId: string;
  onDone?: () => void;
}

/**
 * Mobile payment confirmation — create order from checkout, then pay/capture.
 */
export function MobilePaymentConfirmScreen(props: MobilePaymentConfirmScreenProps): ReactNode {
  const { app, checkoutId, onDone } = props;
  const [order, setOrder] = useState<Order | null>(null);
  const [intent, setIntent] = useState<PaymentIntent | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const boot = useCallback(async () => {
    if (!app.isOrderAvailable()) {
      setError('Order module is not wired for this store.');
      return;
    }
    let loaded: Order;
    try {
      loaded = await app.orderSurface.getOrderByCheckoutId(checkoutId);
    } catch {
      loaded = await app.orderSurface.createOrderFromCheckout(checkoutId);
    }
    setOrder(loaded);

    if (!app.isPaymentAvailable()) {
      setError(null);
      return;
    }

    let payment: PaymentIntent;
    try {
      payment = await app.paymentSurface.getPaymentIntentByOrderId(loaded.id);
    } catch {
      payment = await app.paymentSurface.createPaymentIntent({
        orderId: loaded.id,
        method: 'card',
      });
    }

    if (payment.status === 'pending' && payment.captureStrategy === 'immediate') {
      payment = await app.paymentSurface.capturePaymentIntent(payment.id);
    } else if (
      payment.status === 'pending' &&
      payment.captureStrategy === 'authorize_then_capture'
    ) {
      payment = await app.paymentSurface.authorizePaymentIntent(payment.id);
      payment = await app.paymentSurface.capturePaymentIntent(payment.id);
    }

    setIntent(payment);
    setError(null);
  }, [app, checkoutId]);

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
        next = await app.paymentSurface.authorizePaymentIntent(next.id);
      }
      if (next.status === 'pending' || next.status === 'authorized') {
        next = await app.paymentSurface.capturePaymentIntent(next.id);
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
      <View testID="mobile-payment-screen" accessibilityLabel="error">
        <Text testID="mobile-payment-error" style={styles.error}>
          {error}
        </Text>
      </View>
    );
  }

  if (!order) {
    return (
      <View testID="mobile-payment-screen" accessibilityLabel="loading">
        <Text testID="mobile-payment-loading" style={styles.muted}>
          Confirming payment…
        </Text>
      </View>
    );
  }

  const paid = intent?.status === 'captured';

  return (
    <View
      testID="mobile-payment-screen"
      accessibilityLabel={paid ? 'captured' : 'ready'}
      style={styles.wrap}
    >
      {error ? (
        <Text testID="mobile-payment-error" style={styles.error}>
          {error}
        </Text>
      ) : null}
      <Text testID="mobile-payment-order" style={styles.name}>
        Order {order.id} · {order.status}
      </Text>
      <Text testID="mobile-payment-total" style={styles.meta}>
        Total: {order.total.currency} {order.total.amount}
      </Text>
      {intent ? (
        <Text testID="mobile-payment-intent" style={styles.meta}>
          Payment {intent.id}: {intent.status}
        </Text>
      ) : (
        <Text testID="mobile-payment-no-gateway" style={styles.meta}>
          Order placed. Payment module not wired.
        </Text>
      )}
      {intent && (intent.status === 'pending' || intent.status === 'authorized') ? (
        <Pressable
          testID="mobile-payment-capture"
          disabled={busy}
          onPress={() => void captureManual()}
          style={styles.primary}
        >
          <Text style={styles.primaryLabel}>{busy ? 'Paying…' : 'Pay now'}</Text>
        </Pressable>
      ) : null}
      {paid ? (
        <Text testID="mobile-payment-done" style={styles.done}>
          Payment captured.
        </Text>
      ) : null}
      {onDone ? (
        <Pressable testID="mobile-payment-view-orders" onPress={onDone} style={styles.secondary}>
          <Text>View orders</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 10,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
  },
  meta: {
    fontSize: 13,
    color: 'var(--mobile-text-muted, #64748b)',
  },
  primary: {
    marginTop: 8,
    paddingVertical: 12,
    backgroundColor: '#0f172a',
    alignItems: 'center',
  },
  primaryLabel: {
    color: '#fff',
    fontWeight: '600',
  },
  secondary: {
    marginTop: 4,
    paddingVertical: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#e2e8f0',
    alignItems: 'center',
  },
  muted: {
    fontSize: 14,
    color: 'var(--mobile-text-muted, #64748b)',
  },
  error: {
    fontSize: 14,
    color: '#b91c1c',
  },
  done: {
    fontSize: 14,
    fontWeight: '600',
    color: '#047857',
  },
});
