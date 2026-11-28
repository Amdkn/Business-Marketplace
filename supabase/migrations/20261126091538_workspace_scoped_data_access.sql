-- Enforce workspace ownership for every tenant-facing Garden / Web Desktop record.
create or replace function identity.is_active_workspace_member(p_organization_id uuid, p_workspace_id uuid)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, identity, enterprise, auth
as $$
  select exists (
    select 1
    from enterprise.workspace_memberships wm
    join identity.organization_memberships om
      on om.organization_id = wm.organization_id
     and om.user_id = wm.user_id
    where wm.organization_id = p_organization_id
      and wm.workspace_id = p_workspace_id
      and wm.user_id = auth.uid()
      and wm.membership_status = 'ACTIVE'
      and om.membership_status = 'ACTIVE'
  );
$$;

create or replace function identity.can_manage_workspace(p_organization_id uuid, p_workspace_id uuid)
returns boolean
language sql
stable
security definer
set search_path = pg_catalog, identity, enterprise, auth
as $$
  select exists (
    select 1
    from enterprise.workspace_memberships wm
    join identity.organization_memberships om
      on om.organization_id = wm.organization_id
     and om.user_id = wm.user_id
    join identity.role_bindings rb
      on rb.organization_id = wm.organization_id
     and rb.subject_user_id = wm.user_id
    where wm.organization_id = p_organization_id
      and wm.workspace_id = p_workspace_id
      and wm.user_id = auth.uid()
      and wm.membership_status = 'ACTIVE'
      and om.membership_status = 'ACTIVE'
      and rb.binding_status = 'ACTIVE'
      and rb.role_code = any (array['S0_SOVEREIGN','B1_CEO','B2_MANAGER','B2.2'])
      and (
        (rb.scope_type = 'ORGANIZATION' and rb.scope_id is null)
        or (rb.scope_type = 'WORKSPACE' and rb.scope_id = p_workspace_id)
      )
  );
$$;

revoke all on function identity.is_active_workspace_member(uuid, uuid) from public, anon;
revoke all on function identity.can_manage_workspace(uuid, uuid) from public, anon;
grant execute on function identity.is_active_workspace_member(uuid, uuid) to authenticated;
grant execute on function identity.can_manage_workspace(uuid, uuid) to authenticated;

alter table workspace_data.activity_events
  add column if not exists workspace_id uuid references enterprise.workspaces(id) on delete restrict;
alter table workspace_data.activity_events
  alter column workspace_id set not null;
create index if not exists activity_events_org_workspace_created_idx
  on workspace_data.activity_events(organization_id, workspace_id, created_at desc);

do $$
declare
  t record;
begin
  for t in
    select table_name
    from information_schema.columns
    where table_schema = 'workspace_data'
      and column_name = 'workspace_id'
    order by table_name
  loop
    execute format('alter table workspace_data.%I alter column workspace_id set not null', t.table_name);

    execute format('drop policy if exists %I on workspace_data.%I', t.table_name || '_member_read', t.table_name);
    execute format(
      'create policy %I on workspace_data.%I for select to authenticated using (identity.is_active_workspace_member(organization_id, workspace_id))',
      t.table_name || '_member_read', t.table_name
    );

    execute format('drop policy if exists %I on workspace_data.%I', t.table_name || '_operator_insert', t.table_name);
    execute format(
      'create policy %I on workspace_data.%I for insert to authenticated with check (created_by_user_id = (select auth.uid()) and identity.can_manage_workspace(organization_id, workspace_id))',
      t.table_name || '_operator_insert', t.table_name
    );

    execute format('drop policy if exists %I on workspace_data.%I', t.table_name || '_operator_update', t.table_name);
    execute format(
      'create policy %I on workspace_data.%I for update to authenticated using (identity.can_manage_workspace(organization_id, workspace_id)) with check (identity.can_manage_workspace(organization_id, workspace_id))',
      t.table_name || '_operator_update', t.table_name
    );

    execute format('drop policy if exists %I on workspace_data.%I', t.table_name || '_operator_delete', t.table_name);
    execute format(
      'create policy %I on workspace_data.%I for delete to authenticated using (identity.can_manage_workspace(organization_id, workspace_id))',
      t.table_name || '_operator_delete', t.table_name
    );
  end loop;
end;
$$;

create or replace function workspace_data.guard_tenant_row()
returns trigger
language plpgsql
set search_path = pg_catalog, workspace_data
as $$
begin
  if tg_op = 'UPDATE' and (
    new.organization_id is distinct from old.organization_id
    or new.workspace_id is distinct from old.workspace_id
    or new.id is distinct from old.id
  ) then
    raise exception 'Tenant/workspace ownership and primary key are immutable';
  end if;
  if tg_op = 'UPDATE' then
    new.created_by_user_id := old.created_by_user_id;
  end if;
  new.updated_at = now();
  return new;
end;
$$;
revoke all on function workspace_data.guard_tenant_row() from public, anon, authenticated;

drop policy if exists activity_events_member_read on workspace_data.activity_events;
create policy activity_events_member_read on workspace_data.activity_events
  for select to authenticated
  using (identity.is_active_workspace_member(organization_id, workspace_id));
drop policy if exists activity_events_operator_insert on workspace_data.activity_events;
create policy activity_events_operator_insert on workspace_data.activity_events
  for insert to authenticated
  with check (
    created_by_user_id = (select auth.uid())
    and identity.can_manage_workspace(organization_id, workspace_id)
  );

notify pgrst, 'reload config';
