# Mobile App

Config-driven React Native consumer shell for CommerceOS AI. Resolves navigation, feature flags, and branding, then maps screens and renders a bottom-bar layout.

## Package

`@ai-commerce/mobile-app`

## Status

Sprint 9 Task 2 complete — screen registry + React Native bottom-bar layout shell.

Task 3 (`createMobileApp` facade) is not yet implemented.

## Modules

| Module                           | Purpose                                   |
| -------------------------------- | ----------------------------------------- |
| `MobileAppShellResolver`         | Compose resolved mobile shell from config |
| `MobileScreenRegistry`           | Route key → screen definition map         |
| `buildMobileShellViewModel`      | Shell + registry → layout view-model      |
| `MobileShellLayout` (`./native`) | Header + content + bottom tab bar         |

## Usage

```typescript
import {
  buildMobileShellViewModel,
  createDefaultMobileScreenRegistry,
  MobileAppShellResolver,
  toResolveMobileAppShellInput,
} from '@ai-commerce/mobile-app';
import { MobileShellLayout } from '@ai-commerce/mobile-app/native';
import { ConfigProvider } from '@ai-commerce/config-runtime';

const result = new ConfigProvider({ cache: false }).resolve({ tenantConfig });
const shell = new MobileAppShellResolver().resolve(toResolveMobileAppShellInput(result));
const viewModel = buildMobileShellViewModel(shell, createDefaultMobileScreenRegistry());

<MobileShellLayout viewModel={viewModel} onNavigate={(route) => { /* set active route */ }} />
```

## Scripts

```bash
pnpm --filter @ai-commerce/mobile-app test
pnpm --filter @ai-commerce/mobile-app typecheck
pnpm --filter @ai-commerce/mobile-app lint
pnpm --filter @ai-commerce/mobile-app build
```

## Out of scope (Task 2)

- `createMobileApp` facade / Expo app entry — Task 3
- Native store builds / OTA channels
- Live IdP session binding
