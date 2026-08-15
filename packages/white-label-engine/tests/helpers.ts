import type { Tenant } from '@ai-commerce/config-schema';

import type { BrandEmitterRegistry } from '../src/domain/brand-emitter-registry.js';
import { BrandCompiler } from '../src/domain/brand-compiler.js';
import { BrandResolver } from '../src/domain/brand-resolver.js';
import type { AssetNormalizer } from '../src/domain/asset-normalizer.js';
import { DefaultBrandEmitterRegistry } from '../src/infrastructure/brand-emitter-registry.js';
import { createWhiteLabelProvider } from '../src/infrastructure/create-white-label-provider.js';
import type { WhiteLabelProvider } from '../src/domain/white-label-provider.js';
import type { BrandCacheOptions, BrandPatch, WhiteLabelProviderOptions } from '../src/types.js';

/** Minimal tenant branding overlay for tests. */
export const TENANT_BRANDING_FIXTURE: BrandPatch = {
  appName: 'Acme Market',
  tagline: 'Tenant-specific tagline',
  logo: {
    primary: 'https://cdn.example.com/acme-logo.svg',
  },
  showPoweredBy: false,
  copyrightText: '© 2026 Acme Market',
};

/** Second tenant overlay used for isolation tests. */
export const OTHER_TENANT_BRANDING_FIXTURE: BrandPatch = {
  appName: 'Beta Shop',
  tagline: 'Another tenant',
  logo: {
    primary: 'https://cdn.example.com/beta-logo.svg',
  },
};

/** Branding fixture with explicit app icon, fonts, splash, and OG image. */
export const FULL_ASSET_BRANDING_FIXTURE: BrandPatch = {
  appName: 'Asset Shop',
  tagline: 'Full asset branding',
  logo: {
    primary: 'https://cdn.example.com/logo-primary.svg',
    inverse: 'https://cdn.example.com/logo-inverse.svg',
    favicon: 'https://cdn.example.com/favicon.ico',
    appIcon: 'https://cdn.example.com/app-icon.png',
    appleTouchIcon: 'https://cdn.example.com/apple-touch.png',
  },
  splashScreen: {
    backgroundColor: '#112233',
    imageUrl: 'https://cdn.example.com/splash.png',
  },
  socialShare: {
    ogImageUrl: 'https://cdn.example.com/og-image.png',
  },
  fonts: {
    heading: {
      url: 'https://cdn.example.com/fonts/heading.woff2',
      format: 'woff2',
      weight: 700,
    },
    body: {
      url: 'https://cdn.example.com/fonts/body.woff2',
      format: 'woff2',
    },
  },
};

export const TENANT_A_ID = '11111111-1111-1111-1111-111111111111';
export const TENANT_B_ID = '22222222-2222-2222-2222-222222222222';

/** BrandResolver instance for tests. */
export function createBrandResolver(): BrandResolver {
  return new BrandResolver();
}

/** BrandCompiler wired with the default emitter registry for tests. */
export function createBrandCompiler(options?: {
  emitterRegistry?: BrandEmitterRegistry;
  resolver?: BrandResolver;
  normalizer?: AssetNormalizer;
  cache?: BrandCacheOptions | false;
}): BrandCompiler {
  return new BrandCompiler({
    emitterRegistry: options?.emitterRegistry ?? new DefaultBrandEmitterRegistry(),
    ...options,
  });
}

/** WhiteLabelProvider wired with default resolver, compiler, and emitter registry for tests. */
export function createTestWhiteLabelProvider(
  options?: WhiteLabelProviderOptions & {
    emitterRegistry?: BrandEmitterRegistry;
    resolver?: BrandResolver;
  },
): WhiteLabelProvider {
  return createWhiteLabelProvider(options);
}

export const VERTICAL_TAGLINES: Record<Tenant['vertical'], string> = {
  ecommerce: 'Shop quality products online',
  grocery: 'Fresh essentials, delivered',
  restaurant: 'Order from the menu you love',
  pharmacy: 'Trusted care, delivered with confidence',
  fashion: 'Curated style for every season',
  electronics: 'The latest tech, ready to ship',
};
