import { provisioningRequestSchema, tenantSchema } from '@ai-commerce/config-schema';
import type { ProvisioningRequest } from '@ai-commerce/config-schema';
import { randomUUID } from 'node:crypto';

import { TenantIdentityValidationException } from '../errors.js';
import type { ValidatedProvisioningIdentity } from '../types.js';

/** Validates and normalizes tenant identity from a provisioning request. */
export class IdentityValidator {
  /**
   * Validate request shape and tenant identity constraints.
   * Generates `id` via `crypto.randomUUID()` when omitted.
   */
  validate(request: ProvisioningRequest): ValidatedProvisioningIdentity {
    const parsedRequest = provisioningRequestSchema.safeParse(request);

    if (!parsedRequest.success) {
      throw new TenantIdentityValidationException(
        formatValidationMessage(parsedRequest.error.message),
      );
    }

    const data = parsedRequest.data;
    const id = data.id ?? randomUUID();

    const identityCandidate = {
      id,
      slug: data.slug,
      name: data.name,
      vertical: data.vertical,
      status: 'draft' as const,
      defaultLocale: data.defaultLocale,
      defaultTimezone: data.defaultTimezone,
      ...(data.defaultCountry !== undefined ? { defaultCountry: data.defaultCountry } : {}),
      ...(data.subscriptionTier !== undefined ? { subscriptionTier: data.subscriptionTier } : {}),
    };

    const parsedIdentity = tenantSchema.safeParse(identityCandidate);

    if (!parsedIdentity.success) {
      throw new TenantIdentityValidationException(
        formatValidationMessage(parsedIdentity.error.message),
      );
    }

    return {
      id: parsedIdentity.data.id,
      slug: parsedIdentity.data.slug,
      name: parsedIdentity.data.name,
      vertical: parsedIdentity.data.vertical,
      defaultLocale: parsedIdentity.data.defaultLocale,
      defaultTimezone: parsedIdentity.data.defaultTimezone,
      defaultCountry: parsedIdentity.data.defaultCountry,
      subscriptionTier: parsedIdentity.data.subscriptionTier,
      configOverrides: data.configOverrides,
    };
  }
}

function formatValidationMessage(message: string): string {
  return message.replace(/\n/g, '; ');
}
