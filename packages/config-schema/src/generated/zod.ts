/**
 * AUTO-GENERATED FILE — DO NOT EDIT DIRECTLY.
 * Source: schemas/ (JSON Schema v1)
 * Regenerate: pnpm --filter @ai-commerce/config-schema generate
 */

import { z } from 'zod';

/** Validates `TenantConfiguration` configuration. */
export const tenantConfigurationSchema = z
  .object({
    meta: z
      .object({
        schemaVersion: z
          .literal('v1')
          .describe('Platform schema version. Increment on breaking schema changes.'),
        configVersion: z
          .number()
          .int()
          .gte(1)
          .describe('Monotonic tenant config revision. Incremented on every publish.'),
        createdAt: z.string().datetime({ offset: true }).describe('ISO 8601 date-time in UTC.'),
        updatedAt: z.any(),
        publishedAt: z.any().optional(),
        publishedBy: z
          .any()
          .describe('User ID who published this configuration version.')
          .optional(),
        label: z
          .string()
          .min(1)
          .max(128)
          .describe("Human-readable label for this config revision (e.g. 'Launch config').")
          .optional(),
        migrationHistory: z
          .array(
            z
              .object({
                fromSchemaVersion: z.any(),
                toSchemaVersion: z.any(),
                migratedAt: z.any(),
                migrationId: z
                  .string()
                  .regex(new RegExp('^[a-z0-9-]+$'))
                  .describe('Identifier of the migration script applied.')
                  .optional(),
                notes: z.string().max(1024).optional(),
              })
              .strict(),
          )
          .describe('Audit trail of schema migrations applied to this configuration.')
          .optional(),
      })
      .strict()
      .describe(
        'Metadata for versioning, audit, and schema compatibility of a tenant configuration document.',
      ),
    tenant: z
      .object({
        id: z.string().uuid().describe('RFC 4122 UUID identifier.'),
        slug: z
          .string()
          .regex(new RegExp('^[a-z0-9]+(?:-[a-z0-9]+)*$'))
          .min(2)
          .max(64)
          .describe('URL-safe lowercase slug.'),
        name: z.string().min(1).max(256),
        vertical: z
          .enum(['ecommerce', 'grocery', 'restaurant', 'pharmacy', 'fashion', 'electronics'])
          .describe('Active business vertical pack for this tenant.'),
        status: z
          .enum(['draft', 'active', 'suspended', 'archived'])
          .describe('Tenant lifecycle status.'),
        defaultLocale: z.any(),
        defaultTimezone: z
          .string()
          .min(1)
          .max(64)
          .describe('IANA timezone identifier (e.g. Asia/Karachi).'),
        defaultCountry: z
          .string()
          .regex(new RegExp('^[A-Z]{2}$'))
          .describe('ISO 3166-1 alpha-2 country code.')
          .optional(),
        subscriptionTier: z.enum(['starter', 'growth', 'enterprise']).default('starter'),
        stores: z
          .array(
            z
              .object({
                id: z.any(),
                slug: z.any(),
                name: z.string().min(1).max(256),
                isDefault: z.boolean().default(false),
                channels: z
                  .array(z.enum(['web', 'mobile', 'admin', 'api']))
                  .min(1)
                  .refine(
                    (arr) => arr.every((item, i) => arr.indexOf(item) == i),
                    'All items must be unique!',
                  )
                  .optional(),
              })
              .strict(),
          )
          .min(1)
          .optional(),
        metadata: z
          .record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.null()]))
          .describe('Arbitrary key-value metadata for integrations and extensions.')
          .optional(),
      })
      .strict()
      .describe(
        'Root tenant identity and operational settings. All platform data scopes from the tenant.',
      ),
    company: z
      .object({
        legalName: z.string().min(1).max(512).describe('Registered legal business name.'),
        displayName: z.string().min(1).max(256).describe('Public-facing business name.'),
        registrationNumber: z
          .string()
          .max(128)
          .describe('Business registration or tax ID.')
          .optional(),
        contactEmail: z.string().email().max(320),
        contactPhone: z
          .string()
          .regex(new RegExp('^\\+[1-9]\\d{6,14}$'))
          .describe('E.164 international phone number.')
          .optional(),
        website: z.string().url().max(2048).optional(),
        address: z
          .object({
            line1: z.string().min(1).max(256),
            line2: z.string().max(256).optional(),
            city: z.string().min(1).max(128),
            state: z.string().max(128).optional(),
            postalCode: z.string().max(32).optional(),
            country: z.any(),
          })
          .strict()
          .optional(),
        supportHours: z
          .string()
          .max(256)
          .describe("Human-readable support availability (e.g. 'Mon–Fri 9am–6pm PKT').")
          .optional(),
        metadata: z.any().optional(),
      })
      .strict()
      .describe('Legal and business entity information for the merchant operating the tenant.'),
    branding: z
      .object({
        appName: z
          .string()
          .min(1)
          .max(128)
          .describe('Application display name shown to end customers.'),
        tagline: z.string().min(1).max(256),
        logo: z
          .object({
            primary: z.any().describe('Primary logo URL (light background).').optional(),
            inverse: z.any().describe('Logo for dark backgrounds.').optional(),
            favicon: z.any().optional(),
            appleTouchIcon: z.any().optional(),
          })
          .strict()
          .optional(),
        splashScreen: z
          .object({ backgroundColor: z.any().optional(), imageUrl: z.any().optional() })
          .strict()
          .optional(),
        socialShare: z
          .object({
            ogImageUrl: z.any().optional(),
            twitterHandle: z.string().regex(new RegExp('^@?[A-Za-z0-9_]{1,15}$')).optional(),
          })
          .strict()
          .optional(),
        showPoweredBy: z
          .boolean()
          .describe('Display platform attribution (tier-dependent).')
          .default(true),
        copyrightText: z.string().max(512).optional(),
        metadata: z.any().optional(),
      })
      .strict()
      .describe('Brand identity assets and copy used across all generated surfaces.'),
    theme: z
      .object({
        preset: z
          .enum(['minimal', 'modern', 'classic', 'bold', 'custom'])
          .describe('Base template family selected for the tenant.'),
        colors: z
          .object({
            primary: z.any(),
            secondary: z.any(),
            background: z.any(),
            surface: z.any(),
            text: z
              .string()
              .regex(new RegExp('^#(?:[0-9A-Fa-f]{3}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$'))
              .describe('CSS hex color (#RGB, #RRGGBB, or #RRGGBBAA).'),
            textMuted: z.any().optional(),
            border: z.any().optional(),
            error: z.any(),
            success: z.any(),
            warning: z.any(),
          })
          .strict(),
        typography: z
          .object({
            fontFamily: z
              .object({ heading: z.string().min(1).max(128), body: z.string().min(1).max(128) })
              .strict(),
            scale: z.enum(['compact', 'default', 'comfortable']),
            baseFontSize: z.number().int().gte(12).lte(20).default(16),
          })
          .strict(),
        spacing: z
          .object({
            unit: z
              .union([z.literal(4), z.literal(8)])
              .describe('Base spacing grid unit in pixels.'),
            density: z.enum(['compact', 'default', 'spacious']).default('default'),
          })
          .strict(),
        radius: z
          .object({
            sm: z.number().int().gte(0).lte(16),
            md: z.number().int().gte(0).lte(24),
            lg: z.number().int().gte(0).lte(32),
            full: z.number().int().gte(0).lte(9999).default(9999),
          })
          .strict(),
        elevation: z.enum(['flat', 'subtle', 'raised']).default('subtle'),
        motion: z
          .object({
            enabled: z.boolean().default(true),
            durationMs: z.number().int().gte(0).lte(1000).default(200),
          })
          .strict()
          .optional(),
        componentVariants: z
          .object({
            button: z.enum(['filled', 'outline', 'ghost']).default('filled'),
            input: z.enum(['outline', 'filled', 'underline']).default('outline'),
            card: z.enum(['elevated', 'outlined', 'flat']).default('elevated'),
          })
          .strict()
          .optional(),
        darkMode: z
          .object({
            enabled: z.boolean().default(false),
            strategy: z.enum(['manual', 'system', 'scheduled']).default('system'),
            colors: z
              .object({
                primary: z.any().optional(),
                background: z.any().optional(),
                surface: z.any().optional(),
                text: z.any().optional(),
              })
              .strict()
              .optional(),
          })
          .strict()
          .optional(),
      })
      .strict()
      .describe(
        'Design tokens compiled by the Theme Engine into CSS, React Native, and Admin theme bundles.',
      ),
    navigation: z
      .object({ web: z.any(), mobile: z.any(), admin: z.any() })
      .strict()
      .describe(
        'Cross-surface navigation definitions for web store, mobile app, and admin dashboard.',
      ),
    languages: z
      .object({
        default: z
          .string()
          .regex(new RegExp('^[a-z]{2}(-[A-Z]{2})?$'))
          .describe('BCP 47 language tag (e.g. en, en-US, ur-PK).'),
        supported: z
          .array(z.any())
          .min(1)
          .refine(
            (arr) => arr.every((item, i) => arr.indexOf(item) == i),
            'All items must be unique!',
          ),
        fallback: z.any(),
        rtlLocales: z
          .array(z.any())
          .refine(
            (arr) => arr.every((item, i) => arr.indexOf(item) == i),
            'All items must be unique!',
          )
          .describe('Locales rendered right-to-left (e.g. ar, ur).')
          .optional(),
        autoDetect: z
          .boolean()
          .describe('Detect user locale from browser/device settings.')
          .default(true),
        allowUserOverride: z
          .boolean()
          .describe('Allow end users to switch language in the app.')
          .default(true),
      })
      .strict()
      .describe('Locale and internationalization settings for the tenant.'),
    currency: z
      .object({
        default: z
          .string()
          .regex(new RegExp('^[A-Z]{3}$'))
          .describe('ISO 4217 currency code (e.g. USD, PKR, EUR).'),
        supported: z
          .array(z.any())
          .min(1)
          .refine(
            (arr) => arr.every((item, i) => arr.indexOf(item) == i),
            'All items must be unique!',
          ),
        display: z
          .object({
            symbolPosition: z.enum(['before', 'after']),
            decimalPlaces: z.number().int().gte(0).lte(4).default(2),
            thousandsSeparator: z.enum([',', '.', ' ', "'"]).default(','),
            decimalSeparator: z.enum(['.', ',']).default('.'),
          })
          .strict(),
        allowMultiCurrency: z
          .boolean()
          .describe('Enable checkout in non-default currencies.')
          .default(false),
        exchangeRateProvider: z
          .enum(['manual', 'openexchangerates', 'fixer', 'none'])
          .default('none'),
      })
      .strict()
      .describe('Currency display, formatting, and multi-currency commerce settings.'),
    featureFlags: z
      .object({
        modules: z
          .object({
            catalog: z.boolean().default(true),
            cart: z.boolean().default(true),
            checkout: z.boolean().default(true),
            order: z.boolean().default(true),
            payment: z.boolean().default(true),
            customer: z.boolean().default(true),
            inventory: z.boolean().default(true),
            notification: z.boolean().default(true),
            media: z.boolean().default(true),
            reviews: z.boolean().default(false),
            wishlist: z.boolean().default(false),
            subscriptions: z.boolean().default(false),
            loyalty: z.boolean().default(false),
          })
          .strict()
          .describe('Core and vertical module activation map.'),
        flags: z.record(z.string(), z.boolean()).describe('Arbitrary feature flag key-value map.'),
        experiments: z
          .array(
            z
              .object({
                key: z.string().regex(new RegExp('^[a-z][a-z0-9-]*$')).max(64),
                enabled: z.boolean(),
                variants: z.record(z.string(), z.number().gte(0).lte(100)),
              })
              .strict(),
          )
          .optional(),
      })
      .strict()
      .describe('Tenant-level feature toggles and module activation flags.'),
    authentication: z
      .object({
        customer: z
          .object({
            methods: z
              .object({
                email: z.boolean().default(true),
                phone: z.boolean().default(false),
                guestCheckout: z.boolean().default(true),
                social: z
                  .object({
                    google: z.boolean().default(false),
                    apple: z.boolean().default(false),
                    facebook: z.boolean().default(false),
                  })
                  .strict()
                  .optional(),
              })
              .strict(),
            session: z
              .object({
                tokenTtlMinutes: z.number().int().gte(5).lte(43200).default(10080),
                refreshEnabled: z.boolean().default(true),
                maxDevices: z.number().int().gte(1).lte(50).default(5),
              })
              .strict(),
            mfa: z
              .object({
                required: z.boolean().default(false),
                methods: z
                  .array(z.enum(['totp', 'sms', 'email']))
                  .refine(
                    (arr) => arr.every((item, i) => arr.indexOf(item) == i),
                    'All items must be unique!',
                  )
                  .optional(),
              })
              .strict()
              .optional(),
          })
          .strict(),
        admin: z
          .object({
            methods: z
              .object({
                email: z.boolean().default(true),
                sso: z
                  .object({
                    enabled: z.boolean().default(false),
                    provider: z.enum(['saml', 'oidc']).optional(),
                    issuerUrl: z.any().optional(),
                  })
                  .strict()
                  .optional(),
              })
              .strict(),
            session: z
              .object({
                tokenTtlMinutes: z.number().int().gte(5).lte(1440).default(480),
                idleTimeoutMinutes: z.number().int().gte(5).lte(480).default(30),
              })
              .strict(),
            mfa: z
              .object({
                required: z.boolean().default(true),
                methods: z
                  .array(z.enum(['totp', 'sms', 'email']))
                  .min(1)
                  .refine(
                    (arr) => arr.every((item, i) => arr.indexOf(item) == i),
                    'All items must be unique!',
                  )
                  .default(['totp']),
              })
              .strict(),
            defaultRoles: z
              .array(z.enum(['owner', 'admin', 'manager', 'staff', 'support']))
              .default(['owner', 'admin', 'manager', 'staff']),
          })
          .strict(),
        api: z
          .object({
            enabled: z.boolean().default(false),
            keyRotationDays: z.number().int().gte(30).lte(365).default(90),
            oauthClientCredentials: z.boolean().default(false),
          })
          .strict()
          .optional(),
      })
      .strict()
      .describe('Authentication methods, session policies, and RBAC defaults for the tenant.'),
    payments: z
      .object({
        defaultGateway: z
          .enum(['stripe', 'paypal', 'razorpay', 'jazzcash', 'easypaisa', 'manual', 'custom'])
          .describe('Primary payment gateway for this tenant.'),
        methods: z
          .array(
            z.enum([
              'card',
              'wallet',
              'bank_transfer',
              'cash_on_delivery',
              'buy_now_pay_later',
              'apple_pay',
              'google_pay',
            ]),
          )
          .min(1)
          .refine(
            (arr) => arr.every((item, i) => arr.indexOf(item) == i),
            'All items must be unique!',
          ),
        gateways: z
          .array(
            z
              .object({
                provider: z.enum([
                  'stripe',
                  'paypal',
                  'razorpay',
                  'jazzcash',
                  'easypaisa',
                  'manual',
                  'custom',
                ]),
                enabled: z.boolean(),
                mode: z.enum(['sandbox', 'live']).default('sandbox'),
                credentialsRef: z
                  .string()
                  .regex(new RegExp('^[a-zA-Z0-9/_-]+$'))
                  .describe(
                    'Reference to encrypted credentials in secrets store (not inline secrets).',
                  )
                  .optional(),
                supportedMethods: z.array(z.string()).optional(),
              })
              .strict(),
          )
          .optional(),
        checkout: z
          .object({
            captureStrategy: z
              .enum(['immediate', 'authorize_then_capture', 'manual'])
              .default('immediate'),
            allowSplitPayment: z.boolean().default(false),
            minimumOrderAmount: z.number().gte(0).optional(),
            codEnabled: z.boolean().default(false),
            codMaxAmount: z.number().gte(0).optional(),
          })
          .strict(),
        refunds: z
          .object({
            autoApprove: z.boolean().default(false),
            windowDays: z.number().int().gte(0).lte(365).default(30),
          })
          .strict()
          .optional(),
      })
      .strict()
      .describe('Payment gateway configuration, accepted methods, and checkout payment policies.'),
    notifications: z
      .object({
        channels: z
          .object({
            email: z.boolean().default(true),
            sms: z.boolean().default(false),
            push: z.boolean().default(false),
            whatsapp: z.boolean().default(false),
          })
          .strict(),
        sender: z
          .object({
            fromName: z.string().min(1).max(128),
            fromEmail: z.any(),
            replyTo: z.any().optional(),
            smsSenderId: z
              .string()
              .max(11)
              .describe('Alphanumeric SMS sender ID where supported.')
              .optional(),
          })
          .strict(),
        events: z
          .object({
            orderConfirmed: z.any().optional(),
            orderShipped: z.any().optional(),
            orderDelivered: z.any().optional(),
            orderCancelled: z.any().optional(),
            paymentFailed: z.any().optional(),
            passwordReset: z.any().optional(),
            welcomeCustomer: z.any().optional(),
          })
          .strict()
          .describe('Per-event channel enablement.'),
        templates: z
          .record(
            z.string(),
            z.object({
              subject: z.string().max(256).optional(),
              bodyRef: z.string().describe('Reference to template asset ID.').optional(),
            }),
          )
          .describe('Template overrides keyed by event name.')
          .optional(),
        quietHours: z
          .object({
            enabled: z.boolean().default(false),
            start: z
              .string()
              .regex(new RegExp('^([01]\\d|2[0-3]):[0-5]\\d$'))
              .describe('24h time HH:MM in tenant timezone.')
              .optional(),
            end: z.string().regex(new RegExp('^([01]\\d|2[0-3]):[0-5]\\d$')).optional(),
            channels: z.array(z.enum(['sms', 'push', 'whatsapp'])).optional(),
          })
          .strict()
          .optional(),
      })
      .strict()
      .describe('Notification channels, templates, and delivery policies for the tenant.'),
    integrations: z
      .object({
        analytics: z
          .object({
            enabled: z.boolean().default(true),
            providers: z
              .array(
                z
                  .object({
                    name: z.enum([
                      'google_analytics',
                      'mixpanel',
                      'segment',
                      'amplitude',
                      'custom',
                    ]),
                    enabled: z.boolean(),
                    trackingId: z.string().max(256).optional(),
                    credentialsRef: z.string().max(256).optional(),
                  })
                  .strict(),
              )
              .optional(),
          })
          .strict(),
        erp: z
          .object({
            enabled: z.boolean().default(false),
            provider: z.enum(['sap', 'oracle', 'dynamics', 'custom']).optional(),
            syncIntervalMinutes: z.number().int().gte(5).lte(1440).default(60),
            credentialsRef: z.string().optional(),
          })
          .strict()
          .optional(),
        pos: z
          .object({
            enabled: z.boolean().default(false),
            provider: z.string().max(128).optional(),
            credentialsRef: z.string().optional(),
          })
          .strict()
          .optional(),
        shipping: z
          .array(
            z
              .object({
                provider: z.enum(['manual', 'fedex', 'ups', 'dhl', 'tcs', 'leopards', 'custom']),
                enabled: z.boolean(),
                credentialsRef: z.string().optional(),
                default: z.boolean().default(false),
              })
              .strict(),
          )
          .optional(),
        webhooks: z
          .array(
            z
              .object({
                id: z.any(),
                url: z.any(),
                events: z
                  .array(z.string().regex(new RegExp('^[a-z]+\\.[a-z]+(?:\\.[a-z]+)?$')))
                  .min(1),
                enabled: z.boolean(),
                secretRef: z.string().describe('Reference to webhook signing secret.').optional(),
              })
              .strict(),
          )
          .optional(),
        plugins: z
          .array(
            z
              .object({
                id: z.string().regex(new RegExp('^[a-z0-9]+(?:\\.[a-z0-9]+)+$')),
                version: z.any(),
                enabled: z.boolean(),
                settings: z.any().optional(),
              })
              .strict(),
          )
          .optional(),
      })
      .strict()
      .describe('Third-party service integrations: analytics, ERP, POS, shipping, and webhooks.'),
    aiSettings: z
      .object({
        enabled: z
          .boolean()
          .describe('Master switch for AI features on this tenant.')
          .default(true),
        provider: z
          .object({
            name: z.enum(['openai', 'anthropic', 'google', 'azure', 'custom']),
            model: z
              .string()
              .max(128)
              .describe('Model identifier (e.g. gpt-4o, claude-3-5-sonnet).')
              .optional(),
            credentialsRef: z
              .string()
              .describe('Reference to API credentials in secrets store.')
              .optional(),
          })
          .strict(),
        generation: z
          .object({
            allowedTargets: z
              .array(z.enum(['config', 'theme', 'catalog', 'navigation', 'copy', 'menu_import']))
              .min(1)
              .refine(
                (arr) => arr.every((item, i) => arr.indexOf(item) == i),
                'All items must be unique!',
              ),
            autoApply: z
              .boolean()
              .describe('If false, AI output requires human review before publish.')
              .default(false),
            maxTokensPerRequest: z.number().int().gte(256).lte(128000).default(4096),
          })
          .strict(),
        guardrails: z
          .object({
            lockedFields: z
              .array(
                z.string().regex(new RegExp('^[a-zA-Z][a-zA-Z0-9]*(\\.[a-zA-Z][a-zA-Z0-9]*)*$')),
              )
              .describe(
                'JSON Pointer paths AI cannot modify after publish (e.g. payments.checkout.captureStrategy).',
              ),
            requireSchemaValidation: z.boolean().default(true),
            blockDirectDbWrites: z.boolean().default(true),
            auditAllSuggestions: z.boolean().default(true),
          })
          .strict(),
        copilot: z
          .object({
            adminEnabled: z.boolean().default(true),
            customerSupportEnabled: z.boolean().default(false),
            allowedActions: z
              .array(
                z.enum([
                  'read_orders',
                  'read_catalog',
                  'update_catalog_draft',
                  'generate_reports',
                  'answer_faq',
                ]),
              )
              .optional(),
          })
          .strict()
          .optional(),
      })
      .strict()
      .describe('AI orchestration settings, generation policies, and locked-field governance.'),
    mobileApp: z
      .object({
        enabled: z.boolean().default(true),
        identity: z
          .object({
            bundleId: z
              .string()
              .regex(new RegExp('^[a-z][a-z0-9]*(\\.[a-z0-9]+)+$'))
              .max(256)
              .describe('iOS/Android bundle identifier (e.g. com.merchant.shop).'),
            appName: z.string().min(1).max(30).describe('App Store display name.'),
            version: z
              .string()
              .regex(
                new RegExp(
                  '^(0|[1-9]\\d*)\\.(0|[1-9]\\d*)\\.(0|[1-9]\\d*)(?:-[\\w.]+)?(?:\\+[\\w.]+)?$',
                ),
              )
              .describe('Semantic version string.'),
            buildNumber: z.number().int().gte(1).optional(),
          })
          .strict(),
        storeListing: z
          .object({
            shortDescription: z.string().max(80).optional(),
            fullDescription: z.string().max(4000).optional(),
            keywords: z.array(z.string().max(64)).max(20).optional(),
            category: z.string().max(64).optional(),
            privacyPolicyUrl: z.any().optional(),
          })
          .strict()
          .optional(),
        runtime: z
          .object({
            minOsVersion: z
              .object({
                ios: z.string().regex(new RegExp('^\\d+(\\.\\d+)*$')).default('15.0'),
                android: z.number().int().gte(21).default(24),
              })
              .strict(),
            otaUpdates: z
              .object({
                enabled: z.boolean().default(true),
                channel: z.enum(['development', 'staging', 'production']).default('production'),
              })
              .strict()
              .optional(),
            pushNotifications: z
              .object({
                enabled: z.boolean().default(false),
                provider: z.enum(['firebase', 'apns', 'onesignal', 'custom']).optional(),
              })
              .strict()
              .optional(),
            deepLinking: z
              .object({
                enabled: z.boolean().default(true),
                scheme: z.string().regex(new RegExp('^[a-z][a-z0-9+.-]*$')).max(32).optional(),
                universalLinksDomain: z.string().max(256).optional(),
              })
              .strict()
              .optional(),
          })
          .strict(),
      })
      .strict()
      .describe('React Native mobile application identity, store listing, and runtime settings.'),
    webStore: z
      .object({
        enabled: z.boolean().default(true),
        domain: z
          .object({
            primary: z
              .string()
              .max(256)
              .describe('Primary custom domain (e.g. shop.merchant.com).'),
            aliases: z
              .array(z.string())
              .refine(
                (arr) => arr.every((item, i) => arr.indexOf(item) == i),
                'All items must be unique!',
              )
              .optional(),
            platformSubdomain: z
              .string()
              .regex(new RegExp('^[a-z0-9-]+\\.[a-z0-9.-]+$'))
              .describe('Platform-provided subdomain for starter tier.')
              .optional(),
            ssl: z
              .object({
                autoProvision: z.boolean().default(true),
                forceHttps: z.boolean().default(true),
              })
              .strict()
              .optional(),
          })
          .strict(),
        seo: z
          .object({
            title: z.string().min(1).max(70),
            description: z.string().min(1).max(160),
            keywords: z.array(z.string().max(64)).max(20).optional(),
            robotsIndex: z.boolean().default(true),
            sitemapEnabled: z.boolean().default(true),
            structuredData: z
              .object({
                organization: z.boolean().default(true),
                product: z.boolean().default(true),
                breadcrumb: z.boolean().default(true),
              })
              .strict()
              .optional(),
          })
          .strict(),
        pwa: z
          .object({
            enabled: z.boolean().default(true),
            displayMode: z.enum(['standalone', 'minimal-ui', 'browser']).default('standalone'),
            themeColor: z.any().optional(),
            backgroundColor: z.any().optional(),
          })
          .strict()
          .optional(),
        rendering: z
          .object({
            mode: z.enum(['ssr', 'ssg', 'isr', 'spa']).default('ssr'),
            cacheTtlSeconds: z.number().int().gte(0).lte(86400).default(60),
          })
          .strict(),
        legal: z
          .object({
            termsOfServiceUrl: z.any().optional(),
            privacyPolicyUrl: z.any().optional(),
            refundPolicyUrl: z.any().optional(),
            cookieConsent: z
              .object({ enabled: z.boolean().default(false), regions: z.array(z.any()).optional() })
              .strict()
              .optional(),
          })
          .strict()
          .optional(),
      })
      .strict()
      .describe('Web storefront domain, SEO, PWA, and rendering configuration.'),
    adminDashboard: z
      .object({
        enabled: z.boolean().default(true),
        domain: z
          .object({
            primary: z
              .string()
              .max(256)
              .describe('Admin portal domain (e.g. admin.merchant.com).')
              .optional(),
            platformSubdomain: z
              .string()
              .regex(new RegExp('^[a-z0-9-]+\\.[a-z0-9.-]+$'))
              .optional(),
          })
          .strict()
          .optional(),
        layout: z
          .object({
            sidebarStyle: z.enum(['expanded', 'collapsed', 'mini']).default('expanded'),
            defaultLandingRoute: z.string().min(1).max(256).default('dashboard.overview'),
            widgets: z
              .array(
                z
                  .object({
                    id: z.string().regex(new RegExp('^[a-z0-9-]+$')).max(64),
                    enabled: z.boolean(),
                    position: z.number().int().gte(0).optional(),
                    requiredRole: z
                      .enum(['owner', 'admin', 'manager', 'staff', 'support'])
                      .optional(),
                  })
                  .strict(),
              )
              .optional(),
          })
          .strict(),
        preferences: z
          .object({
            dateFormat: z.enum(['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD']).default('DD/MM/YYYY'),
            timeFormat: z.enum(['12h', '24h']).default('12h'),
            rowsPerPage: z
              .union([z.literal(10), z.literal(25), z.literal(50), z.literal(100)])
              .default(25),
            enableBulkActions: z.boolean().default(true),
            enableExport: z.boolean().default(true),
          })
          .strict(),
        onboarding: z
          .object({
            showWizard: z.boolean().default(true),
            completedSteps: z
              .array(
                z.enum([
                  'company_profile',
                  'branding',
                  'catalog',
                  'payments',
                  'shipping',
                  'go_live',
                ]),
              )
              .refine(
                (arr) => arr.every((item, i) => arr.indexOf(item) == i),
                'All items must be unique!',
              )
              .optional(),
          })
          .strict()
          .optional(),
      })
      .strict()
      .describe('Admin dashboard layout, widgets, RBAC visibility, and operational preferences.'),
    environment: z
      .object({
        current: z
          .enum(['development', 'staging', 'production'])
          .describe('Active environment for this configuration document.'),
        targets: z.object({ development: z.any(), staging: z.any(), production: z.any() }).strict(),
        overrides: z
          .object({
            development: z.any().optional(),
            staging: z.any().optional(),
            production: z.any().optional(),
          })
          .strict()
          .describe('Partial config overrides applied per environment at resolution time.')
          .optional(),
        promotionPolicy: z
          .object({
            requireApproval: z.boolean().default(true),
            allowedPaths: z
              .array(z.enum(['development->staging', 'staging->production']))
              .default(['development->staging', 'staging->production']),
            runValidationOnPromote: z.boolean().default(true),
          })
          .strict()
          .optional(),
      })
      .strict()
      .describe('Environment-specific overrides and deployment target configuration.'),
  })
  .strict()
  .describe('Root tenant configuration document — single source of truth for the entire platform.');

/** Validates `ConfigurationMeta` configuration. */
export const configurationMetaSchema = z
  .object({
    schemaVersion: z
      .literal('v1')
      .describe('Platform schema version. Increment on breaking schema changes.'),
    configVersion: z
      .number()
      .int()
      .gte(1)
      .describe('Monotonic tenant config revision. Incremented on every publish.'),
    createdAt: z.string().datetime({ offset: true }).describe('ISO 8601 date-time in UTC.'),
    updatedAt: z.any(),
    publishedAt: z.any().optional(),
    publishedBy: z
      .string()
      .uuid()
      .describe('User ID who published this configuration version.')
      .optional(),
    label: z
      .string()
      .min(1)
      .max(128)
      .describe("Human-readable label for this config revision (e.g. 'Launch config').")
      .optional(),
    migrationHistory: z
      .array(
        z
          .object({
            fromSchemaVersion: z.any(),
            toSchemaVersion: z.any(),
            migratedAt: z.any(),
            migrationId: z
              .string()
              .regex(new RegExp('^[a-z0-9-]+$'))
              .describe('Identifier of the migration script applied.')
              .optional(),
            notes: z.string().max(1024).optional(),
          })
          .strict(),
      )
      .describe('Audit trail of schema migrations applied to this configuration.')
      .optional(),
  })
  .strict()
  .describe(
    'Metadata for versioning, audit, and schema compatibility of a tenant configuration document.',
  );

/** Validates `Tenant` configuration. */
export const tenantSchema = z
  .object({
    id: z.string().uuid().describe('RFC 4122 UUID identifier.'),
    slug: z
      .string()
      .regex(new RegExp('^[a-z0-9]+(?:-[a-z0-9]+)*$'))
      .min(2)
      .max(64)
      .describe('URL-safe lowercase slug.'),
    name: z.string().min(1).max(256),
    vertical: z
      .enum(['ecommerce', 'grocery', 'restaurant', 'pharmacy', 'fashion', 'electronics'])
      .describe('Active business vertical pack for this tenant.'),
    status: z
      .enum(['draft', 'active', 'suspended', 'archived'])
      .describe('Tenant lifecycle status.'),
    defaultLocale: z
      .string()
      .regex(new RegExp('^[a-z]{2}(-[A-Z]{2})?$'))
      .describe('BCP 47 language tag (e.g. en, en-US, ur-PK).'),
    defaultTimezone: z
      .string()
      .min(1)
      .max(64)
      .describe('IANA timezone identifier (e.g. Asia/Karachi).'),
    defaultCountry: z
      .string()
      .regex(new RegExp('^[A-Z]{2}$'))
      .describe('ISO 3166-1 alpha-2 country code.')
      .optional(),
    subscriptionTier: z.enum(['starter', 'growth', 'enterprise']).default('starter'),
    stores: z
      .array(
        z
          .object({
            id: z.any(),
            slug: z.any(),
            name: z.string().min(1).max(256),
            isDefault: z.boolean().default(false),
            channels: z
              .array(z.enum(['web', 'mobile', 'admin', 'api']))
              .min(1)
              .refine(
                (arr) => arr.every((item, i) => arr.indexOf(item) == i),
                'All items must be unique!',
              )
              .optional(),
          })
          .strict(),
      )
      .min(1)
      .optional(),
    metadata: z
      .record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.null()]))
      .describe('Arbitrary key-value metadata for integrations and extensions.')
      .optional(),
  })
  .strict()
  .describe(
    'Root tenant identity and operational settings. All platform data scopes from the tenant.',
  );

/** Validates `Company` configuration. */
export const companySchema = z
  .object({
    legalName: z.string().min(1).max(512).describe('Registered legal business name.'),
    displayName: z.string().min(1).max(256).describe('Public-facing business name.'),
    registrationNumber: z.string().max(128).describe('Business registration or tax ID.').optional(),
    contactEmail: z.string().email().max(320),
    contactPhone: z
      .string()
      .regex(new RegExp('^\\+[1-9]\\d{6,14}$'))
      .describe('E.164 international phone number.')
      .optional(),
    website: z.string().url().max(2048).optional(),
    address: z
      .object({
        line1: z.string().min(1).max(256),
        line2: z.string().max(256).optional(),
        city: z.string().min(1).max(128),
        state: z.string().max(128).optional(),
        postalCode: z.string().max(32).optional(),
        country: z
          .string()
          .regex(new RegExp('^[A-Z]{2}$'))
          .describe('ISO 3166-1 alpha-2 country code.'),
      })
      .strict()
      .optional(),
    supportHours: z
      .string()
      .max(256)
      .describe("Human-readable support availability (e.g. 'Mon–Fri 9am–6pm PKT').")
      .optional(),
    metadata: z
      .record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.null()]))
      .describe('Arbitrary key-value metadata for integrations and extensions.')
      .optional(),
  })
  .strict()
  .describe('Legal and business entity information for the merchant operating the tenant.');

/** Validates `Branding` configuration. */
export const brandingSchema = z
  .object({
    appName: z
      .string()
      .min(1)
      .max(128)
      .describe('Application display name shown to end customers.'),
    tagline: z.string().min(1).max(256),
    logo: z
      .object({
        primary: z.any().describe('Primary logo URL (light background).').optional(),
        inverse: z.any().describe('Logo for dark backgrounds.').optional(),
        favicon: z.string().url().max(2048).optional(),
        appleTouchIcon: z.any().optional(),
      })
      .strict()
      .optional(),
    splashScreen: z
      .object({
        backgroundColor: z
          .string()
          .regex(new RegExp('^#(?:[0-9A-Fa-f]{3}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$'))
          .describe('CSS hex color (#RGB, #RRGGBB, or #RRGGBBAA).')
          .optional(),
        imageUrl: z.any().optional(),
      })
      .strict()
      .optional(),
    socialShare: z
      .object({
        ogImageUrl: z.any().optional(),
        twitterHandle: z.string().regex(new RegExp('^@?[A-Za-z0-9_]{1,15}$')).optional(),
      })
      .strict()
      .optional(),
    showPoweredBy: z
      .boolean()
      .describe('Display platform attribution (tier-dependent).')
      .default(true),
    copyrightText: z.string().max(512).optional(),
    metadata: z
      .record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.null()]))
      .describe('Arbitrary key-value metadata for integrations and extensions.')
      .optional(),
  })
  .strict()
  .describe('Brand identity assets and copy used across all generated surfaces.');

/** Validates `Theme` configuration. */
export const themeSchema = z
  .object({
    preset: z
      .enum(['minimal', 'modern', 'classic', 'bold', 'custom'])
      .describe('Base template family selected for the tenant.'),
    colors: z
      .object({
        primary: z.any(),
        secondary: z.any(),
        background: z.any(),
        surface: z.any(),
        text: z
          .string()
          .regex(new RegExp('^#(?:[0-9A-Fa-f]{3}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$'))
          .describe('CSS hex color (#RGB, #RRGGBB, or #RRGGBBAA).'),
        textMuted: z.any().optional(),
        border: z.any().optional(),
        error: z.any(),
        success: z.any(),
        warning: z.any(),
      })
      .strict(),
    typography: z
      .object({
        fontFamily: z
          .object({ heading: z.string().min(1).max(128), body: z.string().min(1).max(128) })
          .strict(),
        scale: z.enum(['compact', 'default', 'comfortable']),
        baseFontSize: z.number().int().gte(12).lte(20).default(16),
      })
      .strict(),
    spacing: z
      .object({
        unit: z.union([z.literal(4), z.literal(8)]).describe('Base spacing grid unit in pixels.'),
        density: z.enum(['compact', 'default', 'spacious']).default('default'),
      })
      .strict(),
    radius: z
      .object({
        sm: z.number().int().gte(0).lte(16),
        md: z.number().int().gte(0).lte(24),
        lg: z.number().int().gte(0).lte(32),
        full: z.number().int().gte(0).lte(9999).default(9999),
      })
      .strict(),
    elevation: z.enum(['flat', 'subtle', 'raised']).default('subtle'),
    motion: z
      .object({
        enabled: z.boolean().default(true),
        durationMs: z.number().int().gte(0).lte(1000).default(200),
      })
      .strict()
      .optional(),
    componentVariants: z
      .object({
        button: z.enum(['filled', 'outline', 'ghost']).default('filled'),
        input: z.enum(['outline', 'filled', 'underline']).default('outline'),
        card: z.enum(['elevated', 'outlined', 'flat']).default('elevated'),
      })
      .strict()
      .optional(),
    darkMode: z
      .object({
        enabled: z.boolean().default(false),
        strategy: z.enum(['manual', 'system', 'scheduled']).default('system'),
        colors: z
          .object({
            primary: z.any().optional(),
            background: z.any().optional(),
            surface: z.any().optional(),
            text: z.any().optional(),
          })
          .strict()
          .optional(),
      })
      .strict()
      .optional(),
  })
  .strict()
  .describe(
    'Design tokens compiled by the Theme Engine into CSS, React Native, and Admin theme bundles.',
  );

/** Validates `Navigation` configuration. */
export const navigationSchema = z
  .object({ web: z.any(), mobile: z.any(), admin: z.any() })
  .strict()
  .describe('Cross-surface navigation definitions for web store, mobile app, and admin dashboard.');

/** Validates `Languages` configuration. */
export const languagesSchema = z
  .object({
    default: z
      .string()
      .regex(new RegExp('^[a-z]{2}(-[A-Z]{2})?$'))
      .describe('BCP 47 language tag (e.g. en, en-US, ur-PK).'),
    supported: z
      .array(z.any())
      .min(1)
      .refine((arr) => arr.every((item, i) => arr.indexOf(item) == i), 'All items must be unique!'),
    fallback: z.any(),
    rtlLocales: z
      .array(z.any())
      .refine((arr) => arr.every((item, i) => arr.indexOf(item) == i), 'All items must be unique!')
      .describe('Locales rendered right-to-left (e.g. ar, ur).')
      .optional(),
    autoDetect: z
      .boolean()
      .describe('Detect user locale from browser/device settings.')
      .default(true),
    allowUserOverride: z
      .boolean()
      .describe('Allow end users to switch language in the app.')
      .default(true),
  })
  .strict()
  .describe('Locale and internationalization settings for the tenant.');

/** Validates `Currency` configuration. */
export const currencySchema = z
  .object({
    default: z
      .string()
      .regex(new RegExp('^[A-Z]{3}$'))
      .describe('ISO 4217 currency code (e.g. USD, PKR, EUR).'),
    supported: z
      .array(z.any())
      .min(1)
      .refine((arr) => arr.every((item, i) => arr.indexOf(item) == i), 'All items must be unique!'),
    display: z
      .object({
        symbolPosition: z.enum(['before', 'after']),
        decimalPlaces: z.number().int().gte(0).lte(4).default(2),
        thousandsSeparator: z.enum([',', '.', ' ', "'"]).default(','),
        decimalSeparator: z.enum(['.', ',']).default('.'),
      })
      .strict(),
    allowMultiCurrency: z
      .boolean()
      .describe('Enable checkout in non-default currencies.')
      .default(false),
    exchangeRateProvider: z.enum(['manual', 'openexchangerates', 'fixer', 'none']).default('none'),
  })
  .strict()
  .describe('Currency display, formatting, and multi-currency commerce settings.');

/** Validates `FeatureFlags` configuration. */
export const featureFlagsSchema = z
  .object({
    modules: z
      .object({
        catalog: z.boolean().default(true),
        cart: z.boolean().default(true),
        checkout: z.boolean().default(true),
        order: z.boolean().default(true),
        payment: z.boolean().default(true),
        customer: z.boolean().default(true),
        inventory: z.boolean().default(true),
        notification: z.boolean().default(true),
        media: z.boolean().default(true),
        reviews: z.boolean().default(false),
        wishlist: z.boolean().default(false),
        subscriptions: z.boolean().default(false),
        loyalty: z.boolean().default(false),
      })
      .strict()
      .describe('Core and vertical module activation map.'),
    flags: z.record(z.string(), z.boolean()).describe('Arbitrary feature flag key-value map.'),
    experiments: z
      .array(
        z
          .object({
            key: z.string().regex(new RegExp('^[a-z][a-z0-9-]*$')).max(64),
            enabled: z.boolean(),
            variants: z.record(z.string(), z.number().gte(0).lte(100)),
          })
          .strict(),
      )
      .optional(),
  })
  .strict()
  .describe('Tenant-level feature toggles and module activation flags.');

/** Validates `Authentication` configuration. */
export const authenticationSchema = z
  .object({
    customer: z
      .object({
        methods: z
          .object({
            email: z.boolean().default(true),
            phone: z.boolean().default(false),
            guestCheckout: z.boolean().default(true),
            social: z
              .object({
                google: z.boolean().default(false),
                apple: z.boolean().default(false),
                facebook: z.boolean().default(false),
              })
              .strict()
              .optional(),
          })
          .strict(),
        session: z
          .object({
            tokenTtlMinutes: z.number().int().gte(5).lte(43200).default(10080),
            refreshEnabled: z.boolean().default(true),
            maxDevices: z.number().int().gte(1).lte(50).default(5),
          })
          .strict(),
        mfa: z
          .object({
            required: z.boolean().default(false),
            methods: z
              .array(z.enum(['totp', 'sms', 'email']))
              .refine(
                (arr) => arr.every((item, i) => arr.indexOf(item) == i),
                'All items must be unique!',
              )
              .optional(),
          })
          .strict()
          .optional(),
      })
      .strict(),
    admin: z
      .object({
        methods: z
          .object({
            email: z.boolean().default(true),
            sso: z
              .object({
                enabled: z.boolean().default(false),
                provider: z.enum(['saml', 'oidc']).optional(),
                issuerUrl: z.string().url().max(2048).optional(),
              })
              .strict()
              .optional(),
          })
          .strict(),
        session: z
          .object({
            tokenTtlMinutes: z.number().int().gte(5).lte(1440).default(480),
            idleTimeoutMinutes: z.number().int().gte(5).lte(480).default(30),
          })
          .strict(),
        mfa: z
          .object({
            required: z.boolean().default(true),
            methods: z
              .array(z.enum(['totp', 'sms', 'email']))
              .min(1)
              .refine(
                (arr) => arr.every((item, i) => arr.indexOf(item) == i),
                'All items must be unique!',
              )
              .default(['totp']),
          })
          .strict(),
        defaultRoles: z
          .array(z.enum(['owner', 'admin', 'manager', 'staff', 'support']))
          .default(['owner', 'admin', 'manager', 'staff']),
      })
      .strict(),
    api: z
      .object({
        enabled: z.boolean().default(false),
        keyRotationDays: z.number().int().gte(30).lte(365).default(90),
        oauthClientCredentials: z.boolean().default(false),
      })
      .strict()
      .optional(),
  })
  .strict()
  .describe('Authentication methods, session policies, and RBAC defaults for the tenant.');

/** Validates `Payments` configuration. */
export const paymentsSchema = z
  .object({
    defaultGateway: z
      .enum(['stripe', 'paypal', 'razorpay', 'jazzcash', 'easypaisa', 'manual', 'custom'])
      .describe('Primary payment gateway for this tenant.'),
    methods: z
      .array(
        z.enum([
          'card',
          'wallet',
          'bank_transfer',
          'cash_on_delivery',
          'buy_now_pay_later',
          'apple_pay',
          'google_pay',
        ]),
      )
      .min(1)
      .refine((arr) => arr.every((item, i) => arr.indexOf(item) == i), 'All items must be unique!'),
    gateways: z
      .array(
        z
          .object({
            provider: z.enum([
              'stripe',
              'paypal',
              'razorpay',
              'jazzcash',
              'easypaisa',
              'manual',
              'custom',
            ]),
            enabled: z.boolean(),
            mode: z.enum(['sandbox', 'live']).default('sandbox'),
            credentialsRef: z
              .string()
              .regex(new RegExp('^[a-zA-Z0-9/_-]+$'))
              .describe('Reference to encrypted credentials in secrets store (not inline secrets).')
              .optional(),
            supportedMethods: z.array(z.string()).optional(),
          })
          .strict(),
      )
      .optional(),
    checkout: z
      .object({
        captureStrategy: z
          .enum(['immediate', 'authorize_then_capture', 'manual'])
          .default('immediate'),
        allowSplitPayment: z.boolean().default(false),
        minimumOrderAmount: z.number().gte(0).optional(),
        codEnabled: z.boolean().default(false),
        codMaxAmount: z.number().gte(0).optional(),
      })
      .strict(),
    refunds: z
      .object({
        autoApprove: z.boolean().default(false),
        windowDays: z.number().int().gte(0).lte(365).default(30),
      })
      .strict()
      .optional(),
  })
  .strict()
  .describe('Payment gateway configuration, accepted methods, and checkout payment policies.');

/** Validates `Notifications` configuration. */
export const notificationsSchema = z
  .object({
    channels: z
      .object({
        email: z.boolean().default(true),
        sms: z.boolean().default(false),
        push: z.boolean().default(false),
        whatsapp: z.boolean().default(false),
      })
      .strict(),
    sender: z
      .object({
        fromName: z.string().min(1).max(128),
        fromEmail: z.any(),
        replyTo: z.string().email().max(320).optional(),
        smsSenderId: z
          .string()
          .max(11)
          .describe('Alphanumeric SMS sender ID where supported.')
          .optional(),
      })
      .strict(),
    events: z
      .object({
        orderConfirmed: z.any().optional(),
        orderShipped: z.any().optional(),
        orderDelivered: z.any().optional(),
        orderCancelled: z.any().optional(),
        paymentFailed: z.any().optional(),
        passwordReset: z.any().optional(),
        welcomeCustomer: z.any().optional(),
      })
      .strict()
      .describe('Per-event channel enablement.'),
    templates: z
      .record(
        z.string(),
        z.object({
          subject: z.string().max(256).optional(),
          bodyRef: z.string().describe('Reference to template asset ID.').optional(),
        }),
      )
      .describe('Template overrides keyed by event name.')
      .optional(),
    quietHours: z
      .object({
        enabled: z.boolean().default(false),
        start: z
          .string()
          .regex(new RegExp('^([01]\\d|2[0-3]):[0-5]\\d$'))
          .describe('24h time HH:MM in tenant timezone.')
          .optional(),
        end: z.string().regex(new RegExp('^([01]\\d|2[0-3]):[0-5]\\d$')).optional(),
        channels: z.array(z.enum(['sms', 'push', 'whatsapp'])).optional(),
      })
      .strict()
      .optional(),
  })
  .strict()
  .describe('Notification channels, templates, and delivery policies for the tenant.');

/** Validates `Integrations` configuration. */
export const integrationsSchema = z
  .object({
    analytics: z
      .object({
        enabled: z.boolean().default(true),
        providers: z
          .array(
            z
              .object({
                name: z.enum(['google_analytics', 'mixpanel', 'segment', 'amplitude', 'custom']),
                enabled: z.boolean(),
                trackingId: z.string().max(256).optional(),
                credentialsRef: z.string().max(256).optional(),
              })
              .strict(),
          )
          .optional(),
      })
      .strict(),
    erp: z
      .object({
        enabled: z.boolean().default(false),
        provider: z.enum(['sap', 'oracle', 'dynamics', 'custom']).optional(),
        syncIntervalMinutes: z.number().int().gte(5).lte(1440).default(60),
        credentialsRef: z.string().optional(),
      })
      .strict()
      .optional(),
    pos: z
      .object({
        enabled: z.boolean().default(false),
        provider: z.string().max(128).optional(),
        credentialsRef: z.string().optional(),
      })
      .strict()
      .optional(),
    shipping: z
      .array(
        z
          .object({
            provider: z.enum(['manual', 'fedex', 'ups', 'dhl', 'tcs', 'leopards', 'custom']),
            enabled: z.boolean(),
            credentialsRef: z.string().optional(),
            default: z.boolean().default(false),
          })
          .strict(),
      )
      .optional(),
    webhooks: z
      .array(
        z
          .object({
            id: z.string().uuid().describe('RFC 4122 UUID identifier.'),
            url: z.string().url().max(2048),
            events: z.array(z.string().regex(new RegExp('^[a-z]+\\.[a-z]+(?:\\.[a-z]+)?$'))).min(1),
            enabled: z.boolean(),
            secretRef: z.string().describe('Reference to webhook signing secret.').optional(),
          })
          .strict(),
      )
      .optional(),
    plugins: z
      .array(
        z
          .object({
            id: z.string().regex(new RegExp('^[a-z0-9]+(?:\\.[a-z0-9]+)+$')),
            version: z
              .string()
              .regex(
                new RegExp(
                  '^(0|[1-9]\\d*)\\.(0|[1-9]\\d*)\\.(0|[1-9]\\d*)(?:-[\\w.]+)?(?:\\+[\\w.]+)?$',
                ),
              )
              .describe('Semantic version string.'),
            enabled: z.boolean(),
            settings: z
              .record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.null()]))
              .describe('Arbitrary key-value metadata for integrations and extensions.')
              .optional(),
          })
          .strict(),
      )
      .optional(),
  })
  .strict()
  .describe('Third-party service integrations: analytics, ERP, POS, shipping, and webhooks.');

/** Validates `AiSettings` configuration. */
export const aiSettingsSchema = z
  .object({
    enabled: z.boolean().describe('Master switch for AI features on this tenant.').default(true),
    provider: z
      .object({
        name: z.enum(['openai', 'anthropic', 'google', 'azure', 'custom']),
        model: z
          .string()
          .max(128)
          .describe('Model identifier (e.g. gpt-4o, claude-3-5-sonnet).')
          .optional(),
        credentialsRef: z
          .string()
          .describe('Reference to API credentials in secrets store.')
          .optional(),
      })
      .strict(),
    generation: z
      .object({
        allowedTargets: z
          .array(z.enum(['config', 'theme', 'catalog', 'navigation', 'copy', 'menu_import']))
          .min(1)
          .refine(
            (arr) => arr.every((item, i) => arr.indexOf(item) == i),
            'All items must be unique!',
          ),
        autoApply: z
          .boolean()
          .describe('If false, AI output requires human review before publish.')
          .default(false),
        maxTokensPerRequest: z.number().int().gte(256).lte(128000).default(4096),
      })
      .strict(),
    guardrails: z
      .object({
        lockedFields: z
          .array(z.string().regex(new RegExp('^[a-zA-Z][a-zA-Z0-9]*(\\.[a-zA-Z][a-zA-Z0-9]*)*$')))
          .describe(
            'JSON Pointer paths AI cannot modify after publish (e.g. payments.checkout.captureStrategy).',
          ),
        requireSchemaValidation: z.boolean().default(true),
        blockDirectDbWrites: z.boolean().default(true),
        auditAllSuggestions: z.boolean().default(true),
      })
      .strict(),
    copilot: z
      .object({
        adminEnabled: z.boolean().default(true),
        customerSupportEnabled: z.boolean().default(false),
        allowedActions: z
          .array(
            z.enum([
              'read_orders',
              'read_catalog',
              'update_catalog_draft',
              'generate_reports',
              'answer_faq',
            ]),
          )
          .optional(),
      })
      .strict()
      .optional(),
  })
  .strict()
  .describe('AI orchestration settings, generation policies, and locked-field governance.');

/** Validates `MobileAppSettings` configuration. */
export const mobileAppSettingsSchema = z
  .object({
    enabled: z.boolean().default(true),
    identity: z
      .object({
        bundleId: z
          .string()
          .regex(new RegExp('^[a-z][a-z0-9]*(\\.[a-z0-9]+)+$'))
          .max(256)
          .describe('iOS/Android bundle identifier (e.g. com.merchant.shop).'),
        appName: z.string().min(1).max(30).describe('App Store display name.'),
        version: z
          .string()
          .regex(
            new RegExp(
              '^(0|[1-9]\\d*)\\.(0|[1-9]\\d*)\\.(0|[1-9]\\d*)(?:-[\\w.]+)?(?:\\+[\\w.]+)?$',
            ),
          )
          .describe('Semantic version string.'),
        buildNumber: z.number().int().gte(1).optional(),
      })
      .strict(),
    storeListing: z
      .object({
        shortDescription: z.string().max(80).optional(),
        fullDescription: z.string().max(4000).optional(),
        keywords: z.array(z.string().max(64)).max(20).optional(),
        category: z.string().max(64).optional(),
        privacyPolicyUrl: z.string().url().max(2048).optional(),
      })
      .strict()
      .optional(),
    runtime: z
      .object({
        minOsVersion: z
          .object({
            ios: z.string().regex(new RegExp('^\\d+(\\.\\d+)*$')).default('15.0'),
            android: z.number().int().gte(21).default(24),
          })
          .strict(),
        otaUpdates: z
          .object({
            enabled: z.boolean().default(true),
            channel: z.enum(['development', 'staging', 'production']).default('production'),
          })
          .strict()
          .optional(),
        pushNotifications: z
          .object({
            enabled: z.boolean().default(false),
            provider: z.enum(['firebase', 'apns', 'onesignal', 'custom']).optional(),
          })
          .strict()
          .optional(),
        deepLinking: z
          .object({
            enabled: z.boolean().default(true),
            scheme: z.string().regex(new RegExp('^[a-z][a-z0-9+.-]*$')).max(32).optional(),
            universalLinksDomain: z.string().max(256).optional(),
          })
          .strict()
          .optional(),
      })
      .strict(),
  })
  .strict()
  .describe('React Native mobile application identity, store listing, and runtime settings.');

/** Validates `WebStoreSettings` configuration. */
export const webStoreSettingsSchema = z
  .object({
    enabled: z.boolean().default(true),
    domain: z
      .object({
        primary: z.string().max(256).describe('Primary custom domain (e.g. shop.merchant.com).'),
        aliases: z
          .array(z.string())
          .refine(
            (arr) => arr.every((item, i) => arr.indexOf(item) == i),
            'All items must be unique!',
          )
          .optional(),
        platformSubdomain: z
          .string()
          .regex(new RegExp('^[a-z0-9-]+\\.[a-z0-9.-]+$'))
          .describe('Platform-provided subdomain for starter tier.')
          .optional(),
        ssl: z
          .object({
            autoProvision: z.boolean().default(true),
            forceHttps: z.boolean().default(true),
          })
          .strict()
          .optional(),
      })
      .strict(),
    seo: z
      .object({
        title: z.string().min(1).max(70),
        description: z.string().min(1).max(160),
        keywords: z.array(z.string().max(64)).max(20).optional(),
        robotsIndex: z.boolean().default(true),
        sitemapEnabled: z.boolean().default(true),
        structuredData: z
          .object({
            organization: z.boolean().default(true),
            product: z.boolean().default(true),
            breadcrumb: z.boolean().default(true),
          })
          .strict()
          .optional(),
      })
      .strict(),
    pwa: z
      .object({
        enabled: z.boolean().default(true),
        displayMode: z.enum(['standalone', 'minimal-ui', 'browser']).default('standalone'),
        themeColor: z
          .string()
          .regex(new RegExp('^#(?:[0-9A-Fa-f]{3}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$'))
          .describe('CSS hex color (#RGB, #RRGGBB, or #RRGGBBAA).')
          .optional(),
        backgroundColor: z.any().optional(),
      })
      .strict()
      .optional(),
    rendering: z
      .object({
        mode: z.enum(['ssr', 'ssg', 'isr', 'spa']).default('ssr'),
        cacheTtlSeconds: z.number().int().gte(0).lte(86400).default(60),
      })
      .strict(),
    legal: z
      .object({
        termsOfServiceUrl: z.any().optional(),
        privacyPolicyUrl: z.any().optional(),
        refundPolicyUrl: z.string().url().max(2048).optional(),
        cookieConsent: z
          .object({
            enabled: z.boolean().default(false),
            regions: z
              .array(
                z
                  .string()
                  .regex(new RegExp('^[A-Z]{2}$'))
                  .describe('ISO 3166-1 alpha-2 country code.'),
              )
              .optional(),
          })
          .strict()
          .optional(),
      })
      .strict()
      .optional(),
  })
  .strict()
  .describe('Web storefront domain, SEO, PWA, and rendering configuration.');

/** Validates `AdminDashboardSettings` configuration. */
export const adminDashboardSettingsSchema = z
  .object({
    enabled: z.boolean().default(true),
    domain: z
      .object({
        primary: z
          .string()
          .max(256)
          .describe('Admin portal domain (e.g. admin.merchant.com).')
          .optional(),
        platformSubdomain: z.string().regex(new RegExp('^[a-z0-9-]+\\.[a-z0-9.-]+$')).optional(),
      })
      .strict()
      .optional(),
    layout: z
      .object({
        sidebarStyle: z.enum(['expanded', 'collapsed', 'mini']).default('expanded'),
        defaultLandingRoute: z.string().min(1).max(256).default('dashboard.overview'),
        widgets: z
          .array(
            z
              .object({
                id: z.string().regex(new RegExp('^[a-z0-9-]+$')).max(64),
                enabled: z.boolean(),
                position: z.number().int().gte(0).optional(),
                requiredRole: z.enum(['owner', 'admin', 'manager', 'staff', 'support']).optional(),
              })
              .strict(),
          )
          .optional(),
      })
      .strict(),
    preferences: z
      .object({
        dateFormat: z.enum(['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD']).default('DD/MM/YYYY'),
        timeFormat: z.enum(['12h', '24h']).default('12h'),
        rowsPerPage: z
          .union([z.literal(10), z.literal(25), z.literal(50), z.literal(100)])
          .default(25),
        enableBulkActions: z.boolean().default(true),
        enableExport: z.boolean().default(true),
      })
      .strict(),
    onboarding: z
      .object({
        showWizard: z.boolean().default(true),
        completedSteps: z
          .array(
            z.enum(['company_profile', 'branding', 'catalog', 'payments', 'shipping', 'go_live']),
          )
          .refine(
            (arr) => arr.every((item, i) => arr.indexOf(item) == i),
            'All items must be unique!',
          )
          .optional(),
      })
      .strict()
      .optional(),
  })
  .strict()
  .describe('Admin dashboard layout, widgets, RBAC visibility, and operational preferences.');

/** Validates `EnvironmentSettings` configuration. */
export const environmentSettingsSchema = z
  .object({
    current: z
      .enum(['development', 'staging', 'production'])
      .describe('Active environment for this configuration document.'),
    targets: z.object({ development: z.any(), staging: z.any(), production: z.any() }).strict(),
    overrides: z
      .object({
        development: z.any().optional(),
        staging: z.any().optional(),
        production: z.any().optional(),
      })
      .strict()
      .describe('Partial config overrides applied per environment at resolution time.')
      .optional(),
    promotionPolicy: z
      .object({
        requireApproval: z.boolean().default(true),
        allowedPaths: z
          .array(z.enum(['development->staging', 'staging->production']))
          .default(['development->staging', 'staging->production']),
        runValidationOnPromote: z.boolean().default(true),
      })
      .strict()
      .optional(),
  })
  .strict()
  .describe('Environment-specific overrides and deployment target configuration.');
