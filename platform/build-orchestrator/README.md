# Build Orchestrator

Control-plane service that plans, executes, and tracks tenant-specific artifact rebuilds when configuration is published.

## Package

`@ai-commerce/build-orchestrator`

## Status

Sprint 12 complete — Task 3 delivers `BuildOrchestrator` / `createBuildOrchestrator` with `onConfigPublish`.

HTTP / worker / real CI-CD remain deferred.

## Modules

| Module                                                 | Purpose                                     |
| ------------------------------------------------------ | ------------------------------------------- |
| `createBuildOrchestrator`                              | Wire planner + executor + in-memory stores  |
| `BuildOrchestrator`                                    | Facade: enqueue, execute, `onConfigPublish` |
| `BuildPlanner`                                         | Request → multi-surface plan                |
| `BuildExecutor`                                        | Queued job → simulated steps → artifacts    |
| `InMemoryBuildJobRepository` / `InMemoryArtifactStore` | Default stores                              |

## Usage

```ts
import { createBuildOrchestrator } from '@ai-commerce/build-orchestrator';

const builds = createBuildOrchestrator();

// Config Engine publish hook
const result = await builds.onConfigPublish({
  tenantId: 'tenant-fresh',
  configVersion: 7,
  publishId: 'pub-123',
});
// result.job.status === 'succeeded'
// result.artifacts → surface_bundle descriptors per surface
```

## Scripts

```bash
pnpm --filter @ai-commerce/build-orchestrator test
pnpm --filter @ai-commerce/build-orchestrator typecheck
pnpm --filter @ai-commerce/build-orchestrator lint
```

## Architecture

See [docs/architecture/build-orchestrator.md](../../docs/architecture/build-orchestrator.md).
