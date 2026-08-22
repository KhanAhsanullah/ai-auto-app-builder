import { AuthChallengeException } from '../errors.js';
import type {
  AuthChallengeStartResult,
  AuthTokenSet,
  MagicLinkChallengeRecord,
} from './auth-flow-types.js';
import type { MagicLinkDeliveryPort } from './ports.js';
import { generateOAuthState } from './pkce.js';
import type { AuthSurface, ResolvedAuthPolicy } from '../types.js';
import type { AuthProvider } from './auth-provider.js';

export interface MagicLinkProviderOptions {
  delivery: MagicLinkDeliveryPort;
  /** Base URL used to construct the magic link (e.g. https://app.example.com/auth/magic). */
  magicLinkBaseUrl: string;
  clock?: () => number;
  challengeTtlMs?: number;
  /** Access token TTL when completing a magic link (minutes). */
  tokenTtlMinutes?: number;
}

/** In-memory magic-link challenge store. */
export class InMemoryMagicLinkChallengeStore {
  private readonly byId = new Map<string, MagicLinkChallengeRecord>();

  async save(record: MagicLinkChallengeRecord): Promise<void> {
    this.byId.set(record.challengeId, record);
  }

  async findById(challengeId: string): Promise<MagicLinkChallengeRecord | undefined> {
    return this.byId.get(challengeId);
  }

  async delete(challengeId: string): Promise<void> {
    this.byId.delete(challengeId);
  }
}

/**
 * Email magic-link provider (implements the `email` auth method).
 * Delivers links via an injectable port — no live mailer required.
 */
export class MagicLinkProvider implements AuthProvider {
  readonly id = 'email' as const;
  readonly surfaces: readonly AuthSurface[] = ['customer', 'admin'];
  private readonly clock: () => number;
  private readonly challengeTtlMs: number;
  private readonly tokenTtlMinutes: number;
  private readonly store = new InMemoryMagicLinkChallengeStore();

  constructor(private readonly options: MagicLinkProviderOptions) {
    this.clock = options.clock ?? (() => Date.now());
    this.challengeTtlMs = options.challengeTtlMs ?? 15 * 60 * 1000;
    this.tokenTtlMinutes = options.tokenTtlMinutes ?? 60;
  }

  supports(policy: ResolvedAuthPolicy): boolean {
    return this.surfaces.includes(policy.surface) && policy.enabledMethods.includes('email');
  }

  /** Start a magic-link challenge and deliver the link. */
  async start(input: {
    email: string;
    surface: AuthSurface;
    tenantId?: string;
  }): Promise<AuthChallengeStartResult> {
    if (!input.email.includes('@')) {
      throw new AuthChallengeException('Magic link requires a valid email address.');
    }

    const challengeId = generateOAuthState(24);
    const record: MagicLinkChallengeRecord = {
      challengeId,
      surface: input.surface,
      tenantId: input.tenantId,
      email: input.email.toLowerCase(),
      createdAt: this.clock(),
    };

    await this.store.save(record);

    const magicLinkUrl = new URL(this.options.magicLinkBaseUrl);
    magicLinkUrl.searchParams.set('challengeId', challengeId);
    magicLinkUrl.searchParams.set('email', record.email);

    await this.options.delivery.send({
      email: record.email,
      magicLinkUrl: magicLinkUrl.toString(),
      challengeId,
    });

    return { challengeId };
  }

  /**
   * Complete a magic-link challenge.
   * `confirmationToken` must equal the challengeId (sent in the email link).
   */
  async complete(input: { challengeId: string; confirmationToken: string }): Promise<AuthTokenSet> {
    const record = await this.store.findById(input.challengeId);
    if (!record) {
      throw new AuthChallengeException(`Unknown magic-link challenge '${input.challengeId}'.`);
    }

    if (this.clock() - record.createdAt > this.challengeTtlMs) {
      await this.store.delete(input.challengeId);
      throw new AuthChallengeException(`Magic-link challenge '${input.challengeId}' has expired.`);
    }

    if (input.confirmationToken !== record.challengeId) {
      throw new AuthChallengeException('Magic-link confirmation token mismatch.');
    }

    await this.store.delete(input.challengeId);

    return {
      accessToken: `magic.${record.challengeId}.${generateOAuthState(16)}`,
      expiresAt: this.clock() + this.tokenTtlMinutes * 60 * 1000,
      tokenType: 'Bearer',
    };
  }

  /** Expose store for tests. */
  getChallengeStore(): InMemoryMagicLinkChallengeStore {
    return this.store;
  }
}
