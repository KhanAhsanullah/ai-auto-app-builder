import { describe, expect, it } from 'vitest';

import { enrichStorefrontNav } from '../src/demo/enrich-storefront-nav.js';

describe('enrichStorefrontNav', () => {
  it('adds about and contact to primary and footer', () => {
    const enriched = enrichStorefrontNav({
      navigation: {
        web: {
          primary: [{ id: 'home', label: 'Home', route: 'store.home' }],
        },
      },
    });
    const web = enriched.navigation as {
      web: { primary: Array<{ route: string }>; footer: Array<{ route: string }> };
    };
    expect(web.web.primary.map((i) => i.route)).toEqual(
      expect.arrayContaining(['store.home', 'store.about', 'store.contact']),
    );
    expect(web.web.footer.map((i) => i.route)).toEqual(
      expect.arrayContaining(['store.about', 'store.contact', 'store.catalog']),
    );
  });

  it('does not duplicate existing routes', () => {
    const enriched = enrichStorefrontNav({
      navigation: {
        web: {
          primary: [{ id: 'about', label: 'About', route: 'store.about' }],
          footer: [{ id: 'about', label: 'About', route: 'store.about' }],
        },
      },
    });
    const web = enriched.navigation as {
      web: { primary: unknown[]; footer: unknown[] };
    };
    expect(
      web.web.primary.filter((i) => (i as { route: string }).route === 'store.about'),
    ).toHaveLength(1);
    expect(
      web.web.footer.filter((i) => (i as { route: string }).route === 'store.about'),
    ).toHaveLength(1);
  });
});
