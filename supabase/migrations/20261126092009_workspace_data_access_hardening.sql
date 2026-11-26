-- Keep workspace authorization helpers invoker-scoped; add missing ownership guards.
create or replace function identity.is_active_workspace_member(p_organization_id uuid, p_workspace_id uuid)
returns boolean language sql stable security invoker
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
returns boolean language sql stable security invoker
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
create trigger documents_tenant_guard before update on workspace_data.documents
for each row execute function workspace_data.guard_tenant_row();
create trigger legal_documents_tenant_guard before update on workspace_data.legal_documents
for each row execute function workspace_data.guard_tenant_row();
drop policy if exists activity_events_operator_update on workspace_data.activity_events;
drop policy if exists activity_events_operator_delete on workspace_data.activity_events;
notify pgrst, 'reload config';
