# Admin Dashboard

Merchant admin dashboard shell for CommerceOS AI. Resolves config-driven navigation, feature flags, branding, and layout into a shell model for the admin surface.

## Package

`@ai-commerce/admin-dashboard`

## Status

Sprint 8 Task 1 complete — shell foundation (navigation, feature flags, branding, widgets).

Task 2 (screen registry / React layout) and Task 3 (`createAdminDashboard` facade) are not yet implemented.

## Modules

| Module                              | Purpose                                             |
| ----------------------------------- | --------------------------------------------------- |
| `FeatureFlagEvaluator`              | Evaluate `flags.*` and `modules.*` keys             |
| `AdminNavigationResolver`           | Filter admin nav by visibility + feature flags      |
| `AdminBrandingResolver`             | Map branding (+ company display name) for the shell |
| `AdminDashboardShellResolver`       | Compose the full resolved admin shell model         |
| `toResolveAdminDashboardShellInput` | Map Config Runtime / tenant config → resolver input |

## Usage

```typescript
import {
  AdminDashboardShellResolver,
  toResolveAdminDashboardShellInput,
} from '@ai-commerce/admin-dashboard';
import { ConfigProvider } from '@ai-commerce/config-runtime';

const result = new ConfigProvider({ cache: false }).resolve({ tenantConfig });
const shell = new AdminDashboardShellResolver().resolve(
  toResolveAdminDashboardShellInput(result, { roles: ['manager'] }),
);

shell.navigation.primary; // flag-gated sidebar items
shell.branding.appName;
shell.layout.defaultLandingRoute;
shell.widgets; // role-filtered dashboard widgets
```

## Scripts

```bash
pnpm --filter @ai-commerce/admin-dashboard test
pnpm --filter @ai-commerce/admin-dashboard typecheck
pnpm --filter @ai-commerce/admin-dashboard lint
pnpm --filter @ai-commerce/admin-dashboard build
```

## Out of scope (Task 1)

- React UI / Vite or Next.js app wiring — Task 2–3
- Screen-map registry and page components — Task 2
- `createAdminDashboard` facade — Task 3
- Live theme CSS injection (use Theme Engine emitters in Task 2+)
