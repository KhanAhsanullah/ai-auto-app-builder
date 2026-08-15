import type {
  NormalizedBrandAssets,
  WebBrandLinkDescriptor,
  WebBrandArtifacts,
} from '../../types.js';
import type { BrandEmitter } from '../../types.js';
import { buildFontFaceCss, mimeTypeForFormat } from './emitter-utils.js';

/** Emits web surface brand asset references and HTML link descriptors. */
export class WebBrandEmitter implements BrandEmitter<'web'> {
  readonly surface = 'web' as const;

  emit(assets: NormalizedBrandAssets): WebBrandArtifacts {
    const links: WebBrandLinkDescriptor[] = [];

    if (assets.logos.favicon) {
      links.push({
        rel: 'icon',
        href: assets.logos.favicon.url,
        type: mimeTypeForFormat(assets.logos.favicon.format, 'image'),
      });
    }

    if (assets.logos.appleTouchIcon) {
      links.push({
        rel: 'apple-touch-icon',
        href: assets.logos.appleTouchIcon.url,
      });
    }

    if (assets.appIconSource) {
      links.push({
        rel: 'icon',
        href: assets.appIconSource.source.url,
        sizes: '192x192',
        type: mimeTypeForFormat(assets.appIconSource.source.format, 'image'),
      });
    }

    if (assets.social?.ogImage) {
      links.push({
        rel: 'image_src',
        href: assets.social.ogImage.url,
      });
    }

    const fontFaceCss = buildFontFaceCss(assets.fonts);

    return {
      surface: this.surface,
      faviconHref: assets.logos.favicon?.url,
      appleTouchIconHref: assets.logos.appleTouchIcon?.url,
      logoPrimaryHref: assets.logos.primary?.url,
      logoInverseHref: assets.logos.inverse?.url,
      appIconSourceHref: assets.appIconSource?.source.url,
      appIconResolvedFrom: assets.appIconSource?.resolvedFrom,
      splashBackgroundColor: assets.splash?.backgroundColor,
      splashImageHref: assets.splash?.image?.url,
      ogImageHref: assets.social?.ogImage?.url,
      fontFaceCss,
      links,
    };
  }
}
