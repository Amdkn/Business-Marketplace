// Marketplace runtime mode — retain the inherited SaaS Garden surface,
// but point it at the tenant-scoped compatibility schema provisioned in the
// canonical Marketplace Supabase project. "internal" remains opt-in only.
//
// The mode is a UI/data-client selector, never an authorization boundary.
// Tenant isolation is enforced by Postgres RLS against identity memberships
// and role_bindings; browser-provided org ids are not trusted by policies.

export type AppMode = 'internal' | 'saas';

const RAW = (import.meta.env.VITE_APP_MODE ?? 'saas').toString().toLowerCase();

export const APP_MODE: AppMode = RAW === 'internal' ? 'internal' : 'saas';

/** Legacy Garden repositories target the isolated tenant schema, not public. */
export const DB_SCHEMA = APP_MODE === 'saas' ? 'omk_saas' : 'omk_internal';

export const IS_SAAS = APP_MODE === 'saas';
export const IS_INTERNAL = APP_MODE === 'internal';
