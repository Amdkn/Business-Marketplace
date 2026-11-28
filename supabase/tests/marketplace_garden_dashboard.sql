-- Marketplace Dashboard tenant data contract regression.
-- Safe to run repeatedly; asserts schema shape and isolation controls only.
do $$
declare
  table_name text;
  expected text[] := array['agents','clients'];
  policy_count integer;
begin
  if not exists (select 1 from pg_namespace where nspname = 'dashboard') then
    raise exception 'dashboard schema is missing';
  end if;

  foreach table_name in array expected loop
    if to_regclass(format('dashboard.%I', table_name)) is null then
      raise exception 'dashboard.% table is missing', table_name;
    end if;

    if not (
      select c.relrowsecurity
      from pg_class c
      where c.oid = to_regclass(format('dashboard.%I', table_name))
    ) then
      raise exception 'RLS is disabled on dashboard.%', table_name;
    end if;

    select count(*) into policy_count
    from pg_policies
    where schemaname = 'dashboard' and tablename = table_name;
    if policy_count <> 4 then
      raise exception 'Expected 4 tenant policies on dashboard.%, found %', table_name, policy_count;
    end if;

    if has_table_privilege('anon', format('dashboard.%I', table_name), 'SELECT') then
      raise exception 'anon unexpectedly has SELECT on dashboard.%', table_name;
    end if;
    if not has_table_privilege('authenticated', format('dashboard.%I', table_name), 'SELECT') then
      raise exception 'authenticated lacks SELECT on dashboard.%', table_name;
    end if;
  end loop;

  if not has_schema_privilege('authenticated', 'dashboard', 'USAGE') then
    raise exception 'authenticated lacks schema USAGE on dashboard';
  end if;
end;
$$;
