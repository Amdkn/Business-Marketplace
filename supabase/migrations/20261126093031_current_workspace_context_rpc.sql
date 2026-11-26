-- Safe browser-facing context resolver: expose only the caller's unique active org/workspace.
create or replace function identity.get_current_workspace_context()
returns table (
  organization_id uuid,
  organization_name text,
  workspace_id uuid,
  workspace_name text,
  role_code text
)
language plpgsql
stable
security definer
set search_path = pg_catalog, identity, enterprise, auth
as $$
declare
  v_user_id uuid := auth.uid();
  v_org_count integer;
  v_workspace_count integer;
  v_organization_id uuid;
  v_workspace_id uuid;
  v_role_code text;
begin
  if v_user_id is null then raise exception 'Authentication required'; end if;
  select count(*) into v_org_count
  from identity.organization_memberships om
  where om.user_id = v_user_id and om.membership_status = 'ACTIVE';
  if v_org_count <> 1 then return; end if;

  select om.organization_id into v_organization_id
  from identity.organization_memberships om
  where om.user_id = v_user_id and om.membership_status = 'ACTIVE'
  limit 1;

  select count(*) into v_workspace_count
  from enterprise.workspace_memberships wm
  join enterprise.workspaces w on w.id = wm.workspace_id and w.organization_id = wm.organization_id
  where wm.user_id = v_user_id
    and wm.organization_id = v_organization_id
    and wm.membership_status = 'ACTIVE'
    and w.workspace_status = 'ACTIVE';
  if v_workspace_count <> 1 then return; end if;

  select wm.workspace_id into v_workspace_id
  from enterprise.workspace_memberships wm
  join enterprise.workspaces w on w.id = wm.workspace_id and w.organization_id = wm.organization_id
  where wm.user_id = v_user_id
    and wm.organization_id = v_organization_id
    and wm.membership_status = 'ACTIVE'
    and w.workspace_status = 'ACTIVE'
  limit 1;

  select rb.role_code into v_role_code
  from identity.role_bindings rb
  where rb.organization_id = v_organization_id
    and rb.subject_user_id = v_user_id
    and rb.binding_status = 'ACTIVE'
    and rb.scope_type = 'ORGANIZATION'
    and rb.scope_id is null
  order by rb.created_at desc
  limit 1;

  return query
  select o.id, o.name, w.id, w.name, coalesce(v_role_code, 'MEMBER')
  from identity.organizations o
  join enterprise.workspaces w on w.organization_id = o.id and w.id = v_workspace_id
  where o.id = v_organization_id and o.status = 'ACTIVE' and w.workspace_status = 'ACTIVE';
end;
$$;
revoke all on function identity.get_current_workspace_context() from public, anon;
grant execute on function identity.get_current_workspace_context() to authenticated;
notify pgrst, 'reload config';
