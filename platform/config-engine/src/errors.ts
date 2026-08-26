/** Base error for config engine failures. */
export class ConfigEngineException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConfigEngineException';
  }
}

/** Thrown when a config revision cannot be found. */
export class ConfigDocumentNotFoundException extends ConfigEngineException {
  readonly tenantId: string;
  readonly version?: number;

  constructor(tenantId: string, version?: number) {
    super(
      version === undefined
        ? `No config documents found for tenant '${tenantId}'.`
        : `Config document not found for tenant '${tenantId}' version ${version}.`,
    );
    this.name = 'ConfigDocumentNotFoundException';
    this.tenantId = tenantId;
    this.version = version;
  }
}

/** Thrown when a (tenantId, version) already exists. */
export class ConfigDocumentAlreadyExistsException extends ConfigEngineException {
  readonly tenantId: string;
  readonly version: number;

  constructor(tenantId: string, version: number) {
    super(`Config document already exists for tenant '${tenantId}' version ${version}.`);
    this.name = 'ConfigDocumentAlreadyExistsException';
    this.tenantId = tenantId;
    this.version = version;
  }
}

/** Thrown when draft input fails validation. */
export class ConfigDraftValidationException extends ConfigEngineException {
  constructor(message: string) {
    super(message);
    this.name = 'ConfigDraftValidationException';
  }
}
