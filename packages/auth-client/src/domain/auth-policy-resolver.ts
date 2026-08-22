import type { Authentication } from '@ai-commerce/config-schema';

import { AuthPolicyResolutionException } from '../errors.js';
import type {
  AuthMethodId,
  AuthSurface,
  ResolvedApiAuthPolicy,
  ResolvedAuthPolicy,
  ResolvedMfaPolicy,
  ResolvedSessionPolicy,
  ResolvedSsoPolicy,
  ResolveAuthPolicyInput,
} from '../types.js';
import { AuthPolicyValidator } from './auth-policy-validator.js';

export interface AuthPolicyResolverDeps {
  validator?: AuthPolicyValidator;
}

/**
 * Resolves a surface-scoped authentication policy from tenant authentication config.
 * Does not re-merge platform/vertical layers — callers pass Config Runtime output.
 */
export class AuthPolicyResolver {
  private readonly validator: AuthPolicyValidator;

  constructor(deps: AuthPolicyResolverDeps = {}) {
    this.validator = deps.validator ?? new AuthPolicyValidator();
  }

  /** Resolve and semantically validate the auth policy for a surface. */
  resolve(input: ResolveAuthPolicyInput): ResolvedAuthPolicy {
    this.validator.validate(input.authentication);

    switch (input.surface) {
      case 'customer':
        return this.resolveCustomer(input.authentication, input.tenantId);
      case 'admin':
        return this.resolveAdmin(input.authentication, input.tenantId);
      case 'api':
        return this.resolveApi(input.authentication, input.tenantId);
      default: {
        const exhaustive: never = input.surface;
        throw new AuthPolicyResolutionException(`Unknown auth surface: ${String(exhaustive)}`);
      }
    }
  }

  /** Return whether a method is enabled on the resolved policy. */
  isMethodEnabled(policy: ResolvedAuthPolicy, method: AuthMethodId): boolean {
    return policy.enabledMethods.includes(method);
  }

  private resolveCustomer(authentication: Authentication, tenantId?: string): ResolvedAuthPolicy {
    const customer = authentication.customer;
    const enabledMethods = this.collectCustomerMethods(customer);
    const session = this.resolveCustomerSession(customer.session);
    const mfa = this.resolveOptionalMfa(customer.mfa);

    return {
      tenantId,
      surface: 'customer',
      enabledMethods,
      session,
      ...(mfa ? { mfa } : {}),
    };
  }

  private resolveAdmin(authentication: Authentication, tenantId?: string): ResolvedAuthPolicy {
    const admin = authentication.admin;
    const enabledMethods = this.collectAdminMethods(admin);
    const session = this.resolveAdminSession(admin.session);
    const mfa = this.resolveRequiredMfa(admin.mfa);
    const sso = this.resolveSso(admin.methods.sso);

    return {
      tenantId,
      surface: 'admin',
      enabledMethods,
      session,
      mfa,
      ...(sso ? { sso } : {}),
      ...(admin.defaultRoles ? { defaultRoles: [...admin.defaultRoles] } : {}),
    };
  }

  private resolveApi(authentication: Authentication, tenantId?: string): ResolvedAuthPolicy {
    const api = authentication.api;
    if (!api) {
      return {
        tenantId,
        surface: 'api',
        enabledMethods: [],
        session: {
          tokenTtlMinutes: 60,
          refreshEnabled: false,
        },
        api: {
          enabled: false,
          keyRotationDays: 90,
          oauthClientCredentials: false,
        },
      };
    }

    const enabledMethods = this.collectApiMethods(api);
    const apiPolicy: ResolvedApiAuthPolicy = {
      enabled: api.enabled ?? false,
      keyRotationDays: api.keyRotationDays ?? 90,
      oauthClientCredentials: api.oauthClientCredentials ?? false,
    };

    return {
      tenantId,
      surface: 'api',
      enabledMethods,
      session: {
        tokenTtlMinutes: 60,
        refreshEnabled: false,
      },
      api: apiPolicy,
    };
  }

  private collectCustomerMethods(customer: Authentication['customer']): readonly AuthMethodId[] {
    const methods: AuthMethodId[] = [];
    if (customer.methods.email) methods.push('email');
    if (customer.methods.phone) methods.push('phone');
    if (customer.methods.guestCheckout) methods.push('guest');
    if (customer.methods.social?.google) methods.push('google');
    if (customer.methods.social?.apple) methods.push('apple');
    if (customer.methods.social?.facebook) methods.push('facebook');
    return methods;
  }

  private collectAdminMethods(admin: Authentication['admin']): readonly AuthMethodId[] {
    const methods: AuthMethodId[] = [];
    if (admin.methods.email) methods.push('email');
    if (admin.methods.sso?.enabled === true) methods.push('sso');
    return methods;
  }

  private collectApiMethods(api: NonNullable<Authentication['api']>): readonly AuthMethodId[] {
    if (api.enabled !== true) {
      return [];
    }
    const methods: AuthMethodId[] = ['api_key'];
    if (api.oauthClientCredentials === true) {
      methods.push('client_credentials');
    }
    return methods;
  }

  private resolveCustomerSession(
    session: Authentication['customer']['session'],
  ): ResolvedSessionPolicy {
    return {
      tokenTtlMinutes: session.tokenTtlMinutes,
      refreshEnabled: session.refreshEnabled ?? true,
      ...(session.maxDevices !== undefined ? { maxDevices: session.maxDevices } : {}),
    };
  }

  private resolveAdminSession(session: Authentication['admin']['session']): ResolvedSessionPolicy {
    return {
      tokenTtlMinutes: session.tokenTtlMinutes,
      refreshEnabled: false,
      ...(session.idleTimeoutMinutes !== undefined
        ? { idleTimeoutMinutes: session.idleTimeoutMinutes }
        : {}),
    };
  }

  private resolveOptionalMfa(
    mfa: Authentication['customer']['mfa'],
  ): ResolvedMfaPolicy | undefined {
    if (!mfa) {
      return undefined;
    }
    return {
      required: mfa.required ?? false,
      methods: [...(mfa.methods ?? [])],
    };
  }

  private resolveRequiredMfa(mfa: Authentication['admin']['mfa']): ResolvedMfaPolicy {
    return {
      required: mfa.required,
      methods: [...(mfa.methods ?? [])],
    };
  }

  private resolveSso(
    sso: Authentication['admin']['methods']['sso'],
  ): ResolvedSsoPolicy | undefined {
    if (sso?.enabled !== true || !sso.provider || !sso.issuerUrl) {
      return undefined;
    }
    return {
      enabled: true,
      provider: sso.provider,
      issuerUrl: sso.issuerUrl,
    };
  }
}

/** Type helper documenting surface parameter for callers. */
export type { AuthSurface };
