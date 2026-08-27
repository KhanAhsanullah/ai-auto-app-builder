import type { CartService } from './cart-service.js';
import type {
  AddCartItemFromCatalogInput,
  AddCartItemInput,
  Cart,
  CreateCartInput,
  GetOrCreateByCustomerInput,
  GetOrCreateBySessionInput,
  RemoveCartLineInput,
  SetCartLineQuantityInput,
} from '../types.js';

export interface CartModuleDeps {
  service: CartService;
}

/**
 * Public facade for tenant cart create, getOrCreate, line items, and queries.
 */
export class CartModule {
  constructor(private readonly deps: CartModuleDeps) {}

  async createCart(input: CreateCartInput): Promise<Cart> {
    return this.deps.service.createCart(input);
  }

  async getCart(tenantId: string, cartId: string): Promise<Cart> {
    return this.deps.service.getCart(tenantId, cartId);
  }

  async listCarts(tenantId: string): Promise<Cart[]> {
    return this.deps.service.listCarts(tenantId);
  }

  async getCartByCustomerId(tenantId: string, customerId: string): Promise<Cart> {
    return this.deps.service.getCartByCustomerId(tenantId, customerId);
  }

  async getCartBySessionId(tenantId: string, sessionId: string): Promise<Cart> {
    return this.deps.service.getCartBySessionId(tenantId, sessionId);
  }

  async getOrCreateBySession(input: GetOrCreateBySessionInput): Promise<Cart> {
    return this.deps.service.getOrCreateBySession(input);
  }

  async getOrCreateByCustomer(input: GetOrCreateByCustomerInput): Promise<Cart> {
    return this.deps.service.getOrCreateByCustomer(input);
  }

  async addItem(input: AddCartItemInput): Promise<Cart> {
    return this.deps.service.addItem(input);
  }

  async addItemFromCatalog(input: AddCartItemFromCatalogInput): Promise<Cart> {
    return this.deps.service.addItemFromCatalog(input);
  }

  async setLineQuantity(input: SetCartLineQuantityInput): Promise<Cart> {
    return this.deps.service.setLineQuantity(input);
  }

  async removeLine(input: RemoveCartLineInput): Promise<Cart> {
    return this.deps.service.removeLine(input);
  }

  async clearCart(tenantId: string, cartId: string): Promise<Cart> {
    return this.deps.service.clearCart(tenantId, cartId);
  }
}
