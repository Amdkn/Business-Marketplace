ALTER TABLE workspace_data.clients
  ADD COLUMN IF NOT EXISTS currency text;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid='workspace_data.clients'::regclass
      AND conname='clients_currency_iso4217_check'
  ) THEN
    ALTER TABLE workspace_data.clients
      ADD CONSTRAINT clients_currency_iso4217_check
      CHECK (currency IS NULL OR currency ~ '^[A-Z]{3}$');
  END IF;
END;
$$;
