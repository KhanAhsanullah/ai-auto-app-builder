import type { AuthMethodId, AuthSurface } from '@ai-commerce/auth-client';

import type { GatewayCredentialValidator } from '../domain/auth-middleware.js';
import type { ExtractedCredentialKind } from '../domain/credential-extractor.js';
import type { GatewayAuthPrincipal } from '../types.js';

export interface InMemoryCredentialRecord {
  kind: ExtractedCredentialKind;
  credential: string;
  principal: GatewayAuthPrincipal;
  /** Optional tenant scope; when set, only matches that tenant. */
  tenantId?: string;
}

/** Test / local credential validator backed by an in-memory credential map. */
export class InMemoryCredentialValidator implements GatewayCredentialValidator {
  private readonly records = new Map<string, InMemoryCredentialRecord>();

  /** Register a credential → principal mapping. */
  seed(record: InMemoryCredentialRecord): void {
    this.records.set(keyFor(record.kind, record.credential, record.tenantId), record);
  }

  /** Register many credentials. */
  seedAll(records: readonly InMemoryCredentialRecord[]): void {
    for (const record of records) {
      this.seed(record);
    }
  }

  clear(): void {
    this.records.clear();
  }

  async validate(input: {
    kind: ExtractedCredentialKind;
    credential: string;
    tenantId?: string;
    surface: AuthSurface;
  }): Promise<GatewayAuthPrincipal | undefined> {
    const scoped = this.records.get(keyFor(input.kind, input.credential, input.tenantId));
    if (scoped) {
      return scoped.principal;
    }

    const unscoped = this.records.get(keyFor(input.kind, input.credential, undefined));
    if (!unscoped) {
      return undefined;
    }
    if (unscoped.tenantId && input.tenantId && unscoped.tenantId !== input.tenantId) {
      return undefined;
    }
    return unscoped.principal;
  }
}

/** Helper to build a bearer principal for tests. */
export function bearerPrincipal(input: {
  subject: string;
  surface: AuthSurface;
  method: AuthMethodId;
  expiresAt?: number;
  roles?: readonly string[];
}): GatewayAuthPrincipal {
  return {
    subject: input.subject,
    surface: input.surface,
    method: input.method,
    tokenType: 'bearer',
    expiresAt: input.expiresAt,
    roles: input.roles,
  };
}

function keyFor(kind: ExtractedCredentialKind, credential: string, tenantId?: string): string {
  return `${kind}:${tenantId ?? '*'}:${credential}`;
}
