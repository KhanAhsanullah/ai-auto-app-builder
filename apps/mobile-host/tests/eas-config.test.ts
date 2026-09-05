import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const root = dirname(fileURLToPath(import.meta.url));

describe('@ai-commerce/mobile-host EAS / prebuild config', () => {
  it('declares Expo prebuild and EAS build scripts', () => {
    const pkg = JSON.parse(readFileSync(join(root, '../package.json'), 'utf8')) as {
      scripts: Record<string, string>;
      dependencies: Record<string, string>;
    };
    expect(pkg.scripts.prebuild).toContain('expo prebuild');
    expect(pkg.scripts['prebuild:clean']).toContain('--clean');
    expect(pkg.scripts['eas:build:development']).toContain('development');
    expect(pkg.scripts['eas:build:preview']).toContain('preview');
    expect(pkg.scripts['eas:build:production']).toContain('production');
    expect(pkg.dependencies['expo-dev-client']).toBeTruthy();
  });

  it('has development, preview, and production EAS profiles', () => {
    const eas = JSON.parse(readFileSync(join(root, '../eas.json'), 'utf8')) as {
      build: Record<string, { extends?: string; developmentClient?: boolean }>;
    };
    expect(eas.build.base).toBeTruthy();
    expect(eas.build.development?.extends).toBe('base');
    expect(eas.build.development?.developmentClient).toBe(true);
    expect(eas.build.preview?.extends).toBe('base');
    expect(eas.build.production?.extends).toBe('base');
  });

  it('pins iOS/Android native ids and runtimeVersion for release builds', () => {
    const app = JSON.parse(readFileSync(join(root, '../app.json'), 'utf8')) as {
      expo: {
        version: string;
        runtimeVersion?: { policy?: string };
        ios: { bundleIdentifier: string; buildNumber: string };
        android: { package: string; versionCode: number };
        scheme: string;
      };
    };
    expect(app.expo.scheme).toBe('aicommerce');
    expect(app.expo.runtimeVersion?.policy).toBe('appVersion');
    expect(app.expo.ios.bundleIdentifier).toBe('ai.commerce.mobilehost');
    expect(app.expo.ios.buildNumber).toBe('1');
    expect(app.expo.android.package).toBe('ai.commerce.mobilehost');
    expect(app.expo.android.versionCode).toBe(1);
  });
});
