import { createRoot, type Root } from 'react-dom/client';
import { createElement } from 'react';

import type { WebStore } from '../domain/web-store.js';
import { WebStoreApp, type WebStoreAppProps } from './web-store-app.js';

export interface MountWebStoreOptions {
  store: WebStore;
  /** DOM host element or CSS selector. */
  container: Element | string;
  activeRoute?: WebStoreAppProps['activeRoute'];
  onNavigate?: WebStoreAppProps['onNavigate'];
  renderScreen?: WebStoreAppProps['renderScreen'];
}

export interface MountedWebStore {
  root: Root;
  unmount: () => void;
}

/**
 * Mount the web storefront React app into a DOM container (SPA / embed hosts).
 */
export function mountWebStore(options: MountWebStoreOptions): MountedWebStore {
  const element =
    typeof options.container === 'string'
      ? document.querySelector(options.container)
      : options.container;

  if (!element) {
    throw new Error(
      typeof options.container === 'string'
        ? `Web store mount container not found: '${options.container}'.`
        : 'Web store mount container element is required.',
    );
  }

  const root = createRoot(element);
  root.render(
    createElement(WebStoreApp, {
      store: options.store,
      activeRoute: options.activeRoute,
      onNavigate: options.onNavigate,
      renderScreen: options.renderScreen,
    }),
  );

  return {
    root,
    unmount: () => {
      root.unmount();
    },
  };
}
