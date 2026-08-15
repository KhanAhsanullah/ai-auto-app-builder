import type { BrandEmitterRegistry } from '../domain/brand-emitter-registry.js';
import { BrandCompiler } from '../domain/brand-compiler.js';
import { BrandResolver } from '../domain/brand-resolver.js';
import { WhiteLabelProvider } from '../domain/white-label-provider.js';
import type { WhiteLabelProviderOptions } from '../types.js';
import { DefaultBrandEmitterRegistry } from './brand-emitter-registry.js';

/** Options for creating a WhiteLabelProvider with default infrastructure wiring. */
export interface CreateWhiteLabelProviderOptions extends WhiteLabelProviderOptions {
  resolver?: BrandResolver;
  emitterRegistry?: BrandEmitterRegistry;
}

/** Create a WhiteLabelProvider with default resolver, compiler, and emitter registry wiring. */
export function createWhiteLabelProvider(
  options?: CreateWhiteLabelProviderOptions,
): WhiteLabelProvider {
  const resolver = options?.resolver ?? new BrandResolver();
  const compiler = new BrandCompiler({
    resolver,
    emitterRegistry: options?.emitterRegistry ?? new DefaultBrandEmitterRegistry(),
    cache: options?.cache,
  });

  return new WhiteLabelProvider(resolver, compiler);
}
