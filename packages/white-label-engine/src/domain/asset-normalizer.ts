import type { Branding } from '@ai-commerce/config-schema';

import { AssetValidationException } from '../errors.js';
import type {
  AppIconResolvedFrom,
  AssetRole,
  NormalizedAssetRef,
  NormalizedBrandAssets,
  NormalizedFontAsset,
  ResolvedAppIconSource,
  ResolvedBrandResult,
} from '../types.js';
import {
  ASSET_EXTENSION_RULES,
  inferFormatFromUrl,
  parseAssetUrl,
  validateAssetExtension,
} from '../utils/asset-validation.js';

/** Normalizes resolved brand output into canonical asset references for compilation. */
export class AssetNormalizer {
  /** Produce normalized brand assets from a resolved brand result. */
  normalize(resolved: ResolvedBrandResult): NormalizedBrandAssets {
    const { branding, metadata } = resolved;

    const logos = {
      primary: this.normalizeLogoAsset(branding.logo?.primary, 'primary'),
      inverse: this.normalizeLogoAsset(branding.logo?.inverse, 'inverse'),
      favicon: this.normalizeIconAsset(
        branding.logo?.favicon,
        'favicon',
        ASSET_EXTENSION_RULES.favicon,
      ),
      appIcon: this.normalizeIconAsset(
        branding.logo?.appIcon,
        'app-icon',
        ASSET_EXTENSION_RULES.appIcon,
      ),
      appleTouchIcon: this.normalizeIconAsset(
        branding.logo?.appleTouchIcon,
        'apple-touch',
        ASSET_EXTENSION_RULES.appIcon,
      ),
    };

    const appIconSource = this.resolveAppIconSource(branding, logos);

    const splash =
      branding.splashScreen?.backgroundColor !== undefined ||
      branding.splashScreen?.imageUrl !== undefined
        ? {
            backgroundColor: branding.splashScreen.backgroundColor,
            image: branding.splashScreen.imageUrl
              ? this.normalizeImageAsset(
                  branding.splashScreen.imageUrl,
                  'splash-image',
                  'splash',
                  'splash',
                  ASSET_EXTENSION_RULES.splash,
                )
              : undefined,
          }
        : undefined;

    const social = branding.socialShare?.ogImageUrl
      ? {
          ogImage: this.normalizeImageAsset(
            branding.socialShare.ogImageUrl,
            'og-image',
            'social',
            'og-image',
            ASSET_EXTENSION_RULES.ogImage,
          ),
        }
      : undefined;

    const fonts = this.normalizeFonts(branding);

    return {
      logos,
      appIconSource,
      splash,
      social,
      fonts,
      metadata,
    };
  }

  private normalizeLogoAsset(
    url: string | undefined,
    role: Extract<AssetRole, 'primary' | 'inverse'>,
  ): NormalizedAssetRef | undefined {
    if (!url) {
      return undefined;
    }

    const format = validateAssetExtension(url, ASSET_EXTENSION_RULES.logo);

    return {
      id: `logo-${role}`,
      url,
      kind: 'logo',
      role,
      format,
    };
  }

  private normalizeIconAsset(
    url: string | undefined,
    role: Extract<AssetRole, 'favicon' | 'app-icon' | 'apple-touch'>,
    allowedExtensions: readonly string[],
  ): NormalizedAssetRef | undefined {
    if (!url) {
      return undefined;
    }

    const format = validateAssetExtension(url, allowedExtensions);

    return {
      id: role === 'favicon' ? 'favicon' : role === 'app-icon' ? 'app-icon' : 'apple-touch-icon',
      url,
      kind: 'icon',
      role,
      format,
    };
  }

  private normalizeImageAsset(
    url: string,
    id: string,
    kind: NormalizedAssetRef['kind'],
    role: AssetRole,
    allowedExtensions: readonly string[],
  ): NormalizedAssetRef {
    const format = validateAssetExtension(url, allowedExtensions);

    return {
      id,
      url,
      kind,
      role,
      format,
    };
  }

  private normalizeFonts(branding: Branding): NormalizedBrandAssets['fonts'] | undefined {
    const heading = branding.fonts?.heading
      ? this.normalizeFontAsset(branding.fonts.heading, 'heading')
      : undefined;
    const body = branding.fonts?.body
      ? this.normalizeFontAsset(branding.fonts.body, 'body')
      : undefined;

    if (!heading && !body) {
      return undefined;
    }

    return { heading, body };
  }

  private normalizeFontAsset(
    font: NonNullable<NonNullable<Branding['fonts']>['heading']>,
    role: 'heading' | 'body',
  ): NormalizedFontAsset {
    parseAssetUrl(font.url);

    const format = font.format ?? inferFormatFromUrl(font.url);
    if (!format || !(ASSET_EXTENSION_RULES.font as readonly string[]).includes(format)) {
      throw new AssetValidationException(
        `Font asset URL "${font.url}" has unsupported format "${format || 'unknown'}". Allowed: ${ASSET_EXTENSION_RULES.font.join(', ')}`,
      );
    }

    return {
      id: `font-${role}`,
      url: font.url,
      kind: 'font',
      role,
      format,
      weight: font.weight,
      style: font.style,
    };
  }

  private resolveAppIconSource(
    branding: Branding,
    logos: NormalizedBrandAssets['logos'],
  ): ResolvedAppIconSource | undefined {
    const candidates: Array<{
      resolvedFrom: AppIconResolvedFrom;
      url: string | undefined;
      normalized?: NormalizedAssetRef;
    }> = [
      { resolvedFrom: 'appIcon', url: branding.logo?.appIcon, normalized: logos.appIcon },
      {
        resolvedFrom: 'appleTouchIcon',
        url: branding.logo?.appleTouchIcon,
        normalized: logos.appleTouchIcon,
      },
      { resolvedFrom: 'primary', url: branding.logo?.primary, normalized: logos.primary },
    ];

    for (const candidate of candidates) {
      if (!candidate.url) {
        continue;
      }

      const source =
        candidate.normalized ??
        this.normalizeIconAsset(candidate.url, 'app-icon', ASSET_EXTENSION_RULES.appIcon);

      if (!source) {
        continue;
      }

      return {
        source: {
          ...source,
          id: 'app-icon-source',
          role: 'app-icon',
        },
        resolvedFrom: candidate.resolvedFrom,
      };
    }

    return undefined;
  }
}
