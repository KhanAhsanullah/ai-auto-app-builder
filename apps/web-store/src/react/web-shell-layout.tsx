import type { ReactNode } from 'react';

import type { WebShellViewModel } from '../domain/build-web-shell-view-model.js';
import { WebFooter } from './web-footer.js';
import { WebHeader } from './web-header.js';
import { WebTopNav } from './web-top-nav.js';

export interface WebShellLayoutProps {
  viewModel: WebShellViewModel;
  onNavigate?: (route: string) => void;
  /** Optional content override; defaults to screen title placeholder. */
  children?: ReactNode;
}

/**
 * React web storefront shell: header + top nav + content + footer.
 * Theme CSS variables come from resolved tenant theme (Sprint 25).
 */
export function WebShellLayout(props: WebShellLayoutProps): ReactNode {
  const { viewModel, onNavigate, children } = props;
  const { shell, activeScreen, primaryNav, footerNav } = viewModel;
  const { theme } = shell;

  return (
    <div
      data-testid="web-shell-layout"
      data-nav-style={shell.navigation.style}
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        background: `var(--web-content-bg, ${theme.background})`,
        color: `var(--web-text, ${theme.text})`,
        fontFamily: 'var(--web-font-sans, "Segoe UI", "Helvetica Neue", sans-serif)',
        // Tenant theme → CSS custom properties used across screens
        ['--web-brand' as string]: theme.primary,
        ['--web-brand-secondary' as string]: theme.secondary,
        ['--web-content-bg' as string]: theme.background,
        ['--web-surface' as string]: theme.surface,
        ['--web-text' as string]: theme.text,
        ['--web-text-muted' as string]: theme.textMuted,
        ['--web-border' as string]: theme.border,
        ['--web-nav-bg' as string]: theme.text,
        ['--web-nav-text' as string]: theme.surface,
        ['--web-nav-active' as string]: theme.primary,
        ['--web-header-bg' as string]: theme.surface,
      }}
    >
      <WebHeader
        brandName={shell.branding.displayName}
        title={activeScreen.title}
        subtitle={activeScreen.description}
        tagline={shell.branding.tagline}
        logoUrl={shell.branding.logoPrimary}
      />
      <WebTopNav items={primaryNav} activeRoute={viewModel.activeRoute} onNavigate={onNavigate} />
      <main
        data-testid="web-shell-content"
        style={{ flex: 1, padding: '1.25rem', boxSizing: 'border-box' }}
      >
        {children ?? (
          <div data-testid="web-default-screen" data-route={activeScreen.route}>
            <p style={{ margin: 0, color: 'var(--web-text-muted, #64748b)' }}>
              {activeScreen.description ?? activeScreen.title}
            </p>
          </div>
        )}
      </main>
      <WebFooter
        items={footerNav}
        copyrightText={shell.branding.copyrightText}
        showPoweredBy={shell.branding.showPoweredBy}
        onNavigate={onNavigate}
      />
    </div>
  );
}
