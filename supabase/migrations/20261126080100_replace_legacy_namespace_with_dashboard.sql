-- Replace the temporary legacy namespace with the canonical Dashboard schema.
-- Existing records are preserved; no rows are dropped or reseeded.
do $$
begin
  if exists (select 1 from information_schema.schemata where schema_name='omk_saas')
     and not exists (select 1 from information_schema.schemata where schema_name='dashboard') then
    alter schema omk_saas rename to dashboard;
  elsif exists (select 1 from information_schema.schemata where schema_name='omk_saas')
     and exists (select 1 from information_schema.schemata where schema_name='dashboard') then
    raise exception 'Both legacy and target schemas exist; refusing ambiguous merge';
  elsif not exists (select 1 from information_schema.schemata where schema_name='dashboard') then
    raise exception 'Neither legacy nor target schema exists';
  end if;
end $$;

alter schema dashboard owner to postgres;
revoke all on schema dashboard from public, anon;
grant usage on schema dashboard to authenticated;
alter role authenticator set pgrst.db_schemas = 'public, dashboard';
notify pgrst, 'reload config';
