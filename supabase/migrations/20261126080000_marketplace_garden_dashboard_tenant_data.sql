-- Garden Dashboard operational data contract.
-- This compatibility schema serves the inherited Digital Garden UI while the
-- canonical Marketplace control plane remains in identity/enterprise/areas.
-- No demo rows are inserted. Every row is tenant-owned and RLS guarded.

create schema if not exists omk_saas;
revoke all on schema omk_saas from public, anon;
grant usage on schema omk_saas to authenticated;

create table if not exists omk_saas.clients (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references identity.organizations(id) on delete cascade,
  name text not null check (length(btrim(name)) > 0),
  email text,
  phone text,
  service text,
  status text not null default 'prospect' check (status in ('active','paused','archived','prospect')),
  created_by_user_id uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists omk_saas_clients_org_created_idx on omk_saas.clients(org_id, created_at desc);
alter table omk_saas.clients enable row level security;
revoke all on omk_saas.clients from public, anon;
grant select, insert, update, delete on omk_saas.clients to authenticated;

create policy clients_org_member_select on omk_saas.clients for select to authenticated
using (exists (
  select 1 from identity.organization_memberships m
  where m.organization_id = clients.org_id and m.user_id = (select auth.uid()) and m.membership_status = 'ACTIVE'
));
create policy clients_org_operator_insert on omk_saas.clients for insert to authenticated
with check (
  created_by_user_id = (select auth.uid()) and exists (
    select 1 from identity.organization_memberships m
    join identity.role_bindings r on r.organization_id = m.organization_id and r.subject_user_id = m.user_id
    where m.organization_id = clients.org_id and m.user_id = (select auth.uid())
      and m.membership_status = 'ACTIVE' and r.binding_status = 'ACTIVE'
      and r.role_code in ('S0_SOVEREIGN','B1_CEO','B2_MANAGER','B2.2')
  )
);
create policy clients_org_operator_update on omk_saas.clients for update to authenticated
using (exists (
  select 1 from identity.organization_memberships m
  join identity.role_bindings r on r.organization_id = m.organization_id and r.subject_user_id = m.user_id
  where m.organization_id = clients.org_id and m.user_id = (select auth.uid())
    and m.membership_status = 'ACTIVE' and r.binding_status = 'ACTIVE'
    and r.role_code in ('S0_SOVEREIGN','B1_CEO','B2_MANAGER','B2.2')
))
with check (exists (
  select 1 from identity.organization_memberships m
  join identity.role_bindings r on r.organization_id = m.organization_id and r.subject_user_id = m.user_id
  where m.organization_id = clients.org_id and m.user_id = (select auth.uid())
    and m.membership_status = 'ACTIVE' and r.binding_status = 'ACTIVE'
    and r.role_code in ('S0_SOVEREIGN','B1_CEO','B2_MANAGER','B2.2')
));
create policy clients_org_operator_delete on omk_saas.clients for delete to authenticated
using (exists (
  select 1 from identity.organization_memberships m
  join identity.role_bindings r on r.organization_id = m.organization_id and r.subject_user_id = m.user_id
  where m.organization_id = clients.org_id and m.user_id = (select auth.uid())
    and m.membership_status = 'ACTIVE' and r.binding_status = 'ACTIVE'
    and r.role_code in ('S0_SOVEREIGN','B1_CEO','B2_MANAGER','B2.2')
));

create table if not exists omk_saas.agents (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references identity.organizations(id) on delete cascade,
  name text not null check (length(btrim(name)) > 0),
  role text not null default 'operator' check (role in ('owner','manager','operator','viewer')),
  email text,
  status text not null default 'active' check (status in ('active','paused','archived')),
  hermes_code text,
  channel text,
  state text,
  current_task text,
  load_pct numeric(5,2) check (load_pct is null or load_pct between 0 and 100),
  tokens_today bigint check (tokens_today is null or tokens_today >= 0),
  tasks_today integer check (tasks_today is null or tasks_today >= 0),
  success_pct numeric(5,2) check (success_pct is null or success_pct between 0 and 100),
  default_model text,
  created_by_user_id uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists omk_saas_agents_org_created_idx on omk_saas.agents(org_id, created_at desc);
alter table omk_saas.agents enable row level security;
revoke all on omk_saas.agents from public, anon;
grant select, insert, update, delete on omk_saas.agents to authenticated;

create policy agents_org_member_select on omk_saas.agents for select to authenticated
using (exists (
  select 1 from identity.organization_memberships m
  where m.organization_id = agents.org_id and m.user_id = (select auth.uid()) and m.membership_status = 'ACTIVE'
));
create policy agents_org_operator_insert on omk_saas.agents for insert to authenticated
with check (
  created_by_user_id = (select auth.uid()) and exists (
    select 1 from identity.organization_memberships m
    join identity.role_bindings r on r.organization_id = m.organization_id and r.subject_user_id = m.user_id
    where m.organization_id = agents.org_id and m.user_id = (select auth.uid())
      and m.membership_status = 'ACTIVE' and r.binding_status = 'ACTIVE'
      and r.role_code in ('S0_SOVEREIGN','B1_CEO','B2_MANAGER','B2.2')
  )
);
create policy agents_org_operator_update on omk_saas.agents for update to authenticated
using (exists (
  select 1 from identity.organization_memberships m
  join identity.role_bindings r on r.organization_id = m.organization_id and r.subject_user_id = m.user_id
  where m.organization_id = agents.org_id and m.user_id = (select auth.uid())
    and m.membership_status = 'ACTIVE' and r.binding_status = 'ACTIVE'
    and r.role_code in ('S0_SOVEREIGN','B1_CEO','B2_MANAGER','B2.2')
))
with check (exists (
  select 1 from identity.organization_memberships m
  join identity.role_bindings r on r.organization_id = m.organization_id and r.subject_user_id = m.user_id
  where m.organization_id = agents.org_id and m.user_id = (select auth.uid())
    and m.membership_status = 'ACTIVE' and r.binding_status = 'ACTIVE'
    and r.role_code in ('S0_SOVEREIGN','B1_CEO','B2_MANAGER','B2.2')
));
create policy agents_org_operator_delete on omk_saas.agents for delete to authenticated
using (exists (
  select 1 from identity.organization_memberships m
  join identity.role_bindings r on r.organization_id = m.organization_id and r.subject_user_id = m.user_id
  where m.organization_id = agents.org_id and m.user_id = (select auth.uid())
    and m.membership_status = 'ACTIVE' and r.binding_status = 'ACTIVE'
    and r.role_code in ('S0_SOVEREIGN','B1_CEO','B2_MANAGER','B2.2')
));

grant usage on schema identity to authenticated;
grant select on identity.organization_memberships, identity.role_bindings to authenticated;
alter role authenticator set pgrst.db_schemas = 'public, omk_saas';
notify pgrst, 'reload config';
