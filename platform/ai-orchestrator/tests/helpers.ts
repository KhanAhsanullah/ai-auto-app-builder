import type { AiSettings } from '@ai-commerce/config-schema';

/** Minimal valid AI settings for unit tests. */
export function createTestAiSettings(overrides: Partial<AiSettings> = {}): AiSettings {
  const base: AiSettings = {
    enabled: true,
    provider: { name: 'openai', model: 'gpt-4o' },
    generation: {
      allowedTargets: ['config', 'theme', 'catalog', 'navigation', 'copy'],
      autoApply: false,
      maxTokensPerRequest: 4096,
    },
    guardrails: {
      lockedFields: ['payments.checkout.captureStrategy'],
      requireSchemaValidation: true,
      blockDirectDbWrites: true,
      auditAllSuggestions: true,
    },
    copilot: {
      adminEnabled: true,
      customerSupportEnabled: false,
      allowedActions: ['read_orders', 'read_catalog', 'update_catalog_draft'],
    },
  };

  return {
    ...base,
    ...overrides,
    provider: { ...base.provider, ...overrides.provider },
    generation: { ...base.generation, ...overrides.generation },
    guardrails: { ...base.guardrails, ...overrides.guardrails },
    copilot:
      overrides.copilot === undefined ? base.copilot : { ...base.copilot, ...overrides.copilot },
  };
}

export const VALID_THEME_PAYLOAD = {
  preset: 'modern',
  colors: {
    primary: '#16A34A',
    secondary: '#F59E0B',
    background: '#FFFFFF',
    surface: '#F9FAFB',
    text: '#111827',
    textMuted: '#6B7280',
    border: '#E5E7EB',
    error: '#DC2626',
    success: '#16A34A',
    warning: '#F59E0B',
  },
  typography: {
    fontFamily: { heading: 'Inter', body: 'Inter' },
    scale: 'default',
    baseFontSize: 16,
  },
  spacing: { unit: 4, density: 'default' },
  radius: { sm: 4, md: 8, lg: 12, full: 9999 },
  elevation: 'subtle',
  darkMode: { enabled: true, strategy: 'system' },
} as const;

export const VALID_BRANDING_PAYLOAD = {
  appName: 'Fresh Market',
  tagline: 'Groceries delivered fast',
} as const;

export const VALID_NAVIGATION_PAYLOAD = {
  web: {
    style: 'top-bar',
    primary: [{ id: 'home', label: 'Home', route: 'store.home' }],
  },
  mobile: {
    style: 'bottom-bar',
    primary: [{ id: 'home', label: 'Home', route: 'store.home' }],
  },
  admin: {
    style: 'sidebar',
    primary: [{ id: 'dashboard', label: 'Dashboard', route: 'admin.dashboard' }],
  },
} as const;
