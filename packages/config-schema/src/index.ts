/**
 * @ai-commerce/config-schema
 *
 * Single source of truth for tenant configuration contracts.
 * JSON Schemas live in `schemas/`; TypeScript types and Zod validators are generated.
 */

export {
  MIGRATION_PATHS,
  SCHEMA_ID_BASE,
  SCHEMA_PATHS,
  SCHEMA_VERSION,
  SUPPORTED_SCHEMA_VERSIONS,
  type SchemaVersion,
} from './constants.js';

export type {
  AdminDashboardSettings,
  AiSettings,
  Authentication,
  Branding,
  Company,
  ConfigurationMeta,
  Currency,
  EnvironmentSettings,
  FeatureFlags,
  Integrations,
  Languages,
  MobileAppSettings,
  Navigation,
  Notifications,
  Payments,
  Tenant,
  TenantConfiguration,
  Theme,
  WebStoreSettings,
} from './generated/types.js';

export {
  adminDashboardSettingsSchema,
  aiSettingsSchema,
  authenticationSchema,
  brandingSchema,
  companySchema,
  configurationMetaSchema,
  currencySchema,
  environmentSettingsSchema,
  featureFlagsSchema,
  integrationsSchema,
  languagesSchema,
  mobileAppSettingsSchema,
  navigationSchema,
  notificationsSchema,
  paymentsSchema,
  tenantConfigurationSchema,
  tenantSchema,
  themeSchema,
  webStoreSettingsSchema,
} from './generated/zod.js';
