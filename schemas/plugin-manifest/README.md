# Plugin Manifest Schema

JSON Schema definitions for third-party plugin registration contracts.

## Scope

Defines plugin manifest structure:

- Plugin identity and version
- Required permissions
- Hook point registrations
- Plugin-specific configuration schema
- Runtime isolation requirements

## Version

| Version | Path                         | Status                                                   |
| ------- | ---------------------------- | -------------------------------------------------------- |
| v1      | [plugin-manifest/v1/](./v1/) | Sprint 5 Task 1 — manifest schema and catalog foundation |

## Lifecycle

```
Register → validate manifest → catalog persistence → tenant install → hook activation
```

Tenant install and hook activation are implemented in Sprint 5 Tasks 2–3.

## Related packages

- `@ai-commerce/config-schema` — generated `PluginManifest` type and `pluginManifestSchema`
- `@ai-commerce/plugin-registry` — manifest validation and platform catalog registration
