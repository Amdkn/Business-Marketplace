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
  IF NEW.status IN ('approved','rejected') AND NEW.status IS DISTINCT FROM OLD.status THEN
    NEW.decided_at := COALESCE(NEW.decided_at, now());
    NEW.decided_by_user_id := COALESCE(NEW.decided_by_user_id, auth.uid());
  ELSIF NEW.status IN ('proposed','withdrawn') THEN
    NEW.decided_at := NULL;
    NEW.decided_by_user_id := NULL;
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION workspace_data.guard_change_request_update() FROM PUBLIC, anon, authenticated;
