import type { ReactNode } from 'react';

export interface WebHeaderProps {
  brandName: string;
  title: string;
  subtitle?: string;
  tagline?: string;
  logoUrl?: string;
}

/** Top header for the web storefront shell. */
export function WebHeader(props: WebHeaderProps): ReactNode {
  return (
    <header
      data-testid="web-header"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        padding: '1rem 1.25rem',
        background: 'var(--web-header-bg, #ffffff)',
        borderBottom: '1px solid var(--web-border, #e2e8f0)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
        {props.logoUrl ? (
          <img
            data-testid="web-header-logo"
            src={props.logoUrl}
            alt=""
            width={32}
            height={32}
            style={{ borderRadius: 4 }}
          />
        ) : null}
        <div style={{ minWidth: 0 }}>
          <div
            data-testid="web-header-brand"
            style={{
              fontWeight: 700,
              fontSize: '1.05rem',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {props.brandName}
          </div>
          {props.tagline ? (
            <p
              data-testid="web-header-tagline"
              style={{
                margin: '0.15rem 0 0',
                color: 'var(--web-text-muted, #64748b)',
                fontSize: '0.85rem',
              }}
            >
              {props.tagline}
            </p>
          ) : null}
        </div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <h1
          data-testid="web-header-title"
          style={{ margin: 0, fontSize: '1.15rem', fontWeight: 650 }}
        >
          {props.title}
        </h1>
        {props.subtitle ? (
          <p
            data-testid="web-header-subtitle"
            style={{
              margin: '0.25rem 0 0',
              color: 'var(--web-text-muted, #64748b)',
              fontSize: '0.85rem',
            }}
          >
            {props.subtitle}
          </p>
        ) : null}
      </div>
    </header>
  );
}
