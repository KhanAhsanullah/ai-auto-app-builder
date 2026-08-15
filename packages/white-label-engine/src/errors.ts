/** Base error for white-label engine failures. */
export class WhiteLabelEngineException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'WhiteLabelEngineException';
  }
}

/** Thrown when brand resolution fails due to missing or invalid input. */
export class BrandResolutionException extends WhiteLabelEngineException {
  constructor(message: string) {
    super(message);
    this.name = 'BrandResolutionException';
  }
}

/** Thrown when brand asset compilation fails. */
export class BrandCompilationException extends WhiteLabelEngineException {
  constructor(message: string) {
    super(message);
    this.name = 'BrandCompilationException';
  }
}

/** Thrown when a brand asset reference fails validation. */
export class AssetValidationException extends WhiteLabelEngineException {
  constructor(message: string) {
    super(message);
    this.name = 'AssetValidationException';
  }
}
