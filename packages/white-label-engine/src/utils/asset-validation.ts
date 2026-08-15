import { AssetValidationException } from '../errors.js';

const ALLOWED_PROTOCOLS = new Set(['http:', 'https:']);

/** Parse and validate an asset URL uses an allowed HTTP(S) scheme. */
export function parseAssetUrl(url: string): URL {
  let parsed: URL;

  try {
    parsed = new URL(url);
  } catch {
    throw new AssetValidationException(`Invalid asset URL: ${url}`);
  }

  if (!ALLOWED_PROTOCOLS.has(parsed.protocol)) {
    throw new AssetValidationException(`Unsupported asset URL protocol: ${parsed.protocol}`);
  }

  return parsed;
}

/** Infer a lowercase file extension from an asset URL pathname. */
export function inferFormatFromUrl(url: string): string {
  parseAssetUrl(url);
  const pathname = new URL(url).pathname;
  const segment = pathname.split('/').pop() ?? '';
  const dotIndex = segment.lastIndexOf('.');

  if (dotIndex === -1 || dotIndex === segment.length - 1) {
    return '';
  }

  return segment.slice(dotIndex + 1).toLowerCase();
}

/** Validate an asset URL and ensure its extension is allowed for the asset kind. */
export function validateAssetExtension(url: string, allowedExtensions: readonly string[]): string {
  parseAssetUrl(url);
  const format = inferFormatFromUrl(url);

  if (!format || !allowedExtensions.includes(format)) {
    throw new AssetValidationException(
      `Asset URL "${url}" has unsupported format "${format || 'unknown'}". Allowed: ${allowedExtensions.join(', ')}`,
    );
  }

  return format;
}

/** Allowed extensions grouped by normalized asset role. */
export const ASSET_EXTENSION_RULES = {
  logo: ['svg', 'png', 'jpg', 'jpeg', 'webp', 'gif'],
  favicon: ['ico', 'png', 'svg'],
  appIcon: ['png', 'jpg', 'jpeg', 'webp', 'svg'],
  splash: ['png', 'jpg', 'jpeg', 'webp'],
  ogImage: ['png', 'jpg', 'jpeg', 'webp', 'gif'],
  font: ['woff2', 'woff', 'ttf', 'otf'],
} as const;
