import type { ReactNode } from 'react';

export interface AdminHeaderProps {
  title: string;
  subtitle?: string;
  tenantName: string;
  logoUrl?: string;
}

/** Top header for the admin shell. */
export function AdminHeader(props: AdminHeaderProps): ReactNode {
  return (
    <header
      data-testid="admin-header"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        padding: '1rem 1.25rem',
        background: 'var(--admin-header-bg, #ffffff)',
        borderBottom: '1px solid var(--admin-border, #e2e8f0)',
      }}
    >
      <div>
        <h1
          data-testid="admin-header-title"
          style={{ margin: 0, fontSize: '1.25rem', fontWeight: 650 }}
        >
          {props.title}
        </h1>
        {props.subtitle ? (
          <p
            data-testid="admin-header-subtitle"
            style={{ margin: '0.25rem 0 0', color: 'var(--admin-text-muted, #64748b)' }}
          >
            {props.subtitle}
          </p>
        ) : null}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {props.logoUrl ? (
          <img
            data-testid="admin-header-logo"
            src={props.logoUrl}
            alt=""
            width={28}
            height={28}
            style={{ borderRadius: 4 }}
          />
        ) : null}
        <span data-testid="admin-header-tenant" style={{ fontSize: '0.9rem' }}>
          {props.tenantName}
        </span>
      </div>
    </header>
  );
}
