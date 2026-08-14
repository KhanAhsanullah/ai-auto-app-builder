# Platform

Control-plane services that manage configuration, branding, AI orchestration, and tenant lifecycle.

## Services

| Service                                        | Package                                   | Responsibility                         |
| ---------------------------------------------- | ----------------------------------------- | -------------------------------------- |
| [config-engine](./config-engine)               | `@ai-commerce/config-engine`              | Config CRUD, versioning, publish       |
| [theme-engine-service](./theme-engine-service) | `@ai-commerce/theme-engine-service`       | Theme compilation and asset pipeline   |
| [white-label-engine](./white-label-engine)     | `@ai-commerce/white-label-engine-service` | Domains, SSL, app identity (deferred)  |
| [ai-orchestrator](./ai-orchestrator)           | `@ai-commerce/ai-orchestrator`            | AI config generation and admin copilot |
| [plugin-registry](./plugin-registry)           | `@ai-commerce/plugin-registry`            | Plugin discovery and installation      |
| [tenant-provisioner](./tenant-provisioner)     | `@ai-commerce/tenant-provisioner`         | Tenant onboarding and seed data        |
| [build-orchestrator](./build-orchestrator)     | `@ai-commerce/build-orchestrator`         | Artifact generation and deployment     |

## Control Plane vs Data Plane

- **Platform services** (this folder) — manage tenants, config, themes, builds
- **Apps + modules** — serve end-user and merchant runtime requests

Platform services emit events on config publish that trigger rebuilds across all generated surfaces.

## Status

Foundation scaffold — service implementations in future sprints.
