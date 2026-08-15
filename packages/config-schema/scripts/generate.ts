import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import $RefParser from '@apidevtools/json-schema-ref-parser';
import { compileFromFile } from 'json-schema-to-typescript';
import { jsonSchemaToZod } from 'json-schema-to-zod';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PACKAGE_ROOT = path.resolve(__dirname, '..');
const REPO_ROOT = path.resolve(PACKAGE_ROOT, '../..');
const SCHEMAS_ROOT = path.join(REPO_ROOT, 'schemas');
const GENERATED_DIR = path.join(PACKAGE_ROOT, 'src/generated');

/** Schema files to generate individual TypeScript types and Zod validators for. */
const SCHEMA_ENTRIES = [
  {
    name: 'TenantConfiguration',
    file: 'tenant-config/v1/tenant-config.schema.json',
    exportType: 'TenantConfiguration',
    exportZod: 'tenantConfigurationSchema',
  },
  {
    name: 'ConfigurationMeta',
    file: 'tenant-config/v1/meta.schema.json',
    exportType: 'ConfigurationMeta',
    exportZod: 'configurationMetaSchema',
  },
  {
    name: 'Tenant',
    file: 'tenant-config/v1/tenant.schema.json',
    exportType: 'Tenant',
    exportZod: 'tenantSchema',
  },
  {
    name: 'Company',
    file: 'tenant-config/v1/company.schema.json',
    exportType: 'Company',
    exportZod: 'companySchema',
  },
  {
    name: 'Branding',
    file: 'tenant-config/v1/branding.schema.json',
    exportType: 'Branding',
    exportZod: 'brandingSchema',
  },
  {
    name: 'Theme',
    file: 'theme/v1/theme.schema.json',
    exportType: 'Theme',
    exportZod: 'themeSchema',
  },
  {
    name: 'Navigation',
    file: 'navigation/v1/navigation.schema.json',
    exportType: 'Navigation',
    exportZod: 'navigationSchema',
  },
  {
    name: 'Languages',
    file: 'tenant-config/v1/languages.schema.json',
    exportType: 'Languages',
    exportZod: 'languagesSchema',
  },
  {
    name: 'Currency',
    file: 'tenant-config/v1/currency.schema.json',
    exportType: 'Currency',
    exportZod: 'currencySchema',
  },
  {
    name: 'FeatureFlags',
    file: 'tenant-config/v1/feature-flags.schema.json',
    exportType: 'FeatureFlags',
    exportZod: 'featureFlagsSchema',
  },
  {
    name: 'Authentication',
    file: 'tenant-config/v1/authentication.schema.json',
    exportType: 'Authentication',
    exportZod: 'authenticationSchema',
  },
  {
    name: 'Payments',
    file: 'tenant-config/v1/payments.schema.json',
    exportType: 'Payments',
    exportZod: 'paymentsSchema',
  },
  {
    name: 'Notifications',
    file: 'tenant-config/v1/notifications.schema.json',
    exportType: 'Notifications',
    exportZod: 'notificationsSchema',
  },
  {
    name: 'Integrations',
    file: 'tenant-config/v1/integrations.schema.json',
    exportType: 'Integrations',
    exportZod: 'integrationsSchema',
  },
  {
    name: 'AiSettings',
    file: 'tenant-config/v1/ai-settings.schema.json',
    exportType: 'AiSettings',
    exportZod: 'aiSettingsSchema',
  },
  {
    name: 'MobileAppSettings',
    file: 'tenant-config/v1/mobile-app-settings.schema.json',
    exportType: 'MobileAppSettings',
    exportZod: 'mobileAppSettingsSchema',
  },
  {
    name: 'WebStoreSettings',
    file: 'tenant-config/v1/web-store-settings.schema.json',
    exportType: 'WebStoreSettings',
    exportZod: 'webStoreSettingsSchema',
  },
  {
    name: 'AdminDashboardSettings',
    file: 'tenant-config/v1/admin-dashboard-settings.schema.json',
    exportType: 'AdminDashboardSettings',
    exportZod: 'adminDashboardSettingsSchema',
  },
  {
    name: 'EnvironmentSettings',
    file: 'tenant-config/v1/environment-settings.schema.json',
    exportType: 'EnvironmentSettings',
    exportZod: 'environmentSettingsSchema',
  },
  {
    name: 'ProvisioningRequest',
    file: 'provisioning/v1/provisioning-request.schema.json',
    exportType: 'ProvisioningRequest',
    exportZod: 'provisioningRequestSchema',
  },
] as const;

const BANNER = `/**
 * AUTO-GENERATED FILE — DO NOT EDIT DIRECTLY.
 * Source: schemas/ (JSON Schema v1)
 * Regenerate: pnpm --filter @ai-commerce/config-schema generate
 */`;

async function generateTypes(): Promise<void> {
  const typesDir = path.join(GENERATED_DIR, 'types');
  await mkdir(typesDir, { recursive: true });

  const barrelExports: string[] = [BANNER, ''];

  for (const entry of SCHEMA_ENTRIES) {
    const schemaPath = path.join(SCHEMAS_ROOT, entry.file);
    const types = await compileFromFile(schemaPath, {
      cwd: path.dirname(schemaPath),
      bannerComment: '',
      additionalProperties: false,
      enableConstEnums: true,
      unreachableDefinitions: true,
    });

    const fileName = `${entry.exportZod.replace(/Schema$/, '')}.ts`;
    await writeFile(path.join(typesDir, fileName), `${BANNER}\n\n${types.trim()}\n`, 'utf8');
    barrelExports.push(
      `export type { ${entry.exportType} } from './types/${fileName.replace('.ts', '')}.js';`,
    );
  }

  await writeFile(path.join(GENERATED_DIR, 'types.ts'), `${barrelExports.join('\n')}\n`, 'utf8');
}

async function generateZod(): Promise<string> {
  const parts: string[] = [BANNER, '', "import { z } from 'zod';", ''];

  for (const entry of SCHEMA_ENTRIES) {
    const schemaPath = path.join(SCHEMAS_ROOT, entry.file);
    const bundled = (await $RefParser.bundle(schemaPath)) as Record<string, unknown>;
    const zodExpression = jsonSchemaToZod(bundled);
    parts.push(`/** Validates \`${entry.name}\` configuration. */`);
    parts.push(`export const ${entry.exportZod} = ${zodExpression};`);
    parts.push('');
  }

  return parts.join('\n');
}

async function main(): Promise<void> {
  await mkdir(GENERATED_DIR, { recursive: true });

  const zodContent = await generateZod();
  await generateTypes();

  await writeFile(path.join(GENERATED_DIR, 'zod.ts'), zodContent, 'utf8');

  console.log(
    `Generated TypeScript types and Zod validators for ${SCHEMA_ENTRIES.length} schemas.`,
  );
}

main().catch((error: unknown) => {
  console.error('Schema code generation failed:', error);
  process.exit(1);
});
