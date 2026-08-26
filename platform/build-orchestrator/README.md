# Build Orchestrator

Control-plane service that plans and tracks tenant-specific artifact rebuilds when configuration is published.

## Package

`@ai-commerce/build-orchestrator`

## Status

**Sprint 12 Task 1** — Domain model, build planner, status machine, in-memory job store.

Tasks 2–3 (executor + facade / publish trigger) are not yet implemented. No real CI/CD or Docker.

## Modules

| Module                       | Purpose                                     |
| ---------------------------- | ------------------------------------------- |
| `BuildPlanner`               | `BuildRequest` → ordered multi-surface plan |
| `assertBuildJobTransition`   | Build job status state machine              |
| `BuildJobRepository`         | Persistence port                            |
| `InMemoryBuildJobRepository` | Map-backed job store for tests / dry-runs   |

## Usage

```ts
import { BuildPlanner, InMemoryBuildJobRepository } from '@ai-commerce/build-orchestrator';

const plan = new BuildPlanner().plan({
  tenantId: 'tenant-fresh',
  configVersion: 3,
  reason: 'config_publish',
});

const repo = new InMemoryBuildJobRepository();
await repo.save({
  id: 'job-1',
  tenantId: 'tenant-fresh',
  request: { tenantId: 'tenant-fresh', configVersion: 3 },
  status: 'queued',
  plan,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});
```

## Scripts

```bash
pnpm --filter @ai-commerce/build-orchestrator test
pnpm --filter @ai-commerce/build-orchestrator typecheck
pnpm --filter @ai-commerce/build-orchestrator lint
```

## Architecture

See [docs/architecture/build-orchestrator.md](../../docs/architecture/build-orchestrator.md).
