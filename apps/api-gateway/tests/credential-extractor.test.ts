import { describe, expect, it } from 'vitest';

import { extractCredentials } from '../src/domain/credential-extractor.js';

describe('extractCredentials', () => {
  it('prefers Bearer Authorization', () => {
    expect(
      extractCredentials({
        authorization: 'Bearer tok-1',
        'x-api-key': 'key-1',
        cookie: 'cos_session=sess-1',
      }),
    ).toEqual({ kind: 'bearer', value: 'tok-1' });
  });

  it('reads ApiKey Authorization scheme', () => {
    expect(extractCredentials({ authorization: 'ApiKey key-abc' })).toEqual({
      kind: 'api_key',
      value: 'key-abc',
    });
  });

  it('reads x-api-key header', () => {
    expect(extractCredentials({ 'x-api-key': 'key-xyz' })).toEqual({
      kind: 'api_key',
      value: 'key-xyz',
    });
  });

  it('reads session cookie', () => {
    expect(
      extractCredentials({
        cookie: 'other=1; cos_session=sess%2Dvalue; path=/',
      }),
    ).toEqual({ kind: 'session', value: 'sess-value' });
  });

  it('reads x-session-token when cookie absent', () => {
    expect(extractCredentials({ 'x-session-token': 'sess-header' })).toEqual({
      kind: 'session',
      value: 'sess-header',
    });
  });

  it('returns undefined when no credentials present', () => {
    expect(extractCredentials({})).toBeUndefined();
  });
});
