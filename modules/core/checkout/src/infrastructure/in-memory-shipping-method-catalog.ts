import type {
  ShippingMethodCatalog,
  ShippingMethodOffer,
} from '../domain/shipping-method-catalog.js';

/** Simple in-memory shipping catalog for tests and local wiring. */
export class InMemoryShippingMethodCatalog implements ShippingMethodCatalog {
  constructor(private readonly methods: readonly ShippingMethodOffer[] = []) {}

  async listMethods(tenantId: string, currency: string): Promise<readonly ShippingMethodOffer[]> {
    void tenantId;
    return this.methods
      .filter((method) => method.price.currency === currency)
      .map((method) => structuredClone(method));
  }

  async findById(
    tenantId: string,
    methodId: string,
    currency: string,
  ): Promise<ShippingMethodOffer | undefined> {
    const list = await this.listMethods(tenantId, currency);
    return list.find((method) => method.id === methodId);
  }
}
