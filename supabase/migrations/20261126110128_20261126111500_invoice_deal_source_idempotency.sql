CREATE UNIQUE INDEX IF NOT EXISTS deals_org_workspace_id_uidx
  ON workspace_data.deals (organization_id, workspace_id, id);

ALTER TABLE workspace_data.invoices
  ADD COLUMN IF NOT EXISTS deal_id text,
  ADD COLUMN IF NOT EXISTS source_key text;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid='workspace_data.invoices'::regclass
      AND conname='invoices_deal_workspace_fkey'
  ) THEN
    ALTER TABLE workspace_data.invoices
      ADD CONSTRAINT invoices_deal_workspace_fkey
      FOREIGN KEY (organization_id, workspace_id, deal_id)
      REFERENCES workspace_data.deals (organization_id, workspace_id, id)
      ON DELETE RESTRICT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid='workspace_data.invoices'::regclass
      AND conname='invoices_source_key_length_check'
  ) THEN
    ALTER TABLE workspace_data.invoices
      ADD CONSTRAINT invoices_source_key_length_check
      CHECK (source_key IS NULL OR length(btrim(source_key)) BETWEEN 1 AND 200);
  END IF;
END;
$$;

CREATE INDEX IF NOT EXISTS invoices_org_workspace_deal_idx
  ON workspace_data.invoices (organization_id, workspace_id, deal_id);

CREATE UNIQUE INDEX IF NOT EXISTS invoices_source_key_uidx
  ON workspace_data.invoices (organization_id, workspace_id, source_key)
  WHERE source_key IS NOT NULL;
