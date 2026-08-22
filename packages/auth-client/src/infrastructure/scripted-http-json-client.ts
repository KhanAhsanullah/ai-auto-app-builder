import type { HttpJsonClient } from '../domain/ports.js';

/** In-memory HTTP JSON client for unit tests (scripted responses). */
export class ScriptedHttpJsonClient implements HttpJsonClient {
  private readonly queue: Array<{ status: number; body: Record<string, unknown> }> = [];

  enqueue(response: { status: number; body: Record<string, unknown> }): void {
    this.queue.push(response);
  }

  async postForm(
    _url: string,
    _body: Record<string, string>,
  ): Promise<{ status: number; body: Record<string, unknown> }> {
    const next = this.queue.shift();
    if (!next) {
      throw new Error('ScriptedHttpJsonClient has no queued responses.');
    }
    return next;
  }
}
