-- Record client lifecycle changes in the workspace append-only activity stream.
-- The trigger is atomic with the source write: a client mutation cannot commit
-- without its corresponding activity event.

CREATE OR REPLACE FUNCTION workspace_data.record_client_activity_event()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog
AS $$
DECLARE
  v_organization_id uuid;
  v_workspace_id uuid;
  v_client_id text;
  v_client_name text;
  v_event_type text;
  v_payload jsonb;
BEGIN
  IF TG_OP = 'DELETE' THEN
    v_organization_id := OLD.organization_id;
    v_workspace_id := OLD.workspace_id;
    v_client_id := OLD.id;
    v_client_name := OLD.title;
    v_event_type := 'client.deleted';
    v_payload := jsonb_build_object(
      'client_id', v_client_id,
      'client_name', v_client_name
    );
  ELSIF TG_OP = 'INSERT' THEN
    v_organization_id := NEW.organization_id;
    v_workspace_id := NEW.workspace_id;
    v_client_id := NEW.id;
    v_client_name := NEW.title;
    v_event_type := 'client.created';
    v_payload := jsonb_build_object(
      'client_id', v_client_id,
      'client_name', v_client_name
    );
  ELSE
    v_organization_id := NEW.organization_id;
    v_workspace_id := NEW.workspace_id;
    v_client_id := NEW.id;
    v_client_name := NEW.title;
    v_event_type := 'client.updated';
    v_payload := jsonb_build_object(
      'client_id', v_client_id,
      'client_name', v_client_name,
      'previous_name', OLD.title
    );
  END IF;

  INSERT INTO workspace_data.activity_events (
    organization_id,
    workspace_id,
    created_by_user_id,
    event_type,
    event_payload
  ) VALUES (
    v_organization_id,
    v_workspace_id,
    auth.uid(),
    v_event_type,
    v_payload
  );

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION workspace_data.record_client_activity_event() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS clients_activity_event ON workspace_data.clients;
CREATE TRIGGER clients_activity_event
AFTER INSERT OR UPDATE OR DELETE ON workspace_data.clients
FOR EACH ROW
EXECUTE FUNCTION workspace_data.record_client_activity_event();

CREATE INDEX IF NOT EXISTS activity_events_client_timeline_idx
ON workspace_data.activity_events (
  organization_id,
  workspace_id,
  (event_payload ->> 'client_id'),
  created_at DESC
)
WHERE event_type LIKE 'client.%';

COMMENT ON FUNCTION workspace_data.record_client_activity_event()
IS 'Atomically appends client create/update/delete events to workspace_data.activity_events.';
