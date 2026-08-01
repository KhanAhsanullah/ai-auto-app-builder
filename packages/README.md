# Packages

Shared libraries consumed across apps, modules, and platform services.

## Libraries

| Package                            | Responsibility                                 |
| ---------------------------------- | ---------------------------------------------- |
| [config-schema](./config-schema)   | Canonical JSON Schema for tenant configuration |
| [config-runtime](./config-runtime) | Config resolver with inheritance chain         |
| [theme-engine](./theme-engine)     | Design token compiler for all surfaces         |
| [ui-core](./ui-core)               | Headless UI primitives and state machines      |
| [ui-web](./ui-web)                 | Web presentation components                    |
| [ui-mobile](./ui-mobile)           | React Native presentation components           |
| [sdk-client](./sdk-client)         | Typed API client                               |
| [sdk-admin](./sdk-admin)           | Admin-specific SDK extensions                  |
| [auth-client](./auth-client)       | Authentication flows and token management      |
| [i18n](./i18n)                     | Localization and formatting                    |
| [analytics](./analytics)           | Event taxonomy and tracking                    |
| [feature-flags](./feature-flags)   | Feature flag resolution                        |
| [utils](./utils)                   | Shared pure utilities                          |

## Dependency Rules

- Packages must **not** depend on apps or platform services
- Packages may depend on other packages (acyclic graph)
- Domain logic belongs in `modules/`, not here — packages provide cross-cutting infrastructure

## Status

Foundation scaffold — implementations in future sprints.
