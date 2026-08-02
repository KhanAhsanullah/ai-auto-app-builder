import type { ZodError, ZodIssue } from 'zod';

import type { ConfigValidationError } from './types.js';

function formatPath(path: (string | number)[]): string {
  if (path.length === 0) {
    return '(root)';
  }

  return path.reduce<string>((acc, segment) => {
    if (typeof segment === 'number') {
      return `${acc}[${segment}]`;
    }

    return acc.length === 0 ? segment : `${acc}.${segment}`;
  }, '');
}

function formatIssue(issue: ZodIssue): ConfigValidationError {
  return {
    path: formatPath(issue.path),
    message: issue.message,
    code: issue.code,
  };
}

/** Convert a Zod error into human-readable validation errors. */
export function formatZodErrors(error: ZodError): ConfigValidationError[] {
  return error.issues.map(formatIssue);
}

/** Render validation errors as a multi-line string suitable for logs or UI. */
export function formatValidationErrorMessage(errors: ConfigValidationError[]): string {
  if (errors.length === 0) {
    return 'Configuration validation failed.';
  }

  return errors.map((error) => `${error.path}: ${error.message}`).join('\n');
}

/** Error thrown when configuration validation fails. */
export class ConfigValidationException extends Error {
  readonly errors: ConfigValidationError[];

  constructor(errors: ConfigValidationError[]) {
    super(formatValidationErrorMessage(errors));
    this.name = 'ConfigValidationException';
    this.errors = errors;
  }
}

/** Error thrown when configuration JSON cannot be parsed or loaded. */
export class ConfigLoadException extends Error {
  constructor(
    message: string,
    override readonly cause?: unknown,
  ) {
    super(message);
    this.name = 'ConfigLoadException';
  }
}

/** Error thrown when configuration resolution fails before validation. */
export class ConfigResolutionException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConfigResolutionException';
  }
}
