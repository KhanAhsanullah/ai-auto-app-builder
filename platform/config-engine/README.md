# Config Engine

Control-plane service for tenant configuration CRUD, versioning, validation, and publish events that trigger build rebuilds.

## Package

`@ai-commerce/config-engine`

## Status

**Sprint 13 complete** — Task 3 delivers `ConfigEngine` / `createConfigEngine` facade.

## Modules

| Module                         | Purpose                                |
| ------------------------------ | -------------------------------------- |
| `createConfigEngine`           | Wire drafts + publish + in-memory deps |
| `ConfigEngine`                 | Facade: saveDraft, publish, get/list   |
| `DraftConfigService`           | Save/get/list draft revisions          |
| `PublishConfigService`         | Promote draft → published + emit event |
| `ConfigValidationService`      | Validate via Config Runtime            |
| `InMemoryConfigPublishEmitter` | Collect/fan-out publish events         |
| `InMemoryConfigRepository`     | Versioned document store               |

## Usage

```ts
import { createConfigEngine } from '@ai-commerce/config-engine';

const engine = createConfigEngine({
  onPublish: [
    async (event) => {
      // e.g. await builds.onConfigPublish(event)
    },
  ],
});

await engine.saveDraft({ tenantId: 'tenant-fresh', document });
const { event } = await engine.publish({
  tenantId: 'tenant-fresh',
  surfaces: ['web'],
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
