# Config Engine

Control-plane service for tenant configuration CRUD, versioning, validation, and publish events that trigger build rebuilds.

## Package

`@ai-commerce/config-engine`

## Status

**Sprint 13 Task 2** — Publish workflow + `ConfigPublishEvent` (Build Orchestrator–aligned).

Task 1 (draft CRUD) is complete. Task 3 (`createConfigEngine` facade) is next.

## Modules

| Module                         | Purpose                                |
| ------------------------------ | -------------------------------------- |
| `DraftConfigService`           | Save/get/list draft revisions          |
| `PublishConfigService`         | Promote draft → published + emit event |
| `ConfigValidationService`      | Validate via Config Runtime            |
| `InMemoryConfigPublishEmitter` | Collect/fan-out publish events         |
| `InMemoryConfigRepository`     | Versioned document store               |

## Usage

```ts
import { ConfigProvider } from '@ai-commerce/config-runtime';
import {
  ConfigValidationService,
  DraftConfigService,
  PublishConfigService,
  InMemoryConfigRepository,
  InMemoryConfigPublishEmitter,
} from '@ai-commerce/config-engine';

const repository = new InMemoryConfigRepository();
const validation = new ConfigValidationService({
  configProvider: new ConfigProvider({ cache: false }),
});
const emitter = new InMemoryConfigPublishEmitter([
  async (event) => {
    // e.g. await builds.onConfigPublish(event)
  },
]);

const drafts = new DraftConfigService({ repository, validation });
const publish = new PublishConfigService({ repository, validation, emitter });

await drafts.saveDraft({ tenantId: 'tenant-fresh', document });
const { event } = await publish.publish({ tenantId: 'tenant-fresh', surfaces: ['web'] });
```

## Scripts

```bash
pnpm --filter @ai-commerce/config-engine test
pnpm --filter @ai-commerce/config-engine typecheck
pnpm --filter @ai-commerce/config-engine lint
```

## Architecture

See [docs/architecture/config-engine.md](../../docs/architecture/config-engine.md).
