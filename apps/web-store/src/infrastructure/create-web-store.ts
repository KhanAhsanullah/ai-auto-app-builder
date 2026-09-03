import type { CatalogModule } from '@ai-commerce/module-catalog';

import { createWebStoreFromShell, type WebStore } from '../domain/web-store.js';
import { WebStoreShellResolver } from '../domain/web-store-shell-resolver.js';
import type { WebScreenDefinition, WebScreenRegistry } from '../domain/web-screen-registry.js';
import {
  toResolveWebStoreShellInput,
  type WebStoreConfigSource,
} from '../domain/map-config-provider-result.js';

export interface CreateWebStoreOptions {
  /** Tenant config or ConfigProvider result. */
  config: WebStoreConfigSource;
  /** Override shell resolver. */
  shellResolver?: WebStoreShellResolver;
  /** Pre-built screen registry (skips default + extraScreens). */
  registry?: WebScreenRegistry;
  /** Extra screens when using the default registry. */
  extraScreens?: readonly WebScreenDefinition[];
  /** Initial active route (defaults to landing / first nav). */
  initialRoute?: string;
  /** Optional catalog module — enables storefront product queries. */
  catalog?: CatalogModule;
}

/**
 * Create the WebStore facade from tenant configuration.
 * One call: resolve shell → registry → ready for React app / view-models.
 */
export function createWebStore(options: CreateWebStoreOptions): WebStore {
  const resolver = options.shellResolver ?? new WebStoreShellResolver();
  const shell = resolver.resolve(toResolveWebStoreShellInput(options.config));

  return createWebStoreFromShell({
    shell,
    registry: options.registry,
    extraScreens: options.extraScreens,
    initialRoute: options.initialRoute,
    catalog: options.catalog,
  });
}
