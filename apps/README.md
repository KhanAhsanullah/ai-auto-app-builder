# Apps

Deployable applications that form the runtime surfaces and entry points of the platform.

## Applications

| App                                  | Package                        | Responsibility                             |
| ------------------------------------ | ------------------------------ | ------------------------------------------ |
| [admin-dashboard](./admin-dashboard) | `@ai-commerce/admin-dashboard` | Merchant admin and platform administration |
| [web-store](./web-store)             | `@ai-commerce/web-store`       | Consumer web storefront                    |
| [mobile-app](./mobile-app)           | `@ai-commerce/mobile-app`      | Consumer React Native mobile app           |
| [api-gateway](./api-gateway)         | `@ai-commerce/api-gateway`     | BFF, routing, rate limiting                |
| [platform-api](./platform-api)       | `@ai-commerce/platform-api`    | Control-plane API                          |
| [worker](./worker)                   | `@ai-commerce/worker`          | Background jobs and event processing       |

## Design Principles

- Apps are **thin shells** — business logic lives in `modules/` and shared logic in `packages/`
- All surfaces consume the same **tenant configuration** via `config-runtime`
- Branding is applied via **theme-engine** compiled tokens

## Status

Foundation scaffold — application frameworks will be configured in future sprints.
