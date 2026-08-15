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
