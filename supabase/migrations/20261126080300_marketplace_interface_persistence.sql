-- Marketplace interface persistence: one typed table per non-demo CMS collection.
-- Source definitions are src/lib/cms/seed.ts; demo_coach_* collections stay local-only.
create schema if not exists workspace_data;
revoke all on schema workspace_data from public,anon;
grant usage on schema workspace_data to authenticated;
create table workspace_data.clients (
 id text primary key default gen_random_uuid()::text,
 organization_id uuid not null references identity.organizations(id) on delete cascade,
 workspace_id uuid references enterprise.workspaces(id) on delete set null,
 created_by_user_id uuid references auth.users(id) on delete set null,
  "title" text,
  "segment" text,
  "ticket" numeric,
  "open_threads" numeric,
  "next_session" text,
  "health" numeric,
  "onboarding_step" text,
  "status" text,
 extra_data jsonb not null default '{}'::jsonb,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
alter table workspace_data.clients enable row level security;
create index clients_org_workspace_idx on workspace_data.clients(organization_id,workspace_id,created_at desc);
create policy clients_member_read on workspace_data.clients for select to authenticated using (exists (select 1 from identity.organization_memberships m where m.organization_id=workspace_data.clients.organization_id and m.user_id=(select auth.uid()) and m.membership_status='ACTIVE'));
create policy clients_operator_insert on workspace_data.clients for insert to authenticated with check (created_by_user_id=(select auth.uid()) and exists (select 1 from identity.organization_memberships m join identity.role_bindings r on r.organization_id=m.organization_id and r.subject_user_id=m.user_id where m.organization_id=workspace_data.clients.organization_id and m.user_id=(select auth.uid()) and m.membership_status='ACTIVE' and r.binding_status='ACTIVE' and r.role_code=any(array['S0_SOVEREIGN','B1_CEO','B2_MANAGER','B2.2'])));
create policy clients_operator_update on workspace_data.clients for update to authenticated using (exists (select 1 from identity.organization_memberships m join identity.role_bindings r on r.organization_id=m.organization_id and r.subject_user_id=m.user_id where m.organization_id=workspace_data.clients.organization_id and m.user_id=(select auth.uid()) and m.membership_status='ACTIVE' and r.binding_status='ACTIVE' and r.role_code=any(array['S0_SOVEREIGN','B1_CEO','B2_MANAGER','B2.2']))) with check (exists (select 1 from identity.organization_memberships m join identity.role_bindings r on r.organization_id=m.organization_id and r.subject_user_id=m.user_id where m.organization_id=workspace_data.clients.organization_id and m.user_id=(select auth.uid()) and m.membership_status='ACTIVE' and r.binding_status='ACTIVE' and r.role_code=any(array['S0_SOVEREIGN','B1_CEO','B2_MANAGER','B2.2'])));
create policy clients_operator_delete on workspace_data.clients for delete to authenticated using (exists (select 1 from identity.organization_memberships m join identity.role_bindings r on r.organization_id=m.organization_id and r.subject_user_id=m.user_id where m.organization_id=workspace_data.clients.organization_id and m.user_id=(select auth.uid()) and m.membership_status='ACTIVE' and r.binding_status='ACTIVE' and r.role_code=any(array['S0_SOVEREIGN','B1_CEO','B2_MANAGER','B2.2'])));

create table workspace_data.articles (
 id text primary key default gen_random_uuid()::text,
 organization_id uuid not null references identity.organizations(id) on delete cascade,
 workspace_id uuid references enterprise.workspaces(id) on delete set null,
 created_by_user_id uuid references auth.users(id) on delete set null,
  "title" text,
  "category" text,
  "reads" numeric,
  "updated" text,
  "body" text,
 extra_data jsonb not null default '{}'::jsonb,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
alter table workspace_data.articles enable row level security;
create index articles_org_workspace_idx on workspace_data.articles(organization_id,workspace_id,created_at desc);
create policy articles_member_read on workspace_data.articles for select to authenticated using (exists (select 1 from identity.organization_memberships m where m.organization_id=workspace_data.articles.organization_id and m.user_id=(select auth.uid()) and m.membership_status='ACTIVE'));
create policy articles_operator_insert on workspace_data.articles for insert to authenticated with check (created_by_user_id=(select auth.uid()) and exists (select 1 from identity.organization_memberships m join identity.role_bindings r on r.organization_id=m.organization_id and r.subject_user_id=m.user_id where m.organization_id=workspace_data.articles.organization_id and m.user_id=(select auth.uid()) and m.membership_status='ACTIVE' and r.binding_status='ACTIVE' and r.role_code=any(array['S0_SOVEREIGN','B1_CEO','B2_MANAGER','B2.2'])));
create policy articles_operator_update on workspace_data.articles for update to authenticated using (exists (select 1 from identity.organization_memberships m join identity.role_bindings r on r.organization_id=m.organization_id and r.subject_user_id=m.user_id where m.organization_id=workspace_data.articles.organization_id and m.user_id=(select auth.uid()) and m.membership_status='ACTIVE' and r.binding_status='ACTIVE' and r.role_code=any(array['S0_SOVEREIGN','B1_CEO','B2_MANAGER','B2.2']))) with check (exists (select 1 from identity.organization_memberships m join identity.role_bindings r on r.organization_id=m.organization_id and r.subject_user_id=m.user_id where m.organization_id=workspace_data.articles.organization_id and m.user_id=(select auth.uid()) and m.membership_status='ACTIVE' and r.binding_status='ACTIVE' and r.role_code=any(array['S0_SOVEREIGN','B1_CEO','B2_MANAGER','B2.2'])));
create policy articles_operator_delete on workspace_data.articles for delete to authenticated using (exists (select 1 from identity.organization_memberships m join identity.role_bindings r on r.organization_id=m.organization_id and r.subject_user_id=m.user_id where m.organization_id=workspace_data.articles.organization_id and m.user_id=(select auth.uid()) and m.membership_status='ACTIVE' and r.binding_status='ACTIVE' and r.role_code=any(array['S0_SOVEREIGN','B1_CEO','B2_MANAGER','B2.2'])));

create table workspace_data.team (
 id text primary key default gen_random_uuid()::text,
 organization_id uuid not null references identity.organizations(id) on delete cascade,
 workspace_id uuid references enterprise.workspaces(id) on delete set null,
 created_by_user_id uuid references auth.users(id) on delete set null,
  "title" text,
  "role" text,
  "focus" text,
  "status" text,
  "bio" text,
 extra_data jsonb not null default '{}'::jsonb,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
alter table workspace_data.team enable row level security;
create index team_org_workspace_idx on workspace_data.team(organization_id,workspace_id,created_at desc);
create policy team_member_read on workspace_data.team for select to authenticated using (exists (select 1 from identity.organization_memberships m where m.organization_id=workspace_data.team.organization_id and m.user_id=(select auth.uid()) and m.membership_status='ACTIVE'));
create policy team_operator_insert on workspace_data.team for insert to authenticated with check (created_by_user_id=(select auth.uid()) and exists (select 1 from identity.organization_memberships m join identity.role_bindings r on r.organization_id=m.organization_id and r.subject_user_id=m.user_id where m.organization_id=workspace_data.team.organization_id and m.user_id=(select auth.uid()) and m.membership_status='ACTIVE' and r.binding_status='ACTIVE' and r.role_code=any(array['S0_SOVEREIGN','B1_CEO','B2_MANAGER','B2.2'])));
create policy team_operator_update on workspace_data.team for update to authenticated using (exists (select 1 from identity.organization_memberships m join identity.role_bindings r on r.organization_id=m.organization_id and r.subject_user_id=m.user_id where m.organization_id=workspace_data.team.organization_id and m.user_id=(select auth.uid()) and m.membership_status='ACTIVE' and r.binding_status='ACTIVE' and r.role_code=any(array['S0_SOVEREIGN','B1_CEO','B2_MANAGER','B2.2']))) with check (exists (select 1 from identity.organization_memberships m join identity.role_bindings r on r.organization_id=m.organization_id and r.subject_user_id=m.user_id where m.organization_id=workspace_data.team.organization_id and m.user_id=(select auth.uid()) and m.membership_status='ACTIVE' and r.binding_status='ACTIVE' and r.role_code=any(array['S0_SOVEREIGN','B1_CEO','B2_MANAGER','B2.2'])));
create policy team_operator_delete on workspace_data.team for delete to authenticated using (exists (select 1 from identity.organization_memberships m join identity.role_bindings r on r.organization_id=m.organization_id and r.subject_user_id=m.user_id where m.organization_id=workspace_data.team.organization_id and m.user_id=(select auth.uid()) and m.membership_status='ACTIVE' and r.binding_status='ACTIVE' and r.role_code=any(array['S0_SOVEREIGN','B1_CEO','B2_MANAGER','B2.2'])));

create table workspace_data.people_agents (
 id text primary key default gen_random_uuid()::text,
 organization_id uuid not null references identity.organizations(id) on delete cascade,
 workspace_id uuid references enterprise.workspaces(id) on delete set null,
 created_by_user_id uuid references auth.users(id) on delete set null,
  "title" text,
  "codename" text,
  "role" text,
  "status" text,
  "task" text,
  "rank" text,
  "domain" text,
  "squad" text,
  "cadence" text,
 extra_data jsonb not null default '{}'::jsonb,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
alter table workspace_data.people_agents enable row level security;
create index people_agents_org_workspace_idx on workspace_data.people_agents(organization_id,workspace_id,created_at desc);
create policy people_agents_member_read on workspace_data.people_agents for select to authenticated using (exists (select 1 from identity.organization_memberships m where m.organization_id=workspace_data.people_agents.organization_id and m.user_id=(select auth.uid()) and m.membership_status='ACTIVE'));
create policy people_agents_operator_insert on workspace_data.people_agents for insert to authenticated with check (created_by_user_id=(select auth.uid()) and exists (select 1 from identity.organization_memberships m join identity.role_bindings r on r.organization_id=m.organization_id and r.subject_user_id=m.user_id where m.organization_id=workspace_data.people_agents.organization_id and m.user_id=(select auth.uid()) and m.membership_status='ACTIVE' and r.binding_status='ACTIVE' and r.role_code=any(array['S0_SOVEREIGN','B1_CEO','B2_MANAGER','B2.2'])));
create policy people_agents_operator_update on workspace_data.people_agents for update to authenticated using (exists (select 1 from identity.organization_memberships m join identity.role_bindings r on r.organization_id=m.organization_id and r.subject_user_id=m.user_id where m.organization_id=workspace_data.people_agents.organization_id and m.user_id=(select auth.uid()) and m.membership_status='ACTIVE' and r.binding_status='ACTIVE' and r.role_code=any(array['S0_SOVEREIGN','B1_CEO','B2_MANAGER','B2.2']))) with check (exists (select 1 from identity.organization_memberships m join identity.role_bindings r on r.organization_id=m.organization_id and r.subject_user_id=m.user_id where m.organization_id=workspace_data.people_agents.organization_id and m.user_id=(select auth.uid()) and m.membership_status='ACTIVE' and r.binding_status='ACTIVE' and r.role_code=any(array['S0_SOVEREIGN','B1_CEO','B2_MANAGER','B2.2'])));
create policy people_agents_operator_delete on workspace_data.people_agents for delete to authenticated using (exists (select 1 from identity.organization_memberships m join identity.role_bindings r on r.organization_id=m.organization_id and r.subject_user_id=m.user_id where m.organization_id=workspace_data.people_agents.organization_id and m.user_id=(select auth.uid()) and m.membership_status='ACTIVE' and r.binding_status='ACTIVE' and r.role_code=any(array['S0_SOVEREIGN','B1_CEO','B2_MANAGER','B2.2'])));

create table workspace_data.runbooks (
 id text primary key default gen_random_uuid()::text,
 organization_id uuid not null references identity.organizations(id) on delete cascade,
 workspace_id uuid references enterprise.workspaces(id) on delete set null,
 created_by_user_id uuid references auth.users(id) on delete set null,
  "title" text,
  "category" text,
  "updated" text,
  "steps" text,
 extra_data jsonb not null default '{}'::jsonb,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
alter table workspace_data.runbooks enable row level security;
create index runbooks_org_workspace_idx on workspace_data.runbooks(organization_id,workspace_id,created_at desc);
create policy runbooks_member_read on workspace_data.runbooks for select to authenticated using (exists (select 1 from identity.organization_memberships m where m.organization_id=workspace_data.runbooks.organization_id and m.user_id=(select auth.uid()) and m.membership_status='ACTIVE'));
create policy runbooks_operator_insert on workspace_data.runbooks for insert to authenticated with check (created_by_user_id=(select auth.uid()) and exists (select 1 from identity.organization_memberships m join identity.role_bindings r on r.organization_id=m.organization_id and r.subject_user_id=m.user_id where m.organization_id=workspace_data.runbooks.organization_id and m.user_id=(select auth.uid()) and m.membership_status='ACTIVE' and r.binding_status='ACTIVE' and r.role_code=any(array['S0_SOVEREIGN','B1_CEO','B2_MANAGER','B2.2'])));
create policy runbooks_operator_update on workspace_data.runbooks for update to authenticated using (exists (select 1 from identity.organization_memberships m join identity.role_bindings r on r.organization_id=m.organization_id and r.subject_user_id=m.user_id where m.organization_id=workspace_data.runbooks.organization_id and m.user_id=(select auth.uid()) and m.membership_status='ACTIVE' and r.binding_status='ACTIVE' and r.role_code=any(array['S0_SOVEREIGN','B1_CEO','B2_MANAGER','B2.2']))) with check (exists (select 1 from identity.organization_memberships m join identity.role_bindings r on r.organization_id=m.organization_id and r.subject_user_id=m.user_id where m.organization_id=workspace_data.runbooks.organization_id and m.user_id=(select auth.uid()) and m.membership_status='ACTIVE' and r.binding_status='ACTIVE' and r.role_code=any(array['S0_SOVEREIGN','B1_CEO','B2_MANAGER','B2.2'])));
create policy runbooks_operator_delete on workspace_data.runbooks for delete to authenticated using (exists (select 1 from identity.organization_memberships m join identity.role_bindings r on r.organization_id=m.organization_id and r.subject_user_id=m.user_id where m.organization_id=workspace_data.runbooks.organization_id and m.user_id=(select auth.uid()) and m.membership_status='ACTIVE' and r.binding_status='ACTIVE' and r.role_code=any(array['S0_SOVEREIGN','B1_CEO','B2_MANAGER','B2.2'])));

create table workspace_data.incidents (
 id text primary key default gen_random_uuid()::text,
 organization_id uuid not null references identity.organizations(id) on delete cascade,
 workspace_id uuid references enterprise.workspaces(id) on delete set null,
 created_by_user_id uuid references auth.users(id) on delete set null,
  "title" text,
  "when" text,
  "severity" text,
  "resolution" text,
 extra_data jsonb not null default '{}'::jsonb,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
alter table workspace_data.incidents enable row level security;
create index incidents_org_workspace_idx on workspace_data.incidents(organization_id,workspace_id,created_at desc);
create policy incidents_member_read on workspace_data.incidents for select to authenticated using (exists (select 1 from identity.organization_memberships m where m.organization_id=workspace_data.incidents.organization_id and m.user_id=(select auth.uid()) and m.membership_status='ACTIVE'));
create policy incidents_operator_insert on workspace_data.incidents for insert to authenticated with check (created_by_user_id=(select auth.uid()) and exists (select 1 from identity.organization_memberships m join identity.role_bindings r on r.organization_id=m.organization_id and r.subject_user_id=m.user_id where m.organization_id=workspace_data.incidents.organization_id and m.user_id=(select auth.uid()) and m.membership_status='ACTIVE' and r.binding_status='ACTIVE' and r.role_code=any(array['S0_SOVEREIGN','B1_CEO','B2_MANAGER','B2.2'])));
create policy incidents_operator_update on workspace_data.incidents for update to authenticated using (exists (select 1 from identity.organization_memberships m join identity.role_bindings r on r.organization_id=m.organization_id and r.subject_user_id=m.user_id where m.organization_id=workspace_data.incidents.organization_id and m.user_id=(select auth.uid()) and m.membership_status='ACTIVE' and r.binding_status='ACTIVE' and r.role_code=any(array['S0_SOVEREIGN','B1_CEO','B2_MANAGER','B2.2']))) with check (exists (select 1 from identity.organization_memberships m join identity.role_bindings r on r.organization_id=m.organization_id and r.subject_user_id=m.user_id where m.organization_id=workspace_data.incidents.organization_id and m.user_id=(select auth.uid()) and m.membership_status='ACTIVE' and r.binding_status='ACTIVE' and r.role_code=any(array['S0_SOVEREIGN','B1_CEO','B2_MANAGER','B2.2'])));
create policy incidents_operator_delete on workspace_data.incidents for delete to authenticated using (exists (select 1 from identity.organization_memberships m join identity.role_bindings r on r.organization_id=m.organization_id and r.subject_user_id=m.user_id where m.organization_id=workspace_data.incidents.organization_id and m.user_id=(select auth.uid()) and m.membership_status='ACTIVE' and r.binding_status='ACTIVE' and r.role_code=any(array['S0_SOVEREIGN','B1_CEO','B2_MANAGER','B2.2'])));

create table workspace_data.services (
 id text primary key default gen_random_uuid()::text,
 organization_id uuid not null references identity.organizations(id) on delete cascade,
 workspace_id uuid references enterprise.workspaces(id) on delete set null,
 created_by_user_id uuid references auth.users(id) on delete set null,
  "title" text,
  "note" text,
  "status" text,
  "detail" text,
 extra_data jsonb not null default '{}'::jsonb,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
alter table workspace_data.services enable row level security;
create index services_org_workspace_idx on workspace_data.services(organization_id,workspace_id,created_at desc);
create policy services_member_read on workspace_data.services for select to authenticated using (exists (select 1 from identity.organization_memberships m where m.organization_id=workspace_data.services.organization_id and m.user_id=(select auth.uid()) and m.membership_status='ACTIVE'));
create policy services_operator_insert on workspace_data.services for insert to authenticated with check (created_by_user_id=(select auth.uid()) and exists (select 1 from identity.organization_memberships m join identity.role_bindings r on r.organization_id=m.organization_id and r.subject_user_id=m.user_id where m.organization_id=workspace_data.services.organization_id and m.user_id=(select auth.uid()) and m.membership_status='ACTIVE' and r.binding_status='ACTIVE' and r.role_code=any(array['S0_SOVEREIGN','B1_CEO','B2_MANAGER','B2.2'])));
create policy services_operator_update on workspace_data.services for update to authenticated using (exists (select 1 from identity.organization_memberships m join identity.role_bindings r on r.organization_id=m.organization_id and r.subject_user_id=m.user_id where m.organization_id=workspace_data.services.organization_id and m.user_id=(select auth.uid()) and m.membership_status='ACTIVE' and r.binding_status='ACTIVE' and r.role_code=any(array['S0_SOVEREIGN','B1_CEO','B2_MANAGER','B2.2']))) with check (exists (select 1 from identity.organization_memberships m join identity.role_bindings r on r.organization_id=m.organization_id and r.subject_user_id=m.user_id where m.organization_id=workspace_data.services.organization_id and m.user_id=(select auth.uid()) and m.membership_status='ACTIVE' and r.binding_status='ACTIVE' and r.role_code=any(array['S0_SOVEREIGN','B1_CEO','B2_MANAGER','B2.2'])));
create policy services_operator_delete on workspace_data.services for delete to authenticated using (exists (select 1 from identity.organization_memberships m join identity.role_bindings r on r.organization_id=m.organization_id and r.subject_user_id=m.user_id where m.organization_id=workspace_data.services.organization_id and m.user_id=(select auth.uid()) and m.membership_status='ACTIVE' and r.binding_status='ACTIVE' and r.role_code=any(array['S0_SOVEREIGN','B1_CEO','B2_MANAGER','B2.2'])));

create table workspace_data.it_experiments (
 id text primary key default gen_random_uuid()::text,
 organization_id uuid not null references identity.organizations(id) on delete cascade,
 workspace_id uuid references enterprise.workspaces(id) on delete set null,
 created_by_user_id uuid references auth.users(id) on delete set null,
  "title" text,
  "stage" text,
  "meta" text,
  "notes" text,
 extra_data jsonb not null default '{}'::jsonb,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
alter table workspace_data.it_experiments enable row level security;
create index it_experiments_org_workspace_idx on workspace_data.it_experiments(organization_id,workspace_id,created_at desc);
create policy it_experiments_member_read on workspace_data.it_experiments for select to authenticated using (exists (select 1 from identity.organization_memberships m where m.organization_id=workspace_data.it_experiments.organization_id and m.user_id=(select auth.uid()) and m.membership_status='ACTIVE'));
create policy it_experiments_operator_insert on workspace_data.it_experiments for insert to authenticated with check (created_by_user_id=(select auth.uid()) and exists (select 1 from identity.organization_memberships m join identity.role_bindings r on r.organization_id=m.organization_id and r.subject_user_id=m.user_id where m.organization_id=workspace_data.it_experiments.organization_id and m.user_id=(select auth.uid()) and m.membership_status='ACTIVE' and r.binding_status='ACTIVE' and r.role_code=any(array['S0_SOVEREIGN','B1_CEO','B2_MANAGER','B2.2'])));
create policy it_experiments_operator_update on workspace_data.it_experiments for update to authenticated using (exists (select 1 from identity.organization_memberships m join identity.role_bindings r on r.organization_id=m.organization_id and r.subject_user_id=m.user_id where m.organization_id=workspace_data.it_experiments.organization_id and m.user_id=(select auth.uid()) and m.membership_status='ACTIVE' and r.binding_status='ACTIVE' and r.role_code=any(array['S0_SOVEREIGN','B1_CEO','B2_MANAGER','B2.2']))) with check (exists (select 1 from identity.organization_memberships m join identity.role_bindings r on r.organization_id=m.organization_id and r.subject_user_id=m.user_id where m.organization_id=workspace_data.it_experiments.organization_id and m.user_id=(select auth.uid()) and m.membership_status='ACTIVE' and r.binding_status='ACTIVE' and r.role_code=any(array['S0_SOVEREIGN','B1_CEO','B2_MANAGER','B2.2'])));
create policy it_experiments_operator_delete on workspace_data.it_experiments for delete to authenticated using (exists (select 1 from identity.organization_memberships m join identity.role_bindings r on r.organization_id=m.organization_id and r.subject_user_id=m.user_id where m.organization_id=workspace_data.it_experiments.organization_id and m.user_id=(select auth.uid()) and m.membership_status='ACTIVE' and r.binding_status='ACTIVE' and r.role_code=any(array['S0_SOVEREIGN','B1_CEO','B2_MANAGER','B2.2'])));

create table workspace_data.deploys (
 id text primary key default gen_random_uuid()::text,
 organization_id uuid not null references identity.organizations(id) on delete cascade,
 workspace_id uuid references enterprise.workspaces(id) on delete set null,
 created_by_user_id uuid references auth.users(id) on delete set null,
  "title" text,
  "target" text,
  "when" text,
  "status" text,
 extra_data jsonb not null default '{}'::jsonb,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
alter table workspace_data.deploys enable row level security;
create index deploys_org_workspace_idx on workspace_data.deploys(organization_id,workspace_id,created_at desc);
create policy deploys_member_read on workspace_data.deploys for select to authenticated using (exists (select 1 from identity.organization_memberships m where m.organization_id=workspace_data.deploys.organization_id and m.user_id=(select auth.uid()) and m.membership_status='ACTIVE'));
create policy deploys_operator_insert on workspace_data.deploys for insert to authenticated with check (created_by_user_id=(select auth.uid()) and exists (select 1 from identity.organization_memberships m join identity.role_bindings r on r.organization_id=m.organization_id and r.subject_user_id=m.user_id where m.organization_id=workspace_data.deploys.organization_id and m.user_id=(select auth.uid()) and m.membership_status='ACTIVE' and r.binding_status='ACTIVE' and r.role_code=any(array['S0_SOVEREIGN','B1_CEO','B2_MANAGER','B2.2'])));
create policy deploys_operator_update on workspace_data.deploys for update to authenticated using (exists (select 1 from identity.organization_memberships m join identity.role_bindings r on r.organization_id=m.organization_id and r.subject_user_id=m.user_id where m.organization_id=workspace_data.deploys.organization_id and m.user_id=(select auth.uid()) and m.membership_status='ACTIVE' and r.binding_status='ACTIVE' and r.role_code=any(array['S0_SOVEREIGN','B1_CEO','B2_MANAGER','B2.2']))) with check (exists (select 1 from identity.organization_memberships m join identity.role_bindings r on r.organization_id=m.organization_id and r.subject_user_id=m.user_id where m.organization_id=workspace_data.deploys.organization_id and m.user_id=(select auth.uid()) and m.membership_status='ACTIVE' and r.binding_status='ACTIVE' and r.role_code=any(array['S0_SOVEREIGN','B1_CEO','B2_MANAGER','B2.2'])));
create policy deploys_operator_delete on workspace_data.deploys for delete to authenticated using (exists (select 1 from identity.organization_memberships m join identity.role_bindings r on r.organization_id=m.organization_id and r.subject_user_id=m.user_id where m.organization_id=workspace_data.deploys.organization_id and m.user_id=(select auth.uid()) and m.membership_status='ACTIVE' and r.binding_status='ACTIVE' and r.role_code=any(array['S0_SOVEREIGN','B1_CEO','B2_MANAGER','B2.2'])));

create table workspace_data.tasks (
 id text primary key default gen_random_uuid()::text,
 organization_id uuid not null references identity.organizations(id) on delete cascade,
 workspace_id uuid references enterprise.workspaces(id) on delete set null,
 created_by_user_id uuid references auth.users(id) on delete set null,
  "title" text,
  "when" text,
  "group" text,
  "done" text,
 extra_data jsonb not null default '{}'::jsonb,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
alter table workspace_data.tasks enable row level security;
create index tasks_org_workspace_idx on workspace_data.tasks(organization_id,workspace_id,created_at desc);
create policy tasks_member_read on workspace_data.tasks for select to authenticated using (exists (select 1 from identity.organization_memberships m where m.organization_id=workspace_data.tasks.organization_id and m.user_id=(select auth.uid()) and m.membership_status='ACTIVE'));
create policy tasks_operator_insert on workspace_data.tasks for insert to authenticated with check (created_by_user_id=(select auth.uid()) and exists (select 1 from identity.organization_memberships m join identity.role_bindings r on r.organization_id=m.organization_id and r.subject_user_id=m.user_id where m.organization_id=workspace_data.tasks.organization_id and m.user_id=(select auth.uid()) and m.membership_status='ACTIVE' and r.binding_status='ACTIVE' and r.role_code=any(array['S0_SOVEREIGN','B1_CEO','B2_MANAGER','B2.2'])));
create policy tasks_operator_update on workspace_data.tasks for update to authenticated using (exists (select 1 from identity.organization_memberships m join identity.role_bindings r on r.organization_id=m.organization_id and r.subject_user_id=m.user_id where m.organization_id=workspace_data.tasks.organization_id and m.user_id=(select auth.uid()) and m.membership_status='ACTIVE' and r.binding_status='ACTIVE' and r.role_code=any(array['S0_SOVEREIGN','B1_CEO','B2_MANAGER','B2.2']))) with check (exists (select 1 from identity.organization_memberships m join identity.role_bindings r on r.organization_id=m.organization_id and r.subject_user_id=m.user_id where m.organization_id=workspace_data.tasks.organization_id and m.user_id=(select auth.uid()) and m.membership_status='ACTIVE' and r.binding_status='ACTIVE' and r.role_code=any(array['S0_SOVEREIGN','B1_CEO','B2_MANAGER','B2.2'])));
create policy tasks_operator_delete on workspace_data.tasks for delete to authenticated using (exists (select 1 from identity.organization_memberships m join identity.role_bindings r on r.organization_id=m.organization_id and r.subject_user_id=m.user_id where m.organization_id=workspace_data.tasks.organization_id and m.user_id=(select auth.uid()) and m.membership_status='ACTIVE' and r.binding_status='ACTIVE' and r.role_code=any(array['S0_SOVEREIGN','B1_CEO','B2_MANAGER','B2.2'])));

create table workspace_data.marketplace_listings (
 id text primary key default gen_random_uuid()::text,
 organization_id uuid not null references identity.organizations(id) on delete cascade,
 workspace_id uuid references enterprise.workspaces(id) on delete set null,
 created_by_user_id uuid references auth.users(id) on delete set null,
  "title" text,
  "tag" text,
  "blurb" text,
  "installed" text,
  "featured" text,
 extra_data jsonb not null default '{}'::jsonb,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
alter table workspace_data.marketplace_listings enable row level security;
create index marketplace_listings_org_workspace_idx on workspace_data.marketplace_listings(organization_id,workspace_id,created_at desc);
create policy marketplace_listings_member_read on workspace_data.marketplace_listings for select to authenticated using (exists (select 1 from identity.organization_memberships m where m.organization_id=workspace_data.marketplace_listings.organization_id and m.user_id=(select auth.uid()) and m.membership_status='ACTIVE'));
create policy marketplace_listings_operator_insert on workspace_data.marketplace_listings for insert to authenticated with check (created_by_user_id=(select auth.uid()) and exists (select 1 from identity.organization_memberships m join identity.role_bindings r on r.organization_id=m.organization_id and r.subject_user_id=m.user_id where m.organization_id=workspace_data.marketplace_listings.organization_id and m.user_id=(select auth.uid()) and m.membership_status='ACTIVE' and r.binding_status='ACTIVE' and r.role_code=any(array['S0_SOVEREIGN','B1_CEO','B2_MANAGER','B2.2'])));
create policy marketplace_listings_operator_update on workspace_data.marketplace_listings for update to authenticated using (exists (select 1 from identity.organization_memberships m join identity.role_bindings r on r.organization_id=m.organization_id and r.subject_user_id=m.user_id where m.organization_id=workspace_data.marketplace_listings.organization_id and m.user_id=(select auth.uid()) and m.membership_status='ACTIVE' and r.binding_status='ACTIVE' and r.role_code=any(array['S0_SOVEREIGN','B1_CEO','B2_MANAGER','B2.2']))) with check (exists (select 1 from identity.organization_memberships m join identity.role_bindings r on r.organization_id=m.organization_id and r.subject_user_id=m.user_id where m.organization_id=workspace_data.marketplace_listings.organization_id and m.user_id=(select auth.uid()) and m.membership_status='ACTIVE' and r.binding_status='ACTIVE' and r.role_code=any(array['S0_SOVEREIGN','B1_CEO','B2_MANAGER','B2.2'])));
create policy marketplace_listings_operator_delete on workspace_data.marketplace_listings for delete to authenticated using (exists (select 1 from identity.organization_memberships m join identity.role_bindings r on r.organization_id=m.organization_id and r.subject_user_id=m.user_id where m.organization_id=workspace_data.marketplace_listings.organization_id and m.user_id=(select auth.uid()) and m.membership_status='ACTIVE' and r.binding_status='ACTIVE' and r.role_code=any(array['S0_SOVEREIGN','B1_CEO','B2_MANAGER','B2.2'])));

create table workspace_data.product_items (
 id text primary key default gen_random_uuid()::text,
 organization_id uuid not null references identity.organizations(id) on delete cascade,
 workspace_id uuid references enterprise.workspaces(id) on delete set null,
 created_by_user_id uuid references auth.users(id) on delete set null,
  "title" text,
  "stage" text,
  "meta" text,
  "priority" text,
 extra_data jsonb not null default '{}'::jsonb,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
alter table workspace_data.product_items enable row level security;
create index product_items_org_workspace_idx on workspace_data.product_items(organization_id,workspace_id,created_at desc);
create policy product_items_member_read on workspace_data.product_items for select to authenticated using (exists (select 1 from identity.organization_memberships m where m.organization_id=workspace_data.product_items.organization_id and m.user_id=(select auth.uid()) and m.membership_status='ACTIVE'));
create policy product_items_operator_insert on workspace_data.product_items for insert to authenticated with check (created_by_user_id=(select auth.uid()) and exists (select 1 from identity.organization_memberships m join identity.role_bindings r on r.organization_id=m.organization_id and r.subject_user_id=m.user_id where m.organization_id=workspace_data.product_items.organization_id and m.user_id=(select auth.uid()) and m.membership_status='ACTIVE' and r.binding_status='ACTIVE' and r.role_code=any(array['S0_SOVEREIGN','B1_CEO','B2_MANAGER','B2.2'])));
create policy product_items_operator_update on workspace_data.product_items for update to authenticated using (exists (select 1 from identity.organization_memberships m join identity.role_bindings r on r.organization_id=m.organization_id and r.subject_user_id=m.user_id where m.organization_id=workspace_data.product_items.organization_id and m.user_id=(select auth.uid()) and m.membership_status='ACTIVE' and r.binding_status='ACTIVE' and r.role_code=any(array['S0_SOVEREIGN','B1_CEO','B2_MANAGER','B2.2']))) with check (exists (select 1 from identity.organization_memberships m join identity.role_bindings r on r.organization_id=m.organization_id and r.subject_user_id=m.user_id where m.organization_id=workspace_data.product_items.organization_id and m.user_id=(select auth.uid()) and m.membership_status='ACTIVE' and r.binding_status='ACTIVE' and r.role_code=any(array['S0_SOVEREIGN','B1_CEO','B2_MANAGER','B2.2'])));
create policy product_items_operator_delete on workspace_data.product_items for delete to authenticated using (exists (select 1 from identity.organization_memberships m join identity.role_bindings r on r.organization_id=m.organization_id and r.subject_user_id=m.user_id where m.organization_id=workspace_data.product_items.organization_id and m.user_id=(select auth.uid()) and m.membership_status='ACTIVE' and r.binding_status='ACTIVE' and r.role_code=any(array['S0_SOVEREIGN','B1_CEO','B2_MANAGER','B2.2'])));

create table workspace_data.product_releases (
 id text primary key default gen_random_uuid()::text,
 organization_id uuid not null references identity.organizations(id) on delete cascade,
 workspace_id uuid references enterprise.workspaces(id) on delete set null,
 created_by_user_id uuid references auth.users(id) on delete set null,
  "title" text,
  "version" text,
  "when" text,
  "notes" text,
 extra_data jsonb not null default '{}'::jsonb,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
alter table workspace_data.product_releases enable row level security;
create index product_releases_org_workspace_idx on workspace_data.product_releases(organization_id,workspace_id,created_at desc);
create policy product_releases_member_read on workspace_data.product_releases for select to authenticated using (exists (select 1 from identity.organization_memberships m where m.organization_id=workspace_data.product_releases.organization_id and m.user_id=(select auth.uid()) and m.membership_status='ACTIVE'));
create policy product_releases_operator_insert on workspace_data.product_releases for insert to authenticated with check (created_by_user_id=(select auth.uid()) and exists (select 1 from identity.organization_memberships m join identity.role_bindings r on r.organization_id=m.organization_id and r.subject_user_id=m.user_id where m.organization_id=workspace_data.product_releases.organization_id and m.user_id=(select auth.uid()) and m.membership_status='ACTIVE' and r.binding_status='ACTIVE' and r.role_code=any(array['S0_SOVEREIGN','B1_CEO','B2_MANAGER','B2.2'])));
create policy product_releases_operator_update on workspace_data.product_releases for update to authenticated using (exists (select 1 from identity.organization_memberships m join identity.role_bindings r on r.organization_id=m.organization_id and r.subject_user_id=m.user_id where m.organization_id=workspace_data.product_releases.organization_id and m.user_id=(select auth.uid()) and m.membership_status='ACTIVE' and r.binding_status='ACTIVE' and r.role_code=any(array['S0_SOVEREIGN','B1_CEO','B2_MANAGER','B2.2']))) with check (exists (select 1 from identity.organization_memberships m join identity.role_bindings r on r.organization_id=m.organization_id and r.subject_user_id=m.user_id where m.organization_id=workspace_data.product_releases.organization_id and m.user_id=(select auth.uid()) and m.membership_status='ACTIVE' and r.binding_status='ACTIVE' and r.role_code=any(array['S0_SOVEREIGN','B1_CEO','B2_MANAGER','B2.2'])));
create policy product_releases_operator_delete on workspace_data.product_releases for delete to authenticated using (exists (select 1 from identity.organization_memberships m join identity.role_bindings r on r.organization_id=m.organization_id and r.subject_user_id=m.user_id where m.organization_id=workspace_data.product_releases.organization_id and m.user_id=(select auth.uid()) and m.membership_status='ACTIVE' and r.binding_status='ACTIVE' and r.role_code=any(array['S0_SOVEREIGN','B1_CEO','B2_MANAGER','B2.2'])));

create table workspace_data.growth_channels (
 id text primary key default gen_random_uuid()::text,
 organization_id uuid not null references identity.organizations(id) on delete cascade,
 workspace_id uuid references enterprise.workspaces(id) on delete set null,
 created_by_user_id uuid references auth.users(id) on delete set null,
  "title" text,
  "leads" numeric,
  "cac" numeric,
  "trend" text,
 extra_data jsonb not null default '{}'::jsonb,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
alter table workspace_data.growth_channels enable row level security;
create index growth_channels_org_workspace_idx on workspace_data.growth_channels(organization_id,workspace_id,created_at desc);
create policy growth_channels_member_read on workspace_data.growth_channels for select to authenticated using (exists (select 1 from identity.organization_memberships m where m.organization_id=workspace_data.growth_channels.organization_id and m.user_id=(select auth.uid()) and m.membership_status='ACTIVE'));
create policy growth_channels_operator_insert on workspace_data.growth_channels for insert to authenticated with check (created_by_user_id=(select auth.uid()) and exists (select 1 from identity.organization_memberships m join identity.role_bindings r on r.organization_id=m.organization_id and r.subject_user_id=m.user_id where m.organization_id=workspace_data.growth_channels.organization_id and m.user_id=(select auth.uid()) and m.membership_status='ACTIVE' and r.binding_status='ACTIVE' and r.role_code=any(array['S0_SOVEREIGN','B1_CEO','B2_MANAGER','B2.2'])));
create policy growth_channels_operator_update on workspace_data.growth_channels for update to authenticated using (exists (select 1 from identity.organization_memberships m join identity.role_bindings r on r.organization_id=m.organization_id and r.subject_user_id=m.user_id where m.organization_id=workspace_data.growth_channels.organization_id and m.user_id=(select auth.uid()) and m.membership_status='ACTIVE' and r.binding_status='ACTIVE' and r.role_code=any(array['S0_SOVEREIGN','B1_CEO','B2_MANAGER','B2.2']))) with check (exists (select 1 from identity.organization_memberships m join identity.role_bindings r on r.organization_id=m.organization_id and r.subject_user_id=m.user_id where m.organization_id=workspace_data.growth_channels.organization_id and m.user_id=(select auth.uid()) and m.membership_status='ACTIVE' and r.binding_status='ACTIVE' and r.role_code=any(array['S0_SOVEREIGN','B1_CEO','B2_MANAGER','B2.2'])));
create policy growth_channels_operator_delete on workspace_data.growth_channels for delete to authenticated using (exists (select 1 from identity.organization_memberships m join identity.role_bindings r on r.organization_id=m.organization_id and r.subject_user_id=m.user_id where m.organization_id=workspace_data.growth_channels.organization_id and m.user_id=(select auth.uid()) and m.membership_status='ACTIVE' and r.binding_status='ACTIVE' and r.role_code=any(array['S0_SOVEREIGN','B1_CEO','B2_MANAGER','B2.2'])));

create table workspace_data.growth_experiments (
 id text primary key default gen_random_uuid()::text,
 organization_id uuid not null references identity.organizations(id) on delete cascade,
 workspace_id uuid references enterprise.workspaces(id) on delete set null,
 created_by_user_id uuid references auth.users(id) on delete set null,
  "title" text,
  "lift" text,
  "notes" text,
 extra_data jsonb not null default '{}'::jsonb,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
alter table workspace_data.growth_experiments enable row level security;
create index growth_experiments_org_workspace_idx on workspace_data.growth_experiments(organization_id,workspace_id,created_at desc);
create policy growth_experiments_member_read on workspace_data.growth_experiments for select to authenticated using (exists (select 1 from identity.organization_memberships m where m.organization_id=workspace_data.growth_experiments.organization_id and m.user_id=(select auth.uid()) and m.membership_status='ACTIVE'));
create policy growth_experiments_operator_insert on workspace_data.growth_experiments for insert to authenticated with check (created_by_user_id=(select auth.uid()) and exists (select 1 from identity.organization_memberships m join identity.role_bindings r on r.organization_id=m.organization_id and r.subject_user_id=m.user_id where m.organization_id=workspace_data.growth_experiments.organization_id and m.user_id=(select auth.uid()) and m.membership_status='ACTIVE' and r.binding_status='ACTIVE' and r.role_code=any(array['S0_SOVEREIGN','B1_CEO','B2_MANAGER','B2.2'])));
create policy growth_experiments_operator_update on workspace_data.growth_experiments for update to authenticated using (exists (select 1 from identity.organization_memberships m join identity.role_bindings r on r.organization_id=m.organization_id and r.subject_user_id=m.user_id where m.organization_id=workspace_data.growth_experiments.organization_id and m.user_id=(select auth.uid()) and m.membership_status='ACTIVE' and r.binding_status='ACTIVE' and r.role_code=any(array['S0_SOVEREIGN','B1_CEO','B2_MANAGER','B2.2']))) with check (exists (select 1 from identity.organization_memberships m join identity.role_bindings r on r.organization_id=m.organization_id and r.subject_user_id=m.user_id where m.organization_id=workspace_data.growth_experiments.organization_id and m.user_id=(select auth.uid()) and m.membership_status='ACTIVE' and r.binding_status='ACTIVE' and r.role_code=any(array['S0_SOVEREIGN','B1_CEO','B2_MANAGER','B2.2'])));
create policy growth_experiments_operator_delete on workspace_data.growth_experiments for delete to authenticated using (exists (select 1 from identity.organization_memberships m join identity.role_bindings r on r.organization_id=m.organization_id and r.subject_user_id=m.user_id where m.organization_id=workspace_data.growth_experiments.organization_id and m.user_id=(select auth.uid()) and m.membership_status='ACTIVE' and r.binding_status='ACTIVE' and r.role_code=any(array['S0_SOVEREIGN','B1_CEO','B2_MANAGER','B2.2'])));

create table workspace_data.deals (
 id text primary key default gen_random_uuid()::text,
 organization_id uuid not null references identity.organizations(id) on delete cascade,
 workspace_id uuid references enterprise.workspaces(id) on delete set null,
 created_by_user_id uuid references auth.users(id) on delete set null,
  "title" text,
  "offer" text,
  "value" numeric,
  "stage" text,
 extra_data jsonb not null default '{}'::jsonb,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
alter table workspace_data.deals enable row level security;
create index deals_org_workspace_idx on workspace_data.deals(organization_id,workspace_id,created_at desc);
create policy deals_member_read on workspace_data.deals for select to authenticated using (exists (select 1 from identity.organization_memberships m where m.organization_id=workspace_data.deals.organization_id and m.user_id=(select auth.uid()) and m.membership_status='ACTIVE'));
create policy deals_operator_insert on workspace_data.deals for insert to authenticated with check (created_by_user_id=(select auth.uid()) and exists (select 1 from identity.organization_memberships m join identity.role_bindings r on r.organization_id=m.organization_id and r.subject_user_id=m.user_id where m.organization_id=workspace_data.deals.organization_id and m.user_id=(select auth.uid()) and m.membership_status='ACTIVE' and r.binding_status='ACTIVE' and r.role_code=any(array['S0_SOVEREIGN','B1_CEO','B2_MANAGER','B2.2'])));
create policy deals_operator_update on workspace_data.deals for update to authenticated using (exists (select 1 from identity.organization_memberships m join identity.role_bindings r on r.organization_id=m.organization_id and r.subject_user_id=m.user_id where m.organization_id=workspace_data.deals.organization_id and m.user_id=(select auth.uid()) and m.membership_status='ACTIVE' and r.binding_status='ACTIVE' and r.role_code=any(array['S0_SOVEREIGN','B1_CEO','B2_MANAGER','B2.2']))) with check (exists (select 1 from identity.organization_memberships m join identity.role_bindings r on r.organization_id=m.organization_id and r.subject_user_id=m.user_id where m.organization_id=workspace_data.deals.organization_id and m.user_id=(select auth.uid()) and m.membership_status='ACTIVE' and r.binding_status='ACTIVE' and r.role_code=any(array['S0_SOVEREIGN','B1_CEO','B2_MANAGER','B2.2'])));
create policy deals_operator_delete on workspace_data.deals for delete to authenticated using (exists (select 1 from identity.organization_memberships m join identity.role_bindings r on r.organization_id=m.organization_id and r.subject_user_id=m.user_id where m.organization_id=workspace_data.deals.organization_id and m.user_id=(select auth.uid()) and m.membership_status='ACTIVE' and r.binding_status='ACTIVE' and r.role_code=any(array['S0_SOVEREIGN','B1_CEO','B2_MANAGER','B2.2'])));

create table workspace_data.invoices (
 id text primary key default gen_random_uuid()::text,
 organization_id uuid not null references identity.organizations(id) on delete cascade,
 workspace_id uuid references enterprise.workspaces(id) on delete set null,
 created_by_user_id uuid references auth.users(id) on delete set null,
  "title" text,
  "amount" numeric,
  "due" text,
  "status" text,
 extra_data jsonb not null default '{}'::jsonb,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
alter table workspace_data.invoices enable row level security;
create index invoices_org_workspace_idx on workspace_data.invoices(organization_id,workspace_id,created_at desc);
create policy invoices_member_read on workspace_data.invoices for select to authenticated using (exists (select 1 from identity.organization_memberships m where m.organization_id=workspace_data.invoices.organization_id and m.user_id=(select auth.uid()) and m.membership_status='ACTIVE'));
create policy invoices_operator_insert on workspace_data.invoices for insert to authenticated with check (created_by_user_id=(select auth.uid()) and exists (select 1 from identity.organization_memberships m join identity.role_bindings r on r.organization_id=m.organization_id and r.subject_user_id=m.user_id where m.organization_id=workspace_data.invoices.organization_id and m.user_id=(select auth.uid()) and m.membership_status='ACTIVE' and r.binding_status='ACTIVE' and r.role_code=any(array['S0_SOVEREIGN','B1_CEO','B2_MANAGER','B2.2'])));
create policy invoices_operator_update on workspace_data.invoices for update to authenticated using (exists (select 1 from identity.organization_memberships m join identity.role_bindings r on r.organization_id=m.organization_id and r.subject_user_id=m.user_id where m.organization_id=workspace_data.invoices.organization_id and m.user_id=(select auth.uid()) and m.membership_status='ACTIVE' and r.binding_status='ACTIVE' and r.role_code=any(array['S0_SOVEREIGN','B1_CEO','B2_MANAGER','B2.2']))) with check (exists (select 1 from identity.organization_memberships m join identity.role_bindings r on r.organization_id=m.organization_id and r.subject_user_id=m.user_id where m.organization_id=workspace_data.invoices.organization_id and m.user_id=(select auth.uid()) and m.membership_status='ACTIVE' and r.binding_status='ACTIVE' and r.role_code=any(array['S0_SOVEREIGN','B1_CEO','B2_MANAGER','B2.2'])));
create policy invoices_operator_delete on workspace_data.invoices for delete to authenticated using (exists (select 1 from identity.organization_memberships m join identity.role_bindings r on r.organization_id=m.organization_id and r.subject_user_id=m.user_id where m.organization_id=workspace_data.invoices.organization_id and m.user_id=(select auth.uid()) and m.membership_status='ACTIVE' and r.binding_status='ACTIVE' and r.role_code=any(array['S0_SOVEREIGN','B1_CEO','B2_MANAGER','B2.2'])));

create table workspace_data.contracts (
 id text primary key default gen_random_uuid()::text,
 organization_id uuid not null references identity.organizations(id) on delete cascade,
 workspace_id uuid references enterprise.workspaces(id) on delete set null,
 created_by_user_id uuid references auth.users(id) on delete set null,
  "title" text,
  "client" text,
  "signed" text,
  "status" text,
 extra_data jsonb not null default '{}'::jsonb,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
alter table workspace_data.contracts enable row level security;
create index contracts_org_workspace_idx on workspace_data.contracts(organization_id,workspace_id,created_at desc);
create policy contracts_member_read on workspace_data.contracts for select to authenticated using (exists (select 1 from identity.organization_memberships m where m.organization_id=workspace_data.contracts.organization_id and m.user_id=(select auth.uid()) and m.membership_status='ACTIVE'));
create policy contracts_operator_insert on workspace_data.contracts for insert to authenticated with check (created_by_user_id=(select auth.uid()) and exists (select 1 from identity.organization_memberships m join identity.role_bindings r on r.organization_id=m.organization_id and r.subject_user_id=m.user_id where m.organization_id=workspace_data.contracts.organization_id and m.user_id=(select auth.uid()) and m.membership_status='ACTIVE' and r.binding_status='ACTIVE' and r.role_code=any(array['S0_SOVEREIGN','B1_CEO','B2_MANAGER','B2.2'])));
create policy contracts_operator_update on workspace_data.contracts for update to authenticated using (exists (select 1 from identity.organization_memberships m join identity.role_bindings r on r.organization_id=m.organization_id and r.subject_user_id=m.user_id where m.organization_id=workspace_data.contracts.organization_id and m.user_id=(select auth.uid()) and m.membership_status='ACTIVE' and r.binding_status='ACTIVE' and r.role_code=any(array['S0_SOVEREIGN','B1_CEO','B2_MANAGER','B2.2']))) with check (exists (select 1 from identity.organization_memberships m join identity.role_bindings r on r.organization_id=m.organization_id and r.subject_user_id=m.user_id where m.organization_id=workspace_data.contracts.organization_id and m.user_id=(select auth.uid()) and m.membership_status='ACTIVE' and r.binding_status='ACTIVE' and r.role_code=any(array['S0_SOVEREIGN','B1_CEO','B2_MANAGER','B2.2'])));
create policy contracts_operator_delete on workspace_data.contracts for delete to authenticated using (exists (select 1 from identity.organization_memberships m join identity.role_bindings r on r.organization_id=m.organization_id and r.subject_user_id=m.user_id where m.organization_id=workspace_data.contracts.organization_id and m.user_id=(select auth.uid()) and m.membership_status='ACTIVE' and r.binding_status='ACTIVE' and r.role_code=any(array['S0_SOVEREIGN','B1_CEO','B2_MANAGER','B2.2'])));

create table workspace_data.policies (
 id text primary key default gen_random_uuid()::text,
 organization_id uuid not null references identity.organizations(id) on delete cascade,
 workspace_id uuid references enterprise.workspaces(id) on delete set null,
 created_by_user_id uuid references auth.users(id) on delete set null,
  "title" text,
  "updated" text,
  "body" text,
 extra_data jsonb not null default '{}'::jsonb,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
alter table workspace_data.policies enable row level security;
create index policies_org_workspace_idx on workspace_data.policies(organization_id,workspace_id,created_at desc);
create policy policies_member_read on workspace_data.policies for select to authenticated using (exists (select 1 from identity.organization_memberships m where m.organization_id=workspace_data.policies.organization_id and m.user_id=(select auth.uid()) and m.membership_status='ACTIVE'));
create policy policies_operator_insert on workspace_data.policies for insert to authenticated with check (created_by_user_id=(select auth.uid()) and exists (select 1 from identity.organization_memberships m join identity.role_bindings r on r.organization_id=m.organization_id and r.subject_user_id=m.user_id where m.organization_id=workspace_data.policies.organization_id and m.user_id=(select auth.uid()) and m.membership_status='ACTIVE' and r.binding_status='ACTIVE' and r.role_code=any(array['S0_SOVEREIGN','B1_CEO','B2_MANAGER','B2.2'])));
create policy policies_operator_update on workspace_data.policies for update to authenticated using (exists (select 1 from identity.organization_memberships m join identity.role_bindings r on r.organization_id=m.organization_id and r.subject_user_id=m.user_id where m.organization_id=workspace_data.policies.organization_id and m.user_id=(select auth.uid()) and m.membership_status='ACTIVE' and r.binding_status='ACTIVE' and r.role_code=any(array['S0_SOVEREIGN','B1_CEO','B2_MANAGER','B2.2']))) with check (exists (select 1 from identity.organization_memberships m join identity.role_bindings r on r.organization_id=m.organization_id and r.subject_user_id=m.user_id where m.organization_id=workspace_data.policies.organization_id and m.user_id=(select auth.uid()) and m.membership_status='ACTIVE' and r.binding_status='ACTIVE' and r.role_code=any(array['S0_SOVEREIGN','B1_CEO','B2_MANAGER','B2.2'])));
create policy policies_operator_delete on workspace_data.policies for delete to authenticated using (exists (select 1 from identity.organization_memberships m join identity.role_bindings r on r.organization_id=m.organization_id and r.subject_user_id=m.user_id where m.organization_id=workspace_data.policies.organization_id and m.user_id=(select auth.uid()) and m.membership_status='ACTIVE' and r.binding_status='ACTIVE' and r.role_code=any(array['S0_SOVEREIGN','B1_CEO','B2_MANAGER','B2.2'])));

create table workspace_data.session_notes (
 id text primary key default gen_random_uuid()::text,
 organization_id uuid not null references identity.organizations(id) on delete cascade,
 workspace_id uuid references enterprise.workspaces(id) on delete set null,
 created_by_user_id uuid references auth.users(id) on delete set null,
  "title" text,
  "client_name" text,
  "date" text,
  "duration" text,
  "sentiment" text,
  "body" text,
 extra_data jsonb not null default '{}'::jsonb,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
alter table workspace_data.session_notes enable row level security;
create index session_notes_org_workspace_idx on workspace_data.session_notes(organization_id,workspace_id,created_at desc);
create policy session_notes_member_read on workspace_data.session_notes for select to authenticated using (exists (select 1 from identity.organization_memberships m where m.organization_id=workspace_data.session_notes.organization_id and m.user_id=(select auth.uid()) and m.membership_status='ACTIVE'));
create policy session_notes_operator_insert on workspace_data.session_notes for insert to authenticated with check (created_by_user_id=(select auth.uid()) and exists (select 1 from identity.organization_memberships m join identity.role_bindings r on r.organization_id=m.organization_id and r.subject_user_id=m.user_id where m.organization_id=workspace_data.session_notes.organization_id and m.user_id=(select auth.uid()) and m.membership_status='ACTIVE' and r.binding_status='ACTIVE' and r.role_code=any(array['S0_SOVEREIGN','B1_CEO','B2_MANAGER','B2.2'])));
create policy session_notes_operator_update on workspace_data.session_notes for update to authenticated using (exists (select 1 from identity.organization_memberships m join identity.role_bindings r on r.organization_id=m.organization_id and r.subject_user_id=m.user_id where m.organization_id=workspace_data.session_notes.organization_id and m.user_id=(select auth.uid()) and m.membership_status='ACTIVE' and r.binding_status='ACTIVE' and r.role_code=any(array['S0_SOVEREIGN','B1_CEO','B2_MANAGER','B2.2']))) with check (exists (select 1 from identity.organization_memberships m join identity.role_bindings r on r.organization_id=m.organization_id and r.subject_user_id=m.user_id where m.organization_id=workspace_data.session_notes.organization_id and m.user_id=(select auth.uid()) and m.membership_status='ACTIVE' and r.binding_status='ACTIVE' and r.role_code=any(array['S0_SOVEREIGN','B1_CEO','B2_MANAGER','B2.2'])));
create policy session_notes_operator_delete on workspace_data.session_notes for delete to authenticated using (exists (select 1 from identity.organization_memberships m join identity.role_bindings r on r.organization_id=m.organization_id and r.subject_user_id=m.user_id where m.organization_id=workspace_data.session_notes.organization_id and m.user_id=(select auth.uid()) and m.membership_status='ACTIVE' and r.binding_status='ACTIVE' and r.role_code=any(array['S0_SOVEREIGN','B1_CEO','B2_MANAGER','B2.2'])));

create table workspace_data.legal_ai_act_checks (
 id text primary key default gen_random_uuid()::text,
 organization_id uuid not null references identity.organizations(id) on delete cascade,
 workspace_id uuid references enterprise.workspaces(id) on delete set null,
 created_by_user_id uuid references auth.users(id) on delete set null,
  "title" text,
  "category" text,
  "done" text,
  "description" text,
  "cleared_at" text,
 extra_data jsonb not null default '{}'::jsonb,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
alter table workspace_data.legal_ai_act_checks enable row level security;
create index legal_ai_act_checks_org_workspace_idx on workspace_data.legal_ai_act_checks(organization_id,workspace_id,created_at desc);
create policy legal_ai_act_checks_member_read on workspace_data.legal_ai_act_checks for select to authenticated using (exists (select 1 from identity.organization_memberships m where m.organization_id=workspace_data.legal_ai_act_checks.organization_id and m.user_id=(select auth.uid()) and m.membership_status='ACTIVE'));
create policy legal_ai_act_checks_operator_insert on workspace_data.legal_ai_act_checks for insert to authenticated with check (created_by_user_id=(select auth.uid()) and exists (select 1 from identity.organization_memberships m join identity.role_bindings r on r.organization_id=m.organization_id and r.subject_user_id=m.user_id where m.organization_id=workspace_data.legal_ai_act_checks.organization_id and m.user_id=(select auth.uid()) and m.membership_status='ACTIVE' and r.binding_status='ACTIVE' and r.role_code=any(array['S0_SOVEREIGN','B1_CEO','B2_MANAGER','B2.2'])));
create policy legal_ai_act_checks_operator_update on workspace_data.legal_ai_act_checks for update to authenticated using (exists (select 1 from identity.organization_memberships m join identity.role_bindings r on r.organization_id=m.organization_id and r.subject_user_id=m.user_id where m.organization_id=workspace_data.legal_ai_act_checks.organization_id and m.user_id=(select auth.uid()) and m.membership_status='ACTIVE' and r.binding_status='ACTIVE' and r.role_code=any(array['S0_SOVEREIGN','B1_CEO','B2_MANAGER','B2.2']))) with check (exists (select 1 from identity.organization_memberships m join identity.role_bindings r on r.organization_id=m.organization_id and r.subject_user_id=m.user_id where m.organization_id=workspace_data.legal_ai_act_checks.organization_id and m.user_id=(select auth.uid()) and m.membership_status='ACTIVE' and r.binding_status='ACTIVE' and r.role_code=any(array['S0_SOVEREIGN','B1_CEO','B2_MANAGER','B2.2'])));
create policy legal_ai_act_checks_operator_delete on workspace_data.legal_ai_act_checks for delete to authenticated using (exists (select 1 from identity.organization_memberships m join identity.role_bindings r on r.organization_id=m.organization_id and r.subject_user_id=m.user_id where m.organization_id=workspace_data.legal_ai_act_checks.organization_id and m.user_id=(select auth.uid()) and m.membership_status='ACTIVE' and r.binding_status='ACTIVE' and r.role_code=any(array['S0_SOVEREIGN','B1_CEO','B2_MANAGER','B2.2'])));

create table workspace_data.legal_frameworks (
 id text primary key default gen_random_uuid()::text,
 organization_id uuid not null references identity.organizations(id) on delete cascade,
 workspace_id uuid references enterprise.workspaces(id) on delete set null,
 created_by_user_id uuid references auth.users(id) on delete set null,
  "title" text,
  "family" text,
  "short" text,
  "scope" text,
  "owner" text,
  "applies_from" text,
  "status" text,
 extra_data jsonb not null default '{}'::jsonb,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
alter table workspace_data.legal_frameworks enable row level security;
create index legal_frameworks_org_workspace_idx on workspace_data.legal_frameworks(organization_id,workspace_id,created_at desc);
create policy legal_frameworks_member_read on workspace_data.legal_frameworks for select to authenticated using (exists (select 1 from identity.organization_memberships m where m.organization_id=workspace_data.legal_frameworks.organization_id and m.user_id=(select auth.uid()) and m.membership_status='ACTIVE'));
create policy legal_frameworks_operator_insert on workspace_data.legal_frameworks for insert to authenticated with check (created_by_user_id=(select auth.uid()) and exists (select 1 from identity.organization_memberships m join identity.role_bindings r on r.organization_id=m.organization_id and r.subject_user_id=m.user_id where m.organization_id=workspace_data.legal_frameworks.organization_id and m.user_id=(select auth.uid()) and m.membership_status='ACTIVE' and r.binding_status='ACTIVE' and r.role_code=any(array['S0_SOVEREIGN','B1_CEO','B2_MANAGER','B2.2'])));
create policy legal_frameworks_operator_update on workspace_data.legal_frameworks for update to authenticated using (exists (select 1 from identity.organization_memberships m join identity.role_bindings r on r.organization_id=m.organization_id and r.subject_user_id=m.user_id where m.organization_id=workspace_data.legal_frameworks.organization_id and m.user_id=(select auth.uid()) and m.membership_status='ACTIVE' and r.binding_status='ACTIVE' and r.role_code=any(array['S0_SOVEREIGN','B1_CEO','B2_MANAGER','B2.2']))) with check (exists (select 1 from identity.organization_memberships m join identity.role_bindings r on r.organization_id=m.organization_id and r.subject_user_id=m.user_id where m.organization_id=workspace_data.legal_frameworks.organization_id and m.user_id=(select auth.uid()) and m.membership_status='ACTIVE' and r.binding_status='ACTIVE' and r.role_code=any(array['S0_SOVEREIGN','B1_CEO','B2_MANAGER','B2.2'])));
create policy legal_frameworks_operator_delete on workspace_data.legal_frameworks for delete to authenticated using (exists (select 1 from identity.organization_memberships m join identity.role_bindings r on r.organization_id=m.organization_id and r.subject_user_id=m.user_id where m.organization_id=workspace_data.legal_frameworks.organization_id and m.user_id=(select auth.uid()) and m.membership_status='ACTIVE' and r.binding_status='ACTIVE' and r.role_code=any(array['S0_SOVEREIGN','B1_CEO','B2_MANAGER','B2.2'])));

create table workspace_data.legal_controls (
 id text primary key default gen_random_uuid()::text,
 organization_id uuid not null references identity.organizations(id) on delete cascade,
 workspace_id uuid references enterprise.workspaces(id) on delete set null,
 created_by_user_id uuid references auth.users(id) on delete set null,
  "title" text,
  "framework" text,
  "severity" text,
  "owner" text,
  "evidence_count" numeric,
  "last_tested" text,
  "status" text,
 extra_data jsonb not null default '{}'::jsonb,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
alter table workspace_data.legal_controls enable row level security;
create index legal_controls_org_workspace_idx on workspace_data.legal_controls(organization_id,workspace_id,created_at desc);
create policy legal_controls_member_read on workspace_data.legal_controls for select to authenticated using (exists (select 1 from identity.organization_memberships m where m.organization_id=workspace_data.legal_controls.organization_id and m.user_id=(select auth.uid()) and m.membership_status='ACTIVE'));
create policy legal_controls_operator_insert on workspace_data.legal_controls for insert to authenticated with check (created_by_user_id=(select auth.uid()) and exists (select 1 from identity.organization_memberships m join identity.role_bindings r on r.organization_id=m.organization_id and r.subject_user_id=m.user_id where m.organization_id=workspace_data.legal_controls.organization_id and m.user_id=(select auth.uid()) and m.membership_status='ACTIVE' and r.binding_status='ACTIVE' and r.role_code=any(array['S0_SOVEREIGN','B1_CEO','B2_MANAGER','B2.2'])));
create policy legal_controls_operator_update on workspace_data.legal_controls for update to authenticated using (exists (select 1 from identity.organization_memberships m join identity.role_bindings r on r.organization_id=m.organization_id and r.subject_user_id=m.user_id where m.organization_id=workspace_data.legal_controls.organization_id and m.user_id=(select auth.uid()) and m.membership_status='ACTIVE' and r.binding_status='ACTIVE' and r.role_code=any(array['S0_SOVEREIGN','B1_CEO','B2_MANAGER','B2.2']))) with check (exists (select 1 from identity.organization_memberships m join identity.role_bindings r on r.organization_id=m.organization_id and r.subject_user_id=m.user_id where m.organization_id=workspace_data.legal_controls.organization_id and m.user_id=(select auth.uid()) and m.membership_status='ACTIVE' and r.binding_status='ACTIVE' and r.role_code=any(array['S0_SOVEREIGN','B1_CEO','B2_MANAGER','B2.2'])));
create policy legal_controls_operator_delete on workspace_data.legal_controls for delete to authenticated using (exists (select 1 from identity.organization_memberships m join identity.role_bindings r on r.organization_id=m.organization_id and r.subject_user_id=m.user_id where m.organization_id=workspace_data.legal_controls.organization_id and m.user_id=(select auth.uid()) and m.membership_status='ACTIVE' and r.binding_status='ACTIVE' and r.role_code=any(array['S0_SOVEREIGN','B1_CEO','B2_MANAGER','B2.2'])));

create table workspace_data.legal_compliance_policies (
 id text primary key default gen_random_uuid()::text,
 organization_id uuid not null references identity.organizations(id) on delete cascade,
 workspace_id uuid references enterprise.workspaces(id) on delete set null,
 created_by_user_id uuid references auth.users(id) on delete set null,
  "title" text,
  "version" text,
  "owner" text,
  "updated" text,
  "review_by" text,
  "body" text,
 extra_data jsonb not null default '{}'::jsonb,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
alter table workspace_data.legal_compliance_policies enable row level security;
create index legal_compliance_policies_org_workspace_idx on workspace_data.legal_compliance_policies(organization_id,workspace_id,created_at desc);
create policy legal_compliance_policies_member_read on workspace_data.legal_compliance_policies for select to authenticated using (exists (select 1 from identity.organization_memberships m where m.organization_id=workspace_data.legal_compliance_policies.organization_id and m.user_id=(select auth.uid()) and m.membership_status='ACTIVE'));
create policy legal_compliance_policies_operator_insert on workspace_data.legal_compliance_policies for insert to authenticated with check (created_by_user_id=(select auth.uid()) and exists (select 1 from identity.organization_memberships m join identity.role_bindings r on r.organization_id=m.organization_id and r.subject_user_id=m.user_id where m.organization_id=workspace_data.legal_compliance_policies.organization_id and m.user_id=(select auth.uid()) and m.membership_status='ACTIVE' and r.binding_status='ACTIVE' and r.role_code=any(array['S0_SOVEREIGN','B1_CEO','B2_MANAGER','B2.2'])));
create policy legal_compliance_policies_operator_update on workspace_data.legal_compliance_policies for update to authenticated using (exists (select 1 from identity.organization_memberships m join identity.role_bindings r on r.organization_id=m.organization_id and r.subject_user_id=m.user_id where m.organization_id=workspace_data.legal_compliance_policies.organization_id and m.user_id=(select auth.uid()) and m.membership_status='ACTIVE' and r.binding_status='ACTIVE' and r.role_code=any(array['S0_SOVEREIGN','B1_CEO','B2_MANAGER','B2.2']))) with check (exists (select 1 from identity.organization_memberships m join identity.role_bindings r on r.organization_id=m.organization_id and r.subject_user_id=m.user_id where m.organization_id=workspace_data.legal_compliance_policies.organization_id and m.user_id=(select auth.uid()) and m.membership_status='ACTIVE' and r.binding_status='ACTIVE' and r.role_code=any(array['S0_SOVEREIGN','B1_CEO','B2_MANAGER','B2.2'])));
create policy legal_compliance_policies_operator_delete on workspace_data.legal_compliance_policies for delete to authenticated using (exists (select 1 from identity.organization_memberships m join identity.role_bindings r on r.organization_id=m.organization_id and r.subject_user_id=m.user_id where m.organization_id=workspace_data.legal_compliance_policies.organization_id and m.user_id=(select auth.uid()) and m.membership_status='ACTIVE' and r.binding_status='ACTIVE' and r.role_code=any(array['S0_SOVEREIGN','B1_CEO','B2_MANAGER','B2.2'])));

create table workspace_data.legal_evidence (
 id text primary key default gen_random_uuid()::text,
 organization_id uuid not null references identity.organizations(id) on delete cascade,
 workspace_id uuid references enterprise.workspaces(id) on delete set null,
 created_by_user_id uuid references auth.users(id) on delete set null,
  "title" text,
  "control" text,
  "kind" text,
  "location" text,
  "collected_at" text,
  "expires_at" text,
 extra_data jsonb not null default '{}'::jsonb,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
alter table workspace_data.legal_evidence enable row level security;
create index legal_evidence_org_workspace_idx on workspace_data.legal_evidence(organization_id,workspace_id,created_at desc);
create policy legal_evidence_member_read on workspace_data.legal_evidence for select to authenticated using (exists (select 1 from identity.organization_memberships m where m.organization_id=workspace_data.legal_evidence.organization_id and m.user_id=(select auth.uid()) and m.membership_status='ACTIVE'));
create policy legal_evidence_operator_insert on workspace_data.legal_evidence for insert to authenticated with check (created_by_user_id=(select auth.uid()) and exists (select 1 from identity.organization_memberships m join identity.role_bindings r on r.organization_id=m.organization_id and r.subject_user_id=m.user_id where m.organization_id=workspace_data.legal_evidence.organization_id and m.user_id=(select auth.uid()) and m.membership_status='ACTIVE' and r.binding_status='ACTIVE' and r.role_code=any(array['S0_SOVEREIGN','B1_CEO','B2_MANAGER','B2.2'])));
create policy legal_evidence_operator_update on workspace_data.legal_evidence for update to authenticated using (exists (select 1 from identity.organization_memberships m join identity.role_bindings r on r.organization_id=m.organization_id and r.subject_user_id=m.user_id where m.organization_id=workspace_data.legal_evidence.organization_id and m.user_id=(select auth.uid()) and m.membership_status='ACTIVE' and r.binding_status='ACTIVE' and r.role_code=any(array['S0_SOVEREIGN','B1_CEO','B2_MANAGER','B2.2']))) with check (exists (select 1 from identity.organization_memberships m join identity.role_bindings r on r.organization_id=m.organization_id and r.subject_user_id=m.user_id where m.organization_id=workspace_data.legal_evidence.organization_id and m.user_id=(select auth.uid()) and m.membership_status='ACTIVE' and r.binding_status='ACTIVE' and r.role_code=any(array['S0_SOVEREIGN','B1_CEO','B2_MANAGER','B2.2'])));
create policy legal_evidence_operator_delete on workspace_data.legal_evidence for delete to authenticated using (exists (select 1 from identity.organization_memberships m join identity.role_bindings r on r.organization_id=m.organization_id and r.subject_user_id=m.user_id where m.organization_id=workspace_data.legal_evidence.organization_id and m.user_id=(select auth.uid()) and m.membership_status='ACTIVE' and r.binding_status='ACTIVE' and r.role_code=any(array['S0_SOVEREIGN','B1_CEO','B2_MANAGER','B2.2'])));

create table workspace_data.legal_risks (
 id text primary key default gen_random_uuid()::text,
 organization_id uuid not null references identity.organizations(id) on delete cascade,
 workspace_id uuid references enterprise.workspaces(id) on delete set null,
 created_by_user_id uuid references auth.users(id) on delete set null,
  "title" text,
  "area" text,
  "likelihood" text,
  "impact" text,
  "rating" text,
  "mitigation" text,
  "owner" text,
  "status" text,
 extra_data jsonb not null default '{}'::jsonb,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
alter table workspace_data.legal_risks enable row level security;
create index legal_risks_org_workspace_idx on workspace_data.legal_risks(organization_id,workspace_id,created_at desc);
create policy legal_risks_member_read on workspace_data.legal_risks for select to authenticated using (exists (select 1 from identity.organization_memberships m where m.organization_id=workspace_data.legal_risks.organization_id and m.user_id=(select auth.uid()) and m.membership_status='ACTIVE'));
create policy legal_risks_operator_insert on workspace_data.legal_risks for insert to authenticated with check (created_by_user_id=(select auth.uid()) and exists (select 1 from identity.organization_memberships m join identity.role_bindings r on r.organization_id=m.organization_id and r.subject_user_id=m.user_id where m.organization_id=workspace_data.legal_risks.organization_id and m.user_id=(select auth.uid()) and m.membership_status='ACTIVE' and r.binding_status='ACTIVE' and r.role_code=any(array['S0_SOVEREIGN','B1_CEO','B2_MANAGER','B2.2'])));
create policy legal_risks_operator_update on workspace_data.legal_risks for update to authenticated using (exists (select 1 from identity.organization_memberships m join identity.role_bindings r on r.organization_id=m.organization_id and r.subject_user_id=m.user_id where m.organization_id=workspace_data.legal_risks.organization_id and m.user_id=(select auth.uid()) and m.membership_status='ACTIVE' and r.binding_status='ACTIVE' and r.role_code=any(array['S0_SOVEREIGN','B1_CEO','B2_MANAGER','B2.2']))) with check (exists (select 1 from identity.organization_memberships m join identity.role_bindings r on r.organization_id=m.organization_id and r.subject_user_id=m.user_id where m.organization_id=workspace_data.legal_risks.organization_id and m.user_id=(select auth.uid()) and m.membership_status='ACTIVE' and r.binding_status='ACTIVE' and r.role_code=any(array['S0_SOVEREIGN','B1_CEO','B2_MANAGER','B2.2'])));
create policy legal_risks_operator_delete on workspace_data.legal_risks for delete to authenticated using (exists (select 1 from identity.organization_memberships m join identity.role_bindings r on r.organization_id=m.organization_id and r.subject_user_id=m.user_id where m.organization_id=workspace_data.legal_risks.organization_id and m.user_id=(select auth.uid()) and m.membership_status='ACTIVE' and r.binding_status='ACTIVE' and r.role_code=any(array['S0_SOVEREIGN','B1_CEO','B2_MANAGER','B2.2'])));

create table workspace_data.legal_vendors (
 id text primary key default gen_random_uuid()::text,
 organization_id uuid not null references identity.organizations(id) on delete cascade,
 workspace_id uuid references enterprise.workspaces(id) on delete set null,
 created_by_user_id uuid references auth.users(id) on delete set null,
  "title" text,
  "category" text,
  "data_access" text,
  "dpa_signed" text,
  "dpa_date" text,
  "last_review" text,
  "risk" text,
 extra_data jsonb not null default '{}'::jsonb,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
alter table workspace_data.legal_vendors enable row level security;
create index legal_vendors_org_workspace_idx on workspace_data.legal_vendors(organization_id,workspace_id,created_at desc);
create policy legal_vendors_member_read on workspace_data.legal_vendors for select to authenticated using (exists (select 1 from identity.organization_memberships m where m.organization_id=workspace_data.legal_vendors.organization_id and m.user_id=(select auth.uid()) and m.membership_status='ACTIVE'));
create policy legal_vendors_operator_insert on workspace_data.legal_vendors for insert to authenticated with check (created_by_user_id=(select auth.uid()) and exists (select 1 from identity.organization_memberships m join identity.role_bindings r on r.organization_id=m.organization_id and r.subject_user_id=m.user_id where m.organization_id=workspace_data.legal_vendors.organization_id and m.user_id=(select auth.uid()) and m.membership_status='ACTIVE' and r.binding_status='ACTIVE' and r.role_code=any(array['S0_SOVEREIGN','B1_CEO','B2_MANAGER','B2.2'])));
create policy legal_vendors_operator_update on workspace_data.legal_vendors for update to authenticated using (exists (select 1 from identity.organization_memberships m join identity.role_bindings r on r.organization_id=m.organization_id and r.subject_user_id=m.user_id where m.organization_id=workspace_data.legal_vendors.organization_id and m.user_id=(select auth.uid()) and m.membership_status='ACTIVE' and r.binding_status='ACTIVE' and r.role_code=any(array['S0_SOVEREIGN','B1_CEO','B2_MANAGER','B2.2']))) with check (exists (select 1 from identity.organization_memberships m join identity.role_bindings r on r.organization_id=m.organization_id and r.subject_user_id=m.user_id where m.organization_id=workspace_data.legal_vendors.organization_id and m.user_id=(select auth.uid()) and m.membership_status='ACTIVE' and r.binding_status='ACTIVE' and r.role_code=any(array['S0_SOVEREIGN','B1_CEO','B2_MANAGER','B2.2'])));
create policy legal_vendors_operator_delete on workspace_data.legal_vendors for delete to authenticated using (exists (select 1 from identity.organization_memberships m join identity.role_bindings r on r.organization_id=m.organization_id and r.subject_user_id=m.user_id where m.organization_id=workspace_data.legal_vendors.organization_id and m.user_id=(select auth.uid()) and m.membership_status='ACTIVE' and r.binding_status='ACTIVE' and r.role_code=any(array['S0_SOVEREIGN','B1_CEO','B2_MANAGER','B2.2'])));

create table workspace_data.legal_gaps (
 id text primary key default gen_random_uuid()::text,
 organization_id uuid not null references identity.organizations(id) on delete cascade,
 workspace_id uuid references enterprise.workspaces(id) on delete set null,
 created_by_user_id uuid references auth.users(id) on delete set null,
  "title" text,
  "control" text,
  "framework" text,
  "severity" text,
  "opened_on" text,
  "owner" text,
  "status" text,
 extra_data jsonb not null default '{}'::jsonb,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
alter table workspace_data.legal_gaps enable row level security;
create index legal_gaps_org_workspace_idx on workspace_data.legal_gaps(organization_id,workspace_id,created_at desc);
create policy legal_gaps_member_read on workspace_data.legal_gaps for select to authenticated using (exists (select 1 from identity.organization_memberships m where m.organization_id=workspace_data.legal_gaps.organization_id and m.user_id=(select auth.uid()) and m.membership_status='ACTIVE'));
create policy legal_gaps_operator_insert on workspace_data.legal_gaps for insert to authenticated with check (created_by_user_id=(select auth.uid()) and exists (select 1 from identity.organization_memberships m join identity.role_bindings r on r.organization_id=m.organization_id and r.subject_user_id=m.user_id where m.organization_id=workspace_data.legal_gaps.organization_id and m.user_id=(select auth.uid()) and m.membership_status='ACTIVE' and r.binding_status='ACTIVE' and r.role_code=any(array['S0_SOVEREIGN','B1_CEO','B2_MANAGER','B2.2'])));
create policy legal_gaps_operator_update on workspace_data.legal_gaps for update to authenticated using (exists (select 1 from identity.organization_memberships m join identity.role_bindings r on r.organization_id=m.organization_id and r.subject_user_id=m.user_id where m.organization_id=workspace_data.legal_gaps.organization_id and m.user_id=(select auth.uid()) and m.membership_status='ACTIVE' and r.binding_status='ACTIVE' and r.role_code=any(array['S0_SOVEREIGN','B1_CEO','B2_MANAGER','B2.2']))) with check (exists (select 1 from identity.organization_memberships m join identity.role_bindings r on r.organization_id=m.organization_id and r.subject_user_id=m.user_id where m.organization_id=workspace_data.legal_gaps.organization_id and m.user_id=(select auth.uid()) and m.membership_status='ACTIVE' and r.binding_status='ACTIVE' and r.role_code=any(array['S0_SOVEREIGN','B1_CEO','B2_MANAGER','B2.2'])));
create policy legal_gaps_operator_delete on workspace_data.legal_gaps for delete to authenticated using (exists (select 1 from identity.organization_memberships m join identity.role_bindings r on r.organization_id=m.organization_id and r.subject_user_id=m.user_id where m.organization_id=workspace_data.legal_gaps.organization_id and m.user_id=(select auth.uid()) and m.membership_status='ACTIVE' and r.binding_status='ACTIVE' and r.role_code=any(array['S0_SOVEREIGN','B1_CEO','B2_MANAGER','B2.2'])));

create table workspace_data.personas (
 id text primary key default gen_random_uuid()::text,
 organization_id uuid not null references identity.organizations(id) on delete cascade,
 workspace_id uuid references enterprise.workspaces(id) on delete set null,
 created_by_user_id uuid references auth.users(id) on delete set null,
  "title" text,
  "pronouns" text,
  "wants" text,
  "blockers" text,
  "vocabulary" text,
  "anchor" text,
  "anchor_kind" text,
  "anchor_date" text,
  "domain" text,
 extra_data jsonb not null default '{}'::jsonb,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
alter table workspace_data.personas enable row level security;
create index personas_org_workspace_idx on workspace_data.personas(organization_id,workspace_id,created_at desc);
create policy personas_member_read on workspace_data.personas for select to authenticated using (exists (select 1 from identity.organization_memberships m where m.organization_id=workspace_data.personas.organization_id and m.user_id=(select auth.uid()) and m.membership_status='ACTIVE'));
create policy personas_operator_insert on workspace_data.personas for insert to authenticated with check (created_by_user_id=(select auth.uid()) and exists (select 1 from identity.organization_memberships m join identity.role_bindings r on r.organization_id=m.organization_id and r.subject_user_id=m.user_id where m.organization_id=workspace_data.personas.organization_id and m.user_id=(select auth.uid()) and m.membership_status='ACTIVE' and r.binding_status='ACTIVE' and r.role_code=any(array['S0_SOVEREIGN','B1_CEO','B2_MANAGER','B2.2'])));
create policy personas_operator_update on workspace_data.personas for update to authenticated using (exists (select 1 from identity.organization_memberships m join identity.role_bindings r on r.organization_id=m.organization_id and r.subject_user_id=m.user_id where m.organization_id=workspace_data.personas.organization_id and m.user_id=(select auth.uid()) and m.membership_status='ACTIVE' and r.binding_status='ACTIVE' and r.role_code=any(array['S0_SOVEREIGN','B1_CEO','B2_MANAGER','B2.2']))) with check (exists (select 1 from identity.organization_memberships m join identity.role_bindings r on r.organization_id=m.organization_id and r.subject_user_id=m.user_id where m.organization_id=workspace_data.personas.organization_id and m.user_id=(select auth.uid()) and m.membership_status='ACTIVE' and r.binding_status='ACTIVE' and r.role_code=any(array['S0_SOVEREIGN','B1_CEO','B2_MANAGER','B2.2'])));
create policy personas_operator_delete on workspace_data.personas for delete to authenticated using (exists (select 1 from identity.organization_memberships m join identity.role_bindings r on r.organization_id=m.organization_id and r.subject_user_id=m.user_id where m.organization_id=workspace_data.personas.organization_id and m.user_id=(select auth.uid()) and m.membership_status='ACTIVE' and r.binding_status='ACTIVE' and r.role_code=any(array['S0_SOVEREIGN','B1_CEO','B2_MANAGER','B2.2'])));

create table workspace_data.memory (
 id text primary key default gen_random_uuid()::text,
 organization_id uuid not null references identity.organizations(id) on delete cascade,
 workspace_id uuid references enterprise.workspaces(id) on delete set null,
 created_by_user_id uuid references auth.users(id) on delete set null,
  "title" text,
  "fact" text,
  "provenance" text,
  "retained_on" text,
  "verification" text,
  "verified_by" text,
  "recheck_on" text,
  "domain" text,
  "notes" text,
 extra_data jsonb not null default '{}'::jsonb,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
alter table workspace_data.memory enable row level security;
create index memory_org_workspace_idx on workspace_data.memory(organization_id,workspace_id,created_at desc);
create policy memory_member_read on workspace_data.memory for select to authenticated using (exists (select 1 from identity.organization_memberships m where m.organization_id=workspace_data.memory.organization_id and m.user_id=(select auth.uid()) and m.membership_status='ACTIVE'));
create policy memory_operator_insert on workspace_data.memory for insert to authenticated with check (created_by_user_id=(select auth.uid()) and exists (select 1 from identity.organization_memberships m join identity.role_bindings r on r.organization_id=m.organization_id and r.subject_user_id=m.user_id where m.organization_id=workspace_data.memory.organization_id and m.user_id=(select auth.uid()) and m.membership_status='ACTIVE' and r.binding_status='ACTIVE' and r.role_code=any(array['S0_SOVEREIGN','B1_CEO','B2_MANAGER','B2.2'])));
create policy memory_operator_update on workspace_data.memory for update to authenticated using (exists (select 1 from identity.organization_memberships m join identity.role_bindings r on r.organization_id=m.organization_id and r.subject_user_id=m.user_id where m.organization_id=workspace_data.memory.organization_id and m.user_id=(select auth.uid()) and m.membership_status='ACTIVE' and r.binding_status='ACTIVE' and r.role_code=any(array['S0_SOVEREIGN','B1_CEO','B2_MANAGER','B2.2']))) with check (exists (select 1 from identity.organization_memberships m join identity.role_bindings r on r.organization_id=m.organization_id and r.subject_user_id=m.user_id where m.organization_id=workspace_data.memory.organization_id and m.user_id=(select auth.uid()) and m.membership_status='ACTIVE' and r.binding_status='ACTIVE' and r.role_code=any(array['S0_SOVEREIGN','B1_CEO','B2_MANAGER','B2.2'])));
create policy memory_operator_delete on workspace_data.memory for delete to authenticated using (exists (select 1 from identity.organization_memberships m join identity.role_bindings r on r.organization_id=m.organization_id and r.subject_user_id=m.user_id where m.organization_id=workspace_data.memory.organization_id and m.user_id=(select auth.uid()) and m.membership_status='ACTIVE' and r.binding_status='ACTIVE' and r.role_code=any(array['S0_SOVEREIGN','B1_CEO','B2_MANAGER','B2.2'])));

create table workspace_data.codex (
 id text primary key default gen_random_uuid()::text,
 organization_id uuid not null references identity.organizations(id) on delete cascade,
 workspace_id uuid references enterprise.workspaces(id) on delete set null,
 created_by_user_id uuid references auth.users(id) on delete set null,
  "title" text,
  "situation" text,
  "recipe" text,
  "why" text,
  "applied_count" numeric,
  "last_applied" text,
  "domain" text,
  "owners" text,
  "caveats" text,
 extra_data jsonb not null default '{}'::jsonb,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
alter table workspace_data.codex enable row level security;
create index codex_org_workspace_idx on workspace_data.codex(organization_id,workspace_id,created_at desc);
create policy codex_member_read on workspace_data.codex for select to authenticated using (exists (select 1 from identity.organization_memberships m where m.organization_id=workspace_data.codex.organization_id and m.user_id=(select auth.uid()) and m.membership_status='ACTIVE'));
create policy codex_operator_insert on workspace_data.codex for insert to authenticated with check (created_by_user_id=(select auth.uid()) and exists (select 1 from identity.organization_memberships m join identity.role_bindings r on r.organization_id=m.organization_id and r.subject_user_id=m.user_id where m.organization_id=workspace_data.codex.organization_id and m.user_id=(select auth.uid()) and m.membership_status='ACTIVE' and r.binding_status='ACTIVE' and r.role_code=any(array['S0_SOVEREIGN','B1_CEO','B2_MANAGER','B2.2'])));
create policy codex_operator_update on workspace_data.codex for update to authenticated using (exists (select 1 from identity.organization_memberships m join identity.role_bindings r on r.organization_id=m.organization_id and r.subject_user_id=m.user_id where m.organization_id=workspace_data.codex.organization_id and m.user_id=(select auth.uid()) and m.membership_status='ACTIVE' and r.binding_status='ACTIVE' and r.role_code=any(array['S0_SOVEREIGN','B1_CEO','B2_MANAGER','B2.2']))) with check (exists (select 1 from identity.organization_memberships m join identity.role_bindings r on r.organization_id=m.organization_id and r.subject_user_id=m.user_id where m.organization_id=workspace_data.codex.organization_id and m.user_id=(select auth.uid()) and m.membership_status='ACTIVE' and r.binding_status='ACTIVE' and r.role_code=any(array['S0_SOVEREIGN','B1_CEO','B2_MANAGER','B2.2'])));
create policy codex_operator_delete on workspace_data.codex for delete to authenticated using (exists (select 1 from identity.organization_memberships m join identity.role_bindings r on r.organization_id=m.organization_id and r.subject_user_id=m.user_id where m.organization_id=workspace_data.codex.organization_id and m.user_id=(select auth.uid()) and m.membership_status='ACTIVE' and r.binding_status='ACTIVE' and r.role_code=any(array['S0_SOVEREIGN','B1_CEO','B2_MANAGER','B2.2'])));

create table workspace_data.approval_decisions (
 id text primary key default gen_random_uuid()::text,
 organization_id uuid not null references identity.organizations(id) on delete cascade,
 workspace_id uuid references enterprise.workspaces(id) on delete set null,
 created_by_user_id uuid references auth.users(id) on delete set null,
  "title" text,
  "scenario_id" text,
  "scenario_name" text,
  "verdict" text,
  "decided_by" text,
  "proposal_count" numeric,
  "rationale" text,
  "decided_at" text,
 extra_data jsonb not null default '{}'::jsonb,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
alter table workspace_data.approval_decisions enable row level security;
create index approval_decisions_org_workspace_idx on workspace_data.approval_decisions(organization_id,workspace_id,created_at desc);
create policy approval_decisions_member_read on workspace_data.approval_decisions for select to authenticated using (exists (select 1 from identity.organization_memberships m where m.organization_id=workspace_data.approval_decisions.organization_id and m.user_id=(select auth.uid()) and m.membership_status='ACTIVE'));
create policy approval_decisions_operator_insert on workspace_data.approval_decisions for insert to authenticated with check (created_by_user_id=(select auth.uid()) and exists (select 1 from identity.organization_memberships m join identity.role_bindings r on r.organization_id=m.organization_id and r.subject_user_id=m.user_id where m.organization_id=workspace_data.approval_decisions.organization_id and m.user_id=(select auth.uid()) and m.membership_status='ACTIVE' and r.binding_status='ACTIVE' and r.role_code=any(array['S0_SOVEREIGN','B1_CEO','B2_MANAGER','B2.2'])));
create policy approval_decisions_operator_update on workspace_data.approval_decisions for update to authenticated using (exists (select 1 from identity.organization_memberships m join identity.role_bindings r on r.organization_id=m.organization_id and r.subject_user_id=m.user_id where m.organization_id=workspace_data.approval_decisions.organization_id and m.user_id=(select auth.uid()) and m.membership_status='ACTIVE' and r.binding_status='ACTIVE' and r.role_code=any(array['S0_SOVEREIGN','B1_CEO','B2_MANAGER','B2.2']))) with check (exists (select 1 from identity.organization_memberships m join identity.role_bindings r on r.organization_id=m.organization_id and r.subject_user_id=m.user_id where m.organization_id=workspace_data.approval_decisions.organization_id and m.user_id=(select auth.uid()) and m.membership_status='ACTIVE' and r.binding_status='ACTIVE' and r.role_code=any(array['S0_SOVEREIGN','B1_CEO','B2_MANAGER','B2.2'])));
create policy approval_decisions_operator_delete on workspace_data.approval_decisions for delete to authenticated using (exists (select 1 from identity.organization_memberships m join identity.role_bindings r on r.organization_id=m.organization_id and r.subject_user_id=m.user_id where m.organization_id=workspace_data.approval_decisions.organization_id and m.user_id=(select auth.uid()) and m.membership_status='ACTIVE' and r.binding_status='ACTIVE' and r.role_code=any(array['S0_SOVEREIGN','B1_CEO','B2_MANAGER','B2.2'])));

create table workspace_data.squads (
 id text primary key default gen_random_uuid()::text,
 organization_id uuid not null references identity.organizations(id) on delete cascade,
 workspace_id uuid references enterprise.workspaces(id) on delete set null,
 created_by_user_id uuid references auth.users(id) on delete set null,
  "title" text,
  "mission" text,
  "lead" text,
  "members" text,
  "rank" text,
  "status" text,
  "last_sprint" text,
 extra_data jsonb not null default '{}'::jsonb,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
alter table workspace_data.squads enable row level security;
create index squads_org_workspace_idx on workspace_data.squads(organization_id,workspace_id,created_at desc);
create policy squads_member_read on workspace_data.squads for select to authenticated using (exists (select 1 from identity.organization_memberships m where m.organization_id=workspace_data.squads.organization_id and m.user_id=(select auth.uid()) and m.membership_status='ACTIVE'));
create policy squads_operator_insert on workspace_data.squads for insert to authenticated with check (created_by_user_id=(select auth.uid()) and exists (select 1 from identity.organization_memberships m join identity.role_bindings r on r.organization_id=m.organization_id and r.subject_user_id=m.user_id where m.organization_id=workspace_data.squads.organization_id and m.user_id=(select auth.uid()) and m.membership_status='ACTIVE' and r.binding_status='ACTIVE' and r.role_code=any(array['S0_SOVEREIGN','B1_CEO','B2_MANAGER','B2.2'])));
create policy squads_operator_update on workspace_data.squads for update to authenticated using (exists (select 1 from identity.organization_memberships m join identity.role_bindings r on r.organization_id=m.organization_id and r.subject_user_id=m.user_id where m.organization_id=workspace_data.squads.organization_id and m.user_id=(select auth.uid()) and m.membership_status='ACTIVE' and r.binding_status='ACTIVE' and r.role_code=any(array['S0_SOVEREIGN','B1_CEO','B2_MANAGER','B2.2']))) with check (exists (select 1 from identity.organization_memberships m join identity.role_bindings r on r.organization_id=m.organization_id and r.subject_user_id=m.user_id where m.organization_id=workspace_data.squads.organization_id and m.user_id=(select auth.uid()) and m.membership_status='ACTIVE' and r.binding_status='ACTIVE' and r.role_code=any(array['S0_SOVEREIGN','B1_CEO','B2_MANAGER','B2.2'])));
create policy squads_operator_delete on workspace_data.squads for delete to authenticated using (exists (select 1 from identity.organization_memberships m join identity.role_bindings r on r.organization_id=m.organization_id and r.subject_user_id=m.user_id where m.organization_id=workspace_data.squads.organization_id and m.user_id=(select auth.uid()) and m.membership_status='ACTIVE' and r.binding_status='ACTIVE' and r.role_code=any(array['S0_SOVEREIGN','B1_CEO','B2_MANAGER','B2.2'])));

create table workspace_data.content (
 id text primary key default gen_random_uuid()::text,
 organization_id uuid not null references identity.organizations(id) on delete cascade,
 workspace_id uuid references enterprise.workspaces(id) on delete set null,
 created_by_user_id uuid references auth.users(id) on delete set null,
  "title" text,
  "channel" text,
  "audience" text,
  "status" text,
  "read_time" text,
  "hook" text,
  "cta" text,
 extra_data jsonb not null default '{}'::jsonb,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
alter table workspace_data.content enable row level security;
create index content_org_workspace_idx on workspace_data.content(organization_id,workspace_id,created_at desc);
create policy content_member_read on workspace_data.content for select to authenticated using (exists (select 1 from identity.organization_memberships m where m.organization_id=workspace_data.content.organization_id and m.user_id=(select auth.uid()) and m.membership_status='ACTIVE'));
create policy content_operator_insert on workspace_data.content for insert to authenticated with check (created_by_user_id=(select auth.uid()) and exists (select 1 from identity.organization_memberships m join identity.role_bindings r on r.organization_id=m.organization_id and r.subject_user_id=m.user_id where m.organization_id=workspace_data.content.organization_id and m.user_id=(select auth.uid()) and m.membership_status='ACTIVE' and r.binding_status='ACTIVE' and r.role_code=any(array['S0_SOVEREIGN','B1_CEO','B2_MANAGER','B2.2'])));
create policy content_operator_update on workspace_data.content for update to authenticated using (exists (select 1 from identity.organization_memberships m join identity.role_bindings r on r.organization_id=m.organization_id and r.subject_user_id=m.user_id where m.organization_id=workspace_data.content.organization_id and m.user_id=(select auth.uid()) and m.membership_status='ACTIVE' and r.binding_status='ACTIVE' and r.role_code=any(array['S0_SOVEREIGN','B1_CEO','B2_MANAGER','B2.2']))) with check (exists (select 1 from identity.organization_memberships m join identity.role_bindings r on r.organization_id=m.organization_id and r.subject_user_id=m.user_id where m.organization_id=workspace_data.content.organization_id and m.user_id=(select auth.uid()) and m.membership_status='ACTIVE' and r.binding_status='ACTIVE' and r.role_code=any(array['S0_SOVEREIGN','B1_CEO','B2_MANAGER','B2.2'])));
create policy content_operator_delete on workspace_data.content for delete to authenticated using (exists (select 1 from identity.organization_memberships m join identity.role_bindings r on r.organization_id=m.organization_id and r.subject_user_id=m.user_id where m.organization_id=workspace_data.content.organization_id and m.user_id=(select auth.uid()) and m.membership_status='ACTIVE' and r.binding_status='ACTIVE' and r.role_code=any(array['S0_SOVEREIGN','B1_CEO','B2_MANAGER','B2.2'])));
create table workspace_data.activity_events (
 id text primary key,
 organization_id uuid not null references identity.organizations(id) on delete cascade,
 created_by_user_id uuid references auth.users(id) on delete set null,
 event_type text not null,
 event_payload jsonb not null default '{}'::jsonb,
 created_at timestamptz not null default now()
);
alter table workspace_data.activity_events enable row level security;
create index activity_events_org_created_idx on workspace_data.activity_events(organization_id,created_at desc);
create policy activity_events_member_read on workspace_data.activity_events for select to authenticated using (exists(select 1 from identity.organization_memberships m where m.organization_id=activity_events.organization_id and m.user_id=(select auth.uid()) and m.membership_status='ACTIVE'));
create policy activity_events_operator_insert on workspace_data.activity_events for insert to authenticated with check (created_by_user_id=(select auth.uid()) and exists(select 1 from identity.organization_memberships m join identity.role_bindings r on r.organization_id=m.organization_id and r.subject_user_id=m.user_id where m.organization_id=activity_events.organization_id and m.user_id=(select auth.uid()) and m.membership_status='ACTIVE' and r.binding_status='ACTIVE' and r.role_code=any(array['S0_SOVEREIGN','B1_CEO','B2_MANAGER','B2.2'])));
create or replace function workspace_data.guard_tenant_row() returns trigger language plpgsql set search_path=pg_catalog,workspace_data as $$
begin
 if tg_op='UPDATE' and (new.organization_id is distinct from old.organization_id or new.id is distinct from old.id) then
  raise exception 'Tenant ownership and primary key are immutable';
 end if;
 if tg_op='UPDATE' then new.created_by_user_id := old.created_by_user_id; end if;
 new.updated_at=now();
 return new;
end $$;
revoke all on function workspace_data.guard_tenant_row() from public,anon,authenticated;
create trigger clients_tenant_guard before update on workspace_data.clients for each row execute function workspace_data.guard_tenant_row();
create trigger articles_tenant_guard before update on workspace_data.articles for each row execute function workspace_data.guard_tenant_row();
create trigger team_tenant_guard before update on workspace_data.team for each row execute function workspace_data.guard_tenant_row();
create trigger people_agents_tenant_guard before update on workspace_data.people_agents for each row execute function workspace_data.guard_tenant_row();
create trigger runbooks_tenant_guard before update on workspace_data.runbooks for each row execute function workspace_data.guard_tenant_row();
create trigger incidents_tenant_guard before update on workspace_data.incidents for each row execute function workspace_data.guard_tenant_row();
create trigger services_tenant_guard before update on workspace_data.services for each row execute function workspace_data.guard_tenant_row();
create trigger it_experiments_tenant_guard before update on workspace_data.it_experiments for each row execute function workspace_data.guard_tenant_row();
create trigger deploys_tenant_guard before update on workspace_data.deploys for each row execute function workspace_data.guard_tenant_row();
create trigger tasks_tenant_guard before update on workspace_data.tasks for each row execute function workspace_data.guard_tenant_row();
create trigger marketplace_listings_tenant_guard before update on workspace_data.marketplace_listings for each row execute function workspace_data.guard_tenant_row();
create trigger product_items_tenant_guard before update on workspace_data.product_items for each row execute function workspace_data.guard_tenant_row();
create trigger product_releases_tenant_guard before update on workspace_data.product_releases for each row execute function workspace_data.guard_tenant_row();
create trigger growth_channels_tenant_guard before update on workspace_data.growth_channels for each row execute function workspace_data.guard_tenant_row();
create trigger growth_experiments_tenant_guard before update on workspace_data.growth_experiments for each row execute function workspace_data.guard_tenant_row();
create trigger deals_tenant_guard before update on workspace_data.deals for each row execute function workspace_data.guard_tenant_row();
create trigger invoices_tenant_guard before update on workspace_data.invoices for each row execute function workspace_data.guard_tenant_row();
create trigger contracts_tenant_guard before update on workspace_data.contracts for each row execute function workspace_data.guard_tenant_row();
create trigger policies_tenant_guard before update on workspace_data.policies for each row execute function workspace_data.guard_tenant_row();
create trigger session_notes_tenant_guard before update on workspace_data.session_notes for each row execute function workspace_data.guard_tenant_row();
create trigger legal_ai_act_checks_tenant_guard before update on workspace_data.legal_ai_act_checks for each row execute function workspace_data.guard_tenant_row();
create trigger legal_frameworks_tenant_guard before update on workspace_data.legal_frameworks for each row execute function workspace_data.guard_tenant_row();
create trigger legal_controls_tenant_guard before update on workspace_data.legal_controls for each row execute function workspace_data.guard_tenant_row();
create trigger legal_compliance_policies_tenant_guard before update on workspace_data.legal_compliance_policies for each row execute function workspace_data.guard_tenant_row();
create trigger legal_evidence_tenant_guard before update on workspace_data.legal_evidence for each row execute function workspace_data.guard_tenant_row();
create trigger legal_risks_tenant_guard before update on workspace_data.legal_risks for each row execute function workspace_data.guard_tenant_row();
create trigger legal_vendors_tenant_guard before update on workspace_data.legal_vendors for each row execute function workspace_data.guard_tenant_row();
create trigger legal_gaps_tenant_guard before update on workspace_data.legal_gaps for each row execute function workspace_data.guard_tenant_row();
create trigger personas_tenant_guard before update on workspace_data.personas for each row execute function workspace_data.guard_tenant_row();
create trigger memory_tenant_guard before update on workspace_data.memory for each row execute function workspace_data.guard_tenant_row();
create trigger codex_tenant_guard before update on workspace_data.codex for each row execute function workspace_data.guard_tenant_row();
create trigger approval_decisions_tenant_guard before update on workspace_data.approval_decisions for each row execute function workspace_data.guard_tenant_row();
create trigger squads_tenant_guard before update on workspace_data.squads for each row execute function workspace_data.guard_tenant_row();
create trigger content_tenant_guard before update on workspace_data.content for each row execute function workspace_data.guard_tenant_row();
grant select,insert,update,delete on all tables in schema workspace_data to authenticated;
grant select,insert on workspace_data.activity_events to authenticated;
alter default privileges in schema workspace_data revoke all on tables from public,anon;
alter default privileges in schema workspace_data grant select,insert,update,delete on tables to authenticated;
alter role authenticator set pgrst.db_schemas = 'public, dashboard, identity, workspace_data';
notify pgrst,'reload config';
