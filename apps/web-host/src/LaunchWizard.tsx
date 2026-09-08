import { useMemo, useState, type CSSProperties, type FormEvent, type ReactNode } from 'react';

import type { DemoLaunchVertical } from '@ai-commerce/web-store';

import { LAUNCH_VERTICAL_OPTIONS } from './launch-profile.js';

export interface LaunchWizardSubmit {
  businessName: string;
  vertical: DemoLaunchVertical;
  logoUrl?: string;
}

export interface LaunchWizardProps {
  busy?: boolean;
  error?: string | null;
  onLaunch: (input: LaunchWizardSubmit) => void;
}

/**
 * Boom launch form — live brand preview tinted by the selected vertical.
 */
export function LaunchWizard(props: LaunchWizardProps): ReactNode {
  const { busy = false, error, onLaunch } = props;
  const [businessName, setBusinessName] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [vertical, setVertical] = useState<DemoLaunchVertical>('grocery');

  const selected = useMemo(
    () => LAUNCH_VERTICAL_OPTIONS.find((o) => o.id === vertical) ?? LAUNCH_VERTICAL_OPTIONS[0]!,
    [vertical],
  );

  const previewName = businessName.trim() || 'Your business';
  const accent = selected.accent;
  const pageStyle = {
    ['--launch-accent' as string]: accent,
  } as CSSProperties;

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    const name = businessName.trim();
    if (!name || busy) {
      return;
    }
    onLaunch({
      businessName: name,
      vertical,
      logoUrl: logoUrl.trim() || undefined,
    });
  };

  return (
    <div
      className="launch-page"
      data-testid="web-host-launch-wizard"
      data-vertical={vertical}
      style={pageStyle}
    >
      <div className="launch-shell">
        <section className="launch-preview" aria-live="polite">
          {logoUrl.trim() ? (
            <img
              className="launch-preview-logo"
              src={logoUrl.trim()}
              alt=""
              width={64}
              height={64}
            />
          ) : (
            <div className="launch-preview-mark" aria-hidden>
              {initials(previewName)}
            </div>
          )}
          <p className="launch-preview-kicker">{selected.label}</p>
          <h1 className="launch-preview-brand" data-testid="launch-preview-brand">
            {previewName}
          </h1>
          <p className="launch-preview-tagline">{selected.hint}</p>
        </section>

        <form className="launch-form" onSubmit={onSubmit}>
          <p className="launch-eyebrow">CommerceOS</p>
          <h2 className="launch-title">Launch your app</h2>
          <p className="launch-sub">Name, logo, app type — then Boom.</p>

          <label className="launch-field">
            <span>Business name</span>
            <input
              data-testid="launch-business-name"
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="e.g. Spice Route Kitchen"
              required
              autoFocus
              disabled={busy}
            />
          </label>

          <label className="launch-field">
            <span>Logo URL (optional)</span>
            <input
              data-testid="launch-logo-url"
              type="url"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              placeholder="https://…"
              disabled={busy}
            />
          </label>

          <fieldset className="launch-types" disabled={busy}>
            <legend>App type</legend>
            <div className="launch-type-grid">
              {LAUNCH_VERTICAL_OPTIONS.map((option) => (
                <label
                  key={option.id}
                  className={`launch-type ${vertical === option.id ? 'is-selected' : ''}`}
                  data-testid={`launch-type-${option.id}`}
                  style={{ ['--type-accent' as string]: option.accent }}
                >
                  <input
                    type="radio"
                    name="vertical"
                    value={option.id}
                    checked={vertical === option.id}
                    onChange={() => setVertical(option.id)}
                  />
                  <span className="launch-type-swatch" aria-hidden />
                  <span className="launch-type-label">{option.label}</span>
                  <span className="launch-type-hint">{option.hint}</span>
                </label>
              ))}
            </div>
          </fieldset>

          {error ? (
            <p className="launch-error" data-testid="launch-error">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            className="launch-submit"
            data-testid="launch-submit"
            disabled={busy || !businessName.trim()}
          >
            {busy ? 'Launching…' : 'Boom — launch app'}
          </button>
        </form>
      </div>
    </div>
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
