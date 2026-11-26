-- Contract test for idempotent, client-linked deal invoices.
-- Structural assertions only; no tenant rows are created.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='workspace_data' AND table_name='invoices' AND column_name='deal_id'
  ) OR NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='workspace_data' AND table_name='invoices' AND column_name='source_key'
  ) THEN
    RAISE EXCEPTION 'Invoice deal linkage and source key columns are required';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid='workspace_data.invoices'::regclass
      AND conname='invoices_deal_workspace_fkey'
  ) THEN
    RAISE EXCEPTION 'Invoice must reference a deal in the same workspace';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE schemaname='workspace_data' AND tablename='invoices'
      AND indexname='invoices_source_key_uidx'
  ) THEN
    RAISE EXCEPTION 'Invoice idempotency unique index is missing';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE schemaname='workspace_data' AND tablename='deals'
      AND indexname='deals_org_workspace_id_uidx'
  ) THEN
    RAISE EXCEPTION 'Deal composite unique key is missing';
  END IF;

  IF NOT (SELECT relrowsecurity FROM pg_class WHERE oid='workspace_data.invoices'::regclass) THEN
    RAISE EXCEPTION 'Invoices RLS must remain enabled';
  END IF;
END;
$$;
