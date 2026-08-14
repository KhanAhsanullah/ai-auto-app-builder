import type { BrandPatch } from '../types.js';
import platformBrand from './presets/default.json' with { type: 'json' };

/** Platform-wide branding baseline applied before vertical and tenant layers. */
export const BRAND_PLATFORM_DEFAULTS: BrandPatch = platformBrand;
