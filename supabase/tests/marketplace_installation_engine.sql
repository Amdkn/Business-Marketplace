-- Structural regression for the tenant installation, ownership, dependency and capability engines.
-- This test creates no tenant or business rows.
DO $test$
DECLARE
  v_def text;
  v_rls boolean;
  v_fn regprocedure;
  v_search_path text[];
  v_table text;
BEGIN
  -- One installation per workspace and blueprint.
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid='areas.domain_installations'::regclass AND conname='domain_installations_workspace_id_domain_code_key' AND contype='u') THEN
    RAISE EXCEPTION 'Domain installation idempotency constraint is missing';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid='enterprise.department_installations'::regclass AND conname='department_installations_workspace_id_department_key_key' AND contype='u') THEN
    RAISE EXCEPTION 'Department installation idempotency constraint is missing';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid='areas.holon_installations'::regclass AND conname='holon_installations_domain_installation_id_holon_code_key' AND contype='u') THEN
    RAISE EXCEPTION 'Holon installation idempotency constraint is missing';
  END IF;

  -- Installation requests are idempotent per workspace/key; requests and events are append-only.
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid='enterprise.structure_installation_requests'::regclass AND conname='structure_installation_request_workspace_id_idempotency_key_key' AND contype='u') THEN
    RAISE EXCEPTION 'Structure installation idempotency constraint is missing';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgrelid='enterprise.structure_installation_requests'::regclass AND tgname='structure_installation_requests_append_only' AND NOT tgisinternal) THEN
    RAISE EXCEPTION 'Installation request append-only trigger is missing';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgrelid='enterprise.structure_installation_events'::regclass AND tgname='structure_installation_events_append_only' AND NOT tgisinternal) THEN
    RAISE EXCEPTION 'Installation event append-only trigger is missing';
  END IF;

  -- Exactly one active OWNER per installed entity.
  SELECT pg_get_indexdef(indexrelid) INTO v_def
  FROM pg_index
  WHERE indexrelid='enterprise.installation_ownership_single_owner_uq'::regclass;
  IF v_def IS NULL OR v_def NOT LIKE '%UNIQUE INDEX%'
     OR v_def NOT LIKE '%assignment_role = ''OWNER''%'
     OR v_def NOT LIKE '%assignment_status = ''ACTIVE''%' THEN
    RAISE EXCEPTION 'Single active OWNER unique index is missing or has changed';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgrelid='enterprise.installation_ownership_assignments'::regclass AND tgname='installation_ownership_validate' AND NOT tgisinternal) THEN
    RAISE EXCEPTION 'Ownership principal/scope validator trigger is missing';
  END IF;

  -- Typed, workspace-scoped dependency graph with cycle/scope validator.
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid='enterprise.installation_dependencies'::regclass AND conname='installation_dependencies_workspace_id_source_entity_type_s_key' AND contype='u') THEN
    RAISE EXCEPTION 'Dependency idempotency constraint is missing';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgrelid='enterprise.installation_dependencies'::regclass AND tgname='installation_dependency_validate' AND NOT tgisinternal) THEN
    RAISE EXCEPTION 'Dependency graph validator trigger is missing';
  END IF;

  -- Versioned capability installs are unique per target and version, and validated on writes.
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid='catalog.capability_installations'::regclass AND conname='capability_installations_workspace_id_target_entity_type_ta_key' AND contype='u') THEN
    RAISE EXCEPTION 'Capability installation idempotency constraint is missing';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgrelid='catalog.capability_installations'::regclass AND tgname='capability_installation_validate' AND NOT tgisinternal) THEN
    RAISE EXCEPTION 'Capability installation entitlement validator trigger is missing';
  END IF;

  -- Private engine tables remain RLS-enabled and not directly readable/writable by browser roles.
  FOREACH v_table IN ARRAY ARRAY[
    'areas.domain_installations',
    'areas.holon_installations',
    'enterprise.department_installations',
    'enterprise.installation_ownership_assignments',
    'enterprise.installation_dependencies',
    'enterprise.structure_installation_requests',
    'enterprise.structure_installation_events',
    'catalog.capability_installations'
  ] LOOP
    SELECT c.relrowsecurity INTO v_rls
    FROM pg_class c WHERE c.oid=v_table::regclass;
    IF v_rls IS DISTINCT FROM true THEN
      RAISE EXCEPTION 'RLS must remain enabled on %', v_table;
    END IF;
  END LOOP;

  IF has_table_privilege('anon','areas.domain_installations','SELECT')
     OR has_table_privilege('authenticated','areas.domain_installations','SELECT')
     OR has_table_privilege('anon','areas.holon_installations','SELECT')
     OR has_table_privilege('authenticated','areas.holon_installations','SELECT')
     OR has_table_privilege('anon','enterprise.department_installations','SELECT')
     OR has_table_privilege('authenticated','enterprise.department_installations','SELECT')
     OR has_table_privilege('anon','enterprise.installation_ownership_assignments','SELECT')
     OR has_table_privilege('authenticated','enterprise.installation_ownership_assignments','SELECT')
     OR has_table_privilege('anon','enterprise.installation_dependencies','SELECT')
     OR has_table_privilege('authenticated','enterprise.installation_dependencies','SELECT')
     OR has_table_privilege('anon','enterprise.structure_installation_requests','SELECT')
     OR has_table_privilege('authenticated','enterprise.structure_installation_requests','SELECT')
     OR has_table_privilege('anon','enterprise.structure_installation_events','SELECT')
     OR has_table_privilege('authenticated','enterprise.structure_installation_events','SELECT')
     OR has_table_privilege('anon','catalog.capability_installations','SELECT')
     OR has_table_privilege('authenticated','catalog.capability_installations','SELECT') THEN
    RAISE EXCEPTION 'Private installation engine tables must not be directly readable by browser roles';
  END IF;

  FOREACH v_fn IN ARRAY ARRAY[
    'enterprise.validate_ownership_assignment()'::regprocedure,
    'enterprise.validate_installation_dependency()'::regprocedure,
    'catalog.validate_capability_installation()'::regprocedure
  ] LOOP
    SELECT p.prosecdef, p.proconfig INTO v_rls, v_search_path
    FROM pg_proc p WHERE p.oid=v_fn;
    IF v_rls IS DISTINCT FROM true OR NOT ('search_path=pg_catalog' = ANY(v_search_path)
       OR EXISTS (SELECT 1 FROM unnest(v_search_path) s WHERE s LIKE 'search_path=pg_catalog,%')) THEN
      RAISE EXCEPTION 'Engine validator % must be SECURITY DEFINER with a pinned search_path', v_fn;
    END IF;
    IF has_function_privilege('anon',v_fn,'EXECUTE') OR has_function_privilege('authenticated',v_fn,'EXECUTE') THEN
      RAISE EXCEPTION 'Browser roles must not execute engine validator % directly', v_fn;
    END IF;
  END LOOP;

  RAISE NOTICE 'PASS: tenant installation, idempotency, append-only audit, single-owner, dependency and capability invariants';
END
$test$;
