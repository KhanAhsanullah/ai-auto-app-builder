import type { ReactNode } from 'react';

import type { ResolvedWebNavItem } from '../types.js';

export interface WebTopNavProps {
  items: readonly ResolvedWebNavItem[];
  activeRoute: string;
  onNavigate?: (route: string) => void;
}

/** Config-driven top navigation for the web storefront. */
export function WebTopNav(props: WebTopNavProps): ReactNode {
  if (props.items.length === 0) {
    return null;
  }

  return (
    <nav
      data-testid="web-top-nav"
      aria-label="Primary"
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.35rem',
        padding: '0.65rem 1.25rem',
        background: 'var(--web-nav-bg, #0f172a)',
        color: 'var(--web-nav-text, #e2e8f0)',
      }}
    >
      {props.items.map((item) => (
        <TopNavItem
          key={item.id}
          item={item}
          activeRoute={props.activeRoute}
          onNavigate={props.onNavigate}
        />
      ))}
    </nav>
  );
}

function TopNavItem(props: {
  item: ResolvedWebNavItem;
  activeRoute: string;
  onNavigate?: (route: string) => void;
}): ReactNode {
  const { item, activeRoute, onNavigate } = props;
  const active = item.route === activeRoute;

  return (
    <button
      type="button"
      data-testid={`web-nav-${item.id}`}
      data-active={active ? 'true' : 'false'}
      aria-current={active ? 'page' : undefined}
      onClick={() => onNavigate?.(item.route)}
      style={{
        border: 'none',
        background: active ? 'var(--web-nav-active, #2563eb)' : 'transparent',
        color: 'inherit',
        borderRadius: '0.375rem',
        padding: '0.45rem 0.75rem',
        cursor: 'pointer',
        fontSize: '0.9rem',
      }}
    >
      {item.label}
    </button>
  );
}
