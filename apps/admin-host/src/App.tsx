import { useCallback, useEffect, useState, type ComponentType, type ReactNode } from 'react';
import type { AdminDashboard } from '@ai-commerce/admin-dashboard';
import { AdminDashboardApp } from '@ai-commerce/admin-dashboard/react';

import { createAdminSessionFromPlatform, type AdminSession } from './create-admin-session.js';
import { PlatformCatalogEditor } from './PlatformCatalogEditor.js';
import {
  listTenantsViaPlatformApi,
  PlatformClientError,
  type PlatformCatalogProduct,
  type PlatformTenantSummary,
} from './platform-client.js';

// Dual @types/react (Vite host vs workspace) can diverge on ReactNode; cast keeps host build clean.
const DashboardApp = AdminDashboardApp as unknown as ComponentType<{
  dashboard: AdminDashboard;
  renderScreen?: (input: {
    route: string;
    title: string;
    description?: string;
    widgets: readonly { id: string; position: number }[];
    brandName: string;
  }) => ReactNode;
}>;

type BootState =
  | { status: 'loading-tenants' }
  | { status: 'pick-tenant'; tenants: PlatformTenantSummary[] }
  | { status: 'loading-session'; tenants: PlatformTenantSummary[]; tenantId: string }
  | { status: 'ready'; tenants: PlatformTenantSummary[]; session: AdminSession }
  | { status: 'error'; message: string; tenants?: PlatformTenantSummary[] };

export function App(): ReactNode {
  const [state, setState] = useState<BootState>({ status: 'loading-tenants' });

  const loadTenants = useCallback(async () => {
    setState({ status: 'loading-tenants' });
    try {
      const tenants = await listTenantsViaPlatformApi();
      setState({ status: 'pick-tenant', tenants });
    } catch (err: unknown) {
      setState({
        status: 'error',
        message: err instanceof Error ? err.message : 'Failed to load tenants.',
      });
    }
  }, []);

  useEffect(() => {
    void loadTenants();
  }, [loadTenants]);

  const openTenant = useCallback(async (tenantId: string, tenants: PlatformTenantSummary[]) => {
    setState({ status: 'loading-session', tenants, tenantId });
    try {
      const session = await createAdminSessionFromPlatform({ tenantId });
      setState({ status: 'ready', tenants, session });
    } catch (err: unknown) {
      const message =
        err instanceof PlatformClientError || err instanceof Error
          ? err.message
          : 'Failed to open admin session.';
      setState({ status: 'error', message, tenants });
    }
  }, []);

  const onProductsChanged = useCallback((products: PlatformCatalogProduct[]) => {
    setState((current) => {
      if (current.status !== 'ready') {
        return current;
      }
      return {
        ...current,
        session: {
          ...current.session,
          catalog: { ...current.session.catalog, products },
        },
      };
    });
  }, []);

  if (state.status === 'loading-tenants') {
    return (
      <div className="admin-boot" data-testid="admin-boot-loading">
        <p>Loading tenants from platform-api…</p>
      </div>
    );
  }

  if (state.status === 'error') {
    return (
      <div className="admin-boot" data-testid="admin-boot-error">
        <p className="admin-boot-error">{state.message}</p>
        <button type="button" onClick={() => void loadTenants()}>
          Retry
        </button>
      </div>
    );
  }

  if (state.status === 'loading-session') {
    return (
      <div className="admin-boot" data-testid="admin-boot-session">
        <p>Opening admin for {state.tenantId}…</p>
      </div>
    );
  }

  if (state.status === 'ready') {
    const { session, tenants } = state;
    return (
      <div className="admin-ready" data-testid="admin-ready">
        <div className="admin-topbar">
          <button type="button" onClick={() => setState({ status: 'pick-tenant', tenants })}>
            Switch tenant
          </button>
          <span>
            {session.config.slug} · {session.catalog.products.length} products
          </span>
          <a
            className="admin-storefront-link"
            href={`http://localhost:5173/t/${session.config.slug}`}
            target="_blank"
            rel="noreferrer"
          >
            Open storefront
          </a>
        </div>
        <DashboardApp
          dashboard={session.dashboard}
          renderScreen={({ route }) =>
            route === 'admin.catalog' ? (
              <PlatformCatalogEditor
                tenantId={session.config.tenantId}
                tenantSlug={session.config.slug}
                onProductsChanged={onProductsChanged}
              />
            ) : (
              <p>Select Catalog to manage products.</p>
            )
          }
        />
      </div>
    );
  }

  return (
    <div className="admin-boot" data-testid="admin-tenant-picker">
      <h1>Merchant admin</h1>
      <p>Pick a Boom tenant from platform-api. Catalog loads from the control plane.</p>
      {state.tenants.length === 0 ? (
        <p className="admin-boot-empty">
          No tenants yet. Run the web Boom wizard first (`pnpm web`), then refresh.
        </p>
      ) : (
        <ul className="admin-tenant-list">
          {state.tenants.map((tenant) => (
            <li key={tenant.tenantId}>
              <button type="button" onClick={() => void openTenant(tenant.tenantId, state.tenants)}>
                <strong>{tenant.name}</strong>
                <span>
                  {tenant.slug} · {tenant.vertical} · {tenant.status}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
      <button type="button" className="admin-refresh" onClick={() => void loadTenants()}>
        Refresh
      </button>
    </div>
  );
}
