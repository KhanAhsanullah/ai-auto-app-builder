# Build Orchestrator

Control-plane service that plans, executes, and tracks tenant-specific artifact rebuilds when configuration is published.

## Package

`@ai-commerce/build-orchestrator`

## Status

**Sprint 12 Task 2** — In-process executor + artifact descriptors.

Task 1 (planner / status / job store) is complete. Task 3 (`createBuildOrchestrator` facade) is next. No real CI/CD or Docker.

## Modules

| Module                                              | Purpose                                              |
| --------------------------------------------------- | ---------------------------------------------------- |
| `BuildPlanner`                                      | `BuildRequest` → ordered multi-surface plan          |
| `BuildExecutor`                                     | Run queued job → plan → steps → artifact descriptors |
| `ArtifactStore` / `InMemoryArtifactStore`           | Persist artifact metadata                            |
| `BuildJobRepository` / `InMemoryBuildJobRepository` | Job store                                            |

## Usage

```ts
import {
  BuildPlanner,
  BuildExecutor,
  InMemoryBuildJobRepository,
  InMemoryArtifactStore,
} from '@ai-commerce/build-orchestrator';

const jobs = new InMemoryBuildJobRepository();
const artifacts = new InMemoryArtifactStore();
const planner = new BuildPlanner();

const request = {
  tenantId: 'tenant-fresh',
  configVersion: 3,
  reason: 'config_publish' as const,
  surfaces: ['web', 'admin'] as const,
};

await jobs.save({
  id: 'job-1',
  tenantId: request.tenantId,
  request,
  status: 'queued',
  plan: planner.plan(request),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

const result = await new BuildExecutor({ jobs, artifacts }).execute('job-1');
// result.job.status === 'succeeded'
// result.artifacts → surface_bundle descriptors
```

## Scripts

```bash
pnpm --filter @ai-commerce/build-orchestrator test
pnpm --filter @ai-commerce/build-orchestrator typecheck
pnpm --filter @ai-commerce/build-orchestrator lint
```

## Architecture

See [docs/architecture/build-orchestrator.md](../../docs/architecture/build-orchestrator.md).
