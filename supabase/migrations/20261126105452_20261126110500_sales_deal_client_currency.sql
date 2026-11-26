ALTER TABLE workspace_data.deals
  ADD COLUMN IF NOT EXISTS client_id text,
  ADD COLUMN IF NOT EXISTS currency text;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid='workspace_data.deals'::regclass
      AND conname='deals_client_workspace_fkey'
  ) THEN
    ALTER TABLE workspace_data.deals
      ADD CONSTRAINT deals_client_workspace_fkey
      FOREIGN KEY (organization_id, workspace_id, client_id)
      REFERENCES workspace_data.clients (organization_id, workspace_id, id)
      ON DELETE RESTRICT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid='workspace_data.deals'::regclass
      AND conname='deals_currency_iso4217_check'
  ) THEN
    ALTER TABLE workspace_data.deals
      ADD CONSTRAINT deals_currency_iso4217_check
      CHECK (currency IS NULL OR currency ~ '^[A-Z]{3}$');
  END IF;
END;
$$;

CREATE INDEX IF NOT EXISTS deals_org_workspace_client_idx
  ON workspace_data.deals (organization_id, workspace_id, client_id);
