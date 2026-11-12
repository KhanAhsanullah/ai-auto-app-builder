import { describe, expect, it } from 'vitest';

import {
  parseCatalogProductCreateBody,
  parseCatalogProductPatchBody,
} from '../src/domain/map-catalog-product.js';
import { PlatformApiException } from '../src/errors.js';

describe('map-catalog-product', () => {
  it('parses create body with slug derived from name', () => {
    const input = parseCatalogProductCreateBody({
      name: 'Olive Oil',
      sku: 'OIL-1L',
      title: '1L',
      amount: 1800.4,
    });
    expect(input).toMatchObject({
      name: 'Olive Oil',
      sku: 'OIL-1L',
      title: '1L',
      amount: 1800,
      slug: 'olive-oil',
      currency: 'PKR',
    });
    expect(input.imageUrl).toContain('unsplash.com');
  });

  it('rejects invalid create payloads', () => {
    expect(() => parseCatalogProductCreateBody({ sku: 'X', title: 'T', amount: 1 })).toThrow(
      PlatformApiException,
    );
    expect(() =>
      parseCatalogProductCreateBody({ name: 'A', sku: 'X', title: 'T', amount: -1 }),
    ).toThrow(PlatformApiException);
  });

  it('parses patch body and requires at least one field', () => {
    expect(parseCatalogProductPatchBody({ amount: 99 })).toEqual({ amount: 99 });
    expect(() => parseCatalogProductPatchBody({})).toThrow(PlatformApiException);
  });
});
