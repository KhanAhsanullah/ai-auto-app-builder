import type { CatalogModule } from '@ai-commerce/module-catalog';

import {
  buildMobileShellViewModel,
  type MobileShellViewModel,
} from './build-mobile-shell-view-model.js';
import {
  createDefaultMobileScreenRegistry,
  type MobileScreenDefinition,
  type MobileScreenRegistry,
} from './mobile-screen-registry.js';
import { MobileAppCatalogSurface } from './mobile-app-catalog-surface.js';
import type { ResolvedMobileAppShell } from '../types.js';

export interface MobileAppDeps {
  shell: ResolvedMobileAppShell;
  registry: MobileScreenRegistry;
  /** Initial route when the host does not override. */
  initialRoute?: string;
  /** Optional catalog module for storefront product queries. */
  catalog?: CatalogModule;
}

/**
 * Public facade for the config-driven mobile app.
 * Holds the resolved shell + screen registry and optional catalog binding.
 */
export class MobileApp {
  readonly shell: ResolvedMobileAppShell;
  readonly registry: MobileScreenRegistry;
  readonly initialRoute: string;
  readonly catalogSurface: MobileAppCatalogSurface;

  constructor(private readonly deps: MobileAppDeps) {
    this.shell = deps.shell;
    this.registry = deps.registry;
    this.initialRoute = deps.initialRoute ?? this.registry.resolveActiveScreen(deps.shell).route;
    this.catalogSurface = new MobileAppCatalogSurface(
      deps.shell,
      deps.catalog ? { catalog: deps.catalog } : undefined,
    );
  }

  isCatalogAvailable(): boolean {
    return this.catalogSurface.isAvailable();
  }

  getViewModel(activeRoute?: string): MobileShellViewModel {
    return buildMobileShellViewModel(this.shell, this.registry, activeRoute ?? this.initialRoute);
  }

  registerScreen(screen: MobileScreenDefinition): void {
    this.registry.register(screen);
  }

  hasScreen(route: string): boolean {
    return this.registry.has(route);
  }
}

export interface CreateMobileAppFromShellOptions {
  shell: ResolvedMobileAppShell;
  registry?: MobileScreenRegistry;
  initialRoute?: string;
  extraScreens?: readonly MobileScreenDefinition[];
  catalog?: CatalogModule;
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
    catalog: options.catalog,
  });
}
