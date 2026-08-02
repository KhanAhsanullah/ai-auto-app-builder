import { describe, expect, it } from 'vitest';

import { computeSpacingScale, computeTypographyScale } from '../src/utils/token-scale.js';

describe('token-scale utilities', () => {
  it('computes spacing scale from unit and density', () => {
    const scale = computeSpacingScale({ unit: 4, density: 'default' });

    expect(scale).toEqual({
      xs: '4px',
      sm: '8px',
      md: '16px',
      lg: '24px',
      xl: '32px',
      '2xl': '48px',
    });
  });

  it('computes compact spacing scale', () => {
    const scale = computeSpacingScale({ unit: 4, density: 'compact' });

    expect(scale.md).toBe('12px');
    expect(scale['2xl']).toBe('24px');
  });

  it('computes typography scale from base font size', () => {
    const scale = computeTypographyScale({
      fontFamily: { heading: 'Inter', body: 'Inter' },
      scale: 'default',
      baseFontSize: 16,
    });

    expect(scale.base).toBe('16px');
    expect(scale.lg).toBe('20px');
    expect(scale['2xl']).toBe('30px');
  });

  it('computes comfortable typography scale', () => {
    const scale = computeTypographyScale({
      fontFamily: { heading: 'Inter', body: 'Inter' },
      scale: 'comfortable',
      baseFontSize: 16,
    });

    expect(scale.sm).toBe('16px');
    expect(scale['2xl']).toBe('32px');
  });
});
