import type { ReactNode } from 'react';

export interface WebHomeScreenProps {
  brandName: string;
  tagline?: string;
  logoUrl?: string;
  verticalLabel?: string;
  onShop?: () => void;
}

/**
 * Storefront home — brand-first hero with a single CTA into the catalog.
 */
export function WebHomeScreen(props: WebHomeScreenProps): ReactNode {
  const { brandName, tagline, logoUrl, verticalLabel, onShop } = props;

  return (
    <section
      data-testid="web-home-screen"
      style={{
        display: 'grid',
        gap: '1.75rem',
        alignContent: 'start',
        minHeight: 'min(70vh, 36rem)',
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
          <div style={{ marginTop: '0.5rem' }}>
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
