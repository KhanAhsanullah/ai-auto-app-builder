import { describe, expect, it } from 'vitest';

import {
  parseBoomLaunchBody,
  slugifyBusinessName,
  toProvisioningRequest,
} from '../src/domain/map-boom-launch.js';
import { BoomLaunchValidationException } from '../src/errors.js';

describe('map-boom-launch', () => {
  it('slugifies business names', () => {
    expect(slugifyBusinessName('Spice Route Kitchen')).toBe('spice-route-kitchen');
  });

  it('parses a boom launch body', () => {
    const input = parseBoomLaunchBody({
      businessName: ' Spice Route ',
      vertical: 'restaurant',
      logoUrl: 'https://cdn.example.com/logo.png',
    });
    expect(input.businessName).toBe('Spice Route');
    expect(input.vertical).toBe('restaurant');
    expect(input.logoUrl).toBe('https://cdn.example.com/logo.png');
  });

  it('rejects missing businessName', () => {
    expect(() => parseBoomLaunchBody({ vertical: 'grocery' })).toThrow(
      BoomLaunchValidationException,
    );
  });

  it('maps to a provisioning request with branding + theme', () => {
    const request = toProvisioningRequest({
      businessName: 'Spice Route',
      vertical: 'restaurant',
      logoUrl: 'https://cdn.example.com/logo.png',
    });
    expect(request.slug).toBe('spice-route');
    expect(request.vertical).toBe('restaurant');
    expect(request.configOverrides?.branding).toMatchObject({
      appName: 'Spice Route',
    });
    expect(request.configOverrides?.theme).toMatchObject({
      colors: { primary: '#DC2626' },
    });
  });
});
