import { useEffect, useState, type ReactNode } from 'react';

import type { Product } from '@ai-commerce/module-catalog';

import type { WebStore } from '../../domain/web-store.js';

export interface WebHomeScreenProps {
  brandName: string;
  tagline?: string;
  logoUrl?: string;
  verticalLabel?: string;
  onShop?: () => void;
  /** When set, loads featured products from the store catalog. */
  store?: WebStore;
  onOpenProduct?: (slug: string) => void;
}

/**
 * Storefront home — brand hero, trust strip, and featured products (Sprint 31).
 */
export function WebHomeScreen(props: WebHomeScreenProps): ReactNode {
  const { brandName, tagline, logoUrl, verticalLabel, onShop, store, onOpenProduct } = props;
  const [featured, setFeatured] = useState<Product[]>([]);

  useEffect(() => {
    if (!store?.isCatalogAvailable()) {
      setFeatured([]);
      return;
    }
    let cancelled = false;
    void store.catalogSurface
      .listActiveProducts()
      .then((list) => {
        if (!cancelled) {
          setFeatured(list.slice(0, 3));
        }
      })
      .catch(() => {
        if (!cancelled) {
          setFeatured([]);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [store]);

  return (
    <div data-testid="web-home-screen" style={{ display: 'grid', gap: '2rem' }}>
      <section
        data-testid="web-home-hero"
        style={{
          display: 'grid',
          gap: '1.75rem',
          alignContent: 'start',
          minHeight: 'min(52vh, 28rem)',
          padding: 'clamp(1.5rem, 4vw, 3rem) clamp(0.5rem, 2vw, 1rem)',
          borderRadius: '0.75rem',
          background: `
          radial-gradient(120% 80% at 100% 0%, color-mix(in srgb, var(--web-brand, #16a34a) 22%, transparent), transparent 55%),
          linear-gradient(165deg, var(--web-surface, #f9fafb) 0%, var(--web-content-bg, #fff) 55%, color-mix(in srgb, var(--web-brand, #16a34a) 8%, var(--web-content-bg, #fff)) 100%)
        `,
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '36rem' }}>
          {logoUrl ? (
            <img
              data-testid="web-home-logo"
              src={logoUrl}
              alt=""
              width={56}
              height={56}
              style={{ borderRadius: 8, objectFit: 'cover' }}
            />
          ) : (
            <div
              data-testid="web-home-mark"
              aria-hidden
              style={{
                width: 56,
                height: 56,
                borderRadius: 8,
                display: 'grid',
                placeItems: 'center',
                background: 'var(--web-brand, #16a34a)',
                color: '#fff',
                fontWeight: 700,
                fontSize: '1.35rem',
              }}
            >
              {initials(brandName)}
            </div>
          )}
          <h2
            data-testid="web-home-brand"
            style={{
              margin: 0,
              fontSize: 'clamp(2rem, 5vw, 3rem)',
              lineHeight: 1.05,
              letterSpacing: '-0.02em',
              fontWeight: 750,
              color: 'var(--web-text, #111827)',
            }}
          >
            {brandName}
          </h2>
          {tagline ? (
            <p
              data-testid="web-home-tagline"
              style={{
                margin: 0,
                fontSize: '1.1rem',
                lineHeight: 1.45,
                color: 'var(--web-text-muted, #6b7280)',
                maxWidth: '28rem',
              }}
            >
              {tagline}
            </p>
          ) : null}
          {verticalLabel ? (
            <p
              data-testid="web-home-vertical"
              style={{
                margin: 0,
                fontSize: '0.8rem',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                color: 'var(--web-brand, #16a34a)',
                fontWeight: 600,
              }}
            >
              {verticalLabel}
            </p>
          ) : null}
          {onShop ? (
            <div style={{ marginTop: '0.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
              <button
                type="button"
                data-testid="web-home-shop"
                onClick={onShop}
                style={{
                  border: 'none',
                  borderRadius: '0.5rem',
                  padding: '0.85rem 1.35rem',
                  background: 'var(--web-brand, #16a34a)',
                  color: '#fff',
                  fontWeight: 650,
                  fontSize: '1rem',
                  cursor: 'pointer',
                }}
              >
                Shop catalog
              </button>
            </div>
          ) : null}
        </div>
      </section>

      <section data-testid="web-home-trust" aria-label="Why shop here">
        <ul
          style={{
            listStyle: 'none',
            margin: 0,
            padding: 0,
            display: 'grid',
            gap: '0.75rem',
            gridTemplateColumns: 'repeat(auto-fit, minmax(11rem, 1fr))',
          }}
        >
          {TRUST_ITEMS.map((item) => (
            <li
              key={item.title}
              style={{
                padding: '1rem',
                borderRadius: '0.65rem',
                border: '1px solid var(--web-border, #e5e7eb)',
                background: 'var(--web-surface, #f9fafb)',
              }}
            >
              <div style={{ fontWeight: 650, marginBottom: '0.25rem' }}>{item.title}</div>
              <div style={{ fontSize: '0.9rem', color: 'var(--web-text-muted, #64748b)' }}>
                {item.body}
              </div>
            </li>
          ))}
        </ul>
      </section>

      {featured.length > 0 ? (
        <section data-testid="web-home-featured">
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              marginBottom: '0.85rem',
              gap: '1rem',
            }}
          >
            <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Featured</h3>
            {onShop ? (
              <button
                type="button"
                data-testid="web-home-featured-all"
                onClick={onShop}
                style={{
                  border: 'none',
                  background: 'transparent',
                  color: 'var(--web-brand, #16a34a)',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                View all
              </button>
            ) : null}
          </div>
          <ul
            style={{
              listStyle: 'none',
              margin: 0,
              padding: 0,
              display: 'grid',
              gap: '1rem',
              gridTemplateColumns: 'repeat(auto-fill, minmax(12rem, 1fr))',
            }}
          >
            {featured.map((product) => (
              <li key={product.id}>
                <button
                  type="button"
                  data-testid={`web-home-featured-${product.slug}`}
                  onClick={() => onOpenProduct?.(product.slug)}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    border: '1px solid var(--web-border, #e5e7eb)',
                    borderRadius: '0.65rem',
                    background: 'var(--web-content-bg, #fff)',
                    padding: '0.75rem',
                    cursor: onOpenProduct ? 'pointer' : 'default',
                    display: 'grid',
                    gap: '0.5rem',
                  }}
                >
                  <FeaturedThumb product={product} />
                  <strong style={{ fontSize: '0.95rem' }}>{product.name}</strong>
                  {product.variants[0]?.price ? (
                    <span style={{ color: 'var(--web-brand, #16a34a)', fontWeight: 600 }}>
                      {product.variants[0].price.currency}{' '}
                      {product.variants[0].price.amount.toFixed(
                        product.variants[0].price.currency === 'PKR' ? 0 : 2,
                      )}
                    </span>
                  ) : null}
                </button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

const TRUST_ITEMS = [
  { title: 'Curated catalog', body: 'Vertical-ready products for your store type.' },
  { title: 'Fast checkout', body: 'Cart → address → pay → orders in one flow.' },
  { title: 'Shareable store', body: 'Send your /t/slug link to customers instantly.' },
] as const;

function FeaturedThumb(props: { product: Product }): ReactNode {
  const [failed, setFailed] = useState(false);
  const imageUrl = props.product.variants[0]?.attributes?.imageUrl;
  if (imageUrl && !failed) {
    return (
      <img
        src={imageUrl}
        alt=""
        onError={() => setFailed(true)}
        style={{
          width: '100%',
          aspectRatio: '4 / 3',
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
      style={{
        aspectRatio: '4 / 3',
        borderRadius: '0.45rem',
        display: 'grid',
        placeItems: 'center',
        background: 'color-mix(in srgb, var(--web-brand, #16a34a) 24%, #1f2937)',
        color: '#fff',
        fontWeight: 700,
      }}
    >
      {initials(props.product.name)}
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
