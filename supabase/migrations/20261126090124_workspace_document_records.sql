-- Dedicated tenant persistence for the Garden Documents and Legal Data Room views.
-- These are workspace records, not CMS articles or legal-evidence control records.
create table if not exists workspace_data.documents (
  id text primary key default gen_random_uuid()::text,
  organization_id uuid not null references identity.organizations(id) on delete cascade,
  workspace_id uuid references enterprise.workspaces(id) on delete set null,
  created_by_user_id uuid not null references auth.users(id),
  title text not null check (length(btrim(title)) > 0),
  client_id text,
  file_url text,
  mime_type text,
  document_status text not null default 'draft' check (document_status in ('draft','pending','signed','archived')),
  extra_data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists documents_org_workspace_created_idx on workspace_data.documents(organization_id,workspace_id,created_at desc);
alter table workspace_data.documents enable row level security;
revoke all on workspace_data.documents from public, anon;
grant select,insert,update,delete on workspace_data.documents to authenticated;

create table if not exists workspace_data.legal_documents (
  id text primary key default gen_random_uuid()::text,
  organization_id uuid not null references identity.organizations(id) on delete cascade,
  workspace_id uuid references enterprise.workspaces(id) on delete set null,
  created_by_user_id uuid not null references auth.users(id),
  title text not null check (length(btrim(title)) > 0),
  client_id text,
  document_type text not null default 'PDF' check (document_type in ('PDF','DOCX','DOC','XLSX','OTHER')),
  category text not null default 'Corporate' check (category in ('Client','Freelance','Corporate','Compliance','Platform')),
  document_status text not null default 'Draft' check (document_status in ('Signed','Pending','Draft','Archived')),
  file_url text,
  notes text,
  extra_data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists legal_documents_org_workspace_created_idx on workspace_data.legal_documents(organization_id,workspace_id,created_at desc);
alter table workspace_data.legal_documents enable row level security;
revoke all on workspace_data.legal_documents from public, anon;
grant select,insert,update,delete on workspace_data.legal_documents to authenticated;

do $$
declare t text;
begin
 foreach t in array array['documents','legal_documents'] loop
  execute format('create policy %I on workspace_data.%I for select to authenticated using (exists (select 1 from identity.organization_memberships m where m.organization_id = %I.organization_id and m.user_id = (select auth.uid()) and m.membership_status = ''ACTIVE''))', t||'_member_read', t, t);
  execute format('create policy %I on workspace_data.%I for insert to authenticated with check (created_by_user_id = (select auth.uid()) and exists (select 1 from identity.organization_memberships m join identity.role_bindings r on r.organization_id=m.organization_id and r.subject_user_id=m.user_id where m.organization_id=%I.organization_id and m.user_id=(select auth.uid()) and m.membership_status=''ACTIVE'' and r.binding_status=''ACTIVE'' and r.role_code=any(array[''S0_SOVEREIGN'',''B1_CEO'',''B2_MANAGER'',''B2.2''])))', t||'_operator_insert', t, t);
  execute format('create policy %I on workspace_data.%I for update to authenticated using (exists (select 1 from identity.organization_memberships m join identity.role_bindings r on r.organization_id=m.organization_id and r.subject_user_id=m.user_id where m.organization_id=%I.organization_id and m.user_id=(select auth.uid()) and m.membership_status=''ACTIVE'' and r.binding_status=''ACTIVE'' and r.role_code=any(array[''S0_SOVEREIGN'',''B1_CEO'',''B2_MANAGER'',''B2.2'']))) with check (exists (select 1 from identity.organization_memberships m join identity.role_bindings r on r.organization_id=m.organization_id and r.subject_user_id=m.user_id where m.organization_id=%I.organization_id and m.user_id=(select auth.uid()) and m.membership_status=''ACTIVE'' and r.binding_status=''ACTIVE'' and r.role_code=any(array[''S0_SOVEREIGN'',''B1_CEO'',''B2_MANAGER'',''B2.2''])))', t||'_operator_update', t, t, t);
  execute format('create policy %I on workspace_data.%I for delete to authenticated using (exists (select 1 from identity.organization_memberships m join identity.role_bindings r on r.organization_id=m.organization_id and r.subject_user_id=m.user_id where m.organization_id=%I.organization_id and m.user_id=(select auth.uid()) and m.membership_status=''ACTIVE'' and r.binding_status=''ACTIVE'' and r.role_code=any(array[''S0_SOVEREIGN'',''B1_CEO'',''B2_MANAGER'',''B2.2''])))', t||'_operator_delete', t, t);
 end loop;
end $$;
