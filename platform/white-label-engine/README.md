# White-Label Engine Service

Control-plane service for custom domains, SSL provisioning, app identity (bundle IDs), and branded legal/comms templates.

Brand resolution lives in `@ai-commerce/white-label-engine` (`packages/white-label-engine`). This service is the future HTTP adapter around that library.

## Package

`@ai-commerce/white-label-engine-service`

## Status

**Service scaffold only** — this directory is a placeholder for the future control-plane HTTP adapter. No HTTP endpoints or service business logic are implemented here.

Sprint 3 library implementation is **complete** in `@ai-commerce/white-label-engine` (`packages/white-label-engine`): BrandResolver, asset pipeline, surface emitters, and WhiteLabelProvider facade.

HTTP/service implementation for `@ai-commerce/white-label-engine-service` (custom domains, SSL, bundle IDs, branded templates) remains **intentionally deferred** to a later sprint.

## Scripts

```bash
pnpm lint
pnpm typecheck
```
