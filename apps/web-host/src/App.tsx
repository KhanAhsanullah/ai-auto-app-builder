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

import { createLocalStorageKvStore, type WebHostKvStore } from './local-storage-kv.js';
import { clearGuestSession, resolveGuestSessionId } from './session-storage.js';

// Dual @types/react (Vite host vs workspace) can diverge on ReactNode; cast keeps host build clean.
const StoreApp = WebStoreApp as ComponentType<WebStoreAppProps>;

/**
 * Vite host — localStorage-backed durable demo + reset/export (Sprint 23 Task 2).
 */
export function App(): ReactNode {
  const storeRef = useRef<WebHostKvStore | null>(null);
  const [store, setStore] = useState<WebStore | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [restored, setRestored] = useState(false);

  const boot = useCallback(async (opts?: { clearFirst?: boolean }) => {
    const kv = storeRef.current;
    if (!kv) {
      setError('Durable store is not ready.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      if (opts?.clearFirst) {
        await clearWebDemoSnapshot(kv);
        await clearGuestSession(kv);
      }
      const resolvedSession = await resolveGuestSessionId({ store: kv });
      const bundle = await createDemoWebStore({
        sessionId: resolvedSession,
        snapshotStore: kv,
      });
      setSessionId(bundle.sessionId);
      setStore(bundle.store);
      setRestored(bundle.restoredFromSnapshot);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to start demo store.');
      setStore(null);
      setSessionId(null);
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
        const resolvedSession = await resolveGuestSessionId({ store: kv });
        const bundle = await createDemoWebStore({
          sessionId: resolvedSession,
          snapshotStore: kv,
        });
        if (!cancelled) {
          setSessionId(bundle.sessionId);
          setStore(bundle.store);
          setRestored(bundle.restoredFromSnapshot);
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
    const ok = window.confirm(
      'Reset demo? Clears saved cart, orders, and guest session, then reseeds the catalog.',
    );
    if (ok) {
      void boot({ clearFirst: true });
    }
  }, [boot]);

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

  if (error) {
    return (
      <div className="host-centered" data-testid="web-host-error">
        <p className="host-error">{error}</p>
        <button
          type="button"
          className="host-btn host-btn-danger"
          data-testid="web-host-retry"
          onClick={() => void boot({ clearFirst: true })}
        >
          Retry reset
        </button>
      </div>
    );
  }

  if (!store || !sessionId || busy) {
    return (
      <div className="host-centered" data-testid="web-host-loading">
        <p className="host-muted">{busy ? 'Resetting demo…' : 'Starting demo store…'}</p>
      </div>
    );
  }

  return (
    <div className="host-shell" data-testid="web-host-ready">
      <header className="host-banner">
        <span>CommerceOS web demo</span>
        <span className="host-banner-meta" data-testid="web-host-storage-backend">
          localStorage{restored ? ' · restored' : ''}
        </span>
      </header>
      <div className="host-toolbar" data-testid="web-host-demo-toolbar">
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
