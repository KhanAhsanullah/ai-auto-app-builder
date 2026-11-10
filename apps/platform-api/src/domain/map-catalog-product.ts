import { PlatformApiException } from '../errors.js';
import type {
  CatalogProductCreateHttpBody,
  CatalogProductCreateInput,
  CatalogProductPatchHttpBody,
  CatalogProductPatchInput,
} from '../types.js';
import { slugifyBusinessName } from './map-boom-launch.js';

function requireNonEmptyString(value: unknown, field: string): string {
  if (typeof value !== 'string' || !value.trim()) {
    throw new PlatformApiException(`${field} is required.`, 400);
  }
  return value.trim();
}

function optionalTrimmedString(value: unknown): string | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}

function parseAmount(value: unknown, field: string): number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
    throw new PlatformApiException(`${field} must be a non-negative number.`, 400);
  }
  return Math.round(value);
}

/** Parse and validate POST catalog product JSON body. */
export function parseCatalogProductCreateBody(
  body: CatalogProductCreateHttpBody,
): CatalogProductCreateInput {
  const name = requireNonEmptyString(body.name, 'name');
  const sku = requireNonEmptyString(body.sku, 'sku');
  const title = requireNonEmptyString(body.title, 'title');
  const amount = parseAmount(body.amount, 'amount');

  const slugRaw = optionalTrimmedString(body.slug) ?? slugifyBusinessName(name);
  const slug = slugifyBusinessName(slugRaw);
  const currency = (optionalTrimmedString(body.currency) ?? 'PKR').toUpperCase();
  const imageUrl =
    optionalTrimmedString(body.imageUrl) ??
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=640&h=480&q=80';

  return { name, sku, title, amount, slug, currency, imageUrl };
}

/** Parse and validate PATCH catalog product JSON body. */
export function parseCatalogProductPatchBody(
  body: CatalogProductPatchHttpBody,
): CatalogProductPatchInput {
  const patch: CatalogProductPatchInput = {};

  if (body.name !== undefined) {
    patch.name = requireNonEmptyString(body.name, 'name');
  }
  if (body.sku !== undefined) {
    patch.sku = requireNonEmptyString(body.sku, 'sku');
  }
  if (body.title !== undefined) {
    patch.title = requireNonEmptyString(body.title, 'title');
  }
  if (body.amount !== undefined) {
    patch.amount = parseAmount(body.amount, 'amount');
  }
  if (body.slug !== undefined) {
    patch.slug = slugifyBusinessName(requireNonEmptyString(body.slug, 'slug'));
  }
  if (body.currency !== undefined) {
    patch.currency = requireNonEmptyString(body.currency, 'currency').toUpperCase();
  }
  if (body.imageUrl !== undefined) {
    patch.imageUrl = requireNonEmptyString(body.imageUrl, 'imageUrl');
  }

  if (Object.keys(patch).length === 0) {
    throw new PlatformApiException('At least one field is required to update.', 400);
  }

  return patch;
}
