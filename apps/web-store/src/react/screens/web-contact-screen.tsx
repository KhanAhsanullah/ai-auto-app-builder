import { useState, type CSSProperties, type FormEvent, type ReactNode } from 'react';

export interface WebContactScreenProps {
  brandName: string;
  tagline?: string;
}

/**
 * Contact page — demo inquiry form (Sprint 31 Task 2).
 * Submits locally with a success message (no backend mailer yet).
 */
export function WebContactScreen(props: WebContactScreenProps): ReactNode {
  const { brandName, tagline } = props;
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    setSent(true);
  }

  return (
    <article
      data-testid="web-contact-screen"
      style={{ display: 'grid', gap: '1.5rem', maxWidth: '36rem' }}
    >
      <header style={{ display: 'grid', gap: '0.5rem' }}>
        <p
          style={{
            margin: 0,
            fontSize: '0.8rem',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            color: 'var(--web-brand, #16a34a)',
            fontWeight: 600,
          }}
        >
          Contact
        </p>
        <h2
          data-testid="web-contact-title"
          style={{ margin: 0, fontSize: 'clamp(1.75rem, 4vw, 2.35rem)', lineHeight: 1.15 }}
        >
          Talk to {brandName}
        </h2>
        <p
          data-testid="web-contact-blurb"
          style={{ margin: 0, color: 'var(--web-text-muted, #64748b)', lineHeight: 1.5 }}
        >
          {tagline ?? 'Questions about orders, products, or partnerships — send a note.'}
        </p>
      </header>

      <div
        data-testid="web-contact-details"
        style={{
          padding: '1rem 1.1rem',
          borderRadius: '0.75rem',
          border: '1px solid var(--web-border, #e5e7eb)',
          background: 'var(--web-surface, #f9fafb)',
          display: 'grid',
          gap: '0.35rem',
          fontSize: '0.95rem',
        }}
      >
        <div>
          <strong>Email</strong> — hello@{slugify(brandName)}.demo
        </div>
        <div>
          <strong>Hours</strong> — Mon–Sat, 10:00–20:00
        </div>
      </div>

      {sent ? (
        <p
          data-testid="web-contact-success"
          style={{ margin: 0, color: '#047857', fontWeight: 600 }}
        >
          Thanks {name.trim() || 'there'} — {brandName} got your message (demo confirmation).
        </p>
      ) : (
        <form
          data-testid="web-contact-form"
          onSubmit={onSubmit}
          style={{ display: 'grid', gap: '0.85rem' }}
        >
          <label style={{ display: 'grid', gap: '0.3rem', fontSize: '0.85rem' }}>
            Name
            <input
              data-testid="web-contact-name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={inputStyle}
            />
          </label>
          <label style={{ display: 'grid', gap: '0.3rem', fontSize: '0.85rem' }}>
            Email
            <input
              data-testid="web-contact-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={inputStyle}
            />
          </label>
          <label style={{ display: 'grid', gap: '0.3rem', fontSize: '0.85rem' }}>
            Message
            <textarea
              data-testid="web-contact-message"
              required
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              style={{ ...inputStyle, resize: 'vertical' }}
            />
          </label>
          <button
            type="submit"
            data-testid="web-contact-submit"
            style={{
              justifySelf: 'start',
              border: 'none',
              borderRadius: '0.5rem',
              padding: '0.75rem 1.15rem',
              background: 'var(--web-brand, #16a34a)',
              color: '#fff',
              fontWeight: 650,
              cursor: 'pointer',
            }}
          >
            Send message
          </button>
        </form>
      )}
    </article>
  );
}

const inputStyle: CSSProperties = {
  border: '1px solid var(--web-border, #e5e7eb)',
  borderRadius: '0.5rem',
  padding: '0.65rem 0.75rem',
  font: 'inherit',
};

function slugify(name: string): string {
  return (
    name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 24) || 'store'
  );
}
