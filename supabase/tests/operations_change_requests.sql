-- Structural contract for Operations change requests.
-- Safe on a populated tenant: this test inserts, updates and deletes no rows.
DO $$
DECLARE
  v_rls boolean;
  v_policy_count integer;
  v_workspace_fk text;
  v_decision_check text;
  v_trigger_count integer;
  v_search_path text[];
BEGIN
  SELECT relrowsecurity INTO v_rls
  FROM pg_class WHERE oid='workspace_data.change_requests'::regclass;
  IF NOT COALESCE(v_rls,false) THEN
    RAISE EXCEPTION 'change_requests RLS must remain enabled';
  END IF;

  SELECT count(*) INTO v_policy_count
  FROM pg_policies
  WHERE schemaname='workspace_data' AND tablename='change_requests';
  IF v_policy_count <> 4 THEN
    RAISE EXCEPTION 'Expected four workspace-scoped change_requests policies; found %',v_policy_count;
  END IF;

  IF NOT has_table_privilege('authenticated','workspace_data.change_requests','SELECT')
     OR NOT has_table_privilege('authenticated','workspace_data.change_requests','INSERT')
     OR NOT has_table_privilege('authenticated','workspace_data.change_requests','UPDATE')
     OR NOT has_table_privilege('authenticated','workspace_data.change_requests','DELETE') THEN
    RAISE EXCEPTION 'Authenticated workspace CRUD grants are incomplete';
  END IF;

  IF has_table_privilege('anon','workspace_data.change_requests','SELECT')
     OR has_table_privilege('anon','workspace_data.change_requests','INSERT')
     OR has_table_privilege('anon','workspace_data.change_requests','UPDATE')
     OR has_table_privilege('anon','workspace_data.change_requests','DELETE') THEN
    RAISE EXCEPTION 'Anonymous role must not access change_requests';
  END IF;

  SELECT pg_get_constraintdef(oid) INTO v_workspace_fk
  FROM pg_constraint
  WHERE conrelid='workspace_data.change_requests'::regclass
    AND conname='change_requests_workspace_org_fkey';
  IF v_workspace_fk IS NULL OR position('workspace_id' in v_workspace_fk)=0
     OR position('organization_id' in v_workspace_fk)=0 THEN
    RAISE EXCEPTION 'Composite workspace/organization FK is missing';
  END IF;

  SELECT pg_get_constraintdef(oid) INTO v_decision_check
  FROM pg_constraint
  WHERE conrelid='workspace_data.change_requests'::regclass
    AND conname='change_requests_decision_state_check';
  IF v_decision_check IS NULL OR position('decided_at' in v_decision_check)=0
     OR position('decided_by_user_id' in v_decision_check)=0 THEN
    RAISE EXCEPTION 'Decision audit constraint is missing';
  END IF;

  SELECT count(*) INTO v_trigger_count
  FROM pg_trigger
  WHERE tgrelid='workspace_data.change_requests'::regclass
    AND tgname='change_requests_guard_update'
    AND NOT tgisinternal;
  IF v_trigger_count <> 1 THEN
    RAISE EXCEPTION 'Immutable ownership / decision audit trigger is missing';
  END IF;

  SELECT proconfig INTO v_search_path
  FROM pg_proc
  WHERE oid='workspace_data.guard_change_request_update()'::regprocedure;
  IF v_search_path IS NULL OR NOT ('search_path=pg_catalog, workspace_data' = ANY(v_search_path)) THEN
    RAISE EXCEPTION 'Trigger function search_path is not pinned';
  END IF;

  IF has_function_privilege('authenticated','workspace_data.guard_change_request_update()','EXECUTE') THEN
    RAISE EXCEPTION 'Trigger function must not be directly executable by authenticated clients';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE schemaname='workspace_data' AND tablename='change_requests'
      AND indexname='change_requests_workspace_status_created_idx'
  ) OR NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE schemaname='workspace_data' AND tablename='change_requests'
      AND indexname='change_requests_workspace_org_fk_idx'
  ) THEN
    RAISE EXCEPTION 'Workspace query/FK indexes are missing';
  END IF;
END;
$$;
