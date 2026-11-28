-- Expose only the tenant organization context required by the Dashboard.
-- The organization table remains protected by its active-member RLS policy.
grant usage on schema identity to authenticated;
grant select on identity.organizations to authenticated;
alter role authenticator set pgrst.db_schemas = 'public, dashboard, identity';
notify pgrst, 'reload config';
