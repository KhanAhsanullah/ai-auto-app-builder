import type { DemoLaunchVertical } from '@ai-commerce/web-store';

export interface BoomLaunchClientInput {
  businessName: string;
  vertical: DemoLaunchVertical;
  logoUrl?: string;
}

export interface BoomLaunchClientResult {
  tenantId: string;
  slug: string;
  name: string;
  vertical: DemoLaunchVertical;
  status: string;
  created: boolean;
}

export class BoomLaunchClientError extends Error {
  readonly statusCode?: number;

  constructor(message: string, statusCode?: number) {
    super(message);
    this.name = 'BoomLaunchClientError';
    this.statusCode = statusCode;
  }
}

const DEFAULT_BASE_URL = 'http://127.0.0.1:8787';

/** Resolve platform-api base URL (Vite: VITE_PLATFORM_API_URL). */
export function resolvePlatformApiBaseUrl(
  env: Record<string, string | undefined> = import.meta.env as Record<string, string | undefined>,
): string {
  const fromEnv = env.VITE_PLATFORM_API_URL?.trim();
  return (fromEnv || DEFAULT_BASE_URL).replace(/\/+$/, '');
}

/**
 * Call control-plane Boom launch and return the provisioned tenant summary.
 */
export async function launchBoomViaPlatformApi(
  input: BoomLaunchClientInput,
  options: {
    baseUrl?: string;
    fetchImpl?: typeof fetch;
  } = {},
): Promise<BoomLaunchClientResult> {
  const baseUrl = (options.baseUrl ?? resolvePlatformApiBaseUrl()).replace(/\/+$/, '');
  const fetchImpl = options.fetchImpl ?? globalThis.fetch;
  if (typeof fetchImpl !== 'function') {
    throw new BoomLaunchClientError('fetch is not available in this environment.');
  }

  let response: Response;
  try {
    response = await fetchImpl(`${baseUrl}/v1/boom/launch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        businessName: input.businessName,
        vertical: input.vertical,
        ...(input.logoUrl ? { logoUrl: input.logoUrl } : {}),
      }),
    });
  } catch {
    throw new BoomLaunchClientError(
      `Could not reach platform-api at ${baseUrl}. Start it with: pnpm --filter @ai-commerce/platform-api start`,
    );
  }

  const payload = (await response.json().catch(() => ({}))) as Record<string, unknown>;
  if (!response.ok) {
    const message =
      typeof payload.error === 'string'
        ? payload.error
        : `Boom launch failed (${response.status}).`;
    throw new BoomLaunchClientError(message, response.status);
  }

  const tenantId = typeof payload.tenantId === 'string' ? payload.tenantId : '';
  const slug = typeof payload.slug === 'string' ? payload.slug : '';
  const name = typeof payload.name === 'string' ? payload.name : input.businessName;
  const vertical = payload.vertical;
  if (!tenantId || !slug || typeof vertical !== 'string') {
    throw new BoomLaunchClientError('platform-api returned an incomplete Boom launch result.');
  }

  return {
    tenantId,
    slug,
    name,
    vertical: vertical as DemoLaunchVertical,
    status: typeof payload.status === 'string' ? payload.status : 'active',
    created: Boolean(payload.created),
  };
}
