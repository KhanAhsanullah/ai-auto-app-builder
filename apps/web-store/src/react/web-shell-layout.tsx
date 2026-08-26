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
 */
export function WebShellLayout(props: WebShellLayoutProps): ReactNode {
  const { viewModel, onNavigate, children } = props;
  const { shell, activeScreen, primaryNav, footerNav } = viewModel;

  return (
    <div
      data-testid="web-shell-layout"
      data-nav-style={shell.navigation.style}
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        background: 'var(--web-content-bg, #ffffff)',
        color: 'var(--web-text, #0f172a)',
        fontFamily: 'var(--web-font-sans, system-ui, sans-serif)',
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
