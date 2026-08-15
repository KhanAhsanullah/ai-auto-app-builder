# Plugin Registry

Control-plane service for plugin manifest validation and platform catalog registration.

## Package

`@ai-commerce/plugin-registry`

## Status

Sprint 5 Task 1 complete — manifest validation and in-memory platform catalog foundation.

Task 2 (discovery, tenant install/lifecycle) and Task 3 (hook dispatch, `PluginRegistry` facade) are not yet implemented.

## Task 1 modules

| Module                                      | Purpose                                        |
| ------------------------------------------- | ---------------------------------------------- |
| `ManifestValidator`                         | Schema + semantic manifest validation          |
| `CatalogService`                            | Validate and register manifests in the catalog |
| `PluginCatalogRepository`                   | Catalog persistence port                       |
| `InMemoryPluginCatalogRepository`           | Default in-memory adapter                      |
| `HOOK_POINT_CATALOG` / `isKnownHookPoint()` | Known hook point registry                      |
| `computeManifestFingerprint()`              | SHA-256 idempotency fingerprint                |

## Usage

```typescript
import {
  CatalogService,
  InMemoryPluginCatalogRepository,
  ManifestValidator,
} from '@ai-commerce/plugin-registry';

const catalog = new CatalogService({
  validator: new ManifestValidator(),
  repository: new InMemoryPluginCatalogRepository(),
});

const result = await catalog.register({
  id: 'com.commerceos.theme.contrast',
  name: 'Contrast Theme Extension',
  description: 'Adds high-contrast preset extensions.',
  version: '1.0.0',
  engineVersion: '^5.0.0',
  permissions: ['theme.read'],
  hooks: [{ point: 'theme.presets.extend', handler: 'extendPresets' }],
});
```

Registration is idempotent for identical `(id, version)` manifests. Re-registering the same manifest returns the existing record (`created: false`).

## Scripts

```bash
pnpm --filter @ai-commerce/plugin-registry test
pnpm --filter @ai-commerce/plugin-registry typecheck
pnpm --filter @ai-commerce/plugin-registry lint
pnpm --filter @ai-commerce/plugin-registry build
```

## Platform API version

Manifest `engineVersion` ranges are checked against `PLUGIN_ENGINE_API_VERSION` (`5.0.0`).

## Out of scope (Task 1)

- Discovery, tenant bindings, install/enable/disable/uninstall lifecycle
- Hook dispatcher and handler execution
- `PluginRegistry` facade / `createPluginRegistry()`
- Config Engine integration and tenant config writes
- Database or file persistence
