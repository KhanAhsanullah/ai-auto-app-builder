import type { Tenant } from '@ai-commerce/config-schema';
import type { ConfigLayer } from '@ai-commerce/config-runtime';

import demoTenantLayerJson from './full.example.json' with { type: 'json' };
import { getVerticalBrandDefaults } from './vertical-launch-presets.js';

export const DEMO_LAUNCH_VERTICALS = [
  'grocery',
  'restaurant',
  'pharmacy',
  'ecommerce',
  'fashion',
  'electronics',
] as const satisfies readonly Tenant['vertical'][];

export type DemoLaunchVertical = (typeof DEMO_LAUNCH_VERTICALS)[number];

export interface DemoLaunchInput {
  /** Display name shown in the store shell. */
  businessName: string;
  /** Active vertical / app type. */
  vertical: DemoLaunchVertical;
  /** Optional logo URL (https or data URL). */
  logoUrl?: string;
  /** Optional tagline override; defaults to vertical preset. */
  tagline?: string;
  /** Stable tenant id for reloads (generated once by the host). */
  tenantId?: string;
  /** URL-safe slug; derived from businessName when omitted. */
  slug?: string;
}

export interface BuiltDemoLaunch {
  tenantLayer: ConfigLayer;
  tenantId: string;
  slug: string;
  vertical: DemoLaunchVertical;
  businessName: string;
}

export const DEMO_LAUNCH_VERTICAL_PRIMARY: Record<DemoLaunchVertical, string> = {
  grocery: '#16A34A',
  restaurant: '#DC2626',
  pharmacy: '#0D9488',
  ecommerce: '#2563EB',
  fashion: '#BE185D',
  electronics: '#1E3A8A',
};

const VERTICAL_SHOP_LABEL: Record<DemoLaunchVertical, string> = {
  grocery: 'Shop',
  restaurant: 'Menu',
  pharmacy: 'Medicines',
  ecommerce: 'Shop',
  fashion: 'Collections',
  electronics: 'Products',
};

/** Slugify a business name for demo tenant identity. */
export function slugifyBusinessName(name: string): string {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);
  return slug || 'demo-store';
}

function isLaunchVertical(value: string): value is DemoLaunchVertical {
  return (DEMO_LAUNCH_VERTICALS as readonly string[]).includes(value);
}

/**
 * Build a tenant config layer from wizard input (name + logo + app type).
 * Starts from the validated full example and patches identity / vertical / branding.
 */
export function buildDemoLaunchConfig(input: DemoLaunchInput): BuiltDemoLaunch {
  const businessName = input.businessName.trim();
  if (!businessName) {
    throw new Error('Business name is required.');
  }
  if (!isLaunchVertical(input.vertical)) {
    throw new Error(`Unsupported app type: ${input.vertical}`);
  }

  const vertical = input.vertical;
  const brandDefaults = getVerticalBrandDefaults(vertical);
  const slug = (input.slug?.trim() || slugifyBusinessName(businessName)).slice(0, 64);
  const tenantId =
    input.tenantId?.trim() ||
    (typeof globalThis.crypto?.randomUUID === 'function'
      ? globalThis.crypto.randomUUID()
      : `00000000-0000-4000-8000-${slug.replace(/-/g, '').padEnd(12, '0').slice(0, 12)}`);

  const tagline =
    input.tagline?.trim() || brandDefaults.tagline || `${businessName} — powered by CommerceOS`;
  const logoUrl = input.logoUrl?.trim();
  const primary = DEMO_LAUNCH_VERTICAL_PRIMARY[vertical];
  const shopLabel = VERTICAL_SHOP_LABEL[vertical];

  const base = structuredClone(demoTenantLayerJson) as ConfigLayer & Record<string, unknown>;

  base.meta = {
    ...(base.meta as object),
    label: `Launch wizard — ${businessName}`,
    updatedAt: '2026-09-08T00:00:00.000Z',
  };

  const tenant = { ...(base.tenant as Record<string, unknown>) };
  tenant.id = tenantId;
  tenant.slug = slug;
  tenant.name = businessName;
  tenant.vertical = vertical;
  tenant.status = 'active';
  base.tenant = tenant;

  const company = { ...(base.company as Record<string, unknown>) };
  company.legalName = `${businessName} (Demo)`;
  company.displayName = businessName;
  company.contactEmail = `hello@${slug}.demo`;
  company.website = `https://${slug}.demo`;
  base.company = company;

  const branding = { ...(base.branding as Record<string, unknown>) };
  branding.appName = businessName;
  branding.tagline = tagline;
  branding.showPoweredBy = brandDefaults.showPoweredBy ?? true;
  branding.copyrightText = `© ${new Date().getFullYear()} ${businessName}. All rights reserved.`;
  if (logoUrl) {
    branding.logo = {
      primary: logoUrl,
      inverse: logoUrl,
      favicon: logoUrl,
    };
  }
  base.branding = branding;

  const theme = { ...(base.theme as Record<string, unknown>) };
  const colors = { ...((theme.colors as Record<string, unknown>) ?? {}) };
  colors.primary = primary;
  theme.colors = colors;
  base.theme = theme;

  const navigation = { ...(base.navigation as Record<string, unknown>) };
  const webNav = { ...((navigation.web as Record<string, unknown>) ?? {}) };
  webNav.primary = [
    { id: 'home', label: 'Home', route: 'store.home', icon: 'home' },
    { id: 'shop', label: shopLabel, route: 'store.catalog', icon: 'shopping-bag' },
    { id: 'cart', label: 'Cart', route: 'store.cart', icon: 'cart' },
  ];
  navigation.web = webNav;
  const mobileNav = { ...((navigation.mobile as Record<string, unknown>) ?? {}) };
  mobileNav.primary = [
    { id: 'home', label: 'Home', route: 'store.home', icon: 'home' },
    { id: 'shop', label: shopLabel, route: 'store.catalog', icon: 'shopping-bag' },
    { id: 'cart', label: 'Cart', route: 'store.cart', icon: 'cart' },
  ];
  navigation.mobile = mobileNav;
  base.navigation = navigation;

  const webStore = { ...(base.webStore as Record<string, unknown>) };
  const seo = { ...((webStore.seo as Record<string, unknown>) ?? {}) };
  seo.title = businessName;
  seo.description = tagline;
  webStore.seo = seo;
  base.webStore = webStore;

  return {
    tenantLayer: base as ConfigLayer,
    tenantId,
    slug,
    vertical,
    businessName,
  };
}
