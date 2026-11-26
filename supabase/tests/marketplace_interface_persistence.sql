-- Marketplace interface persistence regression.
-- Run after migrations; this suite validates schema/RLS shape without creating tenant data.
do $$
declare
  expected text[] := array[
    'clients','articles','team','people_agents','runbooks','incidents','services','it_experiments','deploys','tasks',
    'marketplace_listings','product_items','product_releases','growth_channels','growth_experiments','deals','invoices',
    'contracts','policies','session_notes','legal_ai_act_checks','legal_frameworks','legal_controls',
    'legal_compliance_policies','legal_evidence','legal_risks','legal_vendors','legal_gaps','personas','memory','codex',
    'approval_decisions','squads','content'
  ];
  t text;
  n integer;
begin
  if not has_schema_privilege('authenticated','workspace_data','USAGE') then
    raise exception 'authenticated role cannot use workspace_data';
  end if;
  if has_schema_privilege('anon','workspace_data','USAGE') then
    raise exception 'anon unexpectedly has workspace_data usage';
  end if;
  foreach t in array expected loop
    if to_regclass(format('workspace_data.%I',t)) is null then raise exception 'missing collection table %',t; end if;
    if not (select relrowsecurity from pg_class where oid=to_regclass(format('workspace_data.%I',t))) then raise exception 'RLS disabled on %',t; end if;
    select count(*) into n from pg_policies where schemaname='workspace_data' and tablename=t;
    if n <> 4 then raise exception 'expected four policies on %, found %',t,n; end if;
    if has_table_privilege('anon',format('workspace_data.%I',t),'SELECT') then raise exception 'anon SELECT granted on %',t; end if;
    if not has_table_privilege('authenticated',format('workspace_data.%I',t),'SELECT') then raise exception 'authenticated SELECT missing on %',t; end if;
    if not exists(select 1 from pg_trigger where tgrelid=to_regclass(format('workspace_data.%I',t)) and tgname=format('%s_tenant_guard',t) and not tgisinternal) then raise exception 'tenant immutability trigger missing on %',t; end if;
  end loop;
  if to_regclass('workspace_data.activity_events') is null then raise exception 'activity_events table missing'; end if;
  select count(*) into n from pg_policies where schemaname='workspace_data' and tablename='activity_events';
  if n <> 2 then raise exception 'expected two activity event policies, found %',n; end if;
  if (select count(*) from information_schema.tables where table_schema='workspace_data' and table_type='BASE TABLE') <> 35 then
    raise exception 'workspace_data table count differs from 34 collections + activity_events';
  end if;
  if exists(select 1 from information_schema.tables where table_schema='workspace_data' and table_name like 'demo_coach_%') then
    raise exception 'demo-only collections must not have tenant persistence tables';
  end if;
end $$;
