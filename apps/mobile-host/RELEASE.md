# Mobile host release checklist (Sprint 21 Task 3)

Use this before shipping a store / internal binary from `@ai-commerce/mobile-host`.

## Prerequisites

- [ ] Node 20+ and pnpm 9.15+
- [ ] Expo account (`npx eas-cli login`)
- [ ] Apple Developer + Google Play credentials (production only)
- [ ] Repo clean; `pnpm --filter @ai-commerce/mobile-host test typecheck lint` green

## One-time EAS project link

From `apps/mobile-host`:

```bash
npx eas-cli init
```

Replace the placeholder `extra.eas.projectId` in `app.json` with the id EAS prints (do not leave the zero UUID for cloud builds).

## Local native folders (RN CLI–style)

Generate `ios/` + `android/` without committing them (gitignored):

```bash
pnpm --filter @ai-commerce/mobile-host prebuild
# or clean regenerate:
pnpm --filter @ai-commerce/mobile-host prebuild:clean
```

Then open Xcode / Android Studio as with a bare RN app. Re-run prebuild after native dependency changes.

## EAS cloud builds

From `apps/mobile-host` (monorepo; EAS uses pnpm from `eas.json`):

```bash
# Dev client + simulator / internal APK
pnpm --filter @ai-commerce/mobile-host eas:build:development

# Internal QA binary
pnpm --filter @ai-commerce/mobile-host eas:build:preview

# Store-ready
pnpm --filter @ai-commerce/mobile-host eas:build:production
```

Or:

```bash
cd apps/mobile-host
npx eas-cli build --profile preview --platform android
npx eas-cli build --profile production --platform all
```

## Pre-submit checks

- [ ] Deep links: `aicommerce://cart` / `aicommerce://store/orders`
- [ ] Guest session survives cold start (AsyncStorage)
- [ ] Buy path smoke: Shop → Add → Cart → Checkout → Payment → Orders
- [ ] Bundle id / package: `ai.commerce.mobilehost`
- [ ] Version bump: `expo.version`, iOS `buildNumber`, Android `versionCode` (production profile can auto-increment)

## Submit (optional)

```bash
cd apps/mobile-host
npx eas-cli submit --profile production --platform ios
npx eas-cli submit --profile production --platform android
```

## Notes

- Demo data is still in-memory — binaries prove the RN shell, not production commerce backends.
- Expo Go is for day-1; store / TestFlight / Play internal testing needs EAS profiles above.
- Bare RN CLI workflow = `prebuild` output; no rewrite of `@ai-commerce/mobile-app` screens.
