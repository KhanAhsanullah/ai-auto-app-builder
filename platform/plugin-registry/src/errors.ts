/** Base error for plugin registry failures. */
export class PluginRegistryException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PluginRegistryException';
  }
}

/** Thrown when a plugin manifest fails schema or semantic validation. */
export class PluginManifestValidationException extends PluginRegistryException {
  constructor(message: string) {
    super(message);
    this.name = 'PluginManifestValidationException';
  }
}

/** Thrown when a plugin id and version are already registered with different content. */
export class PluginAlreadyRegisteredException extends PluginRegistryException {
  readonly pluginId: string;
  readonly version: string;

  constructor(pluginId: string, version: string, message?: string) {
    super(
      message ??
        `Plugin already registered with id '${pluginId}' and version '${version}' and a different manifest.`,
    );
    this.name = 'PluginAlreadyRegisteredException';
    this.pluginId = pluginId;
    this.version = version;
  }
}

/** Thrown when saving a duplicate catalog record through the repository port. */
export class PluginCatalogDuplicateException extends PluginRegistryException {
  readonly pluginId: string;
  readonly version: string;

  constructor(pluginId: string, version: string) {
    super(`Plugin catalog already contains id '${pluginId}' at version '${version}'.`);
    this.name = 'PluginCatalogDuplicateException';
    this.pluginId = pluginId;
    this.version = version;
  }
}

/** Thrown when filesystem discovery fails at the root path. */
export class PluginDiscoveryException extends PluginRegistryException {
  constructor(message: string) {
    super(message);
    this.name = 'PluginDiscoveryException';
  }
}

/** Thrown when a catalog lookup misses during install or dependency resolution. */
export class PluginCatalogNotFoundException extends PluginRegistryException {
  readonly pluginId: string;
  readonly version: string;

  constructor(pluginId: string, version: string) {
    super(`Plugin catalog does not contain id '${pluginId}' at version '${version}'.`);
    this.name = 'PluginCatalogNotFoundException';
    this.pluginId = pluginId;
    this.version = version;
  }
}

/** Thrown when no catalog version satisfies a dependency range. */
export class PluginDependencyUnresolvedException extends PluginRegistryException {
  readonly pluginId: string;
  readonly versionRange: string;

  constructor(pluginId: string, versionRange: string) {
    super(`No catalog version satisfies dependency '${pluginId}' with range '${versionRange}'.`);
    this.name = 'PluginDependencyUnresolvedException';
    this.pluginId = pluginId;
    this.versionRange = versionRange;
  }
}

/** Thrown when transitive dependency resolution detects a cycle. */
export class PluginDependencyCycleException extends PluginRegistryException {
  readonly pluginId: string;
  readonly version: string;

  constructor(pluginId: string, version: string) {
    super(`Circular plugin dependency detected at '${pluginId}' version '${version}'.`);
    this.name = 'PluginDependencyCycleException';
    this.pluginId = pluginId;
    this.version = version;
  }
}

/** Thrown when tenant config declaration does not match the install request. */
export class TenantPluginConfigMismatchException extends PluginRegistryException {
  readonly tenantId: string;
  readonly pluginId: string;
  readonly version: string;

  constructor(tenantId: string, pluginId: string, version: string, message?: string) {
    super(
      message ??
        `Tenant config plugins declaration does not match install request for '${pluginId}' version '${version}' on tenant '${tenantId}'.`,
    );
    this.name = 'TenantPluginConfigMismatchException';
    this.tenantId = tenantId;
    this.pluginId = pluginId;
    this.version = version;
  }
}

/** Thrown when install input settings conflict with tenant config settings. */
export class PluginSettingsConflictException extends PluginRegistryException {
  readonly tenantId: string;
  readonly pluginId: string;

  constructor(tenantId: string, pluginId: string) {
    super(
      `Install settings conflict with tenant config settings for plugin '${pluginId}' on tenant '${tenantId}'.`,
    );
    this.name = 'PluginSettingsConflictException';
    this.tenantId = tenantId;
    this.pluginId = pluginId;
  }
}

/** Thrown when plugin settings fail manifest configSchema validation. */
export class PluginSettingsValidationException extends PluginRegistryException {
  constructor(message: string) {
    super(message);
    this.name = 'PluginSettingsValidationException';
  }
}

/** Thrown when a tenant plugin binding already exists with different install content. */
export class TenantPluginAlreadyInstalledException extends PluginRegistryException {
  readonly tenantId: string;
  readonly pluginId: string;

  constructor(tenantId: string, pluginId: string) {
    super(
      `Tenant '${tenantId}' already has plugin '${pluginId}' installed with different content.`,
    );
    this.name = 'TenantPluginAlreadyInstalledException';
    this.tenantId = tenantId;
    this.pluginId = pluginId;
  }
}

/** Thrown when a tenant plugin binding is not found. */
export class PluginNotInstalledException extends PluginRegistryException {
  readonly tenantId: string;
  readonly pluginId: string;

  constructor(tenantId: string, pluginId: string) {
    super(`Plugin '${pluginId}' is not installed for tenant '${tenantId}'.`);
    this.name = 'PluginNotInstalledException';
    this.tenantId = tenantId;
    this.pluginId = pluginId;
  }
}

/** Thrown when a tenant plugin lifecycle transition is not allowed. */
export class InvalidPluginLifecycleTransitionException extends PluginRegistryException {
  readonly tenantId: string;
  readonly pluginId: string;
  readonly fromStatus: string;
  readonly toStatus: string;

  constructor(tenantId: string, pluginId: string, fromStatus: string, toStatus: string) {
    super(
      `Invalid plugin lifecycle transition for tenant '${tenantId}' plugin '${pluginId}': ${fromStatus} -> ${toStatus}.`,
    );
    this.name = 'InvalidPluginLifecycleTransitionException';
    this.tenantId = tenantId;
    this.pluginId = pluginId;
    this.fromStatus = fromStatus;
    this.toStatus = toStatus;
  }
}

/** Thrown when saving a duplicate tenant plugin binding through the repository port. */
export class TenantPluginDuplicateException extends PluginRegistryException {
  readonly tenantId: string;
  readonly pluginId: string;

  constructor(tenantId: string, pluginId: string) {
    super(`Tenant '${tenantId}' already has a binding for plugin '${pluginId}'.`);
    this.name = 'TenantPluginDuplicateException';
    this.tenantId = tenantId;
    this.pluginId = pluginId;
  }
}

/** Thrown when enable requires a host handler that was never registered. */
export class PluginHandlerNotRegisteredException extends PluginRegistryException {
  readonly pluginId: string;
  readonly handlerId: string;

  constructor(pluginId: string, handlerId: string) {
    super(
      `Handler '${handlerId}' is not registered for plugin '${pluginId}'. Register the in-process handler before enable.`,
    );
    this.name = 'PluginHandlerNotRegisteredException';
    this.pluginId = pluginId;
    this.handlerId = handlerId;
  }
}

/** Thrown when dispatch targets a hook point outside the platform catalog. */
export class UnknownHookPointException extends PluginRegistryException {
  readonly hookPoint: string;

  constructor(hookPoint: string) {
    super(`Unknown hook point '${hookPoint}'.`);
    this.name = 'UnknownHookPointException';
    this.hookPoint = hookPoint;
  }
}

/** Thrown when fail-fast dispatch aborts after a handler failure (T3-D4). */
export class PluginHandlerDispatchException extends PluginRegistryException {
  readonly tenantId: string;
  readonly hookPoint: string;
  readonly pluginId: string;
  readonly handlerId: string;
  readonly outcomes: readonly {
    pluginId: string;
    handlerId: string;
    success: boolean;
    error?: string;
  }[];
  override readonly cause: unknown;

  constructor(
    tenantId: string,
    hookPoint: string,
    pluginId: string,
    handlerId: string,
    outcomes: readonly {
      pluginId: string;
      handlerId: string;
      success: boolean;
      error?: string;
    }[],
    cause: unknown,
  ) {
    const detail = cause instanceof Error ? cause.message : String(cause);
    super(
      `Hook dispatch failed at '${hookPoint}' for tenant '${tenantId}' in handler '${pluginId}:${handlerId}': ${detail}`,
    );
    this.name = 'PluginHandlerDispatchException';
    this.tenantId = tenantId;
    this.hookPoint = hookPoint;
    this.pluginId = pluginId;
    this.handlerId = handlerId;
    this.outcomes = outcomes;
    this.cause = cause;
  }
}

/** Thrown when tenant handler activation state is inconsistent. */
export class PluginActivationException extends PluginRegistryException {
  constructor(message: string) {
    super(message);
    this.name = 'PluginActivationException';
  }
}
