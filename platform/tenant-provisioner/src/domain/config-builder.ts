import { SCHEMA_VERSION } from '@ai-commerce/config-schema';
import type { ConfigLayer } from '@ai-commerce/config-runtime';
import { deepMerge } from '@ai-commerce/config-runtime';

import { createBaseTenantConfigSections } from '../templates/base-tenant-config.js';
import type { ValidatedProvisioningIdentity } from '../types.js';

/** Builds the initial tenant-layer configuration document for a new tenant. */
export class ConfigBuilder {
  /** Construct the stored tenant configuration layer for a validated identity. */
  build(identity: ValidatedProvisioningIdentity): ConfigLayer {
    const timestamp = new Date().toISOString();

    const baseDocument: ConfigLayer = {
      meta: {
        schemaVersion: SCHEMA_VERSION,
        configVersion: 1,
        createdAt: timestamp,
        updatedAt: timestamp,
        migrationHistory: [],
      },
      tenant: {
        id: identity.id,
        slug: identity.slug,
        name: identity.name,
        vertical: identity.vertical,
        status: 'draft',
        defaultLocale: identity.defaultLocale,
        defaultTimezone: identity.defaultTimezone,
        ...(identity.defaultCountry !== undefined
          ? { defaultCountry: identity.defaultCountry }
          : {}),
        ...(identity.subscriptionTier !== undefined
          ? { subscriptionTier: identity.subscriptionTier }
          : {}),
      },
      ...createBaseTenantConfigSections({
        name: identity.name,
        defaultLocale: identity.defaultLocale,
      }),
    };

    if (!identity.configOverrides || Object.keys(identity.configOverrides).length === 0) {
      return enforceIdentityOnDocument(baseDocument, identity);
    }

    const merged = deepMerge(baseDocument, identity.configOverrides as ConfigLayer);

    return enforceIdentityOnDocument(merged, identity);
  }
}

/** Ensure canonical identity fields and draft status remain authoritative. */
function enforceIdentityOnDocument(
  document: ConfigLayer,
  identity: ValidatedProvisioningIdentity,
): ConfigLayer {
  return {
    ...document,
    tenant: {
      ...document.tenant,
      id: identity.id,
      slug: identity.slug,
      name: identity.name,
      vertical: identity.vertical,
      status: 'draft',
      defaultLocale: identity.defaultLocale,
      defaultTimezone: identity.defaultTimezone,
      ...(identity.defaultCountry !== undefined ? { defaultCountry: identity.defaultCountry } : {}),
      ...(identity.subscriptionTier !== undefined
        ? { subscriptionTier: identity.subscriptionTier }
        : {}),
    },
  };
}
