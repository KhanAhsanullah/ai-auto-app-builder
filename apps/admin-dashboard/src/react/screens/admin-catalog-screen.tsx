import { useEffect, useState, type ReactNode } from 'react';

import type { Product } from '@ai-commerce/module-catalog';

import type { AdminDashboard } from '../../domain/admin-dashboard.js';

export interface AdminCatalogScreenProps {
  dashboard: AdminDashboard;
}

/**
 * Admin catalog screen — lists all products via `catalogSurface`.
 */
export function AdminCatalogScreen(props: AdminCatalogScreenProps): ReactNode {
  const { dashboard } = props;
  const [products, setProducts] = useState<Product[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setProducts(null);
    setError(null);

    if (!dashboard.isCatalogAvailable()) {
      setError('Catalog is not available for this tenant.');
      return;
    }

    void dashboard.catalogSurface
      .listProducts()
      .then((list) => {
        if (!cancelled) {
          setProducts(list);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load products.');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [dashboard]);

  if (error) {
    return (
      <div data-testid="admin-catalog-screen" data-state="error">
        <p data-testid="admin-catalog-error" style={{ margin: 0, color: '#b91c1c' }}>
          {error}
        </p>
      </div>
    );
  }

  if (products === null) {
    return (
      <div data-testid="admin-catalog-screen" data-state="loading">
        <p
          data-testid="admin-catalog-loading"
          style={{ margin: 0, color: 'var(--admin-text-muted, #64748b)' }}
        >
          Loading catalog…
        </p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div data-testid="admin-catalog-screen" data-state="empty">
        <p
          data-testid="admin-catalog-empty"
          style={{ margin: 0, color: 'var(--admin-text-muted, #64748b)' }}
        >
          No products yet. Create products via the catalog module.
        </p>
      </div>
    );
  }

  return (
    <div data-testid="admin-catalog-screen" data-state="ready">
      <table
        data-testid="admin-catalog-table"
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: '0.9rem',
        }}
      >
        <thead>
          <tr style={{ textAlign: 'left', color: 'var(--admin-text-muted, #64748b)' }}>
            <th style={{ padding: '0.5rem 0.4rem', borderBottom: '1px solid #e2e8f0' }}>Name</th>
            <th style={{ padding: '0.5rem 0.4rem', borderBottom: '1px solid #e2e8f0' }}>Slug</th>
            <th style={{ padding: '0.5rem 0.4rem', borderBottom: '1px solid #e2e8f0' }}>Status</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id} data-testid={`admin-catalog-row-${product.slug}`}>
              <td style={{ padding: '0.55rem 0.4rem', borderBottom: '1px solid #e2e8f0' }}>
                {product.name}
              </td>
              <td style={{ padding: '0.55rem 0.4rem', borderBottom: '1px solid #e2e8f0' }}>
                {product.slug}
              </td>
              <td style={{ padding: '0.55rem 0.4rem', borderBottom: '1px solid #e2e8f0' }}>
                {product.status}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
