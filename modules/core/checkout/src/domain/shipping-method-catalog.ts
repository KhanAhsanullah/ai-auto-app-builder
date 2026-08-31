import type { ShippingMethod } from '../types.js';

/** A shipping option offered for a tenant/currency (config-driven). */
export type ShippingMethodOffer = ShippingMethod;

/**
 * Optional port for listing / resolving shipping methods (no hard config dep).
 * Host apps can adapt tenant config `integrations.shipping` or similar.
 */
export interface ShippingMethodCatalog {
  listMethods(tenantId: string, currency: string): Promise<readonly ShippingMethodOffer[]>;
  findById(
    tenantId: string,
    methodId: string,
    currency: string,
  ): Promise<ShippingMethodOffer | undefined>;
}
