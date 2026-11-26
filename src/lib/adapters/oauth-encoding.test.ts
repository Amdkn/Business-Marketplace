import { describe, expect, it } from 'vitest';
import { base64Url } from './oauth-encoding';
import { assertOAuthScopesAllowed, parseOAuthScopes } from '../../supabase/functions/_shared/oauth-scopes.ts';

describe('base64Url', () => {
  it('replaces both Base64 special characters', () => {
    expect(base64Url(new Uint8Array([251, 255]))).toBe('-_8');
  });

  it('removes padding without changing ordinary alphabet characters', () => {
    expect(base64Url(new Uint8Array([0, 1]))).toBe('AAE');
  });

  it('encodes empty input as an empty string', () => {
    expect(base64Url(new Uint8Array())).toBe('');
  });

  it('produces URL-safe output for arbitrary byte values', () => {
    const encoded = base64Url(new Uint8Array([0, 255, 239, 190, 173, 251, 255]));
    expect(encoded).not.toMatch(/[+/=]/);
    expect(encoded).toBe('AP_vvq37_w');
  });
});


describe('OAuth scope parsing used by the Edge Functions', () => {
  it('routes both callback and refresh flows through the shared parser and allowlist', async () => {
    const { readFileSync } = await import('node:fs');
    const callback = readFileSync('supabase/functions/adapter-oauth-callback/index.ts', 'utf8');
    const worker = readFileSync('supabase/functions/adapter-worker/index.ts', 'utf8');

    for (const source of [callback, worker]) {
      expect(source).toContain("from '../_shared/oauth-scopes.ts'");
      expect(source).toContain('parseOAuthScopes(tokens.scope,');
      expect(source).toContain('assertOAuthScopesAllowed(');
    }
  });

  it('parses provider scopes separated by spaces, tabs, and newlines', () => {
    expect(parseOAuthScopes(
      'openid email\tprofile\nhttps://www.googleapis.com/auth/drive.file',
      [],
    )).toEqual([
      'openid',
      'email',
      'profile',
      'https://www.googleapis.com/auth/drive.file',
    ]);
  });

  it('uses the existing allowlist when the provider omits a scope string', () => {
    expect(parseOAuthScopes(undefined, ['openid', 'email'])).toEqual(['openid', 'email']);
    expect(parseOAuthScopes('   ', ['openid'])).toEqual(['openid']);
  });

  it('rejects scope escalation and accepts a subset of the approved scopes', () => {
    expect(() => assertOAuthScopesAllowed(['openid', 'admin'], ['openid', 'email']))
      .toThrow('OAUTH_SCOPE_ESCALATION_REJECTED');
    expect(() => assertOAuthScopesAllowed(['openid'], ['openid', 'email'])).not.toThrow();
  });
});
