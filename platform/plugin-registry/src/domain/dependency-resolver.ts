import semver from 'semver';

import {
  PluginCatalogNotFoundException,
  PluginDependencyCycleException,
  PluginDependencyUnresolvedException,
} from '../errors.js';
import type { ResolvedPluginDependency } from '../types.js';
import type { PluginCatalogRepository } from './plugin-catalog-repository.js';

export interface DependencyResolutionResult {
  pluginId: string;
  version: string;
  resolved: ResolvedPluginDependency[];
}

/** Resolves manifest dependency ranges to exact catalog versions with cycle detection. */
export class DependencyResolver {
  constructor(private readonly catalogRepository: PluginCatalogRepository) {}

  /** Resolve transitive dependencies for a catalog plugin version. */
  async resolve(pluginId: string, version: string): Promise<DependencyResolutionResult> {
    const root = await this.catalogRepository.findByIdAndVersion(pluginId, version);

    if (!root) {
      throw new PluginCatalogNotFoundException(pluginId, version);
    }

    const resolved: ResolvedPluginDependency[] = [];
    const resolvedIds = new Set<string>();
    const stack = new Set<string>();

    await this.resolveNode(root.manifest.id, root.version, stack, resolved, resolvedIds);

    return {
      pluginId,
      version,
      resolved,
    };
  }

  private async resolveNode(
    pluginId: string,
    version: string,
    stack: Set<string>,
    resolved: ResolvedPluginDependency[],
    resolvedIds: Set<string>,
  ): Promise<void> {
    const key = this.nodeKey(pluginId, version);

    if (stack.has(key)) {
      throw new PluginDependencyCycleException(pluginId, version);
    }

    const record = await this.catalogRepository.findByIdAndVersion(pluginId, version);

    if (!record) {
      throw new PluginCatalogNotFoundException(pluginId, version);
    }

    stack.add(key);

    for (const dependency of record.manifest.dependencies ?? []) {
      if (resolvedIds.has(dependency.id)) {
        continue;
      }

      const resolvedVersion = await this.resolveDependencyVersion(
        dependency.id,
        dependency.versionRange,
      );

      await this.resolveNode(dependency.id, resolvedVersion, stack, resolved, resolvedIds);

      resolved.push({
        pluginId: dependency.id,
        requestedRange: dependency.versionRange,
        resolvedVersion,
      });
      resolvedIds.add(dependency.id);
    }

    stack.delete(key);
  }

  private async resolveDependencyVersion(pluginId: string, versionRange: string): Promise<string> {
    const catalogVersions = await this.catalogRepository.listById(pluginId);
    const satisfying = catalogVersions
      .filter((record) => semver.satisfies(record.version, versionRange))
      .sort((left, right) => semver.rcompare(left.version, right.version));

    if (satisfying.length === 0) {
      throw new PluginDependencyUnresolvedException(pluginId, versionRange);
    }

    return satisfying[0]!.version;
  }

  private nodeKey(pluginId: string, version: string): string {
    return `${pluginId}@${version}`;
  }
}
