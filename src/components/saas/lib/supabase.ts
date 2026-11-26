// Garden and Web Desktop share the single Marketplace Supabase client.
// Every query selects its canonical schema explicitly; auth/session state is never duplicated.
import { supabase as marketplaceSupabase, supabaseConfigured } from '../../../lib/supabase';
import { DB_SCHEMA } from '../config/mode';

export const supabase = marketplaceSupabase;
export const SUPABASE_READY = supabaseConfigured;

export function fromSchema<T = unknown>(table: string) {
  return supabase.schema(DB_SCHEMA).from(table) as unknown as {
    select: (cols?: string) => PromiseLike<{ data: T[] | null; error: { message: string } | null }>;
  };
}
