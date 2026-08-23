import type { ReactNode } from 'react';

import type { ResolvedAdminNavItem } from '../types.js';

export interface AdminSidebarProps {
  brandName: string;
  items: readonly ResolvedAdminNavItem[];
  activeRoute: string;
  sidebarStyle: 'expanded' | 'collapsed' | 'mini';
  onNavigate?: (route: string) => void;
}

/** Config-driven admin sidebar navigation. */
export function AdminSidebar(props: AdminSidebarProps): ReactNode {
  const compact = props.sidebarStyle === 'collapsed' || props.sidebarStyle === 'mini';

  return (
    <aside
      data-testid="admin-sidebar"
      data-sidebar-style={props.sidebarStyle}
      aria-label="Admin navigation"
      style={{
        width: compact ? '4rem' : '16rem',
        background: 'var(--admin-sidebar-bg, #0f172a)',
        color: 'var(--admin-sidebar-text, #e2e8f0)',
        minHeight: '100%',
        padding: '1rem 0.75rem',
        boxSizing: 'border-box',
      }}
    >
      <div
        data-testid="admin-sidebar-brand"
        style={{
          fontWeight: 700,
          fontSize: compact ? '0.75rem' : '1.05rem',
          marginBottom: '1.25rem',
          paddingInline: '0.5rem',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {compact ? props.brandName.slice(0, 1) : props.brandName}
      </div>
      <nav>
        <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {props.items.map((item) => (
            <SidebarItem
              key={item.id}
              item={item}
              activeRoute={props.activeRoute}
              compact={compact}
              onNavigate={props.onNavigate}
            />
          ))}
        </ul>
      </nav>
    </aside>
  );
}

function SidebarItem(props: {
  item: ResolvedAdminNavItem;
  activeRoute: string;
  compact: boolean;
  onNavigate?: (route: string) => void;
}): ReactNode {
  const { item, activeRoute, compact, onNavigate } = props;
  const active = item.route === activeRoute;

  return (
    <li>
      <button
        type="button"
        data-testid={`admin-nav-${item.id}`}
        data-active={active ? 'true' : 'false'}
        aria-current={active ? 'page' : undefined}
        title={item.label}
        onClick={() => onNavigate?.(item.route)}
        style={{
          display: 'block',
          width: '100%',
          textAlign: 'left',
          border: 'none',
          background: active ? 'var(--admin-sidebar-active, #2563eb)' : 'transparent',
          color: 'inherit',
          borderRadius: '0.375rem',
          padding: '0.55rem 0.65rem',
          marginBottom: '0.25rem',
          cursor: 'pointer',
          fontSize: '0.9rem',
        }}
      >
        {compact ? (item.icon ?? item.label.slice(0, 1)) : item.label}
      </button>
      {!compact && item.children && item.children.length > 0 ? (
        <ul style={{ listStyle: 'none', margin: '0 0 0.5rem 0.75rem', padding: 0 }}>
          {item.children.map((child) => (
            <SidebarItem
              key={child.id}
              item={child}
              activeRoute={activeRoute}
              compact={compact}
              onNavigate={onNavigate}
            />
          ))}
        </ul>
      ) : null}
    </li>
  );
}
