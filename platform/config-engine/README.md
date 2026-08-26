# Config Engine

Control-plane service for tenant configuration CRUD, versioning, validation, and (later) publish events that trigger build rebuilds.

## Package

`@ai-commerce/config-engine`

## Status

**Sprint 13 Task 1** — Draft CRUD foundation: validation via Config Runtime, versioned documents, in-memory repository.

Task 2 (publish + `ConfigPublishEvent`) and Task 3 (facade) are not yet implemented.

## Modules

| Module                                          | Purpose                                         |
| ----------------------------------------------- | ----------------------------------------------- |
| `ConfigValidationService`                       | Validate config layers through `ConfigProvider` |
| `DraftConfigService`                            | Save/get/list draft revisions                   |
| `ConfigRepository` / `InMemoryConfigRepository` | Versioned document store                        |

## Usage

```ts
import { ConfigProvider } from '@ai-commerce/config-runtime';
import {
  ConfigValidationService,
  DraftConfigService,
  InMemoryConfigRepository,
} from '@ai-commerce/config-engine';

const repository = new InMemoryConfigRepository();
const validation = new ConfigValidationService({
  configProvider: new ConfigProvider({ cache: false }),
});
const drafts = new DraftConfigService({ repository, validation });

const saved = await drafts.saveDraft({
  tenantId: 'tenant-fresh',
  document: tenantConfigLayer,
});
```

## Scripts

```bash
pnpm --filter @ai-commerce/config-engine test
pnpm --filter @ai-commerce/config-engine typecheck
pnpm --filter @ai-commerce/config-engine lint
```

## Architecture

See [docs/architecture/config-engine.md](../../docs/architecture/config-engine.md).
