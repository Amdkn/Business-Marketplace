-- Client activity integration test.
-- Runs under the real authenticated tenant role and rolls back all test rows.

BEGIN;

SELECT set_config(
  'request.jwt.claim.sub',
  (SELECT id::text FROM auth.users ORDER BY created_at LIMIT 1),
  true
);
SELECT set_config(
  'request.jwt.claims',
  jsonb_build_object(
    'sub', (SELECT id::text FROM auth.users ORDER BY created_at LIMIT 1),
    'role', 'authenticated'
  )::text,
  true
);
SELECT set_config(
  'app.test_organization_id',
  (
    SELECT organization_id::text
    FROM identity.organization_memberships
    WHERE user_id = (SELECT id FROM auth.users ORDER BY created_at LIMIT 1)
      AND membership_status = 'ACTIVE'
    ORDER BY created_at
    LIMIT 1
  ),
  true
);
SELECT set_config(
  'app.test_workspace_id',
  (
    SELECT id::text
    FROM enterprise.workspaces
    WHERE organization_id = current_setting('app.test_organization_id')::uuid
    ORDER BY created_at
    LIMIT 1
  ),
  true
);

SET LOCAL ROLE authenticated;

DO $$
DECLARE
  v_client_id text := 'e2e-client-activity-' || gen_random_uuid()::text;
  v_count integer;
  v_types text[];
BEGIN
  IF auth.uid() IS NULL
     OR current_setting('app.test_organization_id', true) IS NULL
     OR current_setting('app.test_workspace_id', true) IS NULL THEN
    RAISE EXCEPTION 'An active authenticated tenant fixture is required for this rollback test';
  END IF;

  INSERT INTO workspace_data.clients (
    id, organization_id, workspace_id, created_by_user_id, title, extra_data
  ) VALUES (
    v_client_id,
    current_setting('app.test_organization_id')::uuid,
    current_setting('app.test_workspace_id')::uuid,
    auth.uid(),
    'E2E activity client',
    '{}'::jsonb
  );

  UPDATE workspace_data.clients
  SET title = 'E2E activity client updated'
  WHERE id = v_client_id;

  DELETE FROM workspace_data.clients
  WHERE id = v_client_id;

  SELECT count(*), array_agg(event_type ORDER BY event_type)
  INTO v_count, v_types
  FROM workspace_data.activity_events
  WHERE organization_id = current_setting('app.test_organization_id')::uuid
    AND workspace_id = current_setting('app.test_workspace_id')::uuid
    AND event_payload ->> 'client_id' = v_client_id;

  IF v_count <> 3 OR v_types <> ARRAY['client.created', 'client.deleted', 'client.updated'] THEN
    RAISE EXCEPTION 'Expected three client lifecycle events, got % / %', v_count, v_types;
  END IF;
END;
$$;

ROLLBACK;
