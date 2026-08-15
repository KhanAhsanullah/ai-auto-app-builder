import { SCHEMA_VERSION } from '@ai-commerce/config-schema';
import type { ConfigLayer } from '@ai-commerce/config-runtime';
import { deepMerge } from '@ai-commerce/config-runtime';

import { createBaseTenantConfigSections } from '../templates/base-tenant-config.js';
import { VerticalSeedLoader } from '../infrastructure/vertical-seed-loader.js';
import type { ValidatedProvisioningIdentity } from '../types.js';
import { EnvironmentBuilder } from './environment-builder.js';

/** Builds the initial tenant-layer configuration document for a new tenant. */
export class ConfigBuilder {
  constructor(
    private readonly verticalSeedLoader = new VerticalSeedLoader(),
    private readonly environmentBuilder = new EnvironmentBuilder(),
  ) {}

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

    let document = deepMerge(baseDocument, this.verticalSeedLoader.load(identity.vertical));

    if (identity.configOverrides && Object.keys(identity.configOverrides).length > 0) {
      document = deepMerge(document, identity.configOverrides as ConfigLayer);
    }

    document = {
      ...document,
      environment: this.environmentBuilder.build({ slug: identity.slug }),
    };

    return enforceIdentityOnDocument(document, identity);
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
