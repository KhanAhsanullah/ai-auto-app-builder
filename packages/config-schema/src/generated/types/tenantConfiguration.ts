/**
 * AUTO-GENERATED FILE — DO NOT EDIT DIRECTLY.
 * Source: schemas/ (JSON Schema v1)
 * Regenerate: pnpm --filter @ai-commerce/config-schema generate
 */

/**
 * Root tenant configuration document — single source of truth for the entire platform.
 */
export interface TenantConfiguration {
  meta: ConfigurationMeta;
  tenant: Tenant;
  company: Company;
  branding: Branding;
  theme: Theme;
  navigation: Navigation;
  languages: Languages;
  currency: Currency;
  featureFlags: FeatureFlags;
  authentication: Authentication;
  payments: Payments;
  notifications: Notifications;
  integrations: Integrations;
  aiSettings: AiSettings;
  mobileApp: MobileAppSettings;
  webStore: WebStoreSettings;
  adminDashboard: AdminDashboardSettings;
  environment: EnvironmentSettings;
}
/**
 * Metadata for versioning, audit, and schema compatibility of a tenant configuration document.
 */
export interface ConfigurationMeta {
  /**
   * Platform schema version. Increment on breaking schema changes.
   */
  schemaVersion: 'v1';
  /**
   * Monotonic tenant config revision. Incremented on every publish.
   */
  configVersion: number;
  /**
   * ISO 8601 date-time in UTC.
   */
  createdAt: string;
  /**
   * ISO 8601 date-time in UTC.
   */
  updatedAt: string;
  /**
   * ISO 8601 date-time in UTC.
   */
  publishedAt?: string;
  /**
   * User ID who published this configuration version.
   */
  publishedBy?: string;
  /**
   * Human-readable label for this config revision (e.g. 'Launch config').
   */
  label?: string;
  /**
   * Audit trail of schema migrations applied to this configuration.
   */
  migrationHistory?: MigrationRecord[];
}
export interface MigrationRecord {
  /**
   * Platform schema version. Increment on breaking schema changes.
   */
  fromSchemaVersion: 'v1';
  /**
   * Platform schema version. Increment on breaking schema changes.
   */
  toSchemaVersion: 'v1';
  /**
   * ISO 8601 date-time in UTC.
   */
  migratedAt: string;
  /**
   * Identifier of the migration script applied.
   */
  migrationId?: string;
  notes?: string;
}
/**
 * Root tenant identity and operational settings. All platform data scopes from the tenant.
 */
export interface Tenant {
  /**
   * RFC 4122 UUID identifier.
   */
  id: string;
  /**
   * URL-safe lowercase slug.
   */
  slug: string;
  name: string;
  /**
   * Active business vertical pack for this tenant.
   */
  vertical: 'ecommerce' | 'grocery' | 'restaurant' | 'pharmacy' | 'fashion' | 'electronics';
  /**
   * Tenant lifecycle status.
   */
  status: 'draft' | 'active' | 'suspended' | 'archived';
  /**
   * BCP 47 language tag (e.g. en, en-US, ur-PK).
   */
  defaultLocale: string;
  /**
   * IANA timezone identifier (e.g. Asia/Karachi).
   */
  defaultTimezone: string;
  /**
   * ISO 3166-1 alpha-2 country code.
   */
  defaultCountry?: string;
  subscriptionTier?: 'starter' | 'growth' | 'enterprise';
  /**
   * @minItems 1
   */
  stores?: [
    {
      /**
       * RFC 4122 UUID identifier.
       */
      id: string;
      /**
       * URL-safe lowercase slug.
       */
      slug: string;
      name: string;
      isDefault?: boolean;
      /**
       * @minItems 1
       */
      channels?: ['web' | 'mobile' | 'admin' | 'api', ...('web' | 'mobile' | 'admin' | 'api')[]];
    },
    ...{
      /**
       * RFC 4122 UUID identifier.
       */
      id: string;
      /**
       * URL-safe lowercase slug.
       */
      slug: string;
      name: string;
      isDefault?: boolean;
      /**
       * @minItems 1
       */
      channels?: ['web' | 'mobile' | 'admin' | 'api', ...('web' | 'mobile' | 'admin' | 'api')[]];
    }[],
  ];
  metadata?: Metadata;
}
/**
 * Arbitrary key-value metadata for integrations and extensions.
 */
export interface Metadata {
  [k: string]: string | number | boolean | null;
}
/**
 * Legal and business entity information for the merchant operating the tenant.
 */
export interface Company {
  /**
   * Registered legal business name.
   */
  legalName: string;
  /**
   * Public-facing business name.
   */
  displayName: string;
  /**
   * Business registration or tax ID.
   */
  registrationNumber?: string;
  contactEmail: string;
  /**
   * E.164 international phone number.
   */
  contactPhone?: string;
  website?: string;
  address?: {
    line1: string;
    line2?: string;
    city: string;
    state?: string;
    postalCode?: string;
    /**
     * ISO 3166-1 alpha-2 country code.
     */
    country: string;
  };
  /**
   * Human-readable support availability (e.g. 'Mon–Fri 9am–6pm PKT').
   */
  supportHours?: string;
  metadata?: Metadata;
}
/**
 * Brand identity assets and copy used across all generated surfaces.
 */
export interface Branding {
  /**
   * Application display name shown to end customers.
   */
  appName: string;
  tagline: string;
  logo?: {
    /**
     * Primary logo URL (light background).
     */
    primary?: string;
    /**
     * Logo for dark backgrounds.
     */
    inverse?: string;
    favicon?: string;
    appleTouchIcon?: string;
    /**
     * Preferred mobile app icon source URL.
     */
    appIcon?: string;
  };
  /**
   * Optional brand font asset references (not theme typography tokens).
   */
  fonts?: {
    heading?: FontAsset;
    body?: FontAsset;
  };
  splashScreen?: {
    /**
     * CSS hex color (#RGB, #RRGGBB, or #RRGGBBAA).
     */
    backgroundColor?: string;
    imageUrl?: string;
  };
  socialShare?: {
    ogImageUrl?: string;
    twitterHandle?: string;
  };
  /**
   * Display platform attribution (tier-dependent).
   */
  showPoweredBy?: boolean;
  copyrightText?: string;
  metadata?: Metadata;
}
/**
 * This interface was referenced by `Branding`'s JSON-Schema
 * via the `definition` "fontAsset".
 */
export interface FontAsset {
  url: string;
  format?: 'woff2' | 'woff' | 'ttf' | 'otf';
  weight?: number;
  style?: 'normal' | 'italic';
}
/**
 * Design tokens compiled by the Theme Engine into CSS, React Native, and Admin theme bundles.
 */
export interface Theme {
  /**
   * Base template family selected for the tenant.
   */
  preset: 'default' | 'minimal' | 'modern' | 'luxury' | 'dark' | 'custom';
  /**
   * Theme versioning and compilation metadata.
   */
  metadata?: {
    /**
     * Incremented when tenant theme configuration changes.
     */
    themeVersion?: number;
    /**
     * ISO 8601 date-time in UTC.
     */
    createdAt?: string;
    /**
     * ISO 8601 date-time in UTC.
     */
    updatedAt?: string;
    /**
     * ISO 8601 date-time in UTC.
     */
    compiledAt?: string;
    /**
     * SHA-256 hash of the canonical resolved theme token payload.
     */
    hash?: string;
  };
  colors: {
    /**
     * CSS hex color (#RGB, #RRGGBB, or #RRGGBBAA).
     */
    primary: string;
    /**
     * CSS hex color (#RGB, #RRGGBB, or #RRGGBBAA).
     */
    secondary: string;
    /**
     * CSS hex color (#RGB, #RRGGBB, or #RRGGBBAA).
     */
    background: string;
    /**
     * CSS hex color (#RGB, #RRGGBB, or #RRGGBBAA).
     */
    surface: string;
    /**
     * CSS hex color (#RGB, #RRGGBB, or #RRGGBBAA).
     */
    text: string;
    /**
     * CSS hex color (#RGB, #RRGGBB, or #RRGGBBAA).
     */
    textMuted?: string;
    /**
     * CSS hex color (#RGB, #RRGGBB, or #RRGGBBAA).
     */
    border?: string;
    /**
     * CSS hex color (#RGB, #RRGGBB, or #RRGGBBAA).
     */
    error: string;
    /**
     * CSS hex color (#RGB, #RRGGBB, or #RRGGBBAA).
     */
    success: string;
    /**
     * CSS hex color (#RGB, #RRGGBB, or #RRGGBBAA).
     */
    warning: string;
  };
  typography: {
    fontFamily: {
      heading: string;
      body: string;
    };
    scale: 'compact' | 'default' | 'comfortable';
    baseFontSize?: number;
  };
  spacing: {
    /**
     * Base spacing grid unit in pixels.
     */
    unit: 4 | 8;
    density?: 'compact' | 'default' | 'spacious';
  };
  radius: {
    sm: number;
    md: number;
    lg: number;
    full?: number;
  };
  elevation?: 'flat' | 'subtle' | 'raised';
  motion?: {
    enabled?: boolean;
    durationMs?: number;
  };
  componentVariants?: {
    button?: 'filled' | 'outline' | 'ghost';
    input?: 'outline' | 'filled' | 'underline';
    card?: 'elevated' | 'outlined' | 'flat';
  };
  darkMode?: {
    enabled?: boolean;
    strategy?: 'manual' | 'system' | 'scheduled';
    colors?: {
      /**
       * CSS hex color (#RGB, #RRGGBB, or #RRGGBBAA).
       */
      primary?: string;
      /**
       * CSS hex color (#RGB, #RRGGBB, or #RRGGBBAA).
       */
      background?: string;
      /**
       * CSS hex color (#RGB, #RRGGBB, or #RRGGBBAA).
       */
      surface?: string;
      /**
       * CSS hex color (#RGB, #RRGGBB, or #RRGGBBAA).
       */
      text?: string;
    };
  };
}
/**
 * Cross-surface navigation definitions for web store, mobile app, and admin dashboard.
 */
export interface Navigation {
  web: SurfaceNavigation;
  mobile: SurfaceNavigation;
  admin: SurfaceNavigation;
}
/**
 * This interface was referenced by `Navigation`'s JSON-Schema
 * via the `definition` "surfaceNavigation".
 */
export interface SurfaceNavigation {
  /**
   * @minItems 1
   */
  primary: [NavItem, ...NavItem[]];
  secondary?: NavItem[];
  footer?: NavItem[];
  /**
   * Layout style hint for the surface renderer.
   */
  style?: 'tabs' | 'drawer' | 'sidebar' | 'bottom-bar' | 'top-bar';
}
/**
 * This interface was referenced by `Navigation`'s JSON-Schema
 * via the `definition` "navItem".
 */
export interface NavItem {
  id: string;
  label: string;
  /**
   * Route key resolved by the screen-map registry.
   */
  route: string;
  /**
   * Icon identifier from the platform icon set.
   */
  icon?: string;
  visible?: boolean;
  /**
   * Optional feature flag key required for this item to appear.
   */
  featureFlag?: string;
  children?: NavItem[];
}
/**
 * Locale and internationalization settings for the tenant.
 */
export interface Languages {
  /**
   * BCP 47 language tag (e.g. en, en-US, ur-PK).
   */
  default: string;
  /**
   * @minItems 1
   */
  supported: [string, ...string[]];
  /**
   * BCP 47 language tag (e.g. en, en-US, ur-PK).
   */
  fallback: string;
  /**
   * Locales rendered right-to-left (e.g. ar, ur).
   */
  rtlLocales?: string[];
  /**
   * Detect user locale from browser/device settings.
   */
  autoDetect?: boolean;
  /**
   * Allow end users to switch language in the app.
   */
  allowUserOverride?: boolean;
}
/**
 * Currency display, formatting, and multi-currency commerce settings.
 */
export interface Currency {
  /**
   * ISO 4217 currency code (e.g. USD, PKR, EUR).
   */
  default: string;
  /**
   * @minItems 1
   */
  supported: [string, ...string[]];
  display: {
    symbolPosition: 'before' | 'after';
    decimalPlaces: number;
    thousandsSeparator?: ',' | '.' | ' ' | "'";
    decimalSeparator?: '.' | ',';
  };
  /**
   * Enable checkout in non-default currencies.
   */
  allowMultiCurrency?: boolean;
  exchangeRateProvider?: 'manual' | 'openexchangerates' | 'fixer' | 'none';
}
/**
 * Tenant-level feature toggles and module activation flags.
 */
export interface FeatureFlags {
  /**
   * Core and vertical module activation map.
   */
  modules: {
    catalog?: boolean;
    cart?: boolean;
    checkout?: boolean;
    order?: boolean;
    payment?: boolean;
    customer?: boolean;
    inventory?: boolean;
    notification?: boolean;
    media?: boolean;
    reviews?: boolean;
    wishlist?: boolean;
    subscriptions?: boolean;
    loyalty?: boolean;
  };
  /**
   * Arbitrary feature flag key-value map.
   */
  flags: {
    [k: string]: boolean;
  };
  experiments?: {
    key: string;
    enabled: boolean;
    variants: {
      [k: string]: number;
    };
  }[];
}
/**
 * Authentication methods, session policies, and RBAC defaults for the tenant.
 */
export interface Authentication {
  customer: {
    methods: {
      email: boolean;
      phone: boolean;
      guestCheckout: boolean;
      social?: {
        google?: boolean;
        apple?: boolean;
        facebook?: boolean;
      };
    };
    session: {
      tokenTtlMinutes: number;
      refreshEnabled?: boolean;
      maxDevices?: number;
    };
    mfa?: {
      required?: boolean;
      methods?: ('totp' | 'sms' | 'email')[];
    };
  };
  admin: {
    methods: {
      email: boolean;
      sso?: {
        enabled?: boolean;
        provider?: 'saml' | 'oidc';
        issuerUrl?: string;
      };
    };
    session: {
      tokenTtlMinutes: number;
      idleTimeoutMinutes?: number;
    };
    mfa: {
      required: boolean;
      /**
       * @minItems 1
       */
      methods?: ['totp' | 'sms' | 'email', ...('totp' | 'sms' | 'email')[]];
    };
    defaultRoles?: ('owner' | 'admin' | 'manager' | 'staff' | 'support')[];
  };
  api?: {
    enabled?: boolean;
    keyRotationDays?: number;
    oauthClientCredentials?: boolean;
  };
}
/**
 * Payment gateway configuration, accepted methods, and checkout payment policies.
 */
export interface Payments {
  /**
   * Primary payment gateway for this tenant.
   */
  defaultGateway: 'stripe' | 'paypal' | 'razorpay' | 'jazzcash' | 'easypaisa' | 'manual' | 'custom';
  /**
   * @minItems 1
   */
  methods: [
    (
      | 'card'
      | 'wallet'
      | 'bank_transfer'
      | 'cash_on_delivery'
      | 'buy_now_pay_later'
      | 'apple_pay'
      | 'google_pay'
    ),
    ...(
      | 'card'
      | 'wallet'
      | 'bank_transfer'
      | 'cash_on_delivery'
      | 'buy_now_pay_later'
      | 'apple_pay'
      | 'google_pay'
    )[],
  ];
  gateways?: {
    provider: 'stripe' | 'paypal' | 'razorpay' | 'jazzcash' | 'easypaisa' | 'manual' | 'custom';
    enabled: boolean;
    mode?: 'sandbox' | 'live';
    /**
     * Reference to encrypted credentials in secrets store (not inline secrets).
     */
    credentialsRef?: string;
    supportedMethods?: string[];
  }[];
  checkout: {
    captureStrategy: 'immediate' | 'authorize_then_capture' | 'manual';
    allowSplitPayment?: boolean;
    minimumOrderAmount?: number;
    codEnabled?: boolean;
    codMaxAmount?: number;
  };
  refunds?: {
    autoApprove?: boolean;
    windowDays?: number;
  };
}
/**
 * Notification channels, templates, and delivery policies for the tenant.
 */
export interface Notifications {
  channels: {
    email: boolean;
    sms?: boolean;
    push?: boolean;
    whatsapp?: boolean;
  };
  sender: {
    fromName: string;
    fromEmail: string;
    replyTo?: string;
    /**
     * Alphanumeric SMS sender ID where supported.
     */
    smsSenderId?: string;
  };
  /**
   * Per-event channel enablement.
   */
  events: {
    orderConfirmed?: EventChannels;
    orderShipped?: EventChannels;
    orderDelivered?: EventChannels;
    orderCancelled?: EventChannels;
    paymentFailed?: EventChannels;
    passwordReset?: EventChannels;
    welcomeCustomer?: EventChannels;
  };
  /**
   * Template overrides keyed by event name.
   */
  templates?: {
    [k: string]: {
      subject?: string;
      /**
       * Reference to template asset ID.
       */
      bodyRef?: string;
    };
  };
  quietHours?: {
    enabled?: boolean;
    /**
     * 24h time HH:MM in tenant timezone.
     */
    start?: string;
    end?: string;
    channels?: ('sms' | 'push' | 'whatsapp')[];
  };
}
/**
 * This interface was referenced by `Notifications`'s JSON-Schema
 * via the `definition` "eventChannels".
 */
export interface EventChannels {
  email?: boolean;
  sms?: boolean;
  push?: boolean;
  whatsapp?: boolean;
}
/**
 * Third-party service integrations: analytics, ERP, POS, shipping, and webhooks.
 */
export interface Integrations {
  analytics: {
    enabled: boolean;
    providers?: {
      name: 'google_analytics' | 'mixpanel' | 'segment' | 'amplitude' | 'custom';
      enabled: boolean;
      trackingId?: string;
      credentialsRef?: string;
    }[];
  };
  erp?: {
    enabled?: boolean;
    provider?: 'sap' | 'oracle' | 'dynamics' | 'custom';
    syncIntervalMinutes?: number;
    credentialsRef?: string;
  };
  pos?: {
    enabled?: boolean;
    provider?: string;
    credentialsRef?: string;
  };
  shipping?: {
    provider: 'manual' | 'fedex' | 'ups' | 'dhl' | 'tcs' | 'leopards' | 'custom';
    enabled: boolean;
    credentialsRef?: string;
    default?: boolean;
  }[];
  webhooks?: {
    /**
     * RFC 4122 UUID identifier.
     */
    id: string;
    url: string;
    /**
     * @minItems 1
     */
    events: [string, ...string[]];
    enabled: boolean;
    /**
     * Reference to webhook signing secret.
     */
    secretRef?: string;
  }[];
  plugins?: {
    id: string;
    /**
     * Semantic version string.
     */
    version: string;
    enabled: boolean;
    settings?: Metadata;
  }[];
}
/**
 * AI orchestration settings, generation policies, and locked-field governance.
 */
export interface AiSettings {
  /**
   * Master switch for AI features on this tenant.
   */
  enabled: boolean;
  provider: {
    name: 'openai' | 'anthropic' | 'google' | 'azure' | 'custom';
    /**
     * Model identifier (e.g. gpt-4o, claude-3-5-sonnet).
     */
    model?: string;
    /**
     * Reference to API credentials in secrets store.
     */
    credentialsRef?: string;
  };
  generation: {
    /**
     * @minItems 1
     */
    allowedTargets: [
      'config' | 'theme' | 'catalog' | 'navigation' | 'copy' | 'menu_import',
      ...('config' | 'theme' | 'catalog' | 'navigation' | 'copy' | 'menu_import')[],
    ];
    /**
     * If false, AI output requires human review before publish.
     */
    autoApply?: boolean;
    maxTokensPerRequest?: number;
  };
  guardrails: {
    /**
     * JSON Pointer paths AI cannot modify after publish (e.g. payments.checkout.captureStrategy).
     */
    lockedFields: string[];
    requireSchemaValidation: boolean;
    blockDirectDbWrites?: boolean;
    auditAllSuggestions?: boolean;
  };
  copilot?: {
    adminEnabled?: boolean;
    customerSupportEnabled?: boolean;
    allowedActions?: (
      'read_orders' | 'read_catalog' | 'update_catalog_draft' | 'generate_reports' | 'answer_faq'
    )[];
  };
}
/**
 * React Native mobile application identity, store listing, and runtime settings.
 */
export interface MobileAppSettings {
  enabled: boolean;
  identity: {
    /**
     * iOS/Android bundle identifier (e.g. com.merchant.shop).
     */
    bundleId: string;
    /**
     * App Store display name.
     */
    appName: string;
    /**
     * Semantic version string.
     */
    version: string;
    buildNumber?: number;
  };
  storeListing?: {
    shortDescription?: string;
    fullDescription?: string;
    /**
     * @maxItems 20
     */
    keywords?:
      | []
      | [string]
      | [string, string]
      | [string, string, string]
      | [string, string, string, string]
      | [string, string, string, string, string]
      | [string, string, string, string, string, string]
      | [string, string, string, string, string, string, string]
      | [string, string, string, string, string, string, string, string]
      | [string, string, string, string, string, string, string, string, string]
      | [string, string, string, string, string, string, string, string, string, string]
      | [string, string, string, string, string, string, string, string, string, string, string]
      | [
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
        ]
      | [
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
        ]
      | [
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
        ]
      | [
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
        ]
      | [
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
        ]
      | [
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
        ]
      | [
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
        ]
      | [
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
        ]
      | [
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
        ];
    category?: string;
    privacyPolicyUrl?: string;
  };
  runtime: {
    minOsVersion: {
      ios?: string;
      android?: number;
    };
    otaUpdates?: {
      enabled?: boolean;
      channel?: 'development' | 'staging' | 'production';
    };
    pushNotifications?: {
      enabled?: boolean;
      provider?: 'firebase' | 'apns' | 'onesignal' | 'custom';
    };
    deepLinking?: {
      enabled?: boolean;
      scheme?: string;
      universalLinksDomain?: string;
    };
  };
}
/**
 * Web storefront domain, SEO, PWA, and rendering configuration.
 */
export interface WebStoreSettings {
  enabled: boolean;
  domain: {
    /**
     * Primary custom domain (e.g. shop.merchant.com).
     */
    primary: string;
    aliases?: string[];
    /**
     * Platform-provided subdomain for starter tier.
     */
    platformSubdomain?: string;
    ssl?: {
      autoProvision?: boolean;
      forceHttps?: boolean;
    };
  };
  seo: {
    title: string;
    description: string;
    /**
     * @maxItems 20
     */
    keywords?:
      | []
      | [string]
      | [string, string]
      | [string, string, string]
      | [string, string, string, string]
      | [string, string, string, string, string]
      | [string, string, string, string, string, string]
      | [string, string, string, string, string, string, string]
      | [string, string, string, string, string, string, string, string]
      | [string, string, string, string, string, string, string, string, string]
      | [string, string, string, string, string, string, string, string, string, string]
      | [string, string, string, string, string, string, string, string, string, string, string]
      | [
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
        ]
      | [
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
        ]
      | [
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
        ]
      | [
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
        ]
      | [
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
        ]
      | [
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
        ]
      | [
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
        ]
      | [
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
        ]
      | [
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
          string,
        ];
    robotsIndex?: boolean;
    sitemapEnabled?: boolean;
    structuredData?: {
      organization?: boolean;
      product?: boolean;
      breadcrumb?: boolean;
    };
  };
  pwa?: {
    enabled?: boolean;
    displayMode?: 'standalone' | 'minimal-ui' | 'browser';
    /**
     * CSS hex color (#RGB, #RRGGBB, or #RRGGBBAA).
     */
    themeColor?: string;
    /**
     * CSS hex color (#RGB, #RRGGBB, or #RRGGBBAA).
     */
    backgroundColor?: string;
  };
  rendering: {
    mode: 'ssr' | 'ssg' | 'isr' | 'spa';
    cacheTtlSeconds?: number;
  };
  legal?: {
    termsOfServiceUrl?: string;
    privacyPolicyUrl?: string;
    refundPolicyUrl?: string;
    cookieConsent?: {
      enabled?: boolean;
      regions?: string[];
    };
  };
}
/**
 * Admin dashboard layout, widgets, RBAC visibility, and operational preferences.
 */
export interface AdminDashboardSettings {
  enabled: boolean;
  domain?: {
    /**
     * Admin portal domain (e.g. admin.merchant.com).
     */
    primary?: string;
    platformSubdomain?: string;
  };
  layout: {
    sidebarStyle: 'expanded' | 'collapsed' | 'mini';
    defaultLandingRoute: string;
    widgets?: {
      id: string;
      enabled: boolean;
      position?: number;
      requiredRole?: 'owner' | 'admin' | 'manager' | 'staff' | 'support';
    }[];
  };
  preferences: {
    dateFormat: 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD';
    timeFormat: '12h' | '24h';
    rowsPerPage?: 10 | 25 | 50 | 100;
    enableBulkActions?: boolean;
    enableExport?: boolean;
  };
  onboarding?: {
    showWizard?: boolean;
    completedSteps?: (
      'company_profile' | 'branding' | 'catalog' | 'payments' | 'shipping' | 'go_live'
    )[];
  };
}
/**
 * Environment-specific overrides and deployment target configuration.
 */
export interface EnvironmentSettings {
  /**
   * Active environment for this configuration document.
   */
  current: 'development' | 'staging' | 'production';
  targets: {
    development: EnvironmentTarget;
    staging: EnvironmentTarget;
    production: EnvironmentTarget;
  };
  /**
   * Partial config overrides applied per environment at resolution time.
   */
  overrides?: {
    development?: EnvironmentOverrides;
    staging?: EnvironmentOverrides;
    production?: EnvironmentOverrides;
  };
  promotionPolicy?: {
    requireApproval?: boolean;
    allowedPaths?: ('development->staging' | 'staging->production')[];
    runValidationOnPromote?: boolean;
  };
}
/**
 * This interface was referenced by `EnvironmentSettings`'s JSON-Schema
 * via the `definition` "environmentTarget".
 */
export interface EnvironmentTarget {
  apiBaseUrl: string;
  cdnBaseUrl?: string;
  debug?: boolean;
  logLevel?: 'debug' | 'info' | 'warn' | 'error';
}
/**
 * Shallow override keys matching top-level tenant config sections.
 *
 * This interface was referenced by `EnvironmentSettings`'s JSON-Schema
 * via the `definition` "environmentOverrides".
 */
export interface EnvironmentOverrides {
  payments?: {
    defaultGateway?: string;
  };
  integrations?: {};
  aiSettings?: {};
  [k: string]: unknown;
}
