# Theme Schema (v1)

Design token schema compiled by the Theme Engine into CSS, React Native, and Admin theme bundles.

## Schema

| File                                     | Description                                                |
| ---------------------------------------- | ---------------------------------------------------------- |
| [theme.schema.json](./theme.schema.json) | Design tokens: colors, typography, spacing, radius, motion |

## Presets

Built-in preset templates in [presets/](./presets/):

| Preset    | Description                              |
| --------- | ---------------------------------------- |
| `default` | Platform baseline                        |
| `minimal` | Flat, compact, high whitespace           |
| `modern`  | Contemporary sans-serif, vibrant primary |
| `luxury`  | Rich palette, refined typography         |
| `dark`    | Dark-first palette                       |
| `custom`  | No template — tenant supplies all fields |

The `preset` field selects the template; tenant overrides deep-merge on top.

## Theme Metadata

Optional `metadata` object on the theme section:

| Field          | Description                                 |
| -------------- | ------------------------------------------- |
| `themeVersion` | Integer incremented on theme changes        |
| `createdAt`    | ISO 8601 — first creation                   |
| `updatedAt`    | ISO 8601 — last edit                        |
| `compiledAt`   | ISO 8601 — set by Theme Engine on resolve   |
| `hash`         | SHA-256 of canonical resolved token payload |

## Example

[examples/theme.example.json](./examples/theme.example.json)

## Referenced By

- Root tenant config: `tenant-config/v1/tenant-config.schema.json` → `theme`
- `@ai-commerce/theme-engine`
- Architecture: [docs/architecture/theme-engine.md](../../docs/architecture/theme-engine.md)

## Version

Current schema version: **v1**
