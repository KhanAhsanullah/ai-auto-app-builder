# Docker

Dockerfiles and Compose for **client demo / staging** (Sprint 30 Task 1).

## Demo stack (Boom web + platform-api)

One command from the **repo root**:

```bash
docker compose -f infra/docker/docker-compose.demo.yml up --build
```

| Service      | URL                   |
| ------------ | --------------------- |
| Web / Boom   | http://localhost:5173 |
| platform-api | http://127.0.0.1:8787 |

Validate compose files without Docker:

```bash
pnpm demo:docker:validate
```

## Files

| File                        | Purpose                                  |
| --------------------------- | ---------------------------------------- |
| `docker-compose.demo.yml`   | platform-api + web-host demo stack       |
| `Dockerfile.platform-api`   | Control-plane API image (`HOST=0.0.0.0`) |
| `Dockerfile.web-host`       | Vite Boom storefront                     |
| `validate-demo-compose.mjs` | File/structure smoke check               |

Durable tenant/config/catalog JSON lives in the `platform-api-data` volume.

## Notes

- Browser calls API at `http://127.0.0.1:8787` (host port), not the Docker service DNS name.
- Admin host (`pnpm admin`) is still local-only for now — add in a later Sprint 30 task.
- Full Postgres/Redis production topology remains future work.
