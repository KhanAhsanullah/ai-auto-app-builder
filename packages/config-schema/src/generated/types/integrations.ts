/**
 * AUTO-GENERATED FILE — DO NOT EDIT DIRECTLY.
 * Source: schemas/ (JSON Schema v1)
 * Regenerate: pnpm --filter @ai-commerce/config-schema generate
 */

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
 * Arbitrary key-value metadata for integrations and extensions.
 */
export interface Metadata {
  [k: string]: string | number | boolean | null;
}
