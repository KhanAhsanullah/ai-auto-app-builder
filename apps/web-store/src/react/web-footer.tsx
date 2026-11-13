import type { ReactNode } from 'react';

import type { ResolvedWebNavItem } from '../types.js';

export interface WebFooterProps {
  items: readonly ResolvedWebNavItem[];
  copyrightText?: string;
  showPoweredBy: boolean;
  onNavigate?: (route: string) => void;
}

/** Config-driven footer for the web storefront. */
export function WebFooter(props: WebFooterProps): ReactNode {
  return (
    <footer
      data-testid="web-footer"
      style={{
        padding: '1.25rem',
        borderTop: '1px solid var(--web-border, #e2e8f0)',
        background: 'var(--web-footer-bg, #f8fafc)',
        color: 'var(--web-text-muted, #64748b)',
        fontSize: '0.875rem',
      }}
    >
      {props.items.length > 0 ? (
        <nav aria-label="Footer" data-testid="web-footer-nav" style={{ marginBottom: '0.75rem' }}>
          <ul
            style={{
              listStyle: 'none',
              margin: 0,
              padding: 0,
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.75rem',
            }}
          >
            {props.items.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  data-testid={`web-footer-nav-${item.id}`}
                  onClick={() => props.onNavigate?.(item.route)}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    color: 'inherit',
                    cursor: 'pointer',
                    padding: 0,
                    textDecoration: 'underline',
                  }}
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
      <div
        data-testid="web-footer-meta"
        style={{
          display: 'grid',
          gap: '0.35rem',
          marginBottom: props.copyrightText || props.showPoweredBy ? '0.75rem' : 0,
        }}
      >
        <p style={{ margin: 0 }}>Customer care · Mon–Sat 10:00–20:00</p>
        <p style={{ margin: 0 }}>Orders &amp; returns · in-app Orders screen</p>
      </div>
      {props.copyrightText ? (
        <p data-testid="web-footer-copyright" style={{ margin: 0 }}>
          {props.copyrightText}
        </p>
      ) : null}
      {props.showPoweredBy ? (
        <p data-testid="web-footer-powered-by" style={{ margin: '0.35rem 0 0' }}>
          Powered by CommerceOS AI
        </p>
      ) : null}
    </footer>
  );
}
