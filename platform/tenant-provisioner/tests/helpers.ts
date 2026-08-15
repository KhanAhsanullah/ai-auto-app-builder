import type { ProvisioningRequest } from '@ai-commerce/config-schema';

import { createTenantProvisioner } from '../src/infrastructure/create-tenant-provisioner.js';
import type { TenantProvisioner } from '../src/domain/tenant-provisioner.js';

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

/** Provisioning request with explicit stable tenant ID for retry tests. */
export const RETRY_SAFE_PROVISIONING_REQUEST: ProvisioningRequest = {
  id: '33333333-3333-4333-8333-333333333333',
  slug: 'retry-safe-shop',
  name: 'Retry Safe Shop',
  vertical: 'ecommerce',
  defaultLocale: 'en',
  defaultTimezone: 'UTC',
};

/** Second tenant slug used for duplicate and isolation tests. */
export const OTHER_TENANT_SLUG = 'other-tenant';

export const OTHER_TENANT_ID = '22222222-2222-4222-8222-222222222222';

const FIXED_CLOCK = '2026-08-16T00:00:00.000Z';

/** Create a TenantProvisioner wired for deterministic tests. */
export function createTestTenantProvisioner(): TenantProvisioner {
  return createTenantProvisioner({ clock: () => FIXED_CLOCK });
}
