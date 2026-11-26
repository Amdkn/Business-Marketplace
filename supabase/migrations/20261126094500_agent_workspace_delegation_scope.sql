-- Permit workspace-scoped agent delegations, which are the canonical workspace assignment.
-- The workspace_id remains a scope reference; agent identity stays in identity.agent_principals.
alter table identity.agent_delegations
  drop constraint if exists agent_delegations_scope_type_check;
alter table identity.agent_delegations
  add constraint agent_delegations_scope_type_check
  check (scope_type = any (array[
    'PLATFORM','ORGANIZATION','WORKSPACE','AREA','ENTERPRISE','DEPARTMENT','PROJECT','RESOURCE'
  ]));

alter table identity.agent_delegations
  drop constraint if exists agent_delegation_scope_shape;
alter table identity.agent_delegations
  add constraint agent_delegation_scope_shape
  check (
    ((scope_type in ('PLATFORM','ORGANIZATION')) and scope_id is null)
    or
    ((scope_type in ('WORKSPACE','AREA','ENTERPRISE','DEPARTMENT','PROJECT','RESOURCE')) and scope_id is not null)
  );

create index if not exists agent_delegations_workspace_active_idx
  on identity.agent_delegations(organization_id, scope_id, agent_principal_id)
  where scope_type='WORKSPACE' and delegation_status='ACTIVE' and revoked_at is null;

create or replace function identity.validate_agent_delegation_scope()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, identity, enterprise
as $$
begin
  if new.scope_type = 'WORKSPACE' and not exists (
    select 1
    from enterprise.workspaces w
    where w.id = new.scope_id
      and w.organization_id = new.organization_id
      and w.workspace_status = 'ACTIVE'
  ) then
    raise exception 'Workspace delegation must target an active workspace in the same organization';
  end if;
  return new;
end;
$$;

revoke all on function identity.validate_agent_delegation_scope() from public, anon, authenticated;
drop trigger if exists agent_delegation_workspace_scope_guard on identity.agent_delegations;
create trigger agent_delegation_workspace_scope_guard
before insert or update of organization_id, scope_type, scope_id
on identity.agent_delegations
for each row execute function identity.validate_agent_delegation_scope();

notify pgrst, 'reload config';
