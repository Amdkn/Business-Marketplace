-- Preserve one canonical agent principal per organization and one active delegation per scope.
-- Make workspace mission assignment reject suspended/revoked principals as well as missing delegations.

create unique index if not exists agent_delegations_one_active_scope_uidx
  on identity.agent_delegations (
    organization_id,
    agent_principal_id,
    scope_type,
    (coalesce(scope_id, '00000000-0000-0000-0000-000000000000'::uuid))
  )
  where delegation_status = 'ACTIVE' and revoked_at is null;

create or replace function workspace_data.validate_mission_agent_delegation()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, workspace_data, identity
as $$
begin
  if new.agent_principal_id is not null and not exists (
    select 1
    from identity.agent_principals ap
    join identity.agent_delegations d
      on d.agent_principal_id = ap.id
     and d.organization_id = ap.organization_id
    where ap.id = new.agent_principal_id
      and ap.organization_id = new.organization_id
      and ap.principal_status = 'ACTIVE'
      and d.scope_type = 'WORKSPACE'
      and d.scope_id = new.workspace_id
      and d.delegation_status = 'ACTIVE'
      and d.starts_at <= now()
      and (d.expires_at is null or d.expires_at > now())
      and d.revoked_at is null
  ) then
    raise exception 'Agent must be ACTIVE and have an active delegation to the mission workspace';
  end if;
  return new;
end;
$$;

revoke all on function workspace_data.validate_mission_agent_delegation() from public, anon, authenticated;
notify pgrst, 'reload config';
