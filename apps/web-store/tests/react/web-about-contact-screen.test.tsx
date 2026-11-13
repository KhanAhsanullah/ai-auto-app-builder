import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { WebAboutScreen } from '../../src/react/screens/web-about-screen.js';
import { WebContactScreen } from '../../src/react/screens/web-contact-screen.js';

afterEach(() => {
  cleanup();
});

describe('About and Contact screens', () => {
  it('renders about story and shop CTA', () => {
    const onShop = vi.fn();
    render(<WebAboutScreen brandName="Spice Route" verticalLabel="restaurant" onShop={onShop} />);
    expect(screen.getByTestId('web-about-title').textContent).toBe('Spice Route');
    fireEvent.click(screen.getByTestId('web-about-shop'));
    expect(onShop).toHaveBeenCalled();
  });

  it('submits contact form with demo success', () => {
    render(<WebContactScreen brandName="Spice Route" />);
    fireEvent.change(screen.getByTestId('web-contact-name'), { target: { value: 'Ali' } });
    fireEvent.change(screen.getByTestId('web-contact-email'), {
      target: { value: 'ali@example.com' },
    });
    fireEvent.change(screen.getByTestId('web-contact-message'), {
      target: { value: 'Hello' },
    });
    fireEvent.submit(screen.getByTestId('web-contact-form'));
    expect(screen.getByTestId('web-contact-success').textContent).toContain('Ali');
  });
});
