import type { Authentication } from '@ai-commerce/config-schema';

import { AuthPolicyValidationException } from '../errors.js';

/**
 * Semantic validation for tenant authentication configuration.
 * Complements JSON Schema / Zod — enforces cross-field invariants.
 */
export class AuthPolicyValidator {
  /** Validate authentication config for all surfaces. */
  validate(authentication: Authentication): void {
    this.validateCustomer(authentication.customer);
    this.validateAdmin(authentication.admin);
    if (authentication.api) {
      this.validateApi(authentication.api);
    }
  }

  private validateCustomer(customer: Authentication['customer']): void {
    const { methods } = customer;
    const socialEnabled =
      methods.social?.google === true ||
      methods.social?.apple === true ||
      methods.social?.facebook === true;

    const hasIdentityMethod = methods.email || methods.phone || socialEnabled;

    if (!hasIdentityMethod && !methods.guestCheckout) {
      throw new AuthPolicyValidationException(
        'Customer authentication requires at least one identity method or guest checkout.',
      );
    }

    if (customer.mfa?.required === true) {
      const mfaMethods = customer.mfa.methods ?? [];
      if (mfaMethods.length === 0) {
        throw new AuthPolicyValidationException(
          'Customer MFA is required but no MFA methods are configured.',
        );
      }
    }

    if (customer.session.tokenTtlMinutes < 5) {
      throw new AuthPolicyValidationException(
        'Customer session tokenTtlMinutes must be at least 5.',
      );
    }
  }

  private validateAdmin(admin: Authentication['admin']): void {
    if (!admin.methods.email && admin.methods.sso?.enabled !== true) {
      throw new AuthPolicyValidationException(
        'Admin authentication requires email and/or enabled SSO.',
      );
    }

    const sso = admin.methods.sso;
    if (sso?.enabled === true) {
      if (!sso.provider) {
        throw new AuthPolicyValidationException(
          'Admin SSO is enabled but provider is missing (saml | oidc).',
        );
      }
      if (!sso.issuerUrl) {
        throw new AuthPolicyValidationException('Admin SSO is enabled but issuerUrl is missing.');
      }
    }

    if (admin.mfa.required) {
      const mfaMethods = admin.mfa.methods ?? [];
      if (mfaMethods.length === 0) {
        throw new AuthPolicyValidationException(
          'Admin MFA is required but no MFA methods are configured.',
        );
      }
    }
  }

  private validateApi(_api: NonNullable<Authentication['api']>): void {
    // API `enabled` implies API-key auth; oauthClientCredentials is optional.
  }
}
