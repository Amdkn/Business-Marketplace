import { describe, expect, it } from 'vitest';
import { base64Url } from './oauth-encoding';

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


describe('OAuth scope parsing source contract', () => {
  it('uses a real whitespace separator in both deployed Edge Function sources', async () => {
    const { readFileSync } = await import('node:fs');
    const callback = readFileSync('supabase/functions/adapter-oauth-callback/index.ts', 'utf8');
    const worker = readFileSync('supabase/functions/adapter-worker/index.ts', 'utf8');

    for (const source of [callback, worker]) {
      expect(source).toContain('split(/\\s+/)');
      expect(source).not.toContain('split(/\\\\s+/)');
    }
  });

  it('splits provider scope strings containing spaces, tabs, or newlines', () => {
    const scopes = 'openid email\tprofile\nhttps://www.googleapis.com/auth/drive.file'
      .trim()
      .split(/\s+/);

    expect(scopes).toEqual([
      'openid',
      'email',
      'profile',
      'https://www.googleapis.com/auth/drive.file',
    ]);
  });
});
