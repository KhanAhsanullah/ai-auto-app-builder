/**
 * Port for LLM / model providers.
 * Task 1 defines the contract; live SDK adapters land in later tasks.
 */
export interface AiProvider {
  readonly id: string;

  /**
   * Generate structured JSON for a prompt.
   * Implementations must return parseable JSON (object or array).
   */
  generateJson(input: { prompt: string; system?: string; maxTokens?: number }): Promise<unknown>;
}

/**
 * Deterministic stub provider for tests and local dry-runs.
 */
export class StubAiProvider implements AiProvider {
  readonly id = 'stub';

  constructor(private readonly response: unknown = { ok: true }) {}

  async generateJson(_input: {
    prompt: string;
    system?: string;
    maxTokens?: number;
  }): Promise<unknown> {
    return this.response;
  }
}
