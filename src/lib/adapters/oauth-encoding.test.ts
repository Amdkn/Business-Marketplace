import { describe, expect, it } from 'vitest';
import { base64Url } from '../../../../supabase/functions/_shared/oauth-encoding.ts';

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
