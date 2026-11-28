CREATE OR REPLACE FUNCTION workspace_data.enforce_invoice_deal_client_match()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = pg_catalog, workspace_data
AS $$
DECLARE
  v_deal_client_id text;
BEGIN
  IF NEW.deal_id IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT d.client_id
    INTO v_deal_client_id
  FROM workspace_data.deals d
  WHERE d.organization_id = NEW.organization_id
    AND d.workspace_id = NEW.workspace_id
    AND d.id = NEW.deal_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invoice deal % does not exist in this workspace', NEW.deal_id
      USING ERRCODE = '23503';
  END IF;

  IF NEW.client_id IS DISTINCT FROM v_deal_client_id THEN
    RAISE EXCEPTION 'Invoice client_id must match the linked deal client_id'
      USING ERRCODE = '23514';
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION workspace_data.enforce_invoice_deal_client_match() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS invoices_deal_client_match ON workspace_data.invoices;
CREATE TRIGGER invoices_deal_client_match
  BEFORE INSERT OR UPDATE OF organization_id, workspace_id, deal_id, client_id
  ON workspace_data.invoices
  FOR EACH ROW EXECUTE FUNCTION workspace_data.enforce_invoice_deal_client_match();
