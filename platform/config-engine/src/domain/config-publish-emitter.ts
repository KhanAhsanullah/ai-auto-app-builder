import type { ConfigPublishEvent } from '../types.js';

/** Listener notified after a successful config publish. */
export type ConfigPublishListener = (event: ConfigPublishEvent) => void | Promise<void>;

/** Port for emitting config publish events (Build Orchestrator / workers). */
export interface ConfigPublishEmitter {
  emit(event: ConfigPublishEvent): Promise<void>;
}

/** Simple multi-listener emitter for tests and in-process wiring. */
export class InMemoryConfigPublishEmitter implements ConfigPublishEmitter {
  readonly events: ConfigPublishEvent[] = [];

  constructor(private readonly listeners: readonly ConfigPublishListener[] = []) {}

  async emit(event: ConfigPublishEvent): Promise<void> {
    this.events.push(structuredClone(event));
    for (const listener of this.listeners) {
      await listener(event);
    }
  }
}
