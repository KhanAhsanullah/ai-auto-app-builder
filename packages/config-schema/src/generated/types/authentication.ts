/**
 * AUTO-GENERATED FILE — DO NOT EDIT DIRECTLY.
 * Source: schemas/ (JSON Schema v1)
 * Regenerate: pnpm --filter @ai-commerce/config-schema generate
 */

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
