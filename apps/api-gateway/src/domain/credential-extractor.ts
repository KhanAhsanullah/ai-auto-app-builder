/** Credential kinds extracted from inbound gateway headers. */
export type ExtractedCredentialKind = 'bearer' | 'session' | 'api_key';

/** Parsed auth credential from Authorization / cookie / API-key headers. */
export interface ExtractedCredential {
  kind: ExtractedCredentialKind;
  value: string;
}

export interface ExtractCredentialsOptions {
  /** Cookie name for session tokens. Default `cos_session`. */
  sessionCookieName?: string;
}

/**
 * Extract a single preferred credential from request headers.
 * Preference: Authorization Bearer → Authorization ApiKey → x-api-key → session cookie.
 */
export function extractCredentials(
  headers: Record<string, string | string[] | undefined>,
  options: ExtractCredentialsOptions = {},
): ExtractedCredential | undefined {
  const authorization = headerValue(headers, 'authorization');
  if (authorization) {
    const bearer = matchScheme(authorization, 'Bearer');
    if (bearer) {
      return { kind: 'bearer', value: bearer };
    }
    const apiKey = matchScheme(authorization, 'ApiKey');
    if (apiKey) {
      return { kind: 'api_key', value: apiKey };
    }
  }

  const apiKeyHeader = headerValue(headers, 'x-api-key');
  if (apiKeyHeader) {
    return { kind: 'api_key', value: apiKeyHeader };
  }

  const sessionCookieName = options.sessionCookieName ?? 'cos_session';
  const cookieHeader = headerValue(headers, 'cookie');
  if (cookieHeader) {
    const session = readCookie(cookieHeader, sessionCookieName);
    if (session) {
      return { kind: 'session', value: session };
    }
  }

  const sessionHeader = headerValue(headers, 'x-session-token');
  if (sessionHeader) {
    return { kind: 'session', value: sessionHeader };
  }

  return undefined;
}

function headerValue(
  headers: Record<string, string | string[] | undefined>,
  name: string,
): string | undefined {
  const raw = headers[name] ?? headers[name.toLowerCase()];
  if (Array.isArray(raw)) {
    return raw[0];
  }
  return raw;
}

function matchScheme(authorization: string, scheme: string): string | undefined {
  const prefix = `${scheme} `;
  if (authorization.length <= prefix.length) {
    return undefined;
  }
  if (authorization.slice(0, prefix.length).toLowerCase() !== prefix.toLowerCase()) {
    return undefined;
  }
  const value = authorization.slice(prefix.length).trim();
  return value.length > 0 ? value : undefined;
}

function readCookie(cookieHeader: string, name: string): string | undefined {
  const parts = cookieHeader.split(';');
  for (const part of parts) {
    const trimmed = part.trim();
    const eq = trimmed.indexOf('=');
    if (eq <= 0) {
      continue;
    }
    const key = trimmed.slice(0, eq).trim();
    if (key !== name) {
      continue;
    }
    const value = trimmed.slice(eq + 1).trim();
    if (!value) {
      return undefined;
    }
    try {
      return decodeURIComponent(value);
    } catch {
      return value;
    }
  }
  return undefined;
}
