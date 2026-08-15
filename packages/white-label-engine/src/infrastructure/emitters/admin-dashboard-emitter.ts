import type {
  AdminDashboardBrandArtifacts,
  BrandEmitter,
  NormalizedBrandAssets,
} from '../../types.js';

/** Emits admin dashboard surface brand asset references. */
export class AdminDashboardBrandEmitter implements BrandEmitter<'admin-dashboard'> {
  readonly surface = 'admin-dashboard' as const;

  emit(assets: NormalizedBrandAssets): AdminDashboardBrandArtifacts {
    return {
      surface: this.surface,
      headerLogoUrl: assets.logos.primary?.url,
      headerLogoInverseUrl: assets.logos.inverse?.url,
      faviconHref: assets.logos.favicon?.url,
      appIconSourceHref: assets.appIconSource?.source.url,
    };
  }
}
