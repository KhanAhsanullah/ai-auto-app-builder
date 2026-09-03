import { useEffect, useState, type ReactNode } from 'react';

import type { Product } from '@ai-commerce/module-catalog';

import type { WebStore } from '../../domain/web-store.js';

export interface WebCatalogScreenProps {
  store: WebStore;
  /** When set with cart wired, shows Add buttons. */
  sessionId?: string;
}

/**
 * Storefront catalog screen — lists active products via `catalogSurface`.
 */
export function WebCatalogScreen(props: WebCatalogScreenProps): ReactNode {
  const { store, sessionId } = props;
  const [products, setProducts] = useState<Product[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [busySku, setBusySku] = useState<string | null>(null);
  const canAdd = Boolean(sessionId) && store.isCartAvailable();

  useEffect(() => {
    let cancelled = false;
    setProducts(null);
    setError(null);

    if (!store.isCatalogAvailable()) {
      setError('Catalog is not available for this store.');
      return;
    }

    void store.catalogSurface
      .listActiveProducts()
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
  }, [store]);

  async function addToCart(product: Product) {
    if (!sessionId || !product.variants[0]) {
      return;
    }
    const variant = product.variants[0];
    setBusySku(variant.sku);
    setMessage(null);
    try {
      const cart = await store.cartSurface.getOrCreateBySession({ sessionId });
      await store.cartSurface.addItemFromCatalog({
        cartId: cart.id,
        productId: product.id,
        variantId: variant.id,
      });
      setMessage(`Added ${product.name} to cart.`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to add to cart.');
    } finally {
      setBusySku(null);
    }
  }

  if (error && products === null) {
    return (
      <div data-testid="web-catalog-screen" data-state="error">
        <p data-testid="web-catalog-error" style={{ margin: 0, color: '#b91c1c' }}>
          {error}
        </p>
      </div>
    );
  }

  if (products === null) {
    return (
      <div data-testid="web-catalog-screen" data-state="loading">
        <p
          data-testid="web-catalog-loading"
          style={{ margin: 0, color: 'var(--web-text-muted, #64748b)' }}
        >
          Loading products…
        </p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div data-testid="web-catalog-screen" data-state="empty">
        <p
          data-testid="web-catalog-empty"
          style={{ margin: 0, color: 'var(--web-text-muted, #64748b)' }}
        >
          No products yet.
        </p>
      </div>
    );
  }

  return (
    <div data-testid="web-catalog-screen" data-state="ready">
      {message ? (
        <p data-testid="web-catalog-toast" style={{ margin: '0 0 0.75rem', color: '#047857' }}>
          {message}
        </p>
      ) : null}
      <ul
        data-testid="web-catalog-list"
        style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: '0.75rem' }}
      >
        {products.map((product) => {
          const price = product.variants[0]?.price;
          const sku = product.variants[0]?.sku;
          return (
            <li
              key={product.id}
              data-testid={`web-catalog-item-${product.slug}`}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: '1rem',
                alignItems: 'center',
                padding: '0.85rem 0',
                borderBottom: '1px solid var(--web-border, #e2e8f0)',
              }}
            >
              <div>
                <div style={{ fontWeight: 600, color: 'var(--web-text, #0f172a)' }}>
                  {product.name}
                </div>
                <div
                  style={{
                    marginTop: '0.25rem',
                    fontSize: '0.85rem',
                    color: 'var(--web-text-muted, #64748b)',
                  }}
                >
                  {product.slug}
                  {price
                    ? ` · ${price.currency} ${price.amount.toFixed(price.currency === 'PKR' ? 0 : 2)}`
                    : ''}
                </div>
              </div>
              {canAdd && sku ? (
                <button
                  type="button"
                  data-testid={`web-catalog-add-${product.slug}`}
                  disabled={busySku === sku}
                  onClick={() => void addToCart(product)}
                  style={{
                    padding: '0.4rem 0.75rem',
                    border: '1px solid var(--web-border, #e2e8f0)',
                    borderRadius: '0.35rem',
                    background: '#fff',
                    cursor: 'pointer',
                  }}
                >
                  Add
                </button>
              ) : null}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
