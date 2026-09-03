import type { CatalogModule } from '@ai-commerce/module-catalog';

import { buildWebShellViewModel, type WebShellViewModel } from './build-web-shell-view-model.js';
import {
  createDefaultWebScreenRegistry,
  type WebScreenDefinition,
  type WebScreenRegistry,
} from './web-screen-registry.js';
import { WebStoreCatalogSurface } from './web-store-catalog-surface.js';
import type { ResolvedWebStoreShell } from '../types.js';

export interface WebStoreDeps {
  shell: ResolvedWebStoreShell;
  registry: WebScreenRegistry;
  /** Initial route when the host does not override. */
  initialRoute?: string;
  /** Optional catalog module for storefront product queries. */
  catalog?: CatalogModule;
}

/**
 * Public facade for the config-driven web storefront.
 * Holds the resolved shell + screen registry and optional catalog binding.
 */
export class WebStore {
  readonly shell: ResolvedWebStoreShell;
  readonly registry: WebScreenRegistry;
  readonly initialRoute: string;
  readonly catalogSurface: WebStoreCatalogSurface;

  constructor(private readonly deps: WebStoreDeps) {
    this.shell = deps.shell;
    this.registry = deps.registry;
    this.initialRoute = deps.initialRoute ?? this.registry.resolveActiveScreen(deps.shell).route;
    this.catalogSurface = new WebStoreCatalogSurface(
      deps.shell,
      deps.catalog ? { catalog: deps.catalog } : undefined,
    );
  }

  /** Whether catalog is wired and enabled for this tenant. */
  isCatalogAvailable(): boolean {
    return this.catalogSurface.isAvailable();
  }

  /** Build a layout view-model for the given (or default) active route. */
  getViewModel(activeRoute?: string): WebShellViewModel {
    return buildWebShellViewModel(this.shell, this.registry, activeRoute ?? this.initialRoute);
  }

  /** Register an additional screen on the live registry. */
  registerScreen(screen: WebScreenDefinition): void {
    this.registry.register(screen);
  }

  /** Whether a route key is registered. */
  hasScreen(route: string): boolean {
    return this.registry.has(route);
  }
}

export interface CreateWebStoreFromShellOptions {
  shell: ResolvedWebStoreShell;
  registry?: WebScreenRegistry;
  initialRoute?: string;
  /** Extra screens registered after defaults (when using default registry). */
  extraScreens?: readonly WebScreenDefinition[];
  catalog?: CatalogModule;
}

/** Wire a WebStore from an already-resolved shell (tests / advanced hosts). */
export function createWebStoreFromShell(options: CreateWebStoreFromShellOptions): WebStore {
  const registry = options.registry ?? createDefaultWebScreenRegistry();
  if (!options.registry && options.extraScreens) {
    registry.registerAll(options.extraScreens);
  }

  return new WebStore({
    shell: options.shell,
    registry,
    initialRoute: options.initialRoute,
    catalog: options.catalog,
  });
}
