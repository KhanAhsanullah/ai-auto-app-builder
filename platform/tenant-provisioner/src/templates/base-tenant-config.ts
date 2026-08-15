import type { ConfigLayer } from '@ai-commerce/config-runtime';

/**
 * Minimal structural tenant-layer sections derived from domain schema requirements.
 *
 * Values are tenant-specific placeholders — not platform defaults (config-runtime)
 * or vertical presets (config-runtime / theme-engine / white-label-engine).
 *
 * Theme tokens mirror `schemas/theme/v1/presets/default.json` structure only
 * because the tenant `theme` section requires preset, colors, typography, spacing,
 * and radius per `theme.schema.json`.
 */
export interface BaseTenantConfigInput {
  name: string;
  defaultLocale: string;
}

/** Build minimal required tenant-layer sections excluding identity and meta. */
export function createBaseTenantConfigSections(input: BaseTenantConfigInput): ConfigLayer {
  const contactEmail = `contact@${
    input.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 48) || 'tenant'
  }.local`;

  return {
    company: {
      legalName: input.name,
      displayName: input.name,
      contactEmail,
    },
    branding: {
      appName: input.name,
      tagline: input.name,
    },
    theme: {
      preset: 'default',
      colors: {
        primary: '#2563EB',
        secondary: '#64748B',
        background: '#FFFFFF',
        surface: '#F8FAFC',
        text: '#0F172A',
        textMuted: '#64748B',
        border: '#E2E8F0',
        error: '#DC2626',
        success: '#16A34A',
        warning: '#F59E0B',
      },
      typography: {
        fontFamily: {
          heading: 'Inter',
          body: 'Inter',
        },
        scale: 'default',
        baseFontSize: 16,
      },
      spacing: {
        unit: 4,
        density: 'default',
      },
      radius: {
        sm: 4,
        md: 8,
        lg: 12,
        full: 9999,
      },
      elevation: 'subtle',
      darkMode: {
        enabled: true,
        strategy: 'system',
      },
    },
    navigation: {
      web: {
        primary: [
          {
            id: 'home',
            label: 'Home',
            route: 'store.home',
          },
        ],
      },
      mobile: {
        primary: [
          {
            id: 'home',
            label: 'Home',
            route: 'store.home',
          },
        ],
      },
      admin: {
        primary: [
          {
            id: 'dashboard',
            label: 'Dashboard',
            route: 'admin.dashboard',
          },
        ],
      },
    },
    languages: {
      default: input.defaultLocale,
      supported: [input.defaultLocale],
      fallback: input.defaultLocale,
    },
    currency: {
      default: 'USD',
      supported: ['USD'],
      display: {
        symbolPosition: 'before',
        decimalPlaces: 2,
      },
    },
  };
}
