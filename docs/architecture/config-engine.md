# Config Engine

Control-plane package (`@ai-commerce/config-engine`) for versioned tenant configuration: draft save, validation, publish, and events that trigger `@ai-commerce/build-orchestrator`.

## Principles

1. **Config Runtime is the validation gate** — never reimplement schema validation.
2. **Revisions are versioned** — monotonic `version` per tenant; publish uses that as `configVersion`.
3. **Draft then publish** — Task 1 drafts; Task 2 promotes and emits `ConfigPublishEvent`.

## Flow

```
SaveDraftInput → DraftConfigService → ConfigDocument (draft)
                                              │
                                              ▼
                                    PublishConfigService
                                              │
                          ┌───────────────────┼───────────────────┐
                          ▼                   ▼                   ▼
                   status=published    meta.configVersion    ConfigPublishEvent
                                                              (emitter)
```

`ConfigPublishEvent` matches Build Orchestrator:

```ts
{ tenantId, configVersion, publishId, surfaces? }
```

## Sprint 13 Task Breakdown

| Task   | Deliverable                                                            |
| ------ | ---------------------------------------------------------------------- |
| Task 1 | Draft CRUD, validation wrapper, in-memory repository                   |
| Task 2 | Publish workflow + `ConfigPublishEvent` (Build Orchestrator alignment) |
| Task 3 | `ConfigEngine` / `createConfigEngine` facade, docs                     |

## Deferred

- Real database adapters
- HTTP / platform-api routes
- Worker queue consumers
- Hard dependency on Build Orchestrator package (wire via emitter listener)
