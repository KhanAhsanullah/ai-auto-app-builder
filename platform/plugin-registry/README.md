# Plugin Registry

Control-plane service for plugin manifest validation, discovery, catalog registration, tenant installation, lifecycle management, and in-process hook dispatch.

## Package

`@ai-commerce/plugin-registry`

## Status

Sprint 5 Task 3 complete — `PluginRegistry` facade, handler activation, and synchronous hook dispatch.

## Modules

| Module                                 | Purpose                                                 |
| -------------------------------------- | ------------------------------------------------------- |
| `PluginRegistry`                       | Public facade for catalog → install → enable → dispatch |
| `createPluginRegistry`                 | Default wiring factory                                  |
| `ManifestValidator`                    | Schema + semantic manifest validation                   |
| `CatalogService`                       | Register manifests in the platform catalog              |
| `DiscoveryService`                     | Scan filesystem and register discovered manifests       |
| `FilesystemManifestScanner`            | Recursive `*.plugin-manifest.json` scanner port         |
| `DependencyResolver`                   | Transitive semver dependency resolution                 |
| `PluginSettingsValidator`              | AJV validation against manifest `configSchema`          |
| `InstallService`                       | Tenant plugin installation with config gate             |
| `PluginLifecycleService`               | Enable / disable / uninstall lifecycle                  |
| `PluginHandlerRegistry`                | Global in-process handler function registry             |
| `PluginActivationService`              | Sync lifecycle ↔ tenant handler activations             |
| `HookDispatcher`                       | Tenant-scoped ordered hook dispatch                     |
| `TenantHandlerActivationStore`         | Active handler bindings port                            |
| `PluginCatalogRepository`              | Platform catalog persistence port                       |
| `TenantPluginRepository`               | Tenant runtime binding persistence port                 |
| `InMemoryPluginCatalogRepository`      | Default catalog adapter                                 |
| `InMemoryTenantPluginRepository`       | Default tenant binding adapter                          |
| `InMemoryTenantHandlerActivationStore` | Default activation adapter                              |

Advanced modules (`HookDispatcher`, `PluginHandlerRegistry`, `PluginActivationService`, activation store) are also available via `@ai-commerce/plugin-registry/internal`.

## Lifecycle

```
Discover → catalog register → tenant install (installed)
  → registerHandler (host) → enable (handlers active)
  → dispatch → disable / uninstall
```

Install requires a matching `integrations.plugins[]` declaration in caller-supplied tenant config (exact `id` + `version`). The registry never writes tenant config.

Enable requires every manifest `hooks[].handler` to be registered globally via `registerHandler` before the binding becomes `enabled`.

## Usage

```typescript
import { createPluginRegistry } from '@ai-commerce/plugin-registry';

const registry = createPluginRegistry();

await registry.registerManifest(manifest);

registry.registerHandler({
  pluginId: manifest.id,
  handlerId: 'extendPresets',
  handler: (invocation) => {
    // mutate invocation.context
  },
});

await registry.install({ tenantId, pluginId, version, tenantConfig });
await registry.enable({ tenantId, pluginId, tenantConfig });

await registry.dispatch({
  tenantId,
  hookPoint: 'theme.presets.extend',
  context: { presets: [] },
});
```

## Scripts

```bash
pnpm --filter @ai-commerce/plugin-registry test
pnpm --filter @ai-commerce/plugin-registry typecheck
pnpm --filter @ai-commerce/plugin-registry lint
pnpm --filter @ai-commerce/plugin-registry build
```

## Out of scope (Task 3)

- Async worker / queue dispatch
- Dynamic filesystem or WASM handler loading
- Permission ACL enforcement (permissions are metadata only)
- Config Engine integration and tenant config writes
- Database or file persistence for bindings / activations
- Theme-engine production wiring (dispatch contract only; D11)
