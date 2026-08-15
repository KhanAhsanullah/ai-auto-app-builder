import { describe, expect, it } from 'vitest';

import { AssetValidationException } from '../src/errors.js';
import {
  ASSET_EXTENSION_RULES,
  inferFormatFromUrl,
  parseAssetUrl,
  validateAssetExtension,
} from '../src/utils/asset-validation.js';

describe('asset validation', () => {
  it('accepts valid http and https asset URLs', () => {
    expect(parseAssetUrl('https://cdn.example.com/logo.svg').href).toBe(
      'https://cdn.example.com/logo.svg',
    );
    expect(parseAssetUrl('http://cdn.example.com/logo.svg').href).toBe(
      'http://cdn.example.com/logo.svg',
    );
  });

  it('rejects invalid URLs', () => {
    expect(() => parseAssetUrl('not-a-url')).toThrow(AssetValidationException);
  });

  it('rejects unsupported URL protocols', () => {
    expect(() => parseAssetUrl('javascript:alert(1)')).toThrow(AssetValidationException);
    expect(() => parseAssetUrl('data:image/png;base64,abc')).toThrow(AssetValidationException);
  });

  it('infers file extensions from URL pathnames', () => {
    expect(inferFormatFromUrl('https://cdn.example.com/assets/logo-primary.svg')).toBe('svg');
    expect(inferFormatFromUrl('https://cdn.example.com/favicon.ico?v=2')).toBe('ico');
  });

  it('validates allowed extensions for asset kinds', () => {
    expect(
      validateAssetExtension('https://cdn.example.com/logo.svg', ASSET_EXTENSION_RULES.logo),
    ).toBe('svg');
    expect(
      validateAssetExtension('https://cdn.example.com/favicon.ico', ASSET_EXTENSION_RULES.favicon),
    ).toBe('ico');
    expect(
      validateAssetExtension('https://cdn.example.com/app-icon.png', ASSET_EXTENSION_RULES.appIcon),
    ).toBe('png');
  });

  it('throws for unsupported asset extensions', () => {
    expect(() =>
      validateAssetExtension('https://cdn.example.com/logo.bmp', ASSET_EXTENSION_RULES.logo),
    ).toThrow(AssetValidationException);
  });
});
