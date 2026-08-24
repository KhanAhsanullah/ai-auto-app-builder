# Admin Dashboard

Config-driven merchant admin for CommerceOS AI — resolve tenant config into a branded shell, map screens, and mount a React app from one facade call.

## Package

`@ai-commerce/admin-dashboard`

## Status

Sprint 8 complete — Task 3 delivers `createAdminDashboard` / `AdminDashboard` facade, `AdminDashboardApp`, and `mountAdminDashboard`.

## Modules

| Module                          | Purpose                                           |
| ------------------------------- | ------------------------------------------------- |
| `createAdminDashboard`          | Config → shell + registry facade                  |
| `AdminDashboard`                | `getViewModel`, screen registration               |
| `AdminDashboardApp` (`./react`) | Stateful React entry with branded default screens |
| `mountAdminDashboard`           | DOM mount helper for SPA / embed hosts            |
| `AdminScreenRegistry`           | Route → screen map                                |
| `AdminShellLayout`              | Sidebar + header + content                        |

## Usage

```typescript
import { createAdminDashboard } from '@ai-commerce/admin-dashboard';
import { AdminDashboardApp, mountAdminDashboard } from '@ai-commerce/admin-dashboard/react';
import { ConfigProvider } from '@ai-commerce/config-runtime';

const result = new ConfigProvider({ cache: false }).resolve({ tenantConfig });
const dashboard = createAdminDashboard({
  config: result,
  roles: ['manager'],
});

// React tree
<AdminDashboardApp dashboard={dashboard} />

// Or mount into the DOM
mountAdminDashboard({ dashboard, container: '#root' });
```

Navigation, feature flags, branding, and widgets all come from tenant config — change config, not forks.

## Scripts

```bash
pnpm --filter @ai-commerce/admin-dashboard test
pnpm --filter @ai-commerce/admin-dashboard typecheck
pnpm --filter @ai-commerce/admin-dashboard lint
pnpm --filter @ai-commerce/admin-dashboard build
```

## Out of scope

- Full Vite/Next app scaffold (host with `mountAdminDashboard` or embed `AdminDashboardApp`)
- Live IdP session binding (`@ai-commerce/auth-client`)
- Runtime Theme Engine CSS injection
