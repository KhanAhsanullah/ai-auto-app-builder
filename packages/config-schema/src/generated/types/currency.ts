/**
 * AUTO-GENERATED FILE — DO NOT EDIT DIRECTLY.
 * Source: schemas/ (JSON Schema v1)
 * Regenerate: pnpm --filter @ai-commerce/config-schema generate
 */

/**
 * Currency display, formatting, and multi-currency commerce settings.
 */
export interface Currency {
  /**
   * ISO 4217 currency code (e.g. USD, PKR, EUR).
   */
  default: string;
  /**
   * @minItems 1
   */
  supported: [string, ...string[]];
  display: {
    symbolPosition: 'before' | 'after';
    decimalPlaces: number;
    thousandsSeparator?: ',' | '.' | ' ' | "'";
    decimalSeparator?: '.' | ',';
  };
  /**
   * Enable checkout in non-default currencies.
   */
  allowMultiCurrency?: boolean;
  exchangeRateProvider?: 'manual' | 'openexchangerates' | 'fixer' | 'none';
}
