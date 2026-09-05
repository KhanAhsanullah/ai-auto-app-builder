import { useEffect, useState, type ComponentType, type ReactNode } from 'react';

import { createDemoWebStore, type WebStore } from '@ai-commerce/web-store';
import { WebStoreApp, type WebStoreAppProps } from '@ai-commerce/web-store/react';

// Dual @types/react (Vite host vs workspace) can diverge on ReactNode; cast keeps host build clean.
const StoreApp = WebStoreApp as ComponentType<WebStoreAppProps>;

/**
 * Vite host — demo tenant with in-memory commerce modules (Sprint 23 Task 1).
 */
export function App(): ReactNode {
  const [store, setStore] = useState<WebStore | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const bundle = await createDemoWebStore();
        if (!cancelled) {
          setStore(bundle.store);
          setSessionId(bundle.sessionId);
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

  if (error) {
    return (
      <div className="host-centered" data-testid="web-host-error">
        <p className="host-error">{error}</p>
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
        <span>CommerceOS web demo</span>
        <span className="host-banner-meta">in-memory · Sprint 23</span>
      </header>
      <StoreApp store={store} sessionId={sessionId} />
    </div>
  );
}
