# Theme Engine

Design token resolver and compiler for CommerceOS AI. Transforms tenant theme configuration into resolved token sets with light/dark modes, metadata, and surface-specific compiled artifacts.

## Package

`@ai-commerce/theme-engine`

## Status

Sprint 2 Task 3 — ThemeProvider facade, Config Runtime integration, public API cleanup.

## Modules

| Module                   | Responsibility                                            |
| ------------------------ | --------------------------------------------------------- |
| `ThemeProvider`          | Public facade — resolve + compile from config or resolver |
| `createThemeProvider`    | Factory wiring resolver, compiler, cache, and emitters    |
| `ThemeResolver`          | Merge inheritance chain + preset templates                |
| `ThemeCompiler`          | Normalize and emit surface artifacts                      |
| `LivePreviewCoordinator` | In-memory preview for White-Label Builder                 |
| `ThemePluginRegistry`    | Extension points for future Theme Plugins (Sprint 5+)     |

Internal modules (emitters, cache, normalizer) are available via `@ai-commerce/theme-engine/internal` for advanced use.

## Pipeline

```
ConfigProvider.resolve()
        ↓
ThemeProvider.provideFromConfig()
        ↓
ThemeResolver → ThemeCompiler → Surface Artifacts
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
import { ConfigProvider } from '@ai-commerce/config-runtime';
import { createThemeProvider } from '@ai-commerce/theme-engine';

const configProvider = new ConfigProvider();
const themeProvider = createThemeProvider();

const configResult = await configProvider.loadFromFile('./tenant-config.json');
const theme = themeProvider.provideFromConfig({ source: configResult });

console.log(theme.resolved.theme.colors.primary);
console.log(theme.artifacts.css.css);
console.log(theme.artifacts.tailwind.config);
console.log(theme.fromCache);
```

Direct resolver input (without Config Runtime):

```typescript
const theme = themeProvider.provide({
  tenantTheme: { preset: 'modern', colors: { primary: '#FF0000' } },
  surfaces: ['css', 'tailwind'],
});
```

## Documentation

- [Theme Engine Architecture](../../docs/architecture/theme-engine.md)
- [Theme Schema](../../schemas/theme/v1/README.md)

## Dependencies

- `@ai-commerce/config-schema` — `Theme` type and validation types
- `@ai-commerce/config-runtime` — `ConfigProvider` integration (dev/tests)

## Version

Sprint 2 Task 3 — ThemeProvider facade and integration.
