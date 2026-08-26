import { buildWebShellViewModel, type WebShellViewModel } from './build-web-shell-view-model.js';
import {
  createDefaultWebScreenRegistry,
  type WebScreenDefinition,
  type WebScreenRegistry,
} from './web-screen-registry.js';
import type { ResolvedWebStoreShell } from '../types.js';

export interface WebStoreDeps {
  shell: ResolvedWebStoreShell;
  registry: WebScreenRegistry;
  /** Initial route when the host does not override. */
  initialRoute?: string;
}

/**
 * Public facade for the config-driven web storefront (Sprint 11 Task 3).
 * Holds the resolved shell + screen registry and builds layout view-models.
 */
export class WebStore {
  readonly shell: ResolvedWebStoreShell;
  readonly registry: WebScreenRegistry;
  readonly initialRoute: string;

  constructor(private readonly deps: WebStoreDeps) {
    this.shell = deps.shell;
    this.registry = deps.registry;
    this.initialRoute = deps.initialRoute ?? this.registry.resolveActiveScreen(deps.shell).route;
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
  });
}
