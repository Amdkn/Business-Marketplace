// Marketplace runtime configuration.
// The Garden workspace stores its tenant-scoped operational records in the
// dedicated dashboard schema. Authorization is enforced by PostgreSQL RLS.

export type AppMode = 'saas';

export const APP_MODE: AppMode = 'saas';
export const DB_SCHEMA = 'dashboard';
export const IS_SAAS = true;
export const IS_INTERNAL = false;
