import type { BrandEmitter, MobileBrandArtifacts, NormalizedBrandAssets } from '../../types.js';

const DEFAULT_ICON_SIZE_SPECS: MobileBrandArtifacts['iconSizesSpec'] = [
  { size: 1024, purpose: 'app-icon' },
  { size: 512, purpose: 'app-icon' },
  { size: 192, purpose: 'adaptive-icon' },
  { size: 96, purpose: 'notification' },
];

/** Emits mobile surface brand asset references and icon size metadata. */
export class MobileBrandEmitter implements BrandEmitter<'mobile'> {
  readonly surface = 'mobile' as const;

  emit(assets: NormalizedBrandAssets): MobileBrandArtifacts {
    return {
      surface: this.surface,
      appIconSourceUrl: assets.appIconSource?.source.url,
      appIconResolvedFrom: assets.appIconSource?.resolvedFrom,
      iconSizesSpec: assets.appIconSource ? DEFAULT_ICON_SIZE_SPECS : [],
      splash: {
        backgroundColor: assets.splash?.backgroundColor,
        imageUrl: assets.splash?.image?.url,
      },
      logoPrimaryUrl: assets.logos.primary?.url,
      fonts: assets.fonts,
    };
  }
}
