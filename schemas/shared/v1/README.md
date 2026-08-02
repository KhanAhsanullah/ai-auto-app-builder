# Shared Schemas (v1)

Reusable primitive types and versioning definitions referenced across all configuration schemas.

## Schemas

| File                                               | Purpose                                                     |
| -------------------------------------------------- | ----------------------------------------------------------- |
| [common.schema.json](./common.schema.json)         | UUID, slug, locale, currency, URL, email, hex color, semver |
| [versioning.schema.json](./versioning.schema.json) | schemaVersion, configVersion, migration records             |

## Example

[examples/common.example.json](./examples/common.example.json)

## Referenced By

All domain schemas in `tenant-config/v1/`, `theme/v1/`, and `navigation/v1/` via `$ref` to `$defs`.
