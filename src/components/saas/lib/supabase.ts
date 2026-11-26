// Marketplace Supabase client — tenant-facing operational data lives in the dashboard schema.
// Identity, enterprise and platform records are accessed through their canonical schemas.

import { createClient } from '@supabase/supabase-js';
import { DB_SCHEMA } from '../config/mode';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

if (!url || !anonKey) {
  // Fail fast & clear (common/coding-style: validate at boundaries).
  // In dev without env, repos should surface this instead of silently using mocks.
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.warn(
      '[supabase] VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY missing. ' +
        'Set them in .env (see .env.example). Data layer will not work until configured.',
    );
  }
}

// Tenant-facing Garden records use the dedicated dashboard schema.
const effectiveSchema: string = DB_SCHEMA;

export const supabase = createClient(url ?? 'http://localhost:54321', anonKey ?? 'public-anon-key', {
  db: { schema: effectiveSchema },
  auth: { persistSession: true, autoRefreshToken: true },
});

export const SUPABASE_READY = Boolean(url && anonKey);

/**
 * Convenience: explicit schema-typed table accessor.
 * Use `fromSchema('clients')` instead of `from('clients')` to make the
 * target schema unambiguous at the call site (avoids D6 #50 foot-gun).
 */
export function fromSchema<T = unknown>(table: string) {
  return supabase.from(table) as unknown as {
    select: (cols?: string) => PromiseLike<{ data: T[] | null; error: { message: string } | null }>;
  };
}
