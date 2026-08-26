/** Base error for AI orchestrator failures. */
export class AiOrchestratorException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AiOrchestratorException';
  }
}

/** Thrown when an AI action is blocked by tenant guardrails. */
export class AiActionForbiddenException extends AiOrchestratorException {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = 'AiActionForbiddenException';
    this.code = code;
  }
}

/** Thrown when AI output fails schema validation. */
export class AiValidationException extends AiOrchestratorException {
  readonly errors: readonly string[];

  constructor(errors: readonly string[]) {
    super(`AI output failed schema validation (${errors.length} error(s)).`);
    this.name = 'AiValidationException';
    this.errors = errors;
  }
}

/** Thrown when the AI provider returns unusable structured output. */
export class AiProviderResponseException extends AiOrchestratorException {
  constructor(message: string) {
    super(message);
    this.name = 'AiProviderResponseException';
  }
}
