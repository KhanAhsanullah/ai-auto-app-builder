/**
 * AUTO-GENERATED FILE — DO NOT EDIT DIRECTLY.
 * Source: schemas/ (JSON Schema v1)
 * Regenerate: pnpm --filter @ai-commerce/config-schema generate
 */

/**
 * Metadata for versioning, audit, and schema compatibility of a tenant configuration document.
 */
export interface ConfigurationMeta {
  /**
   * Platform schema version. Increment on breaking schema changes.
   */
  schemaVersion: 'v1';
  /**
   * Monotonic tenant config revision. Incremented on every publish.
   */
  configVersion: number;
  /**
   * ISO 8601 date-time in UTC.
   */
  createdAt: string;
  /**
   * ISO 8601 date-time in UTC.
   */
  updatedAt: string;
  /**
   * ISO 8601 date-time in UTC.
   */
  publishedAt?: string;
  /**
   * User ID who published this configuration version.
   */
  publishedBy?: string;
  /**
   * Human-readable label for this config revision (e.g. 'Launch config').
   */
  label?: string;
  /**
   * Audit trail of schema migrations applied to this configuration.
   */
  migrationHistory?: MigrationRecord[];
}
export interface MigrationRecord {
  /**
   * Platform schema version. Increment on breaking schema changes.
   */
  fromSchemaVersion: 'v1';
  /**
   * Platform schema version. Increment on breaking schema changes.
   */
  toSchemaVersion: 'v1';
  /**
   * ISO 8601 date-time in UTC.
   */
  migratedAt: string;
  /**
   * Identifier of the migration script applied.
   */
  migrationId?: string;
  notes?: string;
}
