import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ComponentType,
  type ReactNode,
} from 'react';

import {
  clearWebDemoSnapshot,
  createDemoWebStore,
  exportWebDemoSnapshot,
  parseWebDemoSnapshot,
  summarizeWebDemoSnapshot,
  type WebStore,
} from '@ai-commerce/web-store';
import { WebStoreApp, type WebStoreAppProps } from '@ai-commerce/web-store/react';

import { LaunchWizard, type LaunchWizardSubmit } from './LaunchWizard.js';
import { fetchTenantConfigViaPlatformApi, launchBoomViaPlatformApi } from './boom-client.js';
import { createLocalStorageKvStore, type WebHostKvStore } from './local-storage-kv.js';
import {
  clearLaunchProfile,
  loadLaunchProfile,
  saveLaunchProfile,
  type StoredLaunchProfile,
} from './launch-profile.js';
import { clearGuestSession, resolveGuestSessionId } from './session-storage.js';

// Dual @types/react (Vite host vs workspace) can diverge on ReactNode; cast keeps host build clean.
const StoreApp = WebStoreApp as ComponentType<WebStoreAppProps>;

type Phase = 'booting' | 'wizard' | 'store';

/**
 * Vite host — launch wizard (any vertical) → durable demo storefront.
 */
export function App(): ReactNode {
  const storeRef = useRef<WebHostKvStore | null>(null);
  const [phase, setPhase] = useState<Phase>('booting');
  const [store, setStore] = useState<WebStore | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [businessName, setBusinessName] = useState<string | null>(null);
  const [vertical, setVertical] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [restored, setRestored] = useState(false);

  const bootFromProfile = useCallback(async (profile: StoredLaunchProfile) => {
    const kv = storeRef.current;
    if (!kv) {
      setError('Durable store is not ready.');
      setPhase('wizard');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const resolvedSession = await resolveGuestSessionId({ store: kv });
      const platformConfig = await fetchTenantConfigViaPlatformApi(profile.tenantId);
      const bundle = await createDemoWebStore({
        sessionId: resolvedSession,
        snapshotStore: kv,
        tenantConfig: platformConfig.document,
      });
      setSessionId(bundle.sessionId);
      setStore(bundle.store);
      setBusinessName(bundle.businessName);
      setVertical(bundle.vertical);
      setRestored(bundle.restoredFromSnapshot);
      setPhase('store');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to start demo store.');
      setStore(null);
      setSessionId(null);
      setPhase('wizard');
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const kv = createLocalStorageKvStore();
        storeRef.current = kv;
        const profile = await loadLaunchProfile(kv);
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
        const kv = storeRef.current;
        if (!kv) {
          setError('Durable store is not ready.');
          return;
        }
        setBusy(true);
        setError(null);
        try {
          await clearWebDemoSnapshot(kv);
          await clearGuestSession(kv);
          const launched = await launchBoomViaPlatformApi({
            businessName: input.businessName,
            vertical: input.vertical,
            logoUrl: input.logoUrl,
          });
          const profile: StoredLaunchProfile = {
            businessName: launched.name,
            vertical: launched.vertical,
            logoUrl: input.logoUrl,
            tenantId: launched.tenantId,
            slug: launched.slug,
            createdAt: new Date().toISOString(),
          };
          await saveLaunchProfile(kv, profile);
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
    const ok = window.confirm(
      'Create a new app? This clears the current demo cart/orders and opens the launch wizard.',
    );
    if (!ok) {
      return;
    }
    void (async () => {
      const kv = storeRef.current;
      if (!kv) {
        return;
      }
      setBusy(true);
      try {
        await clearWebDemoSnapshot(kv);
        await clearGuestSession(kv);
        await clearLaunchProfile(kv);
        setStore(null);
        setSessionId(null);
        setBusinessName(null);
        setVertical(null);
        setRestored(false);
        setError(null);
        setPhase('wizard');
      } finally {
        setBusy(false);
      }
    })();
  }, []);

  const onResetDemo = useCallback(() => {
    const ok = window.confirm(
      'Reset demo data? Clears cart/orders and reseeds the catalog for this app type.',
    );
    if (!ok) {
      return;
    }
    void (async () => {
      const kv = storeRef.current;
      const profile = kv ? await loadLaunchProfile(kv) : undefined;
      if (!kv || !profile) {
        setPhase('wizard');
        return;
      }
      await clearWebDemoSnapshot(kv);
      await clearGuestSession(kv);
      await bootFromProfile(profile);
    })();
  }, [bootFromProfile]);

  const onExportSnapshot = useCallback(() => {
    void (async () => {
      const kv = storeRef.current;
      if (!kv) {
        window.alert('Store is not ready.');
        return;
      }
      try {
        const json = await exportWebDemoSnapshot(kv);
        if (!json) {
          window.alert('No demo snapshot saved yet.');
          return;
        }
        const summary = summarizeWebDemoSnapshot(parseWebDemoSnapshot(json)!);
        window.alert(
          `Demo snapshot\n${summary.products} products · ${summary.carts} carts · ${summary.orders} orders · ${summary.payments} payments\n\nJSON length: ${json.length} chars (also printed to console).`,
        );
        console.log('[ai-commerce web demo snapshot]', json);
      } catch (err: unknown) {
        window.alert(err instanceof Error ? err.message : 'Export failed');
      }
    })();
  }, []);

  if (phase === 'booting' || (phase === 'store' && busy && !store)) {
    return (
      <div className="host-centered" data-testid="web-host-loading">
        <p className="host-muted">{busy ? 'Launching…' : 'Starting…'}</p>
      </div>
    );
  }

  if (phase === 'wizard') {
    return <LaunchWizard busy={busy} error={error} onLaunch={onLaunch} />;
  }

  if (error && !store) {
    return (
      <div className="host-centered" data-testid="web-host-error">
        <p className="host-error">{error}</p>
        <button
          type="button"
          className="host-btn host-btn-danger"
          onClick={() => setPhase('wizard')}
        >
          Back to wizard
        </button>
      </div>
    );
  }

  if (!store || !sessionId) {
    return (
      <div className="host-centered" data-testid="web-host-loading">
        <p className="host-muted">Starting demo store…</p>
      </div>
    );
  }

  return (
    <div className="host-shell" data-testid="web-host-ready">
      <header className="host-banner">
        <span>
          {businessName ?? 'CommerceOS'} · {vertical}
        </span>
        <span className="host-banner-meta" data-testid="web-host-storage-backend">
          localStorage{restored ? ' · restored' : ''}
        </span>
      </header>
      <div className="host-toolbar" data-testid="web-host-demo-toolbar">
        <button
          type="button"
          className="host-btn host-btn-new"
          data-testid="web-host-new-app"
          disabled={busy}
          onClick={onNewApp}
        >
          New app
        </button>
        <button
          type="button"
          className="host-btn host-btn-danger"
          data-testid="web-host-reset-demo"
          disabled={busy}
          onClick={onResetDemo}
        >
          {busy ? 'Resetting…' : 'Reset demo'}
        </button>
        <button
          type="button"
          className="host-btn host-btn-export"
          data-testid="web-host-export-demo"
          disabled={busy}
          onClick={onExportSnapshot}
        >
          Export
        </button>
      </div>
      <StoreApp store={store} sessionId={sessionId} />
    </div>
  );
}
