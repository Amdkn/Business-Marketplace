CREATE INDEX IF NOT EXISTS change_requests_created_by_user_idx
  ON workspace_data.change_requests (created_by_user_id);
CREATE INDEX IF NOT EXISTS change_requests_decided_by_user_idx
  ON workspace_data.change_requests (decided_by_user_id);
CREATE INDEX IF NOT EXISTS change_requests_workspace_org_fk_idx
  ON workspace_data.change_requests (workspace_id, organization_id);
