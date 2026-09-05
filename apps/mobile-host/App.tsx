import { useCallback, useEffect, useState, type ComponentType, type ReactNode } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import AsyncStorageImport from '@react-native-async-storage/async-storage';

import {
  clearDemoSnapshot,
  createDemoMobileApp,
  exportDemoSnapshot,
  parseDemoSnapshot,
  summarizeDemoSnapshot,
  type DemoSnapshotStore,
  type MobileApp,
} from '@ai-commerce/mobile-app';
import { MobileAppRoot, type MobileAppRootProps } from '@ai-commerce/mobile-app/native';

import {
  clearGuestSession,
  resolveGuestSessionId,
  type SessionStore,
} from './src/session-storage.js';
import { useDeepLinkRoute } from './src/use-deep-link-route.js';

// Dual @types/react (Expo vs workspace) can diverge on ReactNode; cast keeps host build clean.
const AppRoot = MobileAppRoot as ComponentType<MobileAppRootProps>;

// NodeNext resolves the CJS default export awkwardly; narrow to storage surfaces.
const asyncStorage = AsyncStorageImport as unknown as SessionStore & DemoSnapshotStore;

/**
 * Expo host — demo tenant with durable commerce snapshot + reset/export controls.
 */
export default function App(): ReactNode {
  const [app, setApp] = useState<MobileApp | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const { route: deepLinkRoute, setRoute } = useDeepLinkRoute();

  const boot = useCallback(
    async (opts?: { clearFirst?: boolean }) => {
      setBusy(true);
      setError(null);
      try {
        if (opts?.clearFirst) {
          await clearDemoSnapshot(asyncStorage);
          await clearGuestSession(asyncStorage);
        }
        const resolvedSession = await resolveGuestSessionId({ store: asyncStorage });
        const bundle = await createDemoMobileApp({
          sessionId: resolvedSession,
          snapshotStore: asyncStorage,
        });
        setSessionId(bundle.sessionId);
        setApp(bundle.app);
        setRoute(undefined);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to start demo store.');
        setApp(null);
        setSessionId(null);
      } finally {
        setBusy(false);
      }
    },
    [setRoute],
  );

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const resolvedSession = await resolveGuestSessionId({ store: asyncStorage });
        const bundle = await createDemoMobileApp({
          sessionId: resolvedSession,
          snapshotStore: asyncStorage,
        });
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

  const onResetDemo = useCallback(() => {
    Alert.alert(
      'Reset demo?',
      'Clears saved cart, orders, and guest session, then reseeds the catalog.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            void boot({ clearFirst: true });
          },
        },
      ],
    );
  }, [boot]);

  const onExportSnapshot = useCallback(() => {
    void (async () => {
      try {
        const json = await exportDemoSnapshot(asyncStorage);
        if (!json) {
          Alert.alert('Export', 'No demo snapshot saved yet.');
          return;
        }
        const summary = summarizeDemoSnapshot(parseDemoSnapshot(json)!);
        Alert.alert(
          'Demo snapshot',
          `${summary.products} products · ${summary.carts} carts · ${summary.orders} orders · ${summary.payments} payments\n\nJSON length: ${json.length} chars (printed to Metro logs).`,
        );
        console.log('[ai-commerce demo snapshot]', json);
      } catch (err: unknown) {
        Alert.alert('Export failed', err instanceof Error ? err.message : 'Unknown error');
      }
    })();
  }, []);

  const showChrome = Boolean(app && sessionId && !error);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
        <StatusBar style="dark" />
        {showChrome ? (
          <View style={styles.toolbar} testID="mobile-host-demo-toolbar">
            <Pressable
              accessibilityRole="button"
              disabled={busy}
              onPress={onResetDemo}
              style={({ pressed }) => [
                styles.toolbarBtn,
                styles.resetBtn,
                (pressed || busy) && styles.toolbarBtnPressed,
              ]}
              testID="mobile-host-reset-demo"
            >
              <Text style={styles.resetBtnText}>{busy ? 'Resetting…' : 'Reset demo'}</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              disabled={busy}
              onPress={onExportSnapshot}
              style={({ pressed }) => [
                styles.toolbarBtn,
                styles.exportBtn,
                (pressed || busy) && styles.toolbarBtnPressed,
              ]}
              testID="mobile-host-export-demo"
            >
              <Text style={styles.exportBtnText}>Export</Text>
            </Pressable>
          </View>
        ) : null}
        {error ? (
          <View style={styles.centered} testID="mobile-host-error">
            <Text style={styles.error}>{error}</Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => void boot({ clearFirst: true })}
              style={styles.retryBtn}
              testID="mobile-host-retry"
            >
              <Text style={styles.retryBtnText}>Retry reset</Text>
            </Pressable>
          </View>
        ) : !app || !sessionId || busy ? (
          <View style={styles.centered} testID="mobile-host-loading">
            <ActivityIndicator />
            <Text style={styles.muted}>{busy ? 'Resetting demo…' : 'Starting demo store…'}</Text>
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
  toolbar: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
  },
  toolbarBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  toolbarBtnPressed: {
    opacity: 0.7,
  },
  resetBtn: {
    backgroundColor: '#fef2f2',
  },
  resetBtnText: {
    color: '#b91c1c',
    fontWeight: '600',
    fontSize: 13,
  },
  exportBtn: {
    backgroundColor: '#eff6ff',
  },
  exportBtnText: {
    color: '#1d4ed8',
    fontWeight: '600',
    fontSize: 13,
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
  retryBtn: {
    marginTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#fef2f2',
    borderRadius: 6,
  },
  retryBtnText: {
    color: '#b91c1c',
    fontWeight: '600',
  },
});
