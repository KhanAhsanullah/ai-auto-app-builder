import type {
  LivePreviewOptions,
  LivePreviewResult,
  ResolveThemeInput,
  ThemePatch,
} from '../types.js';
import { deepMerge } from '../utils/deep-merge.js';
import { ThemeResolver } from './theme-resolver.js';

/**
 * Coordinates in-memory theme preview for the future White-Label Builder.
 * Applies draft patches without persisting configuration.
 */
export class LivePreviewCoordinator {
  constructor(private readonly resolver: ThemeResolver = new ThemeResolver()) {}

  /**
   * Preview a draft theme patch merged over the current base configuration.
   * Uses the same resolver pipeline as production — no cache, no persistence.
   */
  preview(
    base: ResolveThemeInput,
    draftPatch: ThemePatch,
    options: LivePreviewOptions = {},
  ): LivePreviewResult {
    const mergedTenantTheme = deepMerge(base.tenantTheme ?? {}, draftPatch);

    const resolved = this.resolver.resolve({
      ...base,
      tenantTheme: mergedTenantTheme,
    });

    if (options.skipMetadata) {
      return {
        ...resolved,
        preview: true,
        draftPatch,
      };
    }

    return {
      ...resolved,
      preview: true,
      draftPatch,
    };
  }

  /** Access the underlying resolver for preset/plugin extension points. */
  getResolver(): ThemeResolver {
    return this.resolver;
  }
}
