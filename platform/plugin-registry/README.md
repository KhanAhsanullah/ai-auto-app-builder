# Plugin Registry

Control-plane service for plugin manifest validation, discovery, catalog registration, tenant installation, and lifecycle management.

## Package

`@ai-commerce/plugin-registry`

## Status

Sprint 5 Task 2 complete — discovery, tenant install/lifecycle, and ConfigProvider validation gates.

Task 3 (hook dispatch, `PluginRegistry` facade) is not yet implemented.

## Modules

| Module                            | Purpose                                           |
| --------------------------------- | ------------------------------------------------- |
| `ManifestValidator`               | Schema + semantic manifest validation             |
| `CatalogService`                  | Register manifests in the platform catalog        |
| `DiscoveryService`                | Scan filesystem and register discovered manifests |
| `FilesystemManifestScanner`       | Recursive `*.plugin-manifest.json` scanner port   |
| `DependencyResolver`              | Transitive semver dependency resolution           |
| `PluginSettingsValidator`         | AJV validation against manifest `configSchema`    |
| `InstallService`                  | Tenant plugin installation with config gate       |
| `PluginLifecycleService`          | Enable / disable / uninstall lifecycle            |
| `PluginCatalogRepository`         | Platform catalog persistence port                 |
| `TenantPluginRepository`          | Tenant runtime binding persistence port           |
| `InMemoryPluginCatalogRepository` | Default catalog adapter                           |
| `InMemoryTenantPluginRepository`  | Default tenant binding adapter                    |

## Lifecycle

```
Discover → catalog register → tenant install (installed) → enable → disable → uninstall
```

Install requires a matching `integrations.plugins[]` declaration in caller-supplied tenant config (exact `id` + `version`). The registry never writes tenant config.

## Usage

```typescript
import {
  CatalogService,
  DiscoveryService,
  InstallService,
  InMemoryPluginCatalogRepository,
  InMemoryTenantPluginRepository,
  ManifestValidator,
  PluginLifecycleService,
} from '@ai-commerce/plugin-registry';
import { ConfigProvider } from '@ai-commerce/config-runtime';

const catalogRepository = new InMemoryPluginCatalogRepository();
const tenantPluginRepository = new InMemoryTenantPluginRepository();
const configProvider = new ConfigProvider({ cache: false });

const catalog = new CatalogService({
  validator: new ManifestValidator(),
  repository: catalogRepository,
});

await new DiscoveryService({ catalogService: catalog }).discoverFromDirectory('./plugins');
```

## Scripts

```bash
pnpm --filter @ai-commerce/plugin-registry test
pnpm --filter @ai-commerce/plugin-registry typecheck
pnpm --filter @ai-commerce/plugin-registry lint
pnpm --filter @ai-commerce/plugin-registry build
```

## Out of scope (Task 2)

- Hook dispatcher and handler execution
- `PluginRegistry` facade / `createPluginRegistry()`
- Config Engine integration and tenant config writes
- Database or file persistence for bindings
