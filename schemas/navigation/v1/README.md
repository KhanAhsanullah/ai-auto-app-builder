# Navigation Schema (v1)

Cross-surface navigation schema for web store, mobile app, and admin dashboard.

## Schema

| File                                               | Description                                              |
| -------------------------------------------------- | -------------------------------------------------------- |
| [navigation.schema.json](./navigation.schema.json) | Per-surface nav items, routes, icons, feature flag gates |

## Example

[examples/navigation.example.json](./examples/navigation.example.json)

## Referenced By

- Root tenant config: `tenant-config/v1/tenant-config.schema.json` → `navigation`
- Generated apps resolve `route` keys via screen-map registry (future sprint)

## Version

Current schema version: **v1**
