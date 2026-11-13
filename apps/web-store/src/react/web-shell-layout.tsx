import type { ReactNode } from 'react';

import type { WebShellViewModel } from '../domain/build-web-shell-view-model.js';
import type { ResolvedWebNavItem } from '../types.js';
import { WebFooter } from './web-footer.js';
import { WebHeader } from './web-header.js';
import { WebTopNav } from './web-top-nav.js';

export interface WebShellLayoutProps {
  viewModel: WebShellViewModel;
  onNavigate?: (route: string) => void;
  /** Optional content override; defaults to screen title placeholder. */
  children?: ReactNode;
  showCartButton?: boolean;
}

/**
 * React web storefront shell: header + top nav + content + footer.
 * Theme CSS variables come from resolved tenant theme (Sprint 25).
 */
export function WebShellLayout(props: WebShellLayoutProps): ReactNode {
  const { viewModel, onNavigate, children, showCartButton } = props;
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
      <style>{STOREFRONT_MOBILE_CSS}</style>
      <WebHeader
        brandName={shell.branding.displayName}
        title={activeScreen.title}
        subtitle={activeScreen.description}
        tagline={shell.branding.tagline}
        logoUrl={shell.branding.logoPrimary}
        onBrandClick={onNavigate ? () => onNavigate('store.home') : undefined}
        onCartClick={showCartButton && onNavigate ? () => onNavigate('store.cart') : undefined}
      />
      <WebTopNav items={primaryNav} activeRoute={viewModel.activeRoute} onNavigate={onNavigate} />
      <main
        data-testid="web-shell-content"
        className="web-shell-content"
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
        items={withContentFooterLinks(footerNav)}
        copyrightText={shell.branding.copyrightText}
        showPoweredBy={shell.branding.showPoweredBy}
        onNavigate={onNavigate}
      />
    </div>
  );
}

/** Narrow-viewport polish for header / nav / catalog grid (Sprint 31 Task 3). */
const STOREFRONT_MOBILE_CSS = `
@media (max-width: 640px) {
  [data-testid="web-header"] {
    flex-wrap: wrap;
    align-items: flex-start;
    padding: 0.85rem 0.9rem !important;
    gap: 0.65rem !important;
  }
  [data-testid="web-header-tagline"],
  [data-testid="web-header-subtitle"] {
    display: none;
  }
  [data-testid="web-header-title"] {
    font-size: 1rem !important;
  }
  [data-testid="web-top-nav"] {
    padding: 0.5rem 0.75rem !important;
    gap: 0.25rem !important;
  }
  [data-testid="web-top-nav"] button {
    padding: 0.4rem 0.6rem !important;
    font-size: 0.82rem !important;
  }
  .web-shell-content {
    padding: 0.9rem !important;
  }
  .web-catalog-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
    gap: 0.75rem !important;
  }
}
`;

const CONTENT_FOOTER_LINKS: readonly ResolvedWebNavItem[] = [
  { id: 'about', label: 'About', route: 'store.about' },
  { id: 'contact', label: 'Contact', route: 'store.contact' },
  { id: 'shop', label: 'Shop', route: 'store.catalog' },
];

function withContentFooterLinks(footerNav: readonly ResolvedWebNavItem[]): ResolvedWebNavItem[] {
  const merged = [...footerNav];
  for (const link of CONTENT_FOOTER_LINKS) {
    if (!merged.some((item) => item.route === link.route)) {
      merged.push(link);
    }
  }
  return merged;
}
