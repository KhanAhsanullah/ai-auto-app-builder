# Plugin Manifest Schema

JSON Schema definitions for third-party plugin registration contracts.

## Scope

Defines plugin manifest structure:

- Plugin identity and version
- Required permissions
- Hook point registrations
- Plugin-specific configuration schema
- Runtime isolation requirements

## Lifecycle

```
Register → validate manifest → security scan → tenant install → hook activation
```

## Status

Schema files will be added in a future sprint.
