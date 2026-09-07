import { useMemo, useState, type FormEvent, type ReactNode } from 'react';

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
 * Boom launch form — business name, logo URL, any app type (vertical).
 */
export function LaunchWizard(props: LaunchWizardProps): ReactNode {
  const { busy = false, error, onLaunch } = props;
  const [businessName, setBusinessName] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [vertical, setVertical] = useState<DemoLaunchVertical>('grocery');

  const selected = useMemo(
    () => LAUNCH_VERTICAL_OPTIONS.find((o) => o.id === vertical),
    [vertical],
  );

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
    <div className="launch-page" data-testid="web-host-launch-wizard">
      <div className="launch-card">
        <p className="launch-eyebrow">CommerceOS</p>
        <h1 className="launch-title">Launch your app</h1>
        <p className="launch-sub">
          Enter your business name, optional logo, and app type — then Boom, your storefront is
          ready.
        </p>

        <form className="launch-form" onSubmit={onSubmit}>
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
                >
                  <input
                    type="radio"
                    name="vertical"
                    value={option.id}
                    checked={vertical === option.id}
                    onChange={() => setVertical(option.id)}
                  />
                  <span className="launch-type-label">{option.label}</span>
                  <span className="launch-type-hint">{option.hint}</span>
                </label>
              ))}
            </div>
          </fieldset>

          {selected ? <p className="launch-selected-hint">Selected: {selected.label}</p> : null}
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
