# Theme Engine

Design token resolver and compiler for CommerceOS AI. Transforms tenant theme configuration into resolved token sets with light/dark modes, metadata, and live preview support.

## Package

`@ai-commerce/theme-engine`

## Status

Sprint 2 Task 1 — theme schema, presets, ThemeResolver, ModeResolver, Live Preview, plugin extension points.

## Modules

| Module                   | Responsibility                                                   |
| ------------------------ | ---------------------------------------------------------------- |
| `ThemeResolver`          | Merge inheritance chain + preset templates                       |
| `ModeResolver`           | Light / dark / auto (system) palette resolution                  |
| `PresetRegistry`         | Built-in preset catalog (default, minimal, modern, luxury, dark) |
| `PresetLoader`           | Load preset templates from bundled JSON                          |
| `LivePreviewCoordinator` | In-memory preview for White-Label Builder                        |
| `ThemePluginRegistry`    | Extension points for future Theme Plugins (Sprint 5+)            |

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
import { ThemeResolver, LivePreviewCoordinator } from '@ai-commerce/theme-engine';

const resolver = new ThemeResolver();
const result = resolver.resolve({
  vertical: 'grocery',
  tenantTheme: { preset: 'modern', colors: { primary: '#FF0000' } },
});

console.log(result.theme.colors.primary); // #FF0000
console.log(result.metadata.hash); // SHA-256 of resolved tokens
console.log(result.modes.dark.background); // Dark palette

// Live preview (White-Label Builder)
const preview = new LivePreviewCoordinator();
const draft = preview.preview(
  { tenantTheme: { preset: 'modern' } },
  { colors: { primary: '#00FF00' } },
);
```

## Documentation

- [Theme Engine Architecture](../../docs/architecture/theme-engine.md)
- [Theme Schema](../../schemas/theme/v1/README.md)

## Dependencies

- `@ai-commerce/config-schema` — `Theme` type and `themeSchema` validation

## Version

Sprint 2 Task 1 — preset foundation and theme resolution.
