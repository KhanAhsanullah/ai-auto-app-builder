# Theme Schema

JSON Schema definitions for design tokens and brand styling configuration.

## Scope

Defines theme token categories:

- Color palettes and semantic colors
- Typography scale and font families
- Spacing, radius, and density
- Elevation and motion tokens
- Component variant selections

## Pipeline

```
Theme JSON → validate against schema → compile → CSS / RN / Admin bundles
```

## Consumers

- `packages/theme-engine` — token compiler
- `platform/theme-engine-service` — compile orchestration
- White-Label Engine — brand asset generation

## Status

Schema files will be added in a future sprint.
