import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ComponentType,
  type ReactNode,
} from 'react';
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

import { LaunchWizard, type LaunchWizardSubmit } from './src/LaunchWizard.js';
import {
  clearLaunchProfile,
  loadLaunchProfile,
  saveLaunchProfile,
  type StoredLaunchProfile,
} from './src/launch-profile.js';
import { openDemoDurableStore, type DemoDurableBackend } from './src/open-demo-store.js';
import {
  clearGuestSession,
  resolveGuestSessionId,
  type SessionStore,
} from './src/session-storage.js';
import { useDeepLinkRoute } from './src/use-deep-link-route.js';

const AppRoot = MobileAppRoot as ComponentType<MobileAppRootProps>;
const asyncStorage = AsyncStorageImport as unknown as SessionStore & DemoSnapshotStore;

type DurableStore = SessionStore & DemoSnapshotStore;
type Phase = 'booting' | 'wizard' | 'store';

/**
 * Expo host — Boom launch wizard + SQLite/AsyncStorage durable demo.
 */
export default function App(): ReactNode {
  const storeRef = useRef<DurableStore | null>(null);
  const [backend, setBackend] = useState<DemoDurableBackend | null>(null);
  const [phase, setPhase] = useState<Phase>('booting');
  const [app, setApp] = useState<MobileApp | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [businessName, setBusinessName] = useState<string | null>(null);
  const [vertical, setVertical] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const { route: deepLinkRoute, setRoute } = useDeepLinkRoute();

  const bootFromProfile = useCallback(
    async (profile: StoredLaunchProfile) => {
      const store = storeRef.current;
      if (!store) {
        setError('Durable store is not ready.');
        setPhase('wizard');
        return;
      }
      setBusy(true);
      setError(null);
      try {
        const resolvedSession = await resolveGuestSessionId({ store });
        const bundle = await createDemoMobileApp({
          sessionId: resolvedSession,
          snapshotStore: store,
          launch: {
            businessName: profile.businessName,
            vertical: profile.vertical,
            logoUrl: profile.logoUrl,
            tenantId: profile.tenantId,
          },
        });
        setSessionId(bundle.sessionId);
        setApp(bundle.app);
        setBusinessName(bundle.businessName);
        setVertical(bundle.vertical);
        setRoute(undefined);
        setPhase('store');
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to start demo store.');
        setApp(null);
        setSessionId(null);
        setPhase('wizard');
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
        const opened = await openDemoDurableStore({ asyncStorage });
        if (cancelled) {
          return;
        }
        storeRef.current = opened.store;
        setBackend(opened.backend);
        const profile = await loadLaunchProfile(opened.store);
        if (cancelled) {
          return;
        }
        if (!profile) {
          setPhase('wizard');
          return;
        }
        await bootFromProfile(profile);
      } catch (err: unknown) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to start demo store.');
          setPhase('wizard');
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [bootFromProfile]);

  const onLaunch = useCallback(
    (input: LaunchWizardSubmit) => {
      void (async () => {
        const store = storeRef.current;
        if (!store) {
          setError('Durable store is not ready.');
          return;
        }
        setBusy(true);
        setError(null);
        try {
          await clearDemoSnapshot(store);
          await clearGuestSession(store);
          const tenantId =
            typeof globalThis.crypto?.randomUUID === 'function'
              ? globalThis.crypto.randomUUID()
              : `11111111-1111-4111-8111-${Date.now().toString(16).padStart(12, '0').slice(-12)}`;
          const profile: StoredLaunchProfile = {
            businessName: input.businessName,
            vertical: input.vertical,
            logoUrl: input.logoUrl,
            tenantId,
            createdAt: new Date().toISOString(),
          };
          await saveLaunchProfile(store, profile);
          await bootFromProfile(profile);
        } catch (err: unknown) {
          setError(err instanceof Error ? err.message : 'Launch failed.');
          setPhase('wizard');
          setBusy(false);
        }
      })();
    },
    [bootFromProfile],
  );

  const onNewApp = useCallback(() => {
    Alert.alert(
      'Create a new app?',
      'Clears the current demo cart/orders and opens the launch wizard.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'New app',
          style: 'destructive',
          onPress: () => {
            void (async () => {
              const store = storeRef.current;
              if (!store) {
                return;
              }
              setBusy(true);
              try {
                await clearDemoSnapshot(store);
                await clearGuestSession(store);
                await clearLaunchProfile(store);
                setApp(null);
                setSessionId(null);
                setBusinessName(null);
                setVertical(null);
                setError(null);
                setRoute(undefined);
                setPhase('wizard');
              } finally {
                setBusy(false);
              }
            })();
          },
        },
      ],
    );
  }, [setRoute]);

  const onResetDemo = useCallback(() => {
    Alert.alert('Reset demo?', 'Clears cart/orders and reseeds the catalog for this app type.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reset',
        style: 'destructive',
        onPress: () => {
          void (async () => {
            const store = storeRef.current;
            const profile = store ? await loadLaunchProfile(store) : undefined;
            if (!store || !profile) {
              setPhase('wizard');
              return;
            }
            await clearDemoSnapshot(store);
            await clearGuestSession(store);
            await bootFromProfile(profile);
          })();
        },
      },
    ]);
  }, [bootFromProfile]);

  const onExportSnapshot = useCallback(() => {
    void (async () => {
      const store = storeRef.current;
      if (!store) {
        Alert.alert('Export', 'Store is not ready.');
        return;
      }
      try {
        const json = await exportDemoSnapshot(store);
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

  const showChrome = phase === 'store' && Boolean(app && sessionId && !error);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
        <StatusBar style="dark" />
        {phase === 'wizard' ? <LaunchWizard busy={busy} error={error} onLaunch={onLaunch} /> : null}
        {showChrome ? (
          <View style={styles.toolbar} testID="mobile-host-demo-toolbar">
            <Pressable
              accessibilityRole="button"
              disabled={busy}
              onPress={onNewApp}
              style={({ pressed }) => [
                styles.toolbarBtn,
                styles.newBtn,
                (pressed || busy) && styles.toolbarBtnPressed,
              ]}
              testID="mobile-host-new-app"
            >
              <Text style={styles.newBtnText}>New app</Text>
            </Pressable>
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
            <Text style={styles.backend} testID="mobile-host-storage-backend">
              {businessName ? `${businessName} · ${vertical}` : ''}
              {backend ? ` · ${backend === 'sqlite' ? 'SQLite' : 'AsyncStorage'}` : ''}
            </Text>
          </View>
        ) : null}
        {phase !== 'wizard' && error && !app ? (
          <View style={styles.centered} testID="mobile-host-error">
            <Text style={styles.error}>{error}</Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => setPhase('wizard')}
              style={styles.retryBtn}
              testID="mobile-host-retry"
            >
              <Text style={styles.retryBtnText}>Back to wizard</Text>
            </Pressable>
          </View>
        ) : null}
        {phase === 'booting' || (phase === 'store' && (!app || !sessionId || busy)) ? (
          <View style={styles.centered} testID="mobile-host-loading">
            <ActivityIndicator />
            <Text style={styles.muted}>{busy ? 'Launching…' : 'Starting demo store…'}</Text>
          </View>
        ) : null}
        {phase === 'store' && app && sessionId && !busy ? (
          <AppRoot
            app={app}
            sessionId={sessionId}
            activeRoute={deepLinkRoute}
            onNavigate={setRoute}
          />
        ) : null}
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
    alignItems: 'center',
    flexWrap: 'wrap',
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
  newBtn: {
    backgroundColor: '#ecfdf5',
  },
  newBtnText: {
    color: '#047857',
    fontWeight: '600',
    fontSize: 13,
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
  backend: {
    marginLeft: 'auto',
    fontSize: 11,
    color: '#94a3b8',
    fontWeight: '600',
    maxWidth: 180,
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
