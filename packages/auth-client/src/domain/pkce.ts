import { createHash, randomBytes } from 'node:crypto';

/** Encode bytes as base64url without padding (RFC 7636). */
export function base64UrlEncode(buffer: Buffer): string {
  return buffer.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/u, '');
}

/** Generate a high-entropy PKCE code_verifier. */
export function generateCodeVerifier(byteLength = 32): string {
  if (byteLength < 32 || byteLength > 96) {
    throw new RangeError('PKCE code_verifier byte length must be between 32 and 96.');
  }
  return base64UrlEncode(randomBytes(byteLength));
}

/** Generate S256 code_challenge for a verifier. */
export function generateCodeChallenge(verifier: string): string {
  return base64UrlEncode(createHash('sha256').update(verifier, 'utf8').digest());
}

/** Generate an opaque OAuth state / nonce value. */
export function generateOAuthState(byteLength = 16): string {
  return base64UrlEncode(randomBytes(byteLength));
}

/** Build an authorization URL with query parameters. */
export function buildAuthorizationUrl(
  authorizationEndpoint: string,
  params: Record<string, string>,
): string {
  const url = new URL(authorizationEndpoint);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  return url.toString();
}
