# Mobile App

Config-driven React Native consumer app for CommerceOS AI — resolve tenant config into a branded shell, map screens, and mount a bottom-bar experience from one facade call.

## Package

`@ai-commerce/mobile-app`

## Status

Sprint 9 complete — facade + shell. Sprint 20 complete — commerce screens. Sprint 21 — use `@ai-commerce/mobile-host` to run on device.

## Modules

| Module                       | Purpose                                        |
| ---------------------------- | ---------------------------------------------- |
| `createMobileApp`            | Config → shell + registry facade               |
| `MobileApp`                  | `getViewModel`, screen registration            |
| `MobileAppRoot` (`./native`) | Stateful RN entry with branded default screens |
| `MobileScreenRegistry`       | Route → screen map                             |
| `MobileShellLayout`          | Header + content + bottom tab bar              |

## Usage

```typescript
import { createMobileApp } from '@ai-commerce/mobile-app';
import { MobileAppRoot } from '@ai-commerce/mobile-app/native';
import { ConfigProvider } from '@ai-commerce/config-runtime';

const result = new ConfigProvider({ cache: false }).resolve({ tenantConfig });
const app = createMobileApp({ config: result });

<MobileAppRoot app={app} />
```

Navigation, branding, and identity all come from tenant config — change config, not forks.

## Scripts

```bash
pnpm --filter @ai-commerce/mobile-app test
pnpm --filter @ai-commerce/mobile-app typecheck
pnpm --filter @ai-commerce/mobile-app lint
pnpm --filter @ai-commerce/mobile-app build
```

## Out of scope

- Full Expo / RN CLI host project (embed `MobileAppRoot` in your host)
- Native store builds / OTA channels
- Live IdP session binding
- Runtime Theme Engine token injection
