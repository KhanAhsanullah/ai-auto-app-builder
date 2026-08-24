import {
  buildMobileShellViewModel,
  type MobileShellViewModel,
} from './build-mobile-shell-view-model.js';
import {
  createDefaultMobileScreenRegistry,
  type MobileScreenDefinition,
  type MobileScreenRegistry,
} from './mobile-screen-registry.js';
import type { ResolvedMobileAppShell } from '../types.js';

export interface MobileAppDeps {
  shell: ResolvedMobileAppShell;
  registry: MobileScreenRegistry;
  /** Initial route when the host does not override. */
  initialRoute?: string;
}

/**
 * Public facade for the config-driven mobile app (Sprint 9 Task 3).
 * Holds the resolved shell + screen registry and builds layout view-models.
 */
export class MobileApp {
  readonly shell: ResolvedMobileAppShell;
  readonly registry: MobileScreenRegistry;
  readonly initialRoute: string;

  constructor(private readonly deps: MobileAppDeps) {
    this.shell = deps.shell;
    this.registry = deps.registry;
    this.initialRoute = deps.initialRoute ?? this.registry.resolveActiveScreen(deps.shell).route;
  }

  /** Build a layout view-model for the given (or default) active route. */
  getViewModel(activeRoute?: string): MobileShellViewModel {
    return buildMobileShellViewModel(this.shell, this.registry, activeRoute ?? this.initialRoute);
  }

  /** Register an additional screen on the live registry. */
  registerScreen(screen: MobileScreenDefinition): void {
    this.registry.register(screen);
  }

  /** Whether a route key is registered. */
  hasScreen(route: string): boolean {
    return this.registry.has(route);
  }
}

export interface CreateMobileAppFromShellOptions {
  shell: ResolvedMobileAppShell;
  registry?: MobileScreenRegistry;
  initialRoute?: string;
  /** Extra screens registered after defaults (when using default registry). */
  extraScreens?: readonly MobileScreenDefinition[];
}

/** Wire a MobileApp from an already-resolved shell (tests / advanced hosts). */
export function createMobileAppFromShell(options: CreateMobileAppFromShellOptions): MobileApp {
  const registry = options.registry ?? createDefaultMobileScreenRegistry();
  if (!options.registry && options.extraScreens) {
    registry.registerAll(options.extraScreens);
  }

  return new MobileApp({
    shell: options.shell,
    registry,
    initialRoute: options.initialRoute,
  });
}
