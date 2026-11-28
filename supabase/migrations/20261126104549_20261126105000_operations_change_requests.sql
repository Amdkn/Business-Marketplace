CREATE TABLE IF NOT EXISTS workspace_data.change_requests (
  id text PRIMARY KEY,
  organization_id uuid NOT NULL REFERENCES identity.organizations(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL,
  created_by_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  title text NOT NULL CHECK (length(btrim(title)) BETWEEN 1 AND 240),
  summary text NOT NULL DEFAULT '',
  why text NOT NULL DEFAULT '',
  risk text NOT NULL DEFAULT 'low' CHECK (risk IN ('low','med','high')),
  policy text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'proposed' CHECK (status IN ('proposed','approved','rejected','withdrawn')),
  proposed_by text NOT NULL DEFAULT 'workspace operator',
  decided_by_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  decided_at timestamptz,
  decision_note text,
  extra_data jsonb NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(extra_data) = 'object'),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT change_requests_workspace_org_fkey
    FOREIGN KEY (workspace_id, organization_id)
    REFERENCES enterprise.workspaces(id, organization_id) ON DELETE CASCADE,
  CONSTRAINT change_requests_decision_state_check
    CHECK (
      (status IN ('proposed','withdrawn') AND decided_at IS NULL)
      OR (status IN ('approved','rejected') AND decided_at IS NOT NULL AND decided_by_user_id IS NOT NULL)
    )
);

CREATE INDEX IF NOT EXISTS change_requests_workspace_status_created_idx
  ON workspace_data.change_requests (organization_id, workspace_id, status, created_at DESC);

ALTER TABLE workspace_data.change_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS change_requests_member_read ON workspace_data.change_requests;
CREATE POLICY change_requests_member_read ON workspace_data.change_requests
  FOR SELECT TO authenticated
  USING (identity.is_active_workspace_member(organization_id, workspace_id));

DROP POLICY IF EXISTS change_requests_operator_insert ON workspace_data.change_requests;
CREATE POLICY change_requests_operator_insert ON workspace_data.change_requests
  FOR INSERT TO authenticated
  WITH CHECK (
    created_by_user_id = (SELECT auth.uid())
    AND identity.can_manage_workspace(organization_id, workspace_id)
  );

DROP POLICY IF EXISTS change_requests_operator_update ON workspace_data.change_requests;
CREATE POLICY change_requests_operator_update ON workspace_data.change_requests
  FOR UPDATE TO authenticated
  USING (identity.can_manage_workspace(organization_id, workspace_id))
  WITH CHECK (identity.can_manage_workspace(organization_id, workspace_id));

DROP POLICY IF EXISTS change_requests_operator_delete ON workspace_data.change_requests;
CREATE POLICY change_requests_operator_delete ON workspace_data.change_requests
  FOR DELETE TO authenticated
  USING (identity.can_manage_workspace(organization_id, workspace_id));

CREATE OR REPLACE FUNCTION workspace_data.guard_change_request_update()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = pg_catalog, workspace_data
AS $$
BEGIN
  NEW.id := OLD.id;
  NEW.organization_id := OLD.organization_id;
  NEW.workspace_id := OLD.workspace_id;
  NEW.created_by_user_id := OLD.created_by_user_id;
  NEW.created_at := OLD.created_at;
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION workspace_data.guard_change_request_update() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS change_requests_guard_update ON workspace_data.change_requests;
CREATE TRIGGER change_requests_guard_update
  BEFORE UPDATE ON workspace_data.change_requests
  FOR EACH ROW EXECUTE FUNCTION workspace_data.guard_change_request_update();

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE workspace_data.change_requests TO authenticated;
