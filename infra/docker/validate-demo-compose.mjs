#!/usr/bin/env node
/**
 * Smoke validation for the demo docker compose stack (Sprint 30).
 * Does not require Docker — checks files + required service keys exist.
 */
import { readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(here, '../..');

const requiredFiles = [
  'infra/docker/docker-compose.demo.yml',
  'infra/docker/Dockerfile.platform-api',
  'infra/docker/Dockerfile.web-host',
  'infra/docker/Dockerfile.admin-host',
  'infra/docker/.env.demo.example',
  'docs/runbooks/staging-demo.md',
  '.dockerignore',
];

const failures = [];

for (const rel of requiredFiles) {
  const abs = join(repoRoot, rel);
  if (!existsSync(abs)) {
    failures.push(`missing file: ${rel}`);
  }
}

const dockerignore = readFileSync(join(repoRoot, '.dockerignore'), 'utf8');
if (dockerignore.split('\n').some((line) => line.trim() === 'apps/admin-host')) {
  failures.push('.dockerignore must not exclude apps/admin-host (needed for demo admin image)');
}

const composePath = join(repoRoot, 'infra/docker/docker-compose.demo.yml');
const compose = readFileSync(composePath, 'utf8');

for (const needle of [
  'platform-api:',
  'web-host:',
  'admin-host:',
  '8787:8787',
  '5173:5173',
  '5174:5174',
  'Dockerfile.platform-api',
  'Dockerfile.web-host',
  'Dockerfile.admin-host',
  'VITE_PLATFORM_API_URL',
  'platform-api-data',
  'service_healthy',
]) {
  if (!compose.includes(needle)) {
    failures.push(`compose missing expected fragment: ${needle}`);
  }
}

const apiDockerfile = readFileSync(join(repoRoot, 'infra/docker/Dockerfile.platform-api'), 'utf8');
if (!apiDockerfile.includes('HOST=0.0.0.0')) {
  failures.push('platform-api Dockerfile must bind HOST=0.0.0.0 for containers');
}

if (failures.length > 0) {
  console.error('demo compose validation failed:');
  for (const failure of failures) {
    console.error(`  - ${failure}`);
  }
  process.exit(1);
}

console.log('demo compose validation ok');
console.log('run: docker compose -f infra/docker/docker-compose.demo.yml up --build');
console.log('urls: web :5173 · admin :5174 · api :8787 (shared platform-api-data volume)');
console.log('runbook: docs/runbooks/staging-demo.md');
