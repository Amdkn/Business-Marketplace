-- Garden Dashboard tenant data contract regression.
-- Safe to run repeatedly; asserts schema shape and isolation controls only.
do $$
declare
  table_name text;
  expected text[] := array['agents','clients'];
  policy_count integer;
begin
  if not exists (select 1 from pg_namespace where nspname = 'omk_saas') then
    raise exception 'omk_saas schema is missing';
  end if;

  foreach table_name in array expected loop
    if to_regclass(format('omk_saas.%I', table_name)) is null then
      raise exception 'omk_saas.% table is missing', table_name;
    end if;

    if not (
      select c.relrowsecurity
      from pg_class c
      where c.oid = to_regclass(format('omk_saas.%I', table_name))
    ) then
      raise exception 'RLS is disabled on omk_saas.%', table_name;
    end if;

    select count(*) into policy_count
    from pg_policies
    where schemaname = 'omk_saas' and tablename = table_name;
    if policy_count <> 4 then
      raise exception 'Expected 4 tenant policies on omk_saas.%, found %', table_name, policy_count;
    end if;

    if has_table_privilege('anon', format('omk_saas.%I', table_name), 'SELECT') then
      raise exception 'anon unexpectedly has SELECT on omk_saas.%', table_name;
    end if;
    if not has_table_privilege('authenticated', format('omk_saas.%I', table_name), 'SELECT') then
      raise exception 'authenticated lacks SELECT on omk_saas.%', table_name;
    end if;
  end loop;

  if not has_schema_privilege('authenticated', 'omk_saas', 'USAGE') then
    raise exception 'authenticated lacks schema USAGE on omk_saas';
  end if;
end;
$$;
