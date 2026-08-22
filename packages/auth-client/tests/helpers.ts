import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import type { Authentication } from '@ai-commerce/config-schema';

const testDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(testDir, '../../..');

export const AUTH_EXAMPLE_PATH = join(
  repoRoot,
  'schemas/tenant-config/v1/examples/authentication.example.json',
);

export const FULL_TENANT_CONFIG_PATH = join(
  repoRoot,
  'schemas/tenant-config/v1/examples/full.example.json',
);

/** Load the canonical authentication example. */
export function loadAuthExample(): Authentication {
  return JSON.parse(readFileSync(AUTH_EXAMPLE_PATH, 'utf8')) as Authentication;
}

/** Minimal valid customer + admin authentication config for unit tests. */
export function createMinimalAuthConfig(overrides?: Partial<Authentication>): Authentication {
  return {
    customer: {
      methods: {
        email: true,
        phone: false,
        guestCheckout: true,
      },
      session: {
        tokenTtlMinutes: 10080,
        refreshEnabled: true,
      },
    },
    admin: {
      methods: {
        email: true,
      },
      session: {
        tokenTtlMinutes: 480,
        idleTimeoutMinutes: 30,
      },
      mfa: {
        required: true,
        methods: ['totp'],
      },
    },
    ...overrides,
  };
}
