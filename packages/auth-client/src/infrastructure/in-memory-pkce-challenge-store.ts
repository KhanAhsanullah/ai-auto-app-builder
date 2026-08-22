import type { PkceChallengeRecord } from '../domain/auth-flow-types.js';

/** In-memory store for pending PKCE challenges. */
export class InMemoryPkceChallengeStore {
  private readonly byId = new Map<string, PkceChallengeRecord>();

  async save(record: PkceChallengeRecord): Promise<void> {
    this.byId.set(record.challengeId, record);
  }

  async findById(challengeId: string): Promise<PkceChallengeRecord | undefined> {
    return this.byId.get(challengeId);
  }

  async delete(challengeId: string): Promise<void> {
    this.byId.delete(challengeId);
  }
}
