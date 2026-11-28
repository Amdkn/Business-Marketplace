-- Structural contract for client-linked, currency-aware workspace deals.
-- Safe to run on populated tenants; no rows are inserted by this contract test.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='workspace_data' AND table_name='clients' AND column_name='currency'
  ) OR NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid='workspace_data.clients'::regclass AND conname='clients_currency_iso4217_check'
  ) THEN
    RAISE EXCEPTION 'Client ticket currency column/check is missing';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='workspace_data' AND table_name='deals' AND column_name='client_id'
  ) OR NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='workspace_data' AND table_name='deals' AND column_name='currency'
  ) THEN
    RAISE EXCEPTION 'Deals client_id and currency columns are required';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid='workspace_data.deals'::regclass
      AND conname='deals_client_workspace_fkey'
  ) THEN
    RAISE EXCEPTION 'Deals must reference a client within the same organization and workspace';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid='workspace_data.deals'::regclass
      AND conname='deals_currency_iso4217_check'
  ) THEN
    RAISE EXCEPTION 'Deals ISO 4217 currency constraint is missing';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE schemaname='workspace_data' AND tablename='deals'
      AND indexname='deals_org_workspace_client_idx'
  ) THEN
    RAISE EXCEPTION 'Deals client relation index is missing';
  END IF;

  IF NOT (SELECT relrowsecurity FROM pg_class WHERE oid='workspace_data.deals'::regclass) THEN
    RAISE EXCEPTION 'Deals RLS must remain enabled';
  END IF;
END;
$$;
