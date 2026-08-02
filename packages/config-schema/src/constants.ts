/**
 * Platform configuration schema version constants.
 * Increment SCHEMA_VERSION on breaking JSON Schema changes.
 */
export const SCHEMA_VERSION = 'v1' as const;

export type SchemaVersion = typeof SCHEMA_VERSION;

/** Current supported schema versions for validation and migration. */
export const SUPPORTED_SCHEMA_VERSIONS = ['v1'] as const satisfies readonly SchemaVersion[];

/** Canonical $id base URI for all platform schemas. */
export const SCHEMA_ID_BASE = 'https://platform.ai-commerce.dev/schemas';

/** Relative paths from repository root to versioned schema files. */
export const SCHEMA_PATHS = {
  root: 'schemas/tenant-config/v1/tenant-config.schema.json',
  meta: 'schemas/tenant-config/v1/meta.schema.json',
  tenant: 'schemas/tenant-config/v1/tenant.schema.json',
  company: 'schemas/tenant-config/v1/company.schema.json',
  branding: 'schemas/tenant-config/v1/branding.schema.json',
  theme: 'schemas/theme/v1/theme.schema.json',
  navigation: 'schemas/navigation/v1/navigation.schema.json',
  languages: 'schemas/tenant-config/v1/languages.schema.json',
  currency: 'schemas/tenant-config/v1/currency.schema.json',
  featureFlags: 'schemas/tenant-config/v1/feature-flags.schema.json',
  authentication: 'schemas/tenant-config/v1/authentication.schema.json',
  payments: 'schemas/tenant-config/v1/payments.schema.json',
  notifications: 'schemas/tenant-config/v1/notifications.schema.json',
  integrations: 'schemas/tenant-config/v1/integrations.schema.json',
  aiSettings: 'schemas/tenant-config/v1/ai-settings.schema.json',
  mobileApp: 'schemas/tenant-config/v1/mobile-app-settings.schema.json',
  webStore: 'schemas/tenant-config/v1/web-store-settings.schema.json',
  adminDashboard: 'schemas/tenant-config/v1/admin-dashboard-settings.schema.json',
  environment: 'schemas/tenant-config/v1/environment-settings.schema.json',
  sharedCommon: 'schemas/shared/v1/common.schema.json',
  sharedVersioning: 'schemas/shared/v1/versioning.schema.json',
  fullExample: 'schemas/tenant-config/v1/examples/full.example.json',
} as const;

/** Maps schema version to its migration directory (future versions). */
export const MIGRATION_PATHS: Record<SchemaVersion, string> = {
  v1: 'schemas/tenant-config/v1/migrations',
};
