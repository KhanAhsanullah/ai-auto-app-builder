import type { BrandEmitterRegistry } from '../domain/brand-emitter-registry.js';
import { BrandCompilationException } from '../errors.js';
import type {
  AnyBrandEmitter,
  BrandSurface,
  CompiledSurfaceArtifacts,
  NormalizedBrandAssets,
} from '../types.js';
import { AdminDashboardBrandEmitter } from './emitters/admin-dashboard-emitter.js';
import { MobileBrandEmitter } from './emitters/mobile-emitter.js';
import { WebBrandEmitter } from './emitters/web-emitter.js';

/** Default registry wiring all built-in brand surface emitters. */
export class DefaultBrandEmitterRegistry implements BrandEmitterRegistry {
  private readonly emitters = new Map<BrandSurface, AnyBrandEmitter>();

  constructor(emitters?: AnyBrandEmitter[]) {
    const defaults: AnyBrandEmitter[] = emitters ?? [
      new WebBrandEmitter(),
      new MobileBrandEmitter(),
      new AdminDashboardBrandEmitter(),
    ];

    for (const emitter of defaults) {
      this.emitters.set(emitter.surface, emitter);
    }
  }

  emit<T extends BrandSurface>(
    surface: T,
    assets: NormalizedBrandAssets,
  ): CompiledSurfaceArtifacts[T] {
    const emitter = this.emitters.get(surface);

    if (!emitter) {
      throw new BrandCompilationException(`No emitter registered for surface: ${surface}`);
    }

    return emitter.emit(assets) as CompiledSurfaceArtifacts[T];
  }

  has(surface: BrandSurface): boolean {
    return this.emitters.has(surface);
  }
}
