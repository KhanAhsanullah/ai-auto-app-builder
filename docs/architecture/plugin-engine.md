# Plugin Engine Architecture

Control-plane plugin catalog, tenant bindings, and in-process hook dispatch for CommerceOS AI.

## Overview

`@ai-commerce/plugin-registry` validates plugin manifests, registers them in a platform catalog, installs tenant-scoped bindings, and dispatches known hook points to **enabled** plugins via host-registered in-process handlers.

It does **not** write tenant configuration, load untrusted code from disk, or replace Theme Engine’s local `ThemePluginRegistry` (Sprint 5 Task 3 leaves theme-engine runtime unchanged).

## Boundaries

```
Host process
  ├── registerHandler(pluginId, handlerId, fn)   ← trusted code only
  └── createPluginRegistry()
          ↓
PluginRegistry facade
  ├── Catalog / Discovery / Install (Tasks 1–2)
  ├── Lifecycle enable/disable/uninstall
  ├── PluginActivationService → TenantHandlerActivationStore
  └── HookDispatcher → enabled activations only
          ↓
ConfigProvider.resolve()   ← validation gate on install/enable (read-only)
```

| Concern                      | Owner                                          |
| ---------------------------- | ---------------------------------------------- |
| Manifest schema + types      | `schemas/plugin-manifest` + config-schema      |
| Catalog + tenant bindings    | Plugin Registry                                |
| Hook dispatch                | Plugin Registry (`HookDispatcher`)             |
| Tenant config CRUD / publish | Config Engine (future)                         |
| Theme resolve pipeline       | Theme Engine (separate; optional bridge later) |

## Sprint 5 Task Breakdown

| Task   | Deliverable                                                                |
| ------ | -------------------------------------------------------------------------- |
| Task 1 | Manifest schema, catalog, `ManifestValidator`, registration idempotency    |
| Task 2 | Discovery, install, dependency resolution, lifecycle, ConfigProvider gates |
| Task 3 | Handler registry, activation, `HookDispatcher`, `PluginRegistry` facade    |

## Lifecycle ↔ Hooks

```
uninstalled → install → installed (handlers inactive)
installed / disabled → enable → enabled (handlers active for dispatch)
enabled → disable → disabled (activations removed)
any bound state → uninstall → uninstalled (activations removed)
```

| Transition  | Handler state                                         |
| ----------- | ----------------------------------------------------- |
| `install`   | No activation                                         |
| `enable`    | Assert global handlers → persist `enabled` → activate |
| `disable`   | Deactivate then persist `disabled`                    |
| `uninstall` | Deactivate then delete binding                        |

## Hook Dispatch

1. Validate `hookPoint` ∈ `HOOK_POINT_CATALOG`
2. Load activations for `(tenantId, hookPoint)`
3. Sort by ascending `priority` (default `100`), then `pluginId`, then `handlerId`
4. Invoke host-registered handlers sequentially (await async handlers)
5. Fail-fast on first handler error (`PluginHandlerDispatchException`)

Known hook points:

| Hook point               | Purpose                                    |
| ------------------------ | ------------------------------------------ |
| `theme.presets.extend`   | Preset registry extensions                 |
| `theme.resolve.after`    | Post-resolve theme transforms              |
| `config.validate.after`  | Post-configuration validation side effects |
| `tenant.provision.after` | Post-provision tenant side effects         |

## Public API

Primary entry: `createPluginRegistry()` → `PluginRegistry`.

Advanced modules: `@ai-commerce/plugin-registry/internal`.

## Deferred

- HTTP API / platform-api routes
- Database repository adapters
- Async worker queue dispatch
- WASM / isolated runtimes
- Permission ACL enforcement
- Signature verification / security scanning
- Production Theme Engine bridge
