# Theme Engine Architecture

Architecture reference for Sprint 2 — Theme Engine. Approved for implementation.

## Overview

The Theme Engine transforms resolved tenant configuration into design token artifacts for all platform surfaces. It lives entirely in `@ai-commerce/theme-engine` (`packages/theme-engine`) for Sprint 2. The control-plane **theme-engine-service** and compiled artifact persistence are deferred to a later sprint; artifact compilation output belongs to the **Build Orchestrator** sprint.

**Principle:** Config Runtime resolves _what_ the theme is; Theme Engine resolves _how_ it applies across surfaces.

## Package Scope (Sprint 2)

| In scope                         | Out of scope (later sprints)    |
| -------------------------------- | ------------------------------- |
| `packages/theme-engine`          | `platform/theme-engine-service` |
| Theme schema + presets           | `compiled-output.schema.json`   |
| ThemeResolver, ModeResolver      | ThemeProvider facade (Task 3)   |
| Live Preview coordinator         | CDN artifact storage            |
| TokenNormalizer, emitters        | Plugin implementation           |
| ThemeCompiler, ThemeCache        | Build Orchestrator artifacts    |
| ThemeProvider, integration tests | theme-engine-service            |

## Folder Structure

```
schemas/theme/v1/
├── theme.schema.json
├── presets/
│   ├── default.json
│   ├── minimal.json
│   ├── modern.json
│   ├── luxury.json
│   └── dark.json
└── examples/

packages/theme-engine/
├── src/
│   ├── index.ts
│   ├── types.ts
│   ├── errors.ts
│   ├── utils/
│   │   ├── deep-merge.ts
│   │   └── theme-hash.ts
│   ├── defaults/
│   │   ├── platform-theme.ts
│   │   ├── vertical-themes.ts
│   │   └── presets/              # Runtime copies validated against schemas/
│   ├── domain/
│   │   ├── theme-resolver.ts
│   │   ├── mode-resolver.ts
│   │   ├── token-normalizer.ts
│   │   ├── theme-compiler.ts
│   │   ├── theme-provider.ts
│   │   ├── map-config-theme-source.ts
│   │   ├── preset-registry.ts
│   │   ├── live-preview.ts
│   │   └── plugin-extensions.ts
│   └── infrastructure/
│       ├── preset-loader.ts
│       ├── theme-cache.ts
│       ├── create-theme-provider.ts
│       └── emitters/
│           ├── css-variables-emitter.ts
│           ├── tailwind-emitter.ts
│           ├── react-native-emitter.ts
│           └── admin-dashboard-emitter.ts
└── tests/
```

## Presets

| Preset    | Description                                                  |
| --------- | ------------------------------------------------------------ |
| `default` | Platform baseline — balanced typography, spacing, and colors |
| `minimal` | Flat, compact, high whitespace                               |
| `modern`  | Contemporary sans-serif, vibrant primary                     |
| `luxury`  | Rich palette, elevated typography, refined spacing           |
| `dark`    | Dark-first palette; `darkMode.enabled` true by default       |
| `custom`  | No preset template; tenant must supply all required fields   |

Preset templates live in `schemas/theme/v1/presets/`. The `preset` field in tenant config selects the template; tenant overrides deep-merge on top.

## Theme Metadata

Every resolved theme carries metadata for versioning, auditing, and cache invalidation:

| Field          | Source        | Description                                 |
| -------------- | ------------- | ------------------------------------------- |
| `themeVersion` | Tenant config | Integer incremented on theme changes        |
| `createdAt`    | Tenant config | ISO 8601 — first theme creation             |
| `updatedAt`    | Tenant config | ISO 8601 — last theme edit                  |
| `compiledAt`   | Theme Engine  | ISO 8601 — when tokens were last resolved   |
| `hash`         | Theme Engine  | SHA-256 of canonical resolved token payload |

Metadata is defined in `theme.schema.json` under `metadata` (optional on input; Theme Engine populates `compiledAt` and `hash` on resolve).

## Integration with Config Runtime

```
ConfigProvider.resolve()
        ↓
ConfigProviderResult (ThemeConfigSource)
        ↓
ThemeProvider.provideFromConfig()
        ↓
ThemeResolver.resolve()
        ↓
ResolvedTheme (with metadata + light/dark modes)
        ↓
ThemeCompiler.compileFromResolved()
        ↓
TokenNormalizer.normalize()
        ↓
Surface Emitters (CSS, Tailwind, React Native, Admin)
```

Theme inheritance chain:

```
Theme Platform Defaults
  ↓
Theme Vertical Presets
  ↓
Preset Template (default | minimal | modern | luxury | dark)
  ↓
Tenant Config theme section
  ↓
Environment Overrides.theme (via config-runtime shallow merge)
```

Theme defaults live in `@ai-commerce/theme-engine/defaults/` — not in `@ai-commerce/config-runtime` (Sprint 1 immutability).

## Light / Dark / Auto Mode

| Mode  | Schema                        | Behavior                              |
| ----- | ----------------------------- | ------------------------------------- |
| Light | Base `colors`                 | Default token set                     |
| Dark  | `darkMode.colors` + fallbacks | Merged dark palette                   |
| Auto  | `darkMode.strategy: "system"` | Client follows `prefers-color-scheme` |

The `dark` preset provides a dark-first baseline; `darkMode.strategy` controls runtime switching.

## Live Preview

The **Live Preview** coordinator enables the future White-Label Builder to preview theme changes instantly without persisting config.

```
White-Label Builder UI
        ↓
LivePreviewCoordinator.preview(baseInput, draftPatch)
        ↓
ThemeResolver (in-memory merge)
        ↓
ResolvedTheme → render preview surface
```

- No persistence, no cache write
- Same resolver pipeline as production resolve
- `draftPatch` is a partial `Theme` merged over the current base
- Preview hash computed for devtools diff display

## Theme Plugin Extension Points (Future)

Sprint 2 defines interfaces only — no plugin execution.

```typescript
interface ThemePluginContributor {
  id: string;
  version: string;
  extendPresets?(registry: PresetRegistry): void;
  extendResolvedTheme?(theme: ResolvedTheme): ResolvedTheme;
}

class ThemePluginRegistry {
  register(contributor): void;
  apply(theme): ResolvedTheme; // no-op until Plugin Engine (Sprint 5)
}
```

Plugins will hook in after Sprint 5 Plugin Engine. Extension points are stable contracts for forward compatibility.

## Sprint 2 Task Breakdown

| Task       | Scope                                                                                           | Tag             |
| ---------- | ----------------------------------------------------------------------------------------------- | --------------- |
| **Task 1** | Schema, presets, ThemeResolver, ModeResolver, Live Preview stub, plugin extension points, tests | `sprint2-task1` |
| **Task 2** | TokenNormalizer, emitters, ThemeCompiler, ThemeCache                                            | `sprint2-task2` |
| **Task 3** | ThemeProvider facade, integration tests, docs                                                   | `sprint2-task3` |

## Dependencies

```
@ai-commerce/config-schema  →  Theme type, themeSchema
@ai-commerce/config-runtime  →  ConfigProviderResult (dev/tests)
```

## Decision Log

| Decision               | Choice                                                  |
| ---------------------- | ------------------------------------------------------- |
| Service location       | Deferred — all Sprint 2 code in `packages/theme-engine` |
| Compiled output schema | Deferred to Build Orchestrator sprint                   |
| ADR                    | Skipped — this document replaces ADR-002                |
| Presets                | default, minimal, modern, luxury, dark, custom          |
| Theme defaults         | Owned by theme-engine, not config-runtime               |
