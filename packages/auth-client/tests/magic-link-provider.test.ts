import { describe, expect, it } from 'vitest';

import { MagicLinkProvider } from '../src/domain/magic-link-provider.js';
import { AuthChallengeException } from '../src/errors.js';
import type { MagicLinkDeliveryPort } from '../src/domain/ports.js';

describe('MagicLinkProvider', () => {
  it('delivers a magic link and completes with the challenge token', async () => {
    const sent: Array<{ email: string; magicLinkUrl: string; challengeId: string }> = [];
    const delivery: MagicLinkDeliveryPort = {
      async send(input) {
        sent.push(input);
      },
    };

    const provider = new MagicLinkProvider({
      delivery,
      magicLinkBaseUrl: 'https://app.example.com/auth/magic',
      clock: () => 1_000_000,
      tokenTtlMinutes: 30,
    });

    const started = await provider.start({
      email: 'User@Example.com',
      surface: 'customer',
      tenantId: 't1',
    });

    expect(sent).toHaveLength(1);
    expect(sent[0]?.email).toBe('user@example.com');
    expect(sent[0]?.magicLinkUrl).toContain(`challengeId=${started.challengeId}`);

    const tokens = await provider.complete({
      challengeId: started.challengeId,
      confirmationToken: started.challengeId,
    });

    expect(tokens.accessToken.startsWith('magic.')).toBe(true);
    expect(tokens.expiresAt).toBe(1_000_000 + 30 * 60 * 1000);
  });

  it('rejects invalid confirmation tokens', async () => {
    const provider = new MagicLinkProvider({
      delivery: {
        async send() {
          return;
        },
      },
      magicLinkBaseUrl: 'https://app.example.com/auth/magic',
    });

    const started = await provider.start({
      email: 'a@b.com',
      surface: 'customer',
    });

    await expect(
      provider.complete({
        challengeId: started.challengeId,
        confirmationToken: 'nope',
      }),
    ).rejects.toThrow(AuthChallengeException);
  });
});
