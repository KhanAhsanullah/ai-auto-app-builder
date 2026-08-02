/** Base error for theme engine failures. */
export class ThemeEngineException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ThemeEngineException';
  }
}

/** Thrown when theme resolution fails due to missing or invalid input. */
export class ThemeResolutionException extends ThemeEngineException {
  constructor(message: string) {
    super(message);
    this.name = 'ThemeResolutionException';
  }
}

/** Thrown when a preset template cannot be loaded or is invalid. */
export class PresetNotFoundException extends ThemeEngineException {
  constructor(preset: string) {
    super(`Theme preset not found: ${preset}`);
    this.name = 'PresetNotFoundException';
  }
}

/** Thrown when custom preset is selected but required fields are missing. */
export class IncompleteCustomThemeException extends ThemeResolutionException {
  constructor(missingFields: string[]) {
    super(`Custom theme is missing required fields: ${missingFields.join(', ')}`);
    this.name = 'IncompleteCustomThemeException';
  }
}

/** Thrown when theme compilation fails. */
export class ThemeCompilationException extends ThemeEngineException {
  constructor(message: string) {
    super(message);
    this.name = 'ThemeCompilationException';
  }
}
