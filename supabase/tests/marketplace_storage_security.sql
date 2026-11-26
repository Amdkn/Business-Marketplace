-- Structural and tenant-boundary test for the private Marketplace document bucket.
BEGIN;

-- Administrative assertions are evaluated before switching to the authenticated role.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM storage.buckets
    WHERE id='marketplace-documents' AND public=false AND file_size_limit=10485760
  ) THEN
    RAISE EXCEPTION 'Private Marketplace document bucket is missing or misconfigured';
  END IF;
  IF (
    SELECT count(*) FROM pg_policies
    WHERE schemaname='storage' AND tablename='objects'
      AND policyname IN ('marketplace_documents_read','marketplace_documents_upload','marketplace_documents_delete')
  ) <> 3 THEN
    RAISE EXCEPTION 'Expected all three Marketplace document storage policies';
  END IF;
END;
$$;

SELECT set_config('request.jwt.claim.sub',(SELECT id::text FROM auth.users ORDER BY created_at LIMIT 1),true);
SELECT set_config('request.jwt.claims',jsonb_build_object('sub',(SELECT id::text FROM auth.users ORDER BY created_at LIMIT 1),'role','authenticated')::text,true);
SELECT set_config('app.test_organization_id',(SELECT organization_id::text FROM identity.organization_memberships WHERE user_id=(SELECT id FROM auth.users ORDER BY created_at LIMIT 1) AND membership_status='ACTIVE' ORDER BY created_at LIMIT 1),true);
SELECT set_config('app.test_workspace_id',(SELECT id::text FROM enterprise.workspaces WHERE organization_id=current_setting('app.test_organization_id')::uuid ORDER BY created_at LIMIT 1),true);

SET LOCAL ROLE authenticated;

DO $$
BEGIN
  IF auth.uid() IS NULL
     OR current_setting('app.test_organization_id',true) IS NULL
     OR current_setting('app.test_workspace_id',true) IS NULL THEN
    RAISE EXCEPTION 'An active authenticated tenant fixture is required';
  END IF;
  IF NOT identity.is_active_workspace_member(
    current_setting('app.test_organization_id')::uuid,
    current_setting('app.test_workspace_id')::uuid
  ) THEN
    RAISE EXCEPTION 'Current principal is not an active workspace member';
  END IF;
  IF NOT identity.can_manage_workspace(
    current_setting('app.test_organization_id')::uuid,
    current_setting('app.test_workspace_id')::uuid
  ) THEN
    RAISE EXCEPTION 'Current principal cannot manage workspace files';
  END IF;
END;
$$;

ROLLBACK;
