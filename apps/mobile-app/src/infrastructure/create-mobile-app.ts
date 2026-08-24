import { createMobileAppFromShell, type MobileApp } from '../domain/mobile-app.js';
import { MobileAppShellResolver } from '../domain/mobile-app-shell-resolver.js';
import type { MobileScreenDefinition } from '../domain/mobile-screen-registry.js';
import type { MobileScreenRegistry } from '../domain/mobile-screen-registry.js';
import {
  toResolveMobileAppShellInput,
  type MobileAppConfigSource,
} from '../domain/map-config-provider-result.js';

export interface CreateMobileAppOptions {
  /** Tenant config or ConfigProvider result. */
  config: MobileAppConfigSource;
  /** Override shell resolver. */
  shellResolver?: MobileAppShellResolver;
  /** Pre-built screen registry (skips default + extraScreens). */
  registry?: MobileScreenRegistry;
  /** Extra screens when using the default registry. */
  extraScreens?: readonly MobileScreenDefinition[];
  /** Initial active route (defaults to landing / first nav). */
  initialRoute?: string;
}

/**
 * Create the MobileApp facade from tenant configuration.
 * One call: resolve shell → registry → ready for RN app / view-models.
 */
export function createMobileApp(options: CreateMobileAppOptions): MobileApp {
  const resolver = options.shellResolver ?? new MobileAppShellResolver();
  const shell = resolver.resolve(toResolveMobileAppShellInput(options.config));

  return createMobileAppFromShell({
    shell,
    registry: options.registry,
    extraScreens: options.extraScreens,
    initialRoute: options.initialRoute,
  });
}
