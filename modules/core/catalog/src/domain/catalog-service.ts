import { randomUUID } from 'node:crypto';

import type { CatalogRepository } from './catalog-repository.js';
import {
  CatalogSkuConflictException,
  CatalogSlugConflictException,
  CatalogValidationException,
  CategoryNotFoundException,
  ProductNotFoundException,
} from '../errors.js';
import type {
  Category,
  CreateCategoryInput,
  CreateProductInput,
  CreateProductVariantInput,
  Money,
  Product,
  ProductVariant,
  UpdateCategoryInput,
  UpdateProductInput,
} from '../types.js';

export interface CatalogServiceDeps {
  repository: CatalogRepository;
  now?: () => string;
  createId?: () => string;
}

/**
 * Tenant-scoped catalog writes and reads for categories and products.
 */
export class CatalogService {
  private readonly now: () => string;
  private readonly createId: () => string;

  constructor(private readonly deps: CatalogServiceDeps) {
    this.now = deps.now ?? (() => new Date().toISOString());
    this.createId = deps.createId ?? (() => randomUUID());
  }

  async createCategory(input: CreateCategoryInput): Promise<Category> {
    const tenantId = this.requireTenantId(input.tenantId);
    const slug = this.requireSlug(input.slug);
    const name = this.requireName(input.name);

    await this.assertCategorySlugAvailable(tenantId, slug);

    if (input.parentId !== undefined) {
      await this.requireCategory(tenantId, input.parentId);
    }

    const timestamp = this.now();
    const category: Category = {
      tenantId,
      id: input.id?.trim() || this.createId(),
      slug,
      name,
      ...(input.parentId !== undefined ? { parentId: input.parentId } : {}),
      sortOrder: input.sortOrder ?? 0,
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    await this.deps.repository.saveCategory(category);
    return category;
  }

  async updateCategory(input: UpdateCategoryInput): Promise<Category> {
    const tenantId = this.requireTenantId(input.tenantId);
    const existing = await this.requireCategory(tenantId, input.id);

    const slug = input.slug !== undefined ? this.requireSlug(input.slug) : existing.slug;
    if (slug !== existing.slug) {
      await this.assertCategorySlugAvailable(tenantId, slug);
    }

    const name = input.name !== undefined ? this.requireName(input.name) : existing.name;

    let parentId: string | undefined = existing.parentId;
    if (input.parentId === null) {
      parentId = undefined;
    } else if (input.parentId !== undefined) {
      if (input.parentId === existing.id) {
        throw new CatalogValidationException('Category cannot be its own parent.');
      }
      await this.requireCategory(tenantId, input.parentId);
      parentId = input.parentId;
    }

    const updated: Category = {
      tenantId: existing.tenantId,
      id: existing.id,
      slug,
      name,
      sortOrder: input.sortOrder ?? existing.sortOrder,
      createdAt: existing.createdAt,
      updatedAt: this.now(),
      ...(parentId !== undefined ? { parentId } : {}),
    };

    await this.deps.repository.updateCategory(updated);
    return updated;
  }

  async getCategory(tenantId: string, categoryId: string): Promise<Category> {
    return this.requireCategory(this.requireTenantId(tenantId), categoryId);
  }

  async listCategories(tenantId: string): Promise<Category[]> {
    const list = await this.deps.repository.listCategoriesByTenant(this.requireTenantId(tenantId));
    return [...list].sort((a, b) => a.sortOrder - b.sortOrder || a.slug.localeCompare(b.slug));
  }

  async createProduct(input: CreateProductInput): Promise<Product> {
    const tenantId = this.requireTenantId(input.tenantId);
    const slug = this.requireSlug(input.slug);
    const name = this.requireName(input.name);

    await this.assertProductSlugAvailable(tenantId, slug);

    const categoryIds = [...(input.categoryIds ?? [])];
    for (const categoryId of categoryIds) {
      await this.requireCategory(tenantId, categoryId);
    }

    const variants = this.normalizeVariants(input.variants);
    await this.assertSkusAvailable(
      tenantId,
      variants.map((v) => v.sku),
    );

    const timestamp = this.now();
    const product: Product = {
      tenantId,
      id: input.id?.trim() || this.createId(),
      slug,
      name,
      ...(input.description !== undefined ? { description: input.description } : {}),
      status: input.status ?? 'draft',
      categoryIds,
      variants,
      ...(input.mediaIds !== undefined ? { mediaIds: [...input.mediaIds] } : {}),
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    await this.deps.repository.saveProduct(product);
    return product;
  }

  async updateProduct(input: UpdateProductInput): Promise<Product> {
    const tenantId = this.requireTenantId(input.tenantId);
    const existing = await this.requireProduct(tenantId, input.id);

    const slug = input.slug !== undefined ? this.requireSlug(input.slug) : existing.slug;
    if (slug !== existing.slug) {
      await this.assertProductSlugAvailable(tenantId, slug);
    }

    const name = input.name !== undefined ? this.requireName(input.name) : existing.name;

    let description: string | undefined = existing.description;
    if (input.description === null) {
      description = undefined;
    } else if (input.description !== undefined) {
      description = input.description;
    }

    const categoryIds =
      input.categoryIds !== undefined ? [...input.categoryIds] : [...existing.categoryIds];
    if (input.categoryIds !== undefined) {
      for (const categoryId of categoryIds) {
        await this.requireCategory(tenantId, categoryId);
      }
    }

    let variants = [...existing.variants];
    if (input.variants !== undefined) {
      variants = this.normalizeVariants(input.variants);
      await this.assertSkusAvailable(
        tenantId,
        variants.map((v) => v.sku),
        existing.id,
      );
    }

    let mediaIds: string[] | undefined = existing.mediaIds ? [...existing.mediaIds] : undefined;
    if (input.mediaIds === null) {
      mediaIds = undefined;
    } else if (input.mediaIds !== undefined) {
      mediaIds = [...input.mediaIds];
    }

    const updated: Product = {
      tenantId: existing.tenantId,
      id: existing.id,
      slug,
      name,
      status: input.status ?? existing.status,
      categoryIds,
      variants,
      createdAt: existing.createdAt,
      updatedAt: this.now(),
      ...(description !== undefined ? { description } : {}),
      ...(mediaIds !== undefined ? { mediaIds } : {}),
    };

    await this.deps.repository.updateProduct(updated);
    return updated;
  }

  async getProduct(tenantId: string, productId: string): Promise<Product> {
    return this.requireProduct(this.requireTenantId(tenantId), productId);
  }

  async getProductBySlug(tenantId: string, slug: string): Promise<Product> {
    const product = await this.deps.repository.findProductBySlug(
      this.requireTenantId(tenantId),
      this.requireSlug(slug),
    );
    if (!product) {
      throw new ProductNotFoundException(tenantId.trim(), slug);
    }
    return product;
  }

  async listProducts(tenantId: string): Promise<Product[]> {
    const list = await this.deps.repository.listProductsByTenant(this.requireTenantId(tenantId));
    return [...list].sort((a, b) => a.slug.localeCompare(b.slug));
  }

  private normalizeVariants(variants: readonly CreateProductVariantInput[]): ProductVariant[] {
    if (!variants || variants.length === 0) {
      throw new CatalogValidationException('Product must include at least one variant.');
    }

    const seenSkus = new Set<string>();
    return variants.map((variant) => {
      const sku = variant.sku.trim();
      if (!sku) {
        throw new CatalogValidationException('Variant SKU cannot be empty.');
      }
      if (seenSkus.has(sku)) {
        throw new CatalogValidationException(`Duplicate SKU '${sku}' in product variants.`);
      }
      seenSkus.add(sku);

      const title = variant.title.trim();
      if (!title) {
        throw new CatalogValidationException('Variant title cannot be empty.');
      }

      return {
        id: variant.id?.trim() || this.createId(),
        sku,
        title,
        price: this.requireMoney(variant.price, 'price'),
        ...(variant.compareAtPrice
          ? { compareAtPrice: this.requireMoney(variant.compareAtPrice, 'compareAtPrice') }
          : {}),
        ...(variant.attributes ? { attributes: { ...variant.attributes } } : {}),
      };
    });
  }

  private requireMoney(money: Money, field: string): Money {
    if (!money || typeof money !== 'object') {
      throw new CatalogValidationException(`Variant ${field} is required.`);
    }
    if (typeof money.amount !== 'number' || !Number.isFinite(money.amount) || money.amount < 0) {
      throw new CatalogValidationException(
        `Variant ${field}.amount must be a non-negative number.`,
      );
    }
    const currency = money.currency?.trim();
    if (!currency) {
      throw new CatalogValidationException(`Variant ${field}.currency cannot be empty.`);
    }
    return { amount: money.amount, currency };
  }

  private requireTenantId(tenantId: string): string {
    const trimmed = tenantId.trim();
    if (!trimmed) {
      throw new CatalogValidationException('tenantId cannot be empty.');
    }
    return trimmed;
  }

  private requireSlug(slug: string): string {
    const trimmed = slug.trim();
    if (!trimmed) {
      throw new CatalogValidationException('slug cannot be empty.');
    }
    return trimmed;
  }

  private requireName(name: string): string {
    const trimmed = name.trim();
    if (!trimmed) {
      throw new CatalogValidationException('name cannot be empty.');
    }
    return trimmed;
  }

  private async requireCategory(tenantId: string, categoryId: string): Promise<Category> {
    const category = await this.deps.repository.findCategoryById(tenantId, categoryId);
    if (!category) {
      throw new CategoryNotFoundException(tenantId, categoryId);
    }
    return category;
  }

  private async requireProduct(tenantId: string, productId: string): Promise<Product> {
    const product = await this.deps.repository.findProductById(tenantId, productId);
    if (!product) {
      throw new ProductNotFoundException(tenantId, productId);
    }
    return product;
  }

  private async assertCategorySlugAvailable(tenantId: string, slug: string): Promise<void> {
    const existing = await this.deps.repository.findCategoryBySlug(tenantId, slug);
    if (existing) {
      throw new CatalogSlugConflictException(tenantId, slug, 'category');
    }
  }

  private async assertProductSlugAvailable(tenantId: string, slug: string): Promise<void> {
    const existing = await this.deps.repository.findProductBySlug(tenantId, slug);
    if (existing) {
      throw new CatalogSlugConflictException(tenantId, slug, 'product');
    }
  }

  private async assertSkusAvailable(
    tenantId: string,
    skus: readonly string[],
    excludeProductId?: string,
  ): Promise<void> {
    for (const sku of skus) {
      const existing = await this.deps.repository.findProductBySku(tenantId, sku, excludeProductId);
      if (existing) {
        throw new CatalogSkuConflictException(tenantId, sku);
      }
    }
  }
}
