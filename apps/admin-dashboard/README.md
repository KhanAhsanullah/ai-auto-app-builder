# Admin Dashboard

Merchant admin dashboard for CommerceOS AI. Resolves config-driven navigation, feature flags, and branding into a shell model, maps routes via a screen registry, and renders a React sidebar layout.

## Package

`@ai-commerce/admin-dashboard`

## Status

Sprint 8 Task 2 complete — screen registry + React admin layout shell.

Task 3 (`createAdminDashboard` facade / app entry) is not yet implemented.

## Modules

| Module                         | Purpose                                        |
| ------------------------------ | ---------------------------------------------- |
| `FeatureFlagEvaluator`         | Evaluate `flags.*` and `modules.*` keys        |
| `AdminNavigationResolver`      | Filter admin nav by visibility + feature flags |
| `AdminBrandingResolver`        | Map branding for the shell                     |
| `AdminDashboardShellResolver`  | Compose the resolved admin shell model         |
| `AdminScreenRegistry`          | Route key → screen definition map              |
| `buildAdminShellViewModel`     | Shell + registry → layout view-model           |
| `AdminShellLayout` (`./react`) | React sidebar + header + content shell         |

## Usage

```typescript
import {
  AdminDashboardShellResolver,
  buildAdminShellViewModel,
  createDefaultAdminScreenRegistry,
  toResolveAdminDashboardShellInput,
} from '@ai-commerce/admin-dashboard';
import { AdminShellLayout } from '@ai-commerce/admin-dashboard/react';
import { ConfigProvider } from '@ai-commerce/config-runtime';

const result = new ConfigProvider({ cache: false }).resolve({ tenantConfig });
const shell = new AdminDashboardShellResolver().resolve(
  toResolveAdminDashboardShellInput(result, { roles: ['manager'] }),
);
const viewModel = buildAdminShellViewModel(shell, createDefaultAdminScreenRegistry());

// React
<AdminShellLayout viewModel={viewModel} onNavigate={(route) => { /* set active route */ }} />
```

## Scripts

```bash
pnpm --filter @ai-commerce/admin-dashboard test
pnpm --filter @ai-commerce/admin-dashboard typecheck
pnpm --filter @ai-commerce/admin-dashboard lint
pnpm --filter @ai-commerce/admin-dashboard build
```

## Out of scope (Task 2)

- `createAdminDashboard` facade / Vite or Next.js app entry — Task 3
- Live IdP session binding
- Full theme CSS injection from Theme Engine at runtime
