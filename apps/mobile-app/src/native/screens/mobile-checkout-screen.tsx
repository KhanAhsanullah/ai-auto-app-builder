import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import type { CheckoutSession } from '@ai-commerce/module-checkout';

import type { MobileApp } from '../../domain/mobile-app.js';

export interface MobileCheckoutScreenProps {
  app: MobileApp;
  sessionId: string;
  onComplete?: (checkoutId: string) => void;
}

/**
 * Mobile checkout screen — address + shipping + complete via `checkoutSurface`.
 */
export function MobileCheckoutScreen(props: MobileCheckoutScreenProps): ReactNode {
  const { app, sessionId, onComplete } = props;
  const [session, setSession] = useState<CheckoutSession | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [line1, setLine1] = useState('123 Main St');
  const [city, setCity] = useState('Karachi');
  const [postalCode, setPostalCode] = useState('74000');
  const [country, setCountry] = useState('PK');

  const boot = useCallback(async () => {
    if (!app.isCartAvailable() || !app.isCheckoutAvailable()) {
      setError('Cart and checkout must be wired for this store.');
      return;
    }
    const cart = await app.cartSurface.getOrCreateBySession({ sessionId });
    if (cart.lines.length === 0) {
      setError('Cart is empty. Add products before checkout.');
      setSession(null);
      return;
    }
    const existing = await app.checkoutSurface.getActiveCheckoutByCart(cart.id);
    const started = existing ?? (await app.checkoutSurface.startCheckout(cart.id));
    setSession(started);
    setError(null);
  }, [app, sessionId]);

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

  async function submit() {
    if (!session) {
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await app.checkoutSurface.updateShippingAddress(session.id, {
        line1: line1.trim(),
        city: city.trim(),
        postalCode: postalCode.trim(),
        country: country.trim(),
      });
      await app.checkoutSurface.selectShippingMethod(session.id, {
        id: 'standard',
        name: 'Standard',
        price: { amount: 0, currency: session.currency },
      });
      const completed = await app.checkoutSurface.completeCheckout(session.id);
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
      <View testID="mobile-checkout-screen" accessibilityLabel="error">
        <Text testID="mobile-checkout-error" style={styles.error}>
          {error}
        </Text>
      </View>
    );
  }

  if (session === null) {
    return (
      <View testID="mobile-checkout-screen" accessibilityLabel="loading">
        <Text testID="mobile-checkout-loading" style={styles.muted}>
          Starting checkout…
        </Text>
      </View>
    );
  }

  if (session.status === 'completed') {
    return (
      <View testID="mobile-checkout-screen" accessibilityLabel="completed">
        <Text testID="mobile-checkout-done" style={styles.done}>
          Order placed. Checkout {session.id}
        </Text>
      </View>
    );
  }

  return (
    <View testID="mobile-checkout-screen" accessibilityLabel="ready" style={styles.form}>
      {error ? (
        <Text testID="mobile-checkout-error" style={styles.error}>
          {error}
        </Text>
      ) : null}
      <Text style={styles.label}>Address</Text>
      <TextInput
        testID="mobile-checkout-line1"
        value={line1}
        onChangeText={setLine1}
        style={styles.input}
      />
      <Text style={styles.label}>City</Text>
      <TextInput
        testID="mobile-checkout-city"
        value={city}
        onChangeText={setCity}
        style={styles.input}
      />
      <Text style={styles.label}>Postal code</Text>
      <TextInput
        testID="mobile-checkout-postal"
        value={postalCode}
        onChangeText={setPostalCode}
        style={styles.input}
      />
      <Text style={styles.label}>Country</Text>
      <TextInput
        testID="mobile-checkout-country"
        value={country}
        onChangeText={setCountry}
        style={styles.input}
      />
      <Pressable
        testID="mobile-checkout-submit"
        disabled={busy}
        onPress={() => void submit()}
        style={styles.submit}
      >
        <Text style={styles.submitLabel}>{busy ? 'Placing…' : 'Place order'}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: 'var(--mobile-text-muted, #64748b)',
  },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#e2e8f0',
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 15,
    marginBottom: 4,
  },
  submit: {
    marginTop: 12,
    paddingVertical: 12,
    backgroundColor: '#0f172a',
    alignItems: 'center',
  },
  submitLabel: {
    color: '#fff',
    fontWeight: '600',
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
    fontSize: 15,
    fontWeight: '600',
    color: '#047857',
  },
});
