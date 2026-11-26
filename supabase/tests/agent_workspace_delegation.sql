-- Structural contract for canonical agent identity, workspace delegation and missions.
-- This test is safe to run against a populated tenant: it creates no rows.
do $$
declare
  v_scope_check text;
  v_shape_check text;
begin
  select pg_get_constraintdef(oid) into v_scope_check
  from pg_constraint
  where conrelid='identity.agent_delegations'::regclass
    and conname='agent_delegations_scope_type_check';
  if v_scope_check is null or position('WORKSPACE' in v_scope_check)=0 then
    raise exception 'agent_delegations must allow WORKSPACE scope';
  end if;

  select pg_get_constraintdef(oid) into v_shape_check
  from pg_constraint
  where conrelid='identity.agent_delegations'::regclass
    and conname='agent_delegation_scope_shape';
  if v_shape_check is null or position('WORKSPACE' in v_shape_check)=0 then
    raise exception 'WORKSPACE delegation must require a non-null scope_id';
  end if;

  if not exists (
    select 1 from pg_trigger
    where tgrelid='identity.agent_delegations'::regclass
      and tgname='agent_delegation_workspace_scope_guard'
      and not tgisinternal
  ) then
    raise exception 'Workspace delegation target guard is missing';
  end if;

  if not exists (
    select 1 from pg_constraint
    where conrelid='workspace_data.missions'::regclass
      and conname='missions_agent_same_org_fkey'
  ) then
    raise exception 'Mission-to-agent composite organization FK is missing';
  end if;

  if not exists (
    select 1 from pg_trigger
    where tgrelid='workspace_data.missions'::regclass
      and tgname='missions_agent_delegation_guard'
      and not tgisinternal
  ) then
    raise exception 'Mission active-delegation guard is missing';
  end if;

  if not (select relrowsecurity from pg_class where oid='workspace_data.missions'::regclass) then
    raise exception 'Missions RLS must remain enabled';
  end if;

  if has_table_privilege('authenticated','identity.agent_principals','SELECT')
     or has_table_privilege('authenticated','identity.agent_delegations','SELECT') then
    raise exception 'Private identity tables must not be directly readable by authenticated clients';
  end if;

  if not has_table_privilege('authenticated','workspace_data.missions','SELECT')
     or not has_table_privilege('authenticated','workspace_data.missions','INSERT')
     or not has_table_privilege('authenticated','workspace_data.missions','DELETE') then
    raise exception 'Workspace mission CRUD grants are incomplete';
  end if;
end;
$$;
