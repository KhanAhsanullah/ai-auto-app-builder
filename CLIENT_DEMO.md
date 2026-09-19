# Client demo — CommerceOS AI (MVP)

Filhal itna kaafi hai ke client ko product dikhao: **Boom se branded store** 2–3 minute me.

## Product one-liner (client ko bolo)

> CommerceOS AI se koi bhi business apna naam, logo aur app type (grocery / restaurant / …) choose karke branded web store launch kar sakta hai — catalog, cart, checkout, orders ke saath. Har store ka shareable link bhi milta hai.

## Pehle se chalao (local)

Terminal 1 — control plane:

```bash
pnpm --filter @ai-commerce/platform-api start
```

Terminal 2 — web store:

```bash
pnpm web
```

Browser: http://localhost:5173  
(API default: http://127.0.0.1:8787)

## 3-minute demo script

1. **Wizard** — business name likho (e.g. _Spice Route_), optional logo URL, vertical pick karo (Restaurant).
2. **Boom — launch app** dabao.
3. Store open hoga — brand name + colors + vertical catalog.
4. **Shop → Add → Cart → Checkout → Payment → Orders** chalake dikhao.
5. URL copy karo — `/t/spice-route` ya `/t/spice-route/cart` — naya tab me open karke dikhao ke link shareable hai.

Mobile (optional): `pnpm mobile` (Expo) — same Boom flow; pehle platform-api on hona chahiye.

## Client se kya promise kar sakte ho (abhi)

| Hai ✅                                    | Abhi mat bolo ❌                      |
| ----------------------------------------- | ------------------------------------- |
| Boom se branded store (web + mobile demo) | Production payments / bank settlement |
| Vertical presets + sample catalog         | Real inventory sync / ERP             |
| Platform-owned tenant + config + products | Multi-admin SaaS billing portal       |
| Shareable store URL                       | Custom domain + SSL live              |
| Cart → checkout → order demo path         | App Store / Play Store live apps      |

## Next when client interested

- Unka real logo + catalog import
- Domain / white-label packaging
- Admin dashboard for merchants
- Real payment provider

Technical status: Sprint 28 complete on `main` (`sprint28-task3`).
