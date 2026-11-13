# Staging demo runbook (Sprint 30 Task 3)

Give a client a **single clear way** to see CommerceOS Boom without juggling many local terminals.

Primary path today: **Docker Compose demo stack** on one machine (laptop or VM). Public cloud URL is optional once you publish that host.

Related: [CLIENT_DEMO.md](../../CLIENT_DEMO.md) (pitch + 3-minute script), [infra/docker/README.md](../../infra/docker/README.md).

---

## Client URL (what to send)

| Audience       | URL to share                                    | Notes                                          |
| -------------- | ----------------------------------------------- | ---------------------------------------------- |
| Local Docker   | `http://localhost:5173`                         | Same machine as Compose                        |
| LAN / VM demo  | `http://<host-ip-or-dns>:5173`                  | Open firewall ports 5173 / 5174 / 8787         |
| Public staging | _set after you deploy_ → fill **Published URL** | Must set `VITE_PLATFORM_API_URL` to public API |

**Published URL (fill when live):**

```
Web / Boom:   ________________________________
Admin:        ________________________________
platform-api: ________________________________
```

Until a public host exists, use Docker on the demo laptop and share screen, or tunnel (e.g. Cloudflare Tunnel / ngrok) the three ports and paste the tunnel URLs above.

---

## One-command local staging

From repo root (Docker Desktop / Engine required):

```bash
pnpm demo:docker
# equivalent:
# docker compose -f infra/docker/docker-compose.demo.yml up --build
```

| Surface      | URL                   |
| ------------ | --------------------- |
| Web / Boom   | http://localhost:5173 |
| Admin        | http://localhost:5174 |
| platform-api | http://127.0.0.1:8787 |

Validate compose files without Docker:

```bash
pnpm demo:docker:validate
```

Stop: `Ctrl+C` in the compose terminal, or:

```bash
docker compose -f infra/docker/docker-compose.demo.yml down
```

Reset persisted Boom tenants / catalogs:

```bash
docker compose -f infra/docker/docker-compose.demo.yml down
docker volume rm ai-commerce-demo-platform-api-data
```

---

## Environment variables

Copy [infra/docker/.env.demo.example](../../infra/docker/.env.demo.example) when overriding Compose defaults.

### platform-api

| Variable             | Default (Compose)     | Purpose                       |
| -------------------- | --------------------- | ----------------------------- |
| `HOST`               | `0.0.0.0`             | Bind address inside container |
| `PORT`               | `8787`                | HTTP listen port              |
| `TENANT_STORE_PATH`  | `/data/tenants.json`  | Durable tenants file          |
| `CONFIG_STORE_PATH`  | `/data/configs.json`  | Durable tenant configs        |
| `CATALOG_STORE_PATH` | `/data/catalogs.json` | Durable catalogs              |

CORS is open (`*`) for demo — fine for staging, not production hardening.

### web-host / admin-host (browser → API)

| Variable                | Default (Compose)       | Purpose                                         |
| ----------------------- | ----------------------- | ----------------------------------------------- |
| `VITE_PLATFORM_API_URL` | `http://127.0.0.1:8787` | **Browser-reachable** API base (not Docker DNS) |

Vite reads this at **dev-server start**. After changing it, recreate the web/admin containers.

**Hosted rule:** if the client opens `https://demo.example.com`, set:

```bash
VITE_PLATFORM_API_URL=https://api.demo.example.com
```

(or the same host with a reverse-proxied `/api` path if you terminate TLS that way). Never point the browser at `http://platform-api:8787` — that hostname only exists inside the Compose network.

---

## Hosting a public staging URL (checklist)

1. Provision a VM or PaaS box with Docker.
2. Clone this repo; run `pnpm demo:docker` (or Compose with a custom `.env`).
3. Point DNS / reverse proxy:
   - `demo.…` → host `:5173` (web)
   - `admin.…` → host `:5174` (optional)
   - `api.…` → host `:8787`
4. Set `VITE_PLATFORM_API_URL` to the **public** API origin; recreate web + admin.
5. Open firewall / security group for 80/443 (and map to the three services).
6. Paste the three URLs into **Published URL** above and into [CLIENT_DEMO.md](../../CLIENT_DEMO.md).
7. Run the smoke checklist below once on the public host.

This sprint does **not** ship a vendor-specific IaC template (Fly/Render/etc.); Compose on a single host is the supported staging shape.

---

## Smoke checklist (before client call)

Run against local Docker **or** the published staging URL.

- [ ] `GET {API}/health` → `{"ok":true,"service":"platform-api"}`
- [ ] Web loads at `{WEB}` without console connection errors to the API
- [ ] **New app** → name + Restaurant (or any vertical) → Boom launch succeeds
- [ ] Home shows brand; **Shop** lists products; category chips (if Sprint 31+) filter
- [ ] Add to cart → Checkout → Payment → Orders path works
- [ ] Shareable `/t/{slug}` opens the same store in a new tab
- [ ] Admin `{ADMIN}` lists the same tenant catalog; edit amount → refresh storefront reflects change
- [ ] Restart Compose (or reboot VM) → previous Boom tenant still loads (volume intact)

Quick API ping:

```bash
curl -s http://127.0.0.1:8787/health
# hosted: curl -s https://api.demo.example.com/health
```

---

## Troubleshooting

| Symptom                          | Likely cause                              | Fix                                               |
| -------------------------------- | ----------------------------------------- | ------------------------------------------------- |
| Boom fails / network error       | API down or wrong `VITE_PLATFORM_API_URL` | Check health; recreate web with public API URL    |
| Admin empty after Boom           | Different API / volume                    | Same Compose project + `platform-api-data` volume |
| Port already in use              | Local `pnpm web` still on 5173            | Stop local Vite / change host ports in Compose    |
| Categories missing after upgrade | Old localStorage / volume snapshot        | **Reset demo** in UI, or wipe Docker volume       |

---

## Status

Sprint 30 Task 3 — runbook + env example + smoke checklist. Demo stack: Tasks 1–2 (`pnpm demo:docker`).
