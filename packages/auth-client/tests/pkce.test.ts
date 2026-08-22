import { createHash } from 'node:crypto';

import { describe, expect, it } from 'vitest';

import {
  base64UrlEncode,
  buildAuthorizationUrl,
  generateCodeChallenge,
  generateCodeVerifier,
  generateOAuthState,
} from '../src/domain/pkce.js';

describe('PKCE utilities', () => {
  it('generates verifiers and matching S256 challenges', () => {
    const verifier = generateCodeVerifier();
    expect(verifier.length).toBeGreaterThanOrEqual(43);

    const challenge = generateCodeChallenge(verifier);
    const expected = base64UrlEncode(createHash('sha256').update(verifier, 'utf8').digest());
    expect(challenge).toBe(expected);
  });

  it('rejects invalid verifier byte lengths', () => {
    expect(() => generateCodeVerifier(8)).toThrow(RangeError);
  });

  it('builds authorization URLs with query params', () => {
    const url = buildAuthorizationUrl('https://idp.example.com/authorize', {
      client_id: 'abc',
      state: 'xyz',
    });
    expect(url).toContain('https://idp.example.com/authorize?');
    expect(url).toContain('client_id=abc');
    expect(url).toContain('state=xyz');
  });

  it('generates unique states', () => {
    expect(generateOAuthState()).not.toBe(generateOAuthState());
  });
});
