# Build Orchestrator

Control-plane package (`@ai-commerce/build-orchestrator`) that turns config publish events into tenant-scoped rebuild jobs across Admin, Web, Mobile, and API surfaces.

## Principles

1. **Config publish triggers rebuilds** — jobs carry `tenantId`, `configVersion`, and optional `publishId`.
2. **Surfaces are first-class** — `admin` | `web` | `mobile` | `api`.
3. **Plan before execute** — planner produces declarative steps; executor simulates compilers and emits artifact metadata.
4. **No uncontrolled deploys** — status machine gates progression; terminal states are final.

## Flow

```
ConfigPublishEvent / BuildRequest
        │
        ▼
createBuildOrchestrator()
        │
        ▼
BuildOrchestrator
        ├── enqueue → BuildJob (queued + plan)
        ├── execute / enqueueAndExecute
        └── onConfigPublish → enqueueAndExecute (reason: config_publish)
                │
                ▼
        BuildExecutor → ArtifactStore
```

## Sprint 12 Task Breakdown

| Task   | Deliverable                                               |
| ------ | --------------------------------------------------------- |
| Task 1 | Domain model, planner, status machine, in-memory job repo |
| Task 2 | In-process executor + artifact descriptors                |
| Task 3 | `BuildOrchestrator` / `createBuildOrchestrator` facade    |

## Deferred

- Real CI/CD, Docker, Kubernetes deploys
- Config Engine HTTP publish wiring
- Worker queue consumers
- Live Theme / White-Label compiler invocation
