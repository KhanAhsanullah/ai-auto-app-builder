import type { ReactNode } from 'react';

export interface WebAboutScreenProps {
  brandName: string;
  tagline?: string;
  verticalLabel?: string;
  onShop?: () => void;
  onContact?: () => void;
}

/**
 * About page — store story for Boom tenants (Sprint 31 Task 2).
 */
export function WebAboutScreen(props: WebAboutScreenProps): ReactNode {
  const { brandName, tagline, verticalLabel, onShop, onContact } = props;
  const vertical = verticalLabel?.trim() || 'commerce';

  return (
    <article
      data-testid="web-about-screen"
      style={{ display: 'grid', gap: '1.5rem', maxWidth: '42rem' }}
    >
      <header style={{ display: 'grid', gap: '0.5rem' }}>
        <p
          style={{
            margin: 0,
            fontSize: '0.8rem',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            color: 'var(--web-brand, #16a34a)',
            fontWeight: 600,
          }}
        >
          About
        </p>
        <h2
          data-testid="web-about-title"
          style={{ margin: 0, fontSize: 'clamp(1.75rem, 4vw, 2.35rem)', lineHeight: 1.15 }}
        >
          {brandName}
        </h2>
        {tagline ? (
          <p
            data-testid="web-about-tagline"
            style={{ margin: 0, color: 'var(--web-text-muted, #64748b)', fontSize: '1.05rem' }}
          >
            {tagline}
          </p>
        ) : null}
      </header>

      <p data-testid="web-about-body" style={{ margin: 0, lineHeight: 1.6 }}>
        {brandName} is a {vertical} storefront built on CommerceOS AI — launch with your brand,
        browse a ready catalog, and check out in minutes. This page is part of the richer storefront
        experience for merchants and their customers.
      </p>

      <ul
        data-testid="web-about-points"
        style={{
          margin: 0,
          padding: '1rem 1.15rem',
          listStyle: 'disc',
          borderRadius: '0.75rem',
          background: 'var(--web-surface, #f9fafb)',
          border: '1px solid var(--web-border, #e5e7eb)',
          display: 'grid',
          gap: '0.45rem',
          color: 'var(--web-text, #0f172a)',
        }}
      >
        <li>Branded shop experience for your customers</li>
        <li>Catalog, cart, and checkout in one flow</li>
        <li>Shareable store link you can send anytime</li>
      </ul>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
        {onShop ? (
          <button
            type="button"
            data-testid="web-about-shop"
            onClick={onShop}
            style={{
              border: 'none',
              borderRadius: '0.5rem',
              padding: '0.75rem 1.15rem',
              background: 'var(--web-brand, #16a34a)',
              color: '#fff',
              fontWeight: 650,
              cursor: 'pointer',
            }}
          >
            Browse shop
          </button>
        ) : null}
        {onContact ? (
          <button
            type="button"
            data-testid="web-about-contact"
            onClick={onContact}
            style={{
              border: '1px solid var(--web-border, #e5e7eb)',
              borderRadius: '0.5rem',
              padding: '0.75rem 1.15rem',
              background: 'var(--web-content-bg, #fff)',
              fontWeight: 650,
              cursor: 'pointer',
            }}
          >
            Contact us
          </button>
        ) : null}
      </div>
    </article>
  );
}
