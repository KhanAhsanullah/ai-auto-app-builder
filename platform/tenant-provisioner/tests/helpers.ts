import type { ProvisioningRequest } from '@ai-commerce/config-schema';

/** Minimal valid provisioning request for tests. */
export const VALID_PROVISIONING_REQUEST: ProvisioningRequest = {
  slug: 'acme-market',
  name: 'Acme Market',
  vertical: 'ecommerce',
  defaultLocale: 'en',
  defaultTimezone: 'UTC',
};

/** Valid provisioning request with explicit tenant ID. */
export const VALID_PROVISIONING_REQUEST_WITH_ID: ProvisioningRequest = {
  id: '11111111-1111-4111-8111-111111111111',
  slug: 'beta-shop',
  name: 'Beta Shop',
  vertical: 'grocery',
  defaultLocale: 'en-US',
  defaultTimezone: 'America/New_York',
  defaultCountry: 'US',
  subscriptionTier: 'starter',
};

/** Second tenant slug used for duplicate and isolation tests. */
export const OTHER_TENANT_SLUG = 'other-tenant';

export const OTHER_TENANT_ID = '22222222-2222-4222-8222-222222222222';
