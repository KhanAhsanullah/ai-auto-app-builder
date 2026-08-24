# Mobile App

Config-driven React Native consumer shell for CommerceOS AI. Resolves navigation, feature flags, branding, and mobile identity from tenant configuration.

## Package

`@ai-commerce/mobile-app`

## Status

Sprint 9 Task 1 complete — mobile shell foundation (nav, flags, branding, identity/runtime).

Task 2 (screen registry + RN bottom-bar layout) and Task 3 (`createMobileApp` facade) are not yet implemented.

## Modules

| Module                         | Purpose                                             |
| ------------------------------ | --------------------------------------------------- |
| `FeatureFlagEvaluator`         | Evaluate `flags.*` and `modules.*` keys             |
| `MobileNavigationResolver`     | Filter mobile nav by visibility + feature flags     |
| `MobileBrandingResolver`       | Map branding (+ splash / app icon) for the shell    |
| `MobileAppShellResolver`       | Compose the full resolved mobile shell model        |
| `toResolveMobileAppShellInput` | Map Config Runtime / tenant config → resolver input |

## Usage

```typescript
import { MobileAppShellResolver, toResolveMobileAppShellInput } from '@ai-commerce/mobile-app';
import { ConfigProvider } from '@ai-commerce/config-runtime';

const result = new ConfigProvider({ cache: false }).resolve({ tenantConfig });
const shell = new MobileAppShellResolver().resolve(toResolveMobileAppShellInput(result));

shell.navigation.primary; // bottom-bar items
shell.identity.bundleId;
shell.defaultLandingRoute; // e.g. store.home
```

## Scripts

```bash
pnpm --filter @ai-commerce/mobile-app test
pnpm --filter @ai-commerce/mobile-app typecheck
pnpm --filter @ai-commerce/mobile-app lint
pnpm --filter @ai-commerce/mobile-app build
```

## Out of scope (Task 1)

- React Native UI / bottom-bar layout — Task 2
- Screen-map registry — Task 2
- `createMobileApp` facade / Expo entry — Task 3
- Native builds / store submission
