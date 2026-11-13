import { useEffect, useMemo, useState, type ReactNode } from 'react';

import type { Category, Product } from '@ai-commerce/module-catalog';

import type { WebStore } from '../../domain/web-store.js';

export interface WebCatalogScreenProps {
  store: WebStore;
  /** When set with cart wired, shows Add buttons. */
  sessionId?: string;
  /** Open product detail for a slug. */
  onOpenProduct?: (slug: string) => void;
}

/**
 * Storefront catalog — search + category chips + product cards (Sprint 31).
 */
export function WebCatalogScreen(props: WebCatalogScreenProps): ReactNode {
  const { store, sessionId, onOpenProduct } = props;
  const [products, setProducts] = useState<Product[] | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [busySku, setBusySku] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const canAdd = Boolean(sessionId) && store.isCartAvailable();

  useEffect(() => {
    let cancelled = false;
    setProducts(null);
    setError(null);
    setCategoryId(null);

    if (!store.isCatalogAvailable()) {
      setError('Catalog is not available for this store.');
      return;
    }

    void Promise.all([
      store.catalogSurface.listActiveProducts(),
      store.catalogSurface.listCategories().catch(() => [] as Category[]),
    ])
      .then(([list, cats]) => {
        if (!cancelled) {
          setProducts(list);
          setCategories(
            [...cats].sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name)),
          );
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

  const filtered = useMemo(() => {
    if (!products) {
      return null;
    }
    const q = query.trim().toLowerCase();
    return products.filter((product) => {
      if (categoryId && !product.categoryIds.includes(categoryId)) {
        return false;
      }
      if (!q) {
        return true;
      }
      return (
        product.name.toLowerCase().includes(q) ||
        product.slug.toLowerCase().includes(q) ||
        product.variants.some((v) => v.sku.toLowerCase().includes(q))
      );
    });
  }, [products, query, categoryId]);

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

  if (products === null || filtered === null) {
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

  const selectedCategory = categoryId
    ? categories.find((category) => category.id === categoryId)
    : undefined;
  const noResultsLabel = [
    query.trim() ? `“${query.trim()}”` : null,
    selectedCategory ? selectedCategory.name : null,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <div data-testid="web-catalog-screen" data-state="ready">
      <div
        data-testid="web-catalog-filters"
        style={{
          display: 'grid',
          gap: '0.85rem',
          marginBottom: '1rem',
        }}
      >
        <label
          style={{
            display: 'grid',
            gap: '0.35rem',
            fontSize: '0.85rem',
            color: 'var(--web-text-muted, #64748b)',
          }}
        >
          Search products
          <input
            data-testid="web-catalog-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Name or SKU…"
            style={{
              border: '1px solid var(--web-border, #e5e7eb)',
              borderRadius: '0.5rem',
              padding: '0.65rem 0.75rem',
              font: 'inherit',
              width: '100%',
              maxWidth: '28rem',
              boxSizing: 'border-box',
            }}
          />
        </label>
        {categories.length > 0 ? (
          <div
            data-testid="web-catalog-category-chips"
            role="group"
            aria-label="Categories"
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.45rem',
            }}
          >
            <CategoryChip
              testId="web-catalog-category-all"
              label="All"
              selected={categoryId === null}
              onClick={() => setCategoryId(null)}
            />
            {categories.map((category) => (
              <CategoryChip
                key={category.id}
                testId={`web-catalog-category-${category.slug}`}
                label={category.name}
                selected={categoryId === category.id}
                onClick={() => setCategoryId(category.id)}
              />
            ))}
          </div>
        ) : null}
      </div>
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
      {filtered.length === 0 ? (
        <p data-testid="web-catalog-no-results" style={{ color: 'var(--web-text-muted, #64748b)' }}>
          No products match {noResultsLabel || 'these filters'}.
        </p>
      ) : (
        <ul
          data-testid="web-catalog-list"
          className="web-catalog-grid"
          style={{
            listStyle: 'none',
            margin: 0,
            padding: 0,
            display: 'grid',
            gap: '1rem',
            gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 11rem), 1fr))',
          }}
        >
          {filtered.map((product) => {
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
                <CatalogImage slug={product.slug} name={product.name} imageUrl={imageUrl} />
                <button
                  type="button"
                  data-testid={`web-catalog-open-${product.slug}`}
                  onClick={() => onOpenProduct?.(product.slug)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.25rem',
                    flex: 1,
                    border: 'none',
                    background: 'transparent',
                    padding: 0,
                    textAlign: 'left',
                    cursor: onOpenProduct ? 'pointer' : 'default',
                  }}
                >
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
                  {onOpenProduct ? (
                    <span style={{ fontSize: '0.8rem', color: 'var(--web-text-muted, #64748b)' }}>
                      View details →
                    </span>
                  ) : null}
                </button>
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
      )}
    </div>
  );
}

function CategoryChip(props: {
  testId: string;
  label: string;
  selected: boolean;
  onClick: () => void;
}): ReactNode {
  return (
    <button
      type="button"
      data-testid={props.testId}
      data-selected={props.selected ? 'true' : 'false'}
      aria-pressed={props.selected}
      onClick={props.onClick}
      style={{
        border: props.selected
          ? '1px solid var(--web-brand, #16a34a)'
          : '1px solid var(--web-border, #e5e7eb)',
        borderRadius: '0.5rem',
        padding: '0.4rem 0.85rem',
        background: props.selected ? 'var(--web-brand, #16a34a)' : 'var(--web-surface, #f9fafb)',
        color: props.selected ? '#fff' : 'var(--web-text, #0f172a)',
        cursor: 'pointer',
        font: 'inherit',
        fontSize: '0.85rem',
        fontWeight: 600,
      }}
    >
      {props.label}
    </button>
  );
}

function CatalogImage(props: { slug: string; name: string; imageUrl?: string }): ReactNode {
  const [failed, setFailed] = useState(false);
  if (props.imageUrl && !failed) {
    return (
      <img
        data-testid={`web-catalog-image-${props.slug}`}
        src={props.imageUrl}
        alt=""
        onError={() => setFailed(true)}
        style={{
          aspectRatio: '4 / 3',
          width: '100%',
          objectFit: 'cover',
          borderRadius: '0.45rem',
          background: 'var(--web-border, #e5e7eb)',
        }}
      />
    );
  }
  return (
    <div
      aria-hidden
      data-testid={`web-catalog-swatch-${props.slug}`}
      style={{
        aspectRatio: '4 / 3',
        borderRadius: '0.45rem',
        display: 'grid',
        placeItems: 'center',
        background: swatchBackground(props.slug),
        color: '#fff',
        fontWeight: 700,
        fontSize: '1.5rem',
        letterSpacing: '0.04em',
      }}
    >
      {initials(props.name)}
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
