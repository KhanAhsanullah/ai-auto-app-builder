# Plugin Manifest v1

JSON Schema contract for registering third-party plugins in the platform plugin catalog.

## Schema

| File                                                                           | Purpose                |
| ------------------------------------------------------------------------------ | ---------------------- |
| [plugin-manifest.schema.json](./plugin-manifest.schema.json)                   | Root manifest contract |
| [examples/sample.plugin-manifest.json](./examples/sample.plugin-manifest.json) | Valid example manifest |

## Fields

| Property        | Required | Description                                         |
| --------------- | -------- | --------------------------------------------------- |
| `id`            | Yes      | Reverse-DNS plugin identifier (`com.vendor.plugin`) |
| `name`          | Yes      | Human-readable plugin name                          |
| `description`   | Yes      | Short plugin summary                                |
| `version`       | Yes      | Exact semver release version (catalog key)          |
| `engineVersion` | Yes      | Platform API compatibility semver range             |
| `permissions`   | Yes      | Declared permission strings (may be empty)          |
| `hooks`         | Yes      | Hook point registrations (may be empty)             |
| `dependencies`  | No       | Other plugin dependencies as semver ranges          |
| `configSchema`  | No       | Embedded JSON Schema for plugin settings            |

## Hook points

Manifest hook `point` values must match the platform hook point catalog validated by `@ai-commerce/plugin-registry`:

| Hook point               | Purpose                                    |
| ------------------------ | ------------------------------------------ |
| `theme.presets.extend`   | Preset registry extensions                 |
| `theme.resolve.after`    | Post-resolve theme transforms              |
| `config.validate.after`  | Post-configuration validation side effects |
| `tenant.provision.after` | Post-provision tenant side effects         |

## Lifecycle

```
Register → validate manifest → catalog persistence → (Task 2+) tenant install → (Task 3+) hook activation
```

Security scanning and signature verification are deferred beyond Sprint 5 Task 1.

## Generated types

Run `pnpm --filter @ai-commerce/config-schema generate` to produce:

- `PluginManifest` TypeScript interface
- `pluginManifestSchema` Zod validator
