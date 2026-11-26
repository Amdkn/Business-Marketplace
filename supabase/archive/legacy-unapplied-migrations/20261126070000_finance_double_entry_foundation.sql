-- Day 2 Finance & Capital foundation: double-entry ledger and payment lifecycle.
-- Provider-neutral. No payment processor is assumed connected.
BEGIN;

CREATE SCHEMA IF NOT EXISTS finance;
REVOKE ALL ON SCHEMA finance FROM PUBLIC, anon, authenticated;
GRANT USAGE ON SCHEMA finance TO service_role;

CREATE TABLE finance.ledger_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES identity.organizations(id) ON DELETE RESTRICT,
  account_code text NOT NULL,
  account_name text NOT NULL,
  account_type text NOT NULL CHECK (account_type IN ('ASSET','LIABILITY','EQUITY','REVENUE','EXPENSE')),
  normal_balance text NOT NULL CHECK (normal_balance IN ('DEBIT','CREDIT')),
  currency char(3) NOT NULL CHECK (currency ~ '^[A-Z]{3}$'),
  system_key text,
  account_status text NOT NULL DEFAULT 'ACTIVE' CHECK (account_status IN ('ACTIVE','ARCHIVED')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, account_code, currency),
  UNIQUE (id, organization_id, currency)
);
CREATE UNIQUE INDEX ledger_accounts_system_key_unique
  ON finance.ledger_accounts (organization_id, system_key, currency)
  WHERE system_key IS NOT NULL;
CREATE INDEX ledger_accounts_org_type_idx
  ON finance.ledger_accounts (organization_id, account_type, account_status);

CREATE TABLE finance.journal_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES identity.organizations(id) ON DELETE RESTRICT,
  entry_number text NOT NULL,
  idempotency_key text NOT NULL,
  source_type text NOT NULL CHECK (source_type IN ('ORDER','PAYMENT','REFUND','PAYOUT','FEE','ADJUSTMENT','REVERSAL','OPENING_BALANCE')),
  source_id uuid,
  description text NOT NULL,
  currency char(3) NOT NULL CHECK (currency ~ '^[A-Z]{3}$'),
  entry_status text NOT NULL DEFAULT 'DRAFT' CHECK (entry_status IN ('DRAFT','POSTED','VOID')),
  occurred_at timestamptz NOT NULL DEFAULT now(),
  posted_at timestamptz,
  created_by_user_id uuid,
  reversal_of_entry_id uuid REFERENCES finance.journal_entries(id) ON DELETE RESTRICT,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(metadata) = 'object'),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, idempotency_key),
  UNIQUE (organization_id, entry_number),
  UNIQUE (id, organization_id, currency),
  CHECK ((entry_status = 'POSTED' AND posted_at IS NOT NULL) OR entry_status <> 'POSTED')
);
CREATE INDEX journal_entries_org_time_idx
  ON finance.journal_entries (organization_id, occurred_at DESC);
CREATE INDEX journal_entries_source_idx
  ON finance.journal_entries (source_type, source_id);

CREATE TABLE finance.journal_lines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  journal_entry_id uuid NOT NULL,
  organization_id uuid NOT NULL,
  currency char(3) NOT NULL,
  account_id uuid NOT NULL,
  line_number integer NOT NULL CHECK (line_number > 0),
  description text,
  debit_amount numeric(20,6) NOT NULL DEFAULT 0 CHECK (debit_amount >= 0),
  credit_amount numeric(20,6) NOT NULL DEFAULT 0 CHECK (credit_amount >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (journal_entry_id, organization_id, currency)
    REFERENCES finance.journal_entries(id, organization_id, currency) ON DELETE RESTRICT,
  FOREIGN KEY (account_id, organization_id, currency)
    REFERENCES finance.ledger_accounts(id, organization_id, currency) ON DELETE RESTRICT,
  UNIQUE (journal_entry_id, line_number),
  CHECK ((debit_amount > 0 AND credit_amount = 0) OR (credit_amount > 0 AND debit_amount = 0))
);
CREATE INDEX journal_lines_account_idx
  ON finance.journal_lines (account_id, created_at DESC);

CREATE OR REPLACE FUNCTION finance.assert_posted_journal_balanced()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, finance
AS $function$
DECLARE
  v_entry_id uuid;
  v_status text;
  v_count integer;
  v_debits numeric(20,6);
  v_credits numeric(20,6);
BEGIN
  v_entry_id := CASE WHEN TG_OP = 'DELETE' THEN OLD.journal_entry_id ELSE NEW.journal_entry_id END;
  SELECT entry_status INTO v_status FROM finance.journal_entries WHERE id = v_entry_id;
  IF v_status IS DISTINCT FROM 'POSTED' THEN RETURN NULL; END IF;
  SELECT count(*),coalesce(sum(debit_amount),0),coalesce(sum(credit_amount),0)
    INTO v_count,v_debits,v_credits
  FROM finance.journal_lines WHERE journal_entry_id = v_entry_id;
  IF v_count < 2 OR v_debits <= 0 OR v_debits <> v_credits THEN
    RAISE EXCEPTION 'Posted journal entry % is not balanced (lines %, debit %, credit %)',
      v_entry_id,v_count,v_debits,v_credits;
  END IF;
  RETURN NULL;
END
$function$;
REVOKE ALL ON FUNCTION finance.assert_posted_journal_balanced() FROM PUBLIC, anon, authenticated;

CREATE OR REPLACE FUNCTION finance.prevent_posted_journal_mutation()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, finance
AS $function$
DECLARE v_status text;
BEGIN
  SELECT entry_status INTO v_status FROM finance.journal_entries WHERE id =
    CASE WHEN TG_OP = 'INSERT' THEN NEW.journal_entry_id
         WHEN TG_OP = 'UPDATE' THEN OLD.journal_entry_id
         ELSE OLD.journal_entry_id END;
  IF v_status = 'POSTED' THEN
    RAISE EXCEPTION 'Posted journal lines are immutable; create a reversing entry';
  END IF;
  IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
  RETURN NEW;
END
$function$;
REVOKE ALL ON FUNCTION finance.prevent_posted_journal_mutation() FROM PUBLIC, anon, authenticated;

CREATE TRIGGER journal_lines_immutable_after_post
BEFORE INSERT OR UPDATE OR DELETE ON finance.journal_lines
FOR EACH ROW EXECUTE FUNCTION finance.prevent_posted_journal_mutation();

CREATE CONSTRAINT TRIGGER journal_lines_posted_balance_check
AFTER INSERT OR UPDATE OR DELETE ON finance.journal_lines
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW EXECUTE FUNCTION finance.assert_posted_journal_balanced();

CREATE CONSTRAINT TRIGGER journal_entry_posted_balance_check
AFTER INSERT OR UPDATE OF entry_status ON finance.journal_entries
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW EXECUTE FUNCTION finance.assert_posted_journal_balanced();

CREATE TABLE finance.payment_intents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES commerce.orders(id) ON DELETE RESTRICT,
  buyer_organization_id uuid NOT NULL REFERENCES identity.organizations(id) ON DELETE RESTRICT,
  seller_organization_id uuid NOT NULL REFERENCES identity.organizations(id) ON DELETE RESTRICT,
  provider_key text NOT NULL,
  provider_payment_id text,
  idempotency_key text NOT NULL,
  amount numeric(20,6) NOT NULL CHECK (amount > 0),
  currency char(3) NOT NULL CHECK (currency ~ '^[A-Z]{3}$'),
  payment_status text NOT NULL DEFAULT 'CREATED'
    CHECK (payment_status IN ('CREATED','REQUIRES_ACTION','PROCESSING','AUTHORIZED','CAPTURED','FAILED','CANCELLED','PARTIALLY_REFUNDED','REFUNDED')),
  provider_payload jsonb NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(provider_payload) = 'object'),
  failure_code text,
  failure_message text,
  authorized_at timestamptz,
  captured_at timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (provider_key, idempotency_key),
  UNIQUE (id, order_id),
  CHECK (buyer_organization_id <> seller_organization_id)
);
CREATE UNIQUE INDEX payment_intents_provider_payment_unique
  ON finance.payment_intents(provider_key, provider_payment_id)
  WHERE provider_payment_id IS NOT NULL;
CREATE INDEX payment_intents_order_idx ON finance.payment_intents(order_id, created_at DESC);

CREATE TABLE finance.payment_webhook_receipts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_key text NOT NULL,
  provider_event_id text NOT NULL,
  event_type text NOT NULL,
  signature_verified boolean NOT NULL DEFAULT false,
  processing_status text NOT NULL DEFAULT 'RECEIVED'
    CHECK (processing_status IN ('RECEIVED','PROCESSING','PROCESSED','IGNORED','FAILED')),
  payload_digest text NOT NULL,
  received_at timestamptz NOT NULL DEFAULT now(),
  processed_at timestamptz,
  failure_reason text,
  UNIQUE (provider_key, provider_event_id)
);
CREATE INDEX payment_webhook_receipts_pending_idx
  ON finance.payment_webhook_receipts(received_at)
  WHERE processing_status IN ('RECEIVED','FAILED');

CREATE TABLE finance.refunds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_intent_id uuid NOT NULL REFERENCES finance.payment_intents(id) ON DELETE RESTRICT,
  order_id uuid NOT NULL REFERENCES commerce.orders(id) ON DELETE RESTRICT,
  provider_key text NOT NULL,
  provider_refund_id text,
  idempotency_key text NOT NULL,
  amount numeric(20,6) NOT NULL CHECK (amount > 0),
  currency char(3) NOT NULL CHECK (currency ~ '^[A-Z]{3}$'),
  refund_status text NOT NULL DEFAULT 'REQUESTED'
    CHECK (refund_status IN ('REQUESTED','PENDING','SUCCEEDED','FAILED','CANCELLED')),
  reason text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (provider_key, idempotency_key)
);
CREATE UNIQUE INDEX refunds_provider_refund_unique
  ON finance.refunds(provider_key,provider_refund_id)
  WHERE provider_refund_id IS NOT NULL;

CREATE TABLE finance.payout_batches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_key text NOT NULL,
  batch_key text NOT NULL,
  currency char(3) NOT NULL CHECK (currency ~ '^[A-Z]{3}$'),
  payout_status text NOT NULL DEFAULT 'DRAFT'
    CHECK (payout_status IN ('DRAFT','APPROVED','SUBMITTED','PROCESSING','PAID','FAILED','CANCELLED')),
  total_amount numeric(20,6) NOT NULL DEFAULT 0 CHECK (total_amount >= 0),
  provider_batch_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  submitted_at timestamptz,
  settled_at timestamptz,
  UNIQUE (provider_key,batch_key)
);
CREATE TABLE finance.payout_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  payout_batch_id uuid NOT NULL REFERENCES finance.payout_batches(id) ON DELETE RESTRICT,
  seller_organization_id uuid NOT NULL REFERENCES identity.organizations(id) ON DELETE RESTRICT,
  amount numeric(20,6) NOT NULL CHECK (amount > 0),
  currency char(3) NOT NULL CHECK (currency ~ '^[A-Z]{3}$'),
  payout_status text NOT NULL DEFAULT 'PENDING'
    CHECK (payout_status IN ('PENDING','SUBMITTED','PAID','FAILED','RETURNED')),
  provider_payout_id text,
  idempotency_key text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (payout_batch_id,seller_organization_id),
  UNIQUE (idempotency_key)
);

CREATE TABLE finance.disputes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES commerce.orders(id) ON DELETE RESTRICT,
  payment_intent_id uuid REFERENCES finance.payment_intents(id) ON DELETE RESTRICT,
  provider_key text,
  provider_dispute_id text,
  dispute_status text NOT NULL DEFAULT 'OPEN'
    CHECK (dispute_status IN ('OPEN','UNDER_REVIEW','WON','LOST','ACCEPTED','CLOSED')),
  amount numeric(20,6) NOT NULL CHECK (amount > 0),
  currency char(3) NOT NULL CHECK (currency ~ '^[A-Z]{3}$'),
  reason_code text,
  evidence_due_at timestamptz,
  opened_at timestamptz NOT NULL DEFAULT now(),
  closed_at timestamptz,
  UNIQUE (provider_key,provider_dispute_id)
);

ALTER TABLE finance.ledger_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance.journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance.journal_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance.payment_intents ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance.payment_webhook_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance.refunds ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance.payout_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance.payout_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance.disputes ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON ALL TABLES IN SCHEMA finance FROM PUBLIC, anon, authenticated;
GRANT SELECT,INSERT,UPDATE,DELETE ON ALL TABLES IN SCHEMA finance TO service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA finance REVOKE ALL ON TABLES FROM PUBLIC, anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA finance GRANT SELECT,INSERT,UPDATE,DELETE ON TABLES TO service_role;

COMMIT;
