-- Add typed fields used by the Garden Finance view and a real agent mission table.
create unique index if not exists clients_org_workspace_id_uidx
  on workspace_data.clients(organization_id, workspace_id, id);

alter table workspace_data.invoices
  add column if not exists client_id text,
  add column if not exists currency text,
  add column if not exists issued_at timestamptz,
  add column if not exists due_at timestamptz,
  add column if not exists paid_at timestamptz;

do $$
begin
  if not exists (select 1 from pg_constraint where conrelid='workspace_data.invoices'::regclass and conname='invoices_client_workspace_fkey') then
    alter table workspace_data.invoices
      add constraint invoices_client_workspace_fkey
      foreign key (organization_id, workspace_id, client_id)
      references workspace_data.clients(organization_id, workspace_id, id)
      on delete restrict;
  end if;
  if not exists (select 1 from pg_constraint where conrelid='workspace_data.invoices'::regclass and conname='invoices_currency_iso4217_check') then
    alter table workspace_data.invoices
      add constraint invoices_currency_iso4217_check
      check (currency is null or currency ~ '^[A-Z]{3}$');
  end if;
end;
$$;

create index if not exists invoices_org_workspace_client_idx
  on workspace_data.invoices(organization_id, workspace_id, client_id);
create index if not exists invoices_org_workspace_due_at_idx
  on workspace_data.invoices(organization_id, workspace_id, due_at);

create unique index if not exists agent_principals_org_id_uidx
  on identity.agent_principals(organization_id, id);

create table if not exists workspace_data.missions (
  id text primary key default gen_random_uuid()::text,
  organization_id uuid not null references identity.organizations(id) on delete cascade,
  workspace_id uuid not null references enterprise.workspaces(id) on delete restrict,
  created_by_user_id uuid not null references auth.users(id) on delete restrict,
  agent_principal_id uuid null,
  title text not null,
  priority text not null check (priority in ('P1','P2','P3')),
  status text not null default 'todo' check (status in ('todo','doing','done','cancelled')),
  position integer not null default 0,
  notes text null,
  extra_data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint missions_agent_same_org_fkey
    foreign key (organization_id, agent_principal_id)
    references identity.agent_principals(organization_id, id)
    on delete restrict
);

create index if not exists missions_org_workspace_status_position_idx
  on workspace_data.missions(organization_id, workspace_id, status, position);
create index if not exists missions_agent_principal_idx
  on workspace_data.missions(agent_principal_id);

alter table workspace_data.missions enable row level security;
alter table workspace_data.missions force row level security;
revoke all on table workspace_data.missions from public, anon;
grant select, insert, update, delete on table workspace_data.missions to authenticated;

create policy missions_member_read on workspace_data.missions
  for select to authenticated
  using (identity.is_active_workspace_member(organization_id, workspace_id));
create policy missions_operator_insert on workspace_data.missions
  for insert to authenticated
  with check (created_by_user_id = (select auth.uid()) and identity.can_manage_workspace(organization_id, workspace_id));
create policy missions_operator_update on workspace_data.missions
  for update to authenticated
  using (identity.can_manage_workspace(organization_id, workspace_id))
  with check (identity.can_manage_workspace(organization_id, workspace_id));
create policy missions_operator_delete on workspace_data.missions
  for delete to authenticated
  using (identity.can_manage_workspace(organization_id, workspace_id));

create trigger missions_tenant_guard before update on workspace_data.missions
for each row execute function workspace_data.guard_tenant_row();

create or replace function workspace_data.validate_mission_agent_delegation()
returns trigger language plpgsql security definer
set search_path = pg_catalog, workspace_data, identity
as $$
begin
  if new.agent_principal_id is not null and not exists (
    select 1 from identity.agent_delegations d
    where d.organization_id = new.organization_id
      and d.agent_principal_id = new.agent_principal_id
      and d.scope_type = 'WORKSPACE'
      and d.scope_id = new.workspace_id
      and d.delegation_status = 'ACTIVE'
      and d.starts_at <= now()
      and (d.expires_at is null or d.expires_at > now())
      and d.revoked_at is null
  ) then
    raise exception 'Agent must have an active delegation to the mission workspace';
  end if;
  return new;
end;
$$;
revoke all on function workspace_data.validate_mission_agent_delegation() from public, anon, authenticated;

create trigger missions_agent_delegation_guard
before insert or update of organization_id, workspace_id, agent_principal_id
on workspace_data.missions
for each row execute function workspace_data.validate_mission_agent_delegation();

notify pgrst, 'reload config';
