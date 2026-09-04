import { useEffect, useState, type ComponentType, type ReactNode } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import AsyncStorageImport from '@react-native-async-storage/async-storage';

import { createDemoMobileApp, type MobileApp } from '@ai-commerce/mobile-app';
import { MobileAppRoot, type MobileAppRootProps } from '@ai-commerce/mobile-app/native';

import { resolveGuestSessionId, type SessionStore } from './src/session-storage.js';
import { useDeepLinkRoute } from './src/use-deep-link-route.js';

// Dual @types/react (Expo vs workspace) can diverge on ReactNode; cast keeps host build clean.
const AppRoot = MobileAppRoot as ComponentType<MobileAppRootProps>;

// NodeNext resolves the CJS default export awkwardly; narrow to the SessionStore surface.
const asyncStorage = AsyncStorageImport as unknown as SessionStore;

/**
 * Expo host entry — demo tenant, persisted guest session, deep-link routes.
 */
export default function App(): ReactNode {
  const [app, setApp] = useState<MobileApp | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { route: deepLinkRoute, setRoute } = useDeepLinkRoute();

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const resolvedSession = await resolveGuestSessionId({ store: asyncStorage });
        const bundle = await createDemoMobileApp({ sessionId: resolvedSession });
        if (!cancelled) {
          setSessionId(bundle.sessionId);
          setApp(bundle.app);
        }
      } catch (err: unknown) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to start demo store.');
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
        <StatusBar style="dark" />
        {error ? (
          <View style={styles.centered} testID="mobile-host-error">
            <Text style={styles.error}>{error}</Text>
          </View>
        ) : !app || !sessionId ? (
          <View style={styles.centered} testID="mobile-host-loading">
            <ActivityIndicator />
            <Text style={styles.muted}>Starting demo store…</Text>
          </View>
        ) : (
          <AppRoot
            app={app}
            sessionId={sessionId}
            activeRoute={deepLinkRoute}
            onNavigate={setRoute}
          />
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 24,
  },
  muted: {
    color: '#64748b',
  },
  error: {
    color: '#b91c1c',
    textAlign: 'center',
  },
});
