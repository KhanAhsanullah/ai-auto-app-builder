# Build Orchestrator

Control-plane package (`@ai-commerce/build-orchestrator`) that turns config publish events into tenant-scoped rebuild jobs across Admin, Web, Mobile, and API surfaces.

## Principles

1. **Config publish triggers rebuilds** — jobs carry `tenantId`, `configVersion`, and optional `publishId`.
2. **Surfaces are first-class** — `admin` | `web` | `mobile` | `api`.
3. **Plan before execute** — Task 1 produces declarative steps; Task 2 executes them; Task 3 exposes the facade.
4. **No uncontrolled deploys** — status machine gates progression; terminal states are final.

## Sprint 12 Task 1 surface

```
BuildRequest
     │
     ▼
BuildPlanner → BuildPlan (per-surface steps)
     │
     ▼
BuildJob (queued…)  ←→  BuildJobRepository (InMemory*)
```

Plan step kinds:

- `resolve_config`
- `compile_theme`
- `compile_brand`
- `emit_artifact`

## Sprint 12 Task 2 — Executor

```
queued BuildJob
     │
     ▼
BuildExecutor.execute(jobId)
     ├── planning (attach plan)
     ├── running (simulate steps)
     │     └── emit_artifact → ArtifactStore.save(BuildArtifactRef)
     └── succeeded | failed
```

`BuildArtifactRef` is metadata only (`contentHash`, surface, configVersion) — no binary blobs or Docker images yet.

## Status machine

```
queued → planning → running → succeeded
                     ↘ failed
queued | planning | running → cancelled
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
