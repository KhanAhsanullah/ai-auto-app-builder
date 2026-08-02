# Schema Versioning

Versioning strategy for platform configuration schemas.

## Two Version Concepts

| Concept            | Field                | Scope                  | Increment When                                                                |
| ------------------ | -------------------- | ---------------------- | ----------------------------------------------------------------------------- |
| **Schema Version** | `meta.schemaVersion` | Platform-wide contract | Breaking JSON Schema change (field removed, type changed, new required field) |
| **Config Version** | `meta.configVersion` | Per-tenant document    | Every publish of tenant configuration                                         |

## Current Version

| Schema Version | Status | Root Schema                                  |
| -------------- | ------ | -------------------------------------------- |
| **v1**         | Active | `tenant-config/v1/tenant-config.schema.json` |

The `schemaVersion` field is constrained to `"v1"` via enum in `shared/v1/versioning.schema.json`. When v2 is introduced, the enum expands and migration tooling activates.

## Semantic Rules

### Non-Breaking Changes (same schema version)

- Adding optional properties
- Adding new enum values at the end
- Relaxing validation (wider pattern, larger maxLength)
- Adding new example files

### Breaking Changes (requires new schema version)

- Removing properties
- Renaming properties
- Adding required properties
- Changing property types
- Tightening validation that rejects previously valid configs

## Version Constants

Defined in `@ai-commerce/config-schema`:

```typescript
export const SCHEMA_VERSION = 'v1';
export const SUPPORTED_SCHEMA_VERSIONS = ['v1'];
```

## Compatibility Checks

On config publish, the Config Engine (future sprint) will:

1. Read `meta.schemaVersion`
2. Verify it is in `SUPPORTED_SCHEMA_VERSIONS`
3. Validate the full document against the matching schema version
4. Reject publish if schema version is unsupported or validation fails

## File Layout Convention

```
schemas/
├── tenant-config/
│   ├── v1/          ← current version
│   └── v2/          ← future version (when needed)
├── theme/
│   ├── v1/
│   └── v2/
└── shared/
    └── v1/
```

Each version folder is **immutable** once published. Changes go into a new version folder.

## Audit Trail

`meta.migrationHistory` records every schema migration applied to a tenant config:

```json
{
  "fromSchemaVersion": "v1",
  "toSchemaVersion": "v2",
  "migratedAt": "2027-01-15T08:00:00.000Z",
  "migrationId": "v1-to-v2-rename-featureFlags"
}
```
