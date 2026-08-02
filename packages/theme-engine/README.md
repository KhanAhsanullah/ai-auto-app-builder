# Theme Engine

Design token resolver and compiler for CommerceOS AI. Transforms tenant theme configuration into resolved token sets with light/dark modes, metadata, and surface-specific compiled artifacts.

## Package

`@ai-commerce/theme-engine`

## Status

Sprint 2 Task 2 — TokenNormalizer, ThemeCompiler, ThemeCache, and surface emitters (CSS, Tailwind, React Native, Admin Dashboard).

## Modules

| Module                        | Responsibility                                                   |
| ----------------------------- | ---------------------------------------------------------------- |
| `ThemeResolver`               | Merge inheritance chain + preset templates                       |
| `ModeResolver`                | Light / dark / auto (system) palette resolution                  |
| `TokenNormalizer`             | Canonical normalized design tokens for emitters                  |
| `ThemeCompiler`               | Resolve, normalize, and emit surface artifacts                   |
| `ThemeEmitterRegistry`        | Port for surface emitter lookup (dependency inversion)           |
| `DefaultThemeEmitterRegistry` | Default wiring for all built-in surface emitters                 |
| `ThemeCache`                  | In-memory LRU cache for compiled theme output                    |
| `CssVariablesEmitter`         | CSS custom property bundles for web surfaces                     |
| `TailwindEmitter`             | Tailwind theme extension configuration                           |
| `ReactNativeEmitter`          | React Native theme objects for mobile                            |
| `AdminDashboardTokenEmitter`  | Admin dashboard semantic tokens + CSS variables                  |
| `PresetRegistry`              | Built-in preset catalog (default, minimal, modern, luxury, dark) |
| `PresetLoader`                | Load preset templates from bundled JSON                          |
| `LivePreviewCoordinator`      | In-memory preview for White-Label Builder                        |
| `ThemePluginRegistry`         | Extension points for future Theme Plugins (Sprint 5+)            |

## Theme Inheritance

```
Theme Platform Defaults
  ↓
Theme Vertical Presets
  ↓
Preset Template
  ↓
Tenant Config theme section
  ↓
Environment Overrides
  ↓
ThemeResolver → TokenNormalizer → Surface Emitters
```

## Scripts

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

## Usage

```typescript
import { DefaultThemeEmitterRegistry, ThemeCompiler } from '@ai-commerce/theme-engine';

const compiler = new ThemeCompiler({
  emitterRegistry: new DefaultThemeEmitterRegistry(),
});
const compiled = compiler.compile({
  tenantTheme: { preset: 'modern', colors: { primary: '#FF0000' } },
});

console.log(compiled.artifacts.css.css); // CSS variables for light + dark
console.log(compiled.artifacts.tailwind.config); // Tailwind theme.extend
console.log(compiled.artifacts['react-native'].light.colors); // RN light palette
console.log(compiled.artifacts['admin-dashboard'].semantic); // Admin semantic tokens
console.log(compiled.metadata.hash); // Cache invalidation key
```

## Documentation

- [Theme Engine Architecture](../../docs/architecture/theme-engine.md)
- [Theme Schema](../../schemas/theme/v1/README.md)

## Dependencies

- `@ai-commerce/config-schema` — `Theme` type and `themeSchema` validation

## Version

Sprint 2 Task 2 — theme compiler and surface emitters.
