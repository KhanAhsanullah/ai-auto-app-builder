# Config Engine

Control-plane package (`@ai-commerce/config-engine`) for versioned tenant configuration: draft save, validation, and later publish events that trigger `@ai-commerce/build-orchestrator`.

## Principles

1. **Config Runtime is the validation gate** — never reimplement schema validation.
2. **Revisions are versioned** — monotonic `version` per tenant; publish bumps become `configVersion` for builds.
3. **Draft first** — Task 1 only persists `status: 'draft'`; publish lands in Task 2.

## Sprint 13 Task 1 surface

```
SaveDraftInput
     │
     ▼
ConfigValidationService (ConfigProvider.resolve)
     │
     ▼
DraftConfigService → ConfigRepository (InMemory*)
     │
     ▼
ConfigDocument { tenantId, version, status: draft, document }
```

## Sprint 13 Task Breakdown

| Task   | Deliverable                                                             |
| ------ | ----------------------------------------------------------------------- |
| Task 1 | Draft CRUD, validation wrapper, in-memory repository                    |
| Task 2 | Publish workflow + `ConfigPublishEvent` (align with Build Orchestrator) |
| Task 3 | `ConfigEngine` / `createConfigEngine` facade, docs                      |

## Deferred

- Real database adapters
- HTTP / platform-api routes
- Worker queue consumers
- Live Build Orchestrator wiring (Task 2/3)
