import { useEffect, useState, type ReactNode } from 'react';

import type { Product } from '@ai-commerce/module-catalog';

import type { WebStore } from '../../domain/web-store.js';

export interface WebCatalogScreenProps {
  store: WebStore;
  /** When set with cart wired, shows Add buttons. */
  sessionId?: string;
}

/**
 * Storefront catalog — product cards with brand-tinted media placeholders.
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
      {error ? (
        <p
          data-testid="web-catalog-inline-error"
          style={{ margin: '0 0 0.75rem', color: '#b91c1c' }}
        >
          {error}
        </p>
      ) : null}
      <ul
        data-testid="web-catalog-list"
        style={{
          listStyle: 'none',
          margin: 0,
          padding: 0,
          display: 'grid',
          gap: '1rem',
          gridTemplateColumns: 'repeat(auto-fill, minmax(15rem, 1fr))',
        }}
      >
        {products.map((product) => {
          const price = product.variants[0]?.price;
          const sku = product.variants[0]?.sku;
          const imageUrl = product.variants[0]?.attributes?.imageUrl;
          const priceLabel = price
            ? `${price.currency} ${price.amount.toFixed(price.currency === 'PKR' ? 0 : 2)}`
            : null;
          return (
            <li
              key={product.id}
              data-testid={`web-catalog-item-${product.slug}`}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.85rem',
                padding: '0.85rem',
                borderRadius: '0.65rem',
                background: 'var(--web-surface, #f9fafb)',
                border: '1px solid var(--web-border, #e5e7eb)',
              }}
            >
              {imageUrl ? (
                <img
                  data-testid={`web-catalog-image-${product.slug}`}
                  src={imageUrl}
                  alt=""
                  style={{
                    aspectRatio: '4 / 3',
                    width: '100%',
                    objectFit: 'cover',
                    borderRadius: '0.45rem',
                    background: 'var(--web-border, #e5e7eb)',
                  }}
                />
              ) : (
                <div
                  aria-hidden
                  data-testid={`web-catalog-swatch-${product.slug}`}
                  style={{
                    aspectRatio: '4 / 3',
                    borderRadius: '0.45rem',
                    display: 'grid',
                    placeItems: 'center',
                    background: swatchBackground(product.slug),
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: '1.5rem',
                    letterSpacing: '0.04em',
                  }}
                >
                  {initials(product.name)}
                </div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: 1 }}>
                <div style={{ fontWeight: 650, color: 'var(--web-text, #0f172a)' }}>
                  {product.name}
                </div>
                {priceLabel ? (
                  <div
                    style={{
                      fontSize: '0.95rem',
                      fontWeight: 600,
                      color: 'var(--web-brand, #16a34a)',
                    }}
                  >
                    {priceLabel}
                  </div>
                ) : null}
              </div>
              {canAdd && sku ? (
                <button
                  type="button"
                  data-testid={`web-catalog-add-${product.slug}`}
                  disabled={busySku === sku}
                  onClick={() => void addToCart(product)}
                  style={{
                    padding: '0.55rem 0.75rem',
                    border: 'none',
                    borderRadius: '0.4rem',
                    background: 'var(--web-brand, #16a34a)',
                    color: '#fff',
                    cursor: 'pointer',
                    fontWeight: 600,
                    opacity: busySku === sku ? 0.7 : 1,
                  }}
                >
                  {busySku === sku ? 'Adding…' : 'Add to cart'}
                </button>
              ) : null}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return '?';
  }
  if (parts.length === 1) {
    return parts[0]!.slice(0, 2).toUpperCase();
  }
  return `${parts[0]![0] ?? ''}${parts[1]![0] ?? ''}`.toUpperCase();
}

/** Stable tint from slug so cards feel distinct without product images. */
function swatchBackground(slug: string): string {
  let hash = 0;
  for (let i = 0; i < slug.length; i += 1) {
    hash = (hash * 31 + slug.charCodeAt(i)) >>> 0;
  }
  const mix = 18 + (hash % 28);
  return `color-mix(in srgb, var(--web-brand, #16a34a) ${mix}%, #1f2937)`;
}
