// Marketplace runtime configuration.
// Garden and Web Desktop share the canonical tenant-owned workspace_data store.
export type AppMode = 'saas';
export const APP_MODE: AppMode = 'saas';
export const DB_SCHEMA = 'workspace_data';
export const IS_SAAS = true;
export const IS_INTERNAL = false;
