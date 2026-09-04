import { useEffect, useState, type ComponentType, type ReactNode } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { createDemoMobileApp, type MobileApp } from '@ai-commerce/mobile-app';
import { MobileAppRoot, type MobileAppRootProps } from '@ai-commerce/mobile-app/native';

// Dual @types/react (Expo vs workspace) can diverge on ReactNode; cast keeps host build clean.
const AppRoot = MobileAppRoot as ComponentType<MobileAppRootProps>;

/**
 * Expo host entry — boots an in-memory demo tenant and mounts `MobileAppRoot`.
 */
export default function App(): ReactNode {
  const [app, setApp] = useState<MobileApp | null>(null);
  const [sessionId, setSessionId] = useState('mobile-demo');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void createDemoMobileApp()
      .then((bundle) => {
        if (!cancelled) {
          setApp(bundle.app);
          setSessionId(bundle.sessionId);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to start demo store.');
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
        <StatusBar style="dark" />
        {error ? (
          <View style={styles.centered}>
            <Text style={styles.error}>{error}</Text>
          </View>
        ) : !app ? (
          <View style={styles.centered}>
            <ActivityIndicator />
            <Text style={styles.muted}>Starting demo store…</Text>
          </View>
        ) : (
          <AppRoot app={app} sessionId={sessionId} />
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
