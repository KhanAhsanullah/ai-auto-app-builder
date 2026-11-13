import { useEffect, useState, type ReactNode } from 'react';

import type { Product } from '@ai-commerce/module-catalog';

import type { WebStore } from '../../domain/web-store.js';

export interface WebProductScreenProps {
  store: WebStore;
  productSlug: string;
  sessionId?: string;
  onBack?: () => void;
  onAddedToCart?: () => void;
}

/**
 * Product detail — name, price, image, add to cart (Sprint 31 Task 1).
 */
export function WebProductScreen(props: WebProductScreenProps): ReactNode {
  const { store, productSlug, sessionId, onBack, onAddedToCart } = props;
  const [product, setProduct] = useState<Product | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const canAdd = Boolean(sessionId) && store.isCartAvailable();

  useEffect(() => {
    let cancelled = false;
    setProduct(null);
    setError(null);
    setImageFailed(false);

    void store.catalogSurface
      .getProductBySlug(productSlug)
      .then((loaded) => {
        if (!cancelled) {
          setProduct(loaded);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Product not found.');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [store, productSlug]);

  async function addToCart() {
    if (!sessionId || !product?.variants[0]) {
      return;
    }
    const variant = product.variants[0];
    setBusy(true);
    setError(null);
    try {
      const cart = await store.cartSurface.getOrCreateBySession({ sessionId });
      await store.cartSurface.addItemFromCatalog({
        cartId: cart.id,
        productId: product.id,
        variantId: variant.id,
      });
      onAddedToCart?.();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to add to cart.');
    } finally {
      setBusy(false);
    }
  }

  if (error && !product) {
    return (
      <div data-testid="web-product-screen" data-state="error">
        <p style={{ color: '#b91c1c', margin: '0 0 1rem' }}>{error}</p>
        {onBack ? (
          <button type="button" data-testid="web-product-back" onClick={onBack}>
            Back to shop
          </button>
        ) : null}
      </div>
    );
  }

  if (!product) {
    return (
      <div data-testid="web-product-screen" data-state="loading">
        <p style={{ margin: 0, color: 'var(--web-text-muted, #64748b)' }}>Loading product…</p>
      </div>
    );
  }

  const price = product.variants[0]?.price;
  const imageUrl = product.variants[0]?.attributes?.imageUrl;
  const priceLabel = price
    ? `${price.currency} ${price.amount.toFixed(price.currency === 'PKR' ? 0 : 2)}`
    : null;
  const title = product.variants[0]?.title;

  return (
    <article
      data-testid="web-product-screen"
      data-state="ready"
      data-slug={product.slug}
      style={{
        display: 'grid',
        gap: '1.5rem',
        gridTemplateColumns: 'repeat(auto-fit, minmax(16rem, 1fr))',
        alignItems: 'start',
      }}
    >
      <div>
        {imageUrl && !imageFailed ? (
          <img
            data-testid="web-product-image"
            src={imageUrl}
            alt=""
            onError={() => setImageFailed(true)}
            style={{
              width: '100%',
              aspectRatio: '4 / 3',
              objectFit: 'cover',
              borderRadius: '0.75rem',
              background: 'var(--web-border, #e5e7eb)',
            }}
          />
        ) : (
          <div
            data-testid="web-product-swatch"
            aria-hidden
            style={{
              aspectRatio: '4 / 3',
              borderRadius: '0.75rem',
              display: 'grid',
              placeItems: 'center',
              background: 'color-mix(in srgb, var(--web-brand, #16a34a) 28%, #1f2937)',
              color: '#fff',
              fontWeight: 700,
              fontSize: '2rem',
            }}
          >
            {product.name.slice(0, 2).toUpperCase()}
          </div>
        )}
      </div>
      <div style={{ display: 'grid', gap: '0.85rem' }}>
        {onBack ? (
          <button
            type="button"
            data-testid="web-product-back"
            onClick={onBack}
            style={{
              justifySelf: 'start',
              border: 'none',
              background: 'transparent',
              color: 'var(--web-brand, #16a34a)',
              cursor: 'pointer',
              padding: 0,
              fontWeight: 600,
            }}
          >
            ← Back to shop
          </button>
        ) : null}
        <h2
          data-testid="web-product-name"
          style={{ margin: 0, fontSize: '1.75rem', lineHeight: 1.15 }}
        >
          {product.name}
        </h2>
        {title ? (
          <p
            data-testid="web-product-variant"
            style={{ margin: 0, color: 'var(--web-text-muted, #64748b)' }}
          >
            {title}
          </p>
        ) : null}
        {priceLabel ? (
          <p
            data-testid="web-product-price"
            style={{
              margin: 0,
              fontSize: '1.35rem',
              fontWeight: 700,
              color: 'var(--web-brand, #16a34a)',
            }}
          >
            {priceLabel}
          </p>
        ) : null}
        {product.description ? (
          <p data-testid="web-product-description" style={{ margin: 0, lineHeight: 1.55 }}>
            {product.description}
          </p>
        ) : (
          <p
            data-testid="web-product-description"
            style={{ margin: 0, lineHeight: 1.55, color: 'var(--web-text-muted, #64748b)' }}
          >
            Fresh from the {store.shell.tenant.vertical} catalog — add to cart to continue checkout.
          </p>
        )}
        {error ? <p style={{ margin: 0, color: '#b91c1c' }}>{error}</p> : null}
        {canAdd ? (
          <button
            type="button"
            data-testid="web-product-add"
            disabled={busy}
            onClick={() => void addToCart()}
            style={{
              justifySelf: 'start',
              border: 'none',
              borderRadius: '0.5rem',
              padding: '0.85rem 1.25rem',
              background: 'var(--web-brand, #16a34a)',
              color: '#fff',
              fontWeight: 650,
              cursor: 'pointer',
              opacity: busy ? 0.7 : 1,
            }}
          >
            {busy ? 'Adding…' : 'Add to cart'}
          </button>
        ) : null}
      </div>
    </article>
  );
}
