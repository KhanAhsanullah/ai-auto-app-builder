# Docker

Dockerfiles and Compose for **client demo / staging** (Sprint 30).

## Demo stack (Boom web + admin + platform-api)

One command from the **repo root**:

```bash
docker compose -f infra/docker/docker-compose.demo.yml up --build
# or: pnpm demo:docker
```

| Service      | URL                   |
| ------------ | --------------------- |
| Web / Boom   | http://localhost:5173 |
| Admin        | http://localhost:5174 |
| platform-api | http://127.0.0.1:8787 |

Validate compose files without Docker:

```bash
pnpm demo:docker:validate
```

## Shared data volume

Volume **`ai-commerce-demo-platform-api-data`** (`platform-api-data` in compose) mounts at `/data` in `platform-api` with:

| Env var              | File                  |
| -------------------- | --------------------- |
| `TENANT_STORE_PATH`  | `/data/tenants.json`  |
| `CONFIG_STORE_PATH`  | `/data/configs.json`  |
| `CATALOG_STORE_PATH` | `/data/catalogs.json` |

Web Boom launch and admin catalog CRUD both talk to the **same** API + volume — edits persist across container restarts until you `docker volume rm ai-commerce-demo-platform-api-data`.

## Files

| File                        | Purpose                              |
| --------------------------- | ------------------------------------ |
| `docker-compose.demo.yml`   | platform-api + web-host + admin-host |
| `Dockerfile.platform-api`   | Control-plane API (`HOST=0.0.0.0`)   |
| `Dockerfile.web-host`       | Vite Boom storefront                 |
| `Dockerfile.admin-host`     | Vite merchant admin                  |
| `validate-demo-compose.mjs` | File/structure smoke check           |

## Env overrides

See [`.env.demo.example`](./.env.demo.example). Critical for hosting: set `VITE_PLATFORM_API_URL` to a **browser-reachable** API origin (never `http://platform-api:8787`).

## Notes

- Browser calls API at `http://127.0.0.1:8787` (host port), not Docker DNS names.
- Full staging runbook (client URL, smoke checklist, public host steps): [docs/runbooks/staging-demo.md](../../docs/runbooks/staging-demo.md).
