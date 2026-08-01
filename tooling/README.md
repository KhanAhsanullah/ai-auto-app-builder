# Tooling

Developer tools, CLI, generators, and validation utilities for the platform.

## Tools

| Tool                             | Package                      | Responsibility                              |
| -------------------------------- | ---------------------------- | ------------------------------------------- |
| [cli](./cli)                     | `@ai-commerce/cli`           | `platform` CLI for tenant ops and local dev |
| [generators](./generators)       | `@ai-commerce/generators`    | Scaffold apps and manifests from config     |
| [config-linter](./config-linter) | `@ai-commerce/config-linter` | Pre-deploy config validation                |

## Usage

These tools are used by:

- Developers during local development
- CI/CD pipelines for validation gates
- Build Orchestrator for artifact generation
- Tenant Provisioner during onboarding

## Status

Foundation scaffold — tool implementations in future sprints.
