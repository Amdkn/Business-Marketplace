-- The predicates inspect private membership tables. SECURITY DEFINER is constrained:
-- fixed search_path, auth.uid()-bound subject, boolean-only result, no anon/PUBLIC execution.
create or replace function identity.is_active_workspace_member(p_organization_id uuid, p_workspace_id uuid)
returns boolean language sql stable security definer
set search_path = pg_catalog, identity, enterprise, auth
as $$
  select exists (
    select 1 from enterprise.workspace_memberships wm
    join identity.organization_memberships om
      on om.organization_id = wm.organization_id and om.user_id = wm.user_id
    where wm.organization_id = p_organization_id
      and wm.workspace_id = p_workspace_id
      and wm.user_id = auth.uid()
      and wm.membership_status = 'ACTIVE'
      and om.membership_status = 'ACTIVE'
  );
$$;
create or replace function identity.can_manage_workspace(p_organization_id uuid, p_workspace_id uuid)
returns boolean language sql stable security definer
set search_path = pg_catalog, identity, enterprise, auth
as $$
  select exists (
    select 1 from enterprise.workspace_memberships wm
    join identity.organization_memberships om
      on om.organization_id = wm.organization_id and om.user_id = wm.user_id
    join identity.role_bindings rb
      on rb.organization_id = wm.organization_id and rb.subject_user_id = wm.user_id
    where wm.organization_id = p_organization_id
      and wm.workspace_id = p_workspace_id
      and wm.user_id = auth.uid()
      and wm.membership_status = 'ACTIVE'
      and om.membership_status = 'ACTIVE'
      and rb.binding_status = 'ACTIVE'
      and rb.role_code = any (array['S0_SOVEREIGN','B1_CEO','B2_MANAGER','B2.2'])
      and ((rb.scope_type = 'ORGANIZATION' and rb.scope_id is null)
        or (rb.scope_type = 'WORKSPACE' and rb.scope_id = p_workspace_id))
  );
$$;
revoke all on function identity.is_active_workspace_member(uuid, uuid) from public, anon;
revoke all on function identity.can_manage_workspace(uuid, uuid) from public, anon;
grant execute on function identity.is_active_workspace_member(uuid, uuid) to authenticated;
grant execute on function identity.can_manage_workspace(uuid, uuid) to authenticated;
notify pgrst, 'reload config';
