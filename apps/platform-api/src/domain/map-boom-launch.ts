import type { ProvisioningRequest } from '@ai-commerce/config-schema';

import { BoomLaunchValidationException } from '../errors.js';
import type { BoomLaunchHttpBody, BoomLaunchInput, BoomLaunchVertical } from '../types.js';

const VERTICALS: readonly BoomLaunchVertical[] = [
  'ecommerce',
  'grocery',
  'restaurant',
  'pharmacy',
  'fashion',
  'electronics',
] as const;

const VERTICAL_THEME_PRIMARY: Record<BoomLaunchVertical, string> = {
  grocery: '#16A34A',
  restaurant: '#DC2626',
  pharmacy: '#0D9488',
  ecommerce: '#2563EB',
  fashion: '#BE185D',
  electronics: '#1E3A8A',
};

/** Slugify a business name for demo / control-plane tenant identity. */
export function slugifyBusinessName(name: string): string {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);
  return slug || 'demo-store';
}

function isVertical(value: unknown): value is BoomLaunchVertical {
  return typeof value === 'string' && (VERTICALS as readonly string[]).includes(value);
}

/** Parse and validate a Boom launch JSON body. */
export function parseBoomLaunchBody(body: BoomLaunchHttpBody): BoomLaunchInput {
  const businessName = typeof body.businessName === 'string' ? body.businessName.trim() : '';
  if (!businessName) {
    throw new BoomLaunchValidationException('businessName is required.');
  }
  if (!isVertical(body.vertical)) {
    throw new BoomLaunchValidationException(`vertical must be one of: ${VERTICALS.join(', ')}.`);
  }

  const input: BoomLaunchInput = {
    businessName,
    vertical: body.vertical,
  };

  if (typeof body.logoUrl === 'string' && body.logoUrl.trim()) {
    input.logoUrl = body.logoUrl.trim();
  }
  if (typeof body.slug === 'string' && body.slug.trim()) {
    input.slug = body.slug.trim().toLowerCase();
  }
  if (typeof body.tenantId === 'string' && body.tenantId.trim()) {
    input.tenantId = body.tenantId.trim();
  }
  if (typeof body.defaultLocale === 'string' && body.defaultLocale.trim()) {
    input.defaultLocale = body.defaultLocale.trim();
  }
  if (typeof body.defaultTimezone === 'string' && body.defaultTimezone.trim()) {
    input.defaultTimezone = body.defaultTimezone.trim();
  }
  if (typeof body.defaultCountry === 'string' && body.defaultCountry.trim()) {
    input.defaultCountry = body.defaultCountry.trim().toUpperCase();
  }

  return input;
}

/**
 * Map Boom wizard input into a schema ProvisioningRequest
 * with branding / theme overrides for the selected vertical.
 */
export function toProvisioningRequest(input: BoomLaunchInput): ProvisioningRequest {
  const businessName = input.businessName.trim();
  if (!businessName) {
    throw new BoomLaunchValidationException('businessName is required.');
  }

  const slug = (input.slug?.trim() || slugifyBusinessName(businessName)).slice(0, 64);
  const primary = VERTICAL_THEME_PRIMARY[input.vertical];
  const branding: Record<string, unknown> = {
    appName: businessName,
    tagline: `${businessName} — powered by CommerceOS`,
  };
  if (input.logoUrl?.trim()) {
    branding.logo = { primary: input.logoUrl.trim() };
  }

  const request: ProvisioningRequest = {
    slug,
    name: businessName,
    vertical: input.vertical,
    defaultLocale: input.defaultLocale?.trim() || 'en',
    defaultTimezone: input.defaultTimezone?.trim() || 'UTC',
    configOverrides: {
      branding,
      theme: {
        colors: {
          primary,
        },
      },
    },
  };

  if (input.tenantId?.trim()) {
    request.id = input.tenantId.trim();
  }
  if (input.defaultCountry?.trim()) {
    request.defaultCountry = input.defaultCountry.trim().toUpperCase();
  }

  return request;
}
