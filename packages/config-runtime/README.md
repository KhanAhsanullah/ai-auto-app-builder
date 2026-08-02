# Config Runtime

Runtime configuration resolver with inheritance: platform defaults → vertical preset → tenant override → environment. Used by all apps and services.

## Package

`@ai-commerce/config-runtime`

## Status

Sprint 1 Task 3 — configuration runtime implemented.

## Modules

| Module            | Responsibility                                            |
| ----------------- | --------------------------------------------------------- |
| `ConfigLoader`    | Parse JSON strings, objects, and files                    |
| `ConfigResolver`  | Merge inheritance chain with deep merge                   |
| `ConfigValidator` | Validate against `@ai-commerce/config-schema` Zod schemas |
| `ConfigCache`     | In-memory LRU cache with optional TTL                     |
| `ConfigProvider`  | Facade combining load → resolve → validate → cache        |

## Configuration Priority

```
Platform Defaults
  ↓
Vertical Defaults
  ↓
Tenant Configuration
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
import { ConfigProvider } from '@ai-commerce/config-runtime';

const provider = new ConfigProvider();
const result = await provider.loadFromFile('/path/to/tenant-config.json');

console.log(result.config.tenant.name);
console.log(result.environment);
```
