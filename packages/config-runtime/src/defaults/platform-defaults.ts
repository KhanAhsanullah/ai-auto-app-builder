import { SCHEMA_VERSION } from '@ai-commerce/config-schema';

import type { ConfigLayer } from '../types.js';

/** Built-in platform defaults applied before vertical and tenant layers. */
export const PLATFORM_DEFAULTS: ConfigLayer = {
  meta: {
    schemaVersion: SCHEMA_VERSION,
    configVersion: 0,
    createdAt: '1970-01-01T00:00:00.000Z',
    updatedAt: '1970-01-01T00:00:00.000Z',
    migrationHistory: [],
  },
  featureFlags: {
    modules: {
      catalog: true,
      cart: true,
      checkout: true,
      order: true,
      payment: true,
      customer: true,
      inventory: true,
      notification: true,
      media: true,
    },
    flags: {},
  },
  authentication: {
    customer: {
      methods: {
        email: true,
        phone: false,
        guestCheckout: true,
      },
      session: {
        tokenTtlMinutes: 60 * 24 * 7,
        refreshEnabled: true,
      },
    },
    admin: {
      methods: {
        email: true,
      },
      session: {
        tokenTtlMinutes: 60 * 8,
        idleTimeoutMinutes: 30,
      },
      mfa: {
        required: false,
        methods: ['totp'],
      },
    },
  },
  payments: {
    defaultGateway: 'stripe',
    methods: ['card'],
    checkout: {
      captureStrategy: 'immediate',
      codEnabled: false,
    },
  },
  notifications: {
    channels: {
      email: true,
      push: false,
      sms: false,
    },
    sender: {
      fromName: 'Commerce Platform',
      fromEmail: 'noreply@platform.local',
    },
    events: {
      orderConfirmed: { email: true },
      passwordReset: { email: true },
      welcomeCustomer: { email: true },
    },
  },
  integrations: {
    analytics: {
      enabled: false,
      providers: [],
    },
  },
  aiSettings: {
    enabled: false,
    provider: {
      name: 'openai',
    },
    generation: {
      allowedTargets: ['config', 'theme', 'copy'],
      autoApply: false,
    },
    guardrails: {
      lockedFields: [],
      requireSchemaValidation: true,
      auditAllSuggestions: true,
    },
  },
  environment: {
    current: 'development',
    targets: {
      development: {
        apiBaseUrl: 'http://localhost:3000',
        debug: true,
        logLevel: 'debug',
      },
      staging: {
        apiBaseUrl: 'https://api-staging.platform.local',
        debug: false,
        logLevel: 'info',
      },
      production: {
        apiBaseUrl: 'https://api.platform.local',
        debug: false,
        logLevel: 'warn',
      },
    },
  },
  webStore: {
    enabled: true,
    rendering: {
      mode: 'ssr',
    },
  },
  mobileApp: {
    enabled: false,
    runtime: {
      minOsVersion: {},
    },
  },
  adminDashboard: {
    enabled: true,
    layout: {
      sidebarStyle: 'expanded',
      defaultLandingRoute: 'admin.dashboard',
    },
    preferences: {
      dateFormat: 'YYYY-MM-DD',
      timeFormat: '24h',
      rowsPerPage: 25,
    },
  },
};
