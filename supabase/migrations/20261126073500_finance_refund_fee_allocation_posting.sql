BEGIN;
CREATE TABLE finance.refund_fee_allocations (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 refund_id uuid NOT NULL UNIQUE REFERENCES finance.refunds(id) ON DELETE RESTRICT,
 payment_intent_id uuid NOT NULL REFERENCES finance.payment_intents(id) ON DELETE RESTRICT,
 order_id uuid NOT NULL REFERENCES commerce.orders(id) ON DELETE RESTRICT,
 owner_organization_id uuid NOT NULL REFERENCES identity.organizations(id) ON DELETE RESTRICT,
 gross_refund_amount numeric(20,6) NOT NULL CHECK(gross_refund_amount>0),
 platform_fee_reversal numeric(20,6) NOT NULL CHECK(platform_fee_reversal>=0),
 seller_payable_reversal numeric(20,6) NOT NULL CHECK(seller_payable_reversal>=0),
 cumulative_refunds_amount numeric(20,6) NOT NULL CHECK(cumulative_refunds_amount>0),
 cumulative_fee_target numeric(20,6) NOT NULL CHECK(cumulative_fee_target>=0),
 currency char(3) NOT NULL CHECK(currency ~ '^[A-Z]{3}$'),
 rounding_scale smallint NOT NULL CHECK(rounding_scale BETWEEN 0 AND 6),
 created_at timestamptz NOT NULL DEFAULT now(),
 CHECK(gross_refund_amount=platform_fee_reversal+seller_payable_reversal)
);
CREATE INDEX refund_fee_allocations_payment_idx ON finance.refund_fee_allocations(payment_intent_id);
CREATE INDEX refund_fee_allocations_order_idx ON finance.refund_fee_allocations(order_id);
CREATE INDEX refund_fee_allocations_owner_created_idx ON finance.refund_fee_allocations(owner_organization_id,created_at DESC);
ALTER TABLE finance.refund_fee_allocations ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON finance.refund_fee_allocations FROM PUBLIC,anon,authenticated;
GRANT SELECT,INSERT,UPDATE,DELETE ON finance.refund_fee_allocations TO service_role;
CREATE OR REPLACE FUNCTION finance.reject_refund_fee_allocation_mutation()
RETURNS trigger LANGUAGE plpgsql SET search_path=pg_catalog,finance AS $$
BEGIN RAISE EXCEPTION 'Refund fee allocations are immutable'; END $$;
CREATE TRIGGER refund_fee_allocation_immutable BEFORE UPDATE OR DELETE ON finance.refund_fee_allocations
FOR EACH ROW EXECUTE FUNCTION finance.reject_refund_fee_allocation_mutation();

CREATE OR REPLACE FUNCTION api.post_succeeded_refund_finance_entry(p_actor_user_id uuid,p_owner_organization_id uuid,p_refund_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,identity,commerce,finance,api
AS $function$
DECLARE v_refund finance.refunds%ROWTYPE; v_payment finance.payment_intents%ROWTYPE;
 v_order commerce.orders%ROWTYPE; v_fee finance.order_fee_snapshots%ROWTYPE;
 v_allocation finance.refund_fee_allocations%ROWTYPE;
 v_cumulative_refunds numeric(20,6); v_previous_fee_reversal numeric(20,6);
 v_fee_target numeric(20,6); v_fee_reversal numeric(20,6); v_seller_reversal numeric(20,6);
 v_psp uuid; v_seller uuid; v_revenue uuid; v_lines jsonb:='[]'::jsonb; v_entry_id uuid;
BEGIN
 PERFORM 1 FROM identity.organization_memberships m WHERE m.organization_id=p_owner_organization_id AND m.user_id=p_actor_user_id AND m.membership_status='ACTIVE';
 IF NOT FOUND THEN RAISE EXCEPTION 'Active organization membership required'; END IF;
 PERFORM 1 FROM identity.role_bindings rb WHERE rb.organization_id=p_owner_organization_id AND rb.subject_user_id=p_actor_user_id
 AND rb.binding_status='ACTIVE' AND rb.starts_at<=now() AND (rb.expires_at IS NULL OR rb.expires_at>now())
 AND rb.role_code IN ('S0_SOVEREIGN','B1_CEO','B2_MANAGER','B2.2');
 IF NOT FOUND THEN RAISE EXCEPTION 'Finance posting role required'; END IF;
 SELECT * INTO v_refund FROM finance.refunds WHERE id=p_refund_id FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Refund not found'; END IF;
 SELECT * INTO v_payment FROM finance.payment_intents WHERE id=v_refund.payment_intent_id;
 IF NOT FOUND THEN RAISE EXCEPTION 'Refund payment intent not found'; END IF;
 PERFORM pg_advisory_xact_lock(hashtextextended(v_payment.id::text||':refund-finance-posting',0));
 SELECT * INTO v_refund FROM finance.refunds WHERE id=p_refund_id FOR UPDATE;
 SELECT * INTO v_payment FROM finance.payment_intents WHERE id=v_refund.payment_intent_id FOR UPDATE;
 SELECT * INTO v_order FROM commerce.orders WHERE id=v_refund.order_id;
 IF NOT FOUND OR v_refund.order_id<>v_payment.order_id OR v_refund.provider_key<>v_payment.provider_key OR v_refund.currency<>v_payment.currency
 THEN RAISE EXCEPTION 'Refund facts do not match payment intent'; END IF;
 SELECT * INTO v_fee FROM finance.order_fee_snapshots WHERE order_id=v_order.id;
 IF NOT FOUND OR v_fee.owner_organization_id<>p_owner_organization_id OR v_fee.gross_amount<>v_payment.amount OR v_fee.currency<>v_payment.currency
 THEN RAISE EXCEPTION 'Matching immutable order fee snapshot is required'; END IF;
 SELECT id INTO v_entry_id FROM finance.journal_entries WHERE organization_id=p_owner_organization_id
 AND idempotency_key='refund-settlement:'||v_refund.id::text AND source_type='REFUND' AND source_id=v_refund.id;
 IF FOUND THEN
  SELECT * INTO v_allocation FROM finance.refund_fee_allocations WHERE refund_id=v_refund.id;
  RETURN jsonb_build_object('journal_entry_id',v_entry_id,'refund_id',v_refund.id,'gross_refund_amount',v_refund.amount,
   'platform_fee_reversal',v_allocation.platform_fee_reversal,'seller_payable_reversal',v_allocation.seller_payable_reversal,
   'currency',v_refund.currency,'accounting_status','POSTED','idempotent_reuse',true);
 END IF;
 IF v_refund.refund_status<>'SUCCEEDED' OR v_refund.provider_refund_id IS NULL
 THEN RAISE EXCEPTION 'Provider-confirmed successful refund is required before journal posting'; END IF;
 IF v_payment.payment_status NOT IN ('CAPTURED','PARTIALLY_REFUNDED','REFUNDED')
 OR v_payment.captured_at IS NULL OR v_payment.provider_payment_id IS NULL
 THEN RAISE EXCEPTION 'Refund must reference a provider-confirmed captured payment'; END IF;
 IF NOT EXISTS(SELECT 1 FROM finance.journal_entries WHERE organization_id=p_owner_organization_id
 AND idempotency_key='payment-capture:'||v_payment.id::text AND source_type='PAYMENT' AND source_id=v_payment.id)
 THEN RAISE EXCEPTION 'Original captured payment journal must be posted before refund accounting'; END IF;
 IF v_refund.amount<=0 OR v_refund.amount>v_payment.amount THEN RAISE EXCEPTION 'Invalid refund amount'; END IF;
 SELECT coalesce(sum(r.amount),0) INTO v_cumulative_refunds FROM finance.refunds r
 WHERE r.payment_intent_id=v_payment.id AND r.refund_status='SUCCEEDED';
 IF v_cumulative_refunds>v_payment.amount THEN RAISE EXCEPTION 'Successful refunds exceed captured payment'; END IF;
 SELECT coalesce(sum(a.platform_fee_reversal),0) INTO v_previous_fee_reversal
 FROM finance.refund_fee_allocations a WHERE a.payment_intent_id=v_payment.id;
 v_fee_target:=CASE WHEN v_fee.gross_amount=0 THEN 0 ELSE round(v_fee.fee_amount*v_cumulative_refunds/v_fee.gross_amount,v_fee.rounding_scale) END;
 v_fee_reversal:=v_fee_target-v_previous_fee_reversal;
 IF v_fee_reversal<0 OR v_fee_reversal>v_refund.amount THEN RAISE EXCEPTION 'Refund fee allocation is inconsistent with cumulative refund history'; END IF;
 v_seller_reversal:=v_refund.amount-v_fee_reversal;
 SELECT id INTO v_psp FROM finance.ledger_accounts WHERE organization_id=p_owner_organization_id AND currency=v_refund.currency
 AND system_key='PSP_CLEARING' AND account_type='ASSET' AND normal_balance='DEBIT' AND account_status='ACTIVE';
 SELECT id INTO v_seller FROM finance.ledger_accounts WHERE organization_id=p_owner_organization_id AND currency=v_refund.currency
 AND system_key='SELLER_PAYABLE' AND account_type='LIABILITY' AND normal_balance='CREDIT' AND account_status='ACTIVE';
 SELECT id INTO v_revenue FROM finance.ledger_accounts WHERE organization_id=p_owner_organization_id AND currency=v_refund.currency
 AND system_key='PLATFORM_FEE_REVENUE' AND account_type='REVENUE' AND normal_balance='CREDIT' AND account_status='ACTIVE';
 IF v_psp IS NULL OR (v_seller_reversal>0 AND v_seller IS NULL) OR (v_fee_reversal>0 AND v_revenue IS NULL)
 THEN RAISE EXCEPTION 'Required active Finance chart accounts are missing for refund currency'; END IF;
 INSERT INTO finance.refund_fee_allocations(refund_id,payment_intent_id,order_id,owner_organization_id,gross_refund_amount,
 platform_fee_reversal,seller_payable_reversal,cumulative_refunds_amount,cumulative_fee_target,currency,rounding_scale)
 VALUES(v_refund.id,v_payment.id,v_order.id,p_owner_organization_id,v_refund.amount,v_fee_reversal,v_seller_reversal,
 v_cumulative_refunds,v_fee_target,v_refund.currency,v_fee.rounding_scale) RETURNING * INTO v_allocation;
 IF v_seller_reversal>0 THEN v_lines:=v_lines||jsonb_build_array(jsonb_build_object('account_id',v_seller,'debit_amount',v_seller_reversal::text,'credit_amount','0')); END IF;
 IF v_fee_reversal>0 THEN v_lines:=v_lines||jsonb_build_array(jsonb_build_object('account_id',v_revenue,'debit_amount',v_fee_reversal::text,'credit_amount','0')); END IF;
 v_lines:=v_lines||jsonb_build_array(jsonb_build_object('account_id',v_psp,'debit_amount','0','credit_amount',v_refund.amount::text));
 v_entry_id:=api.post_finance_journal_entry(p_actor_user_id,p_owner_organization_id,'REFUND-'||replace(v_refund.id::text,'-',''),
 'refund-settlement:'||v_refund.id::text,'REFUND',v_refund.id,'Provider-confirmed marketplace refund '||v_refund.id::text,
 v_refund.currency,v_lines);
 RETURN jsonb_build_object('journal_entry_id',v_entry_id,'refund_id',v_refund.id,'gross_refund_amount',v_refund.amount,
 'platform_fee_reversal',v_fee_reversal,'seller_payable_reversal',v_seller_reversal,'currency',v_refund.currency,
 'accounting_status','POSTED','idempotent_reuse',false);
END
$function$;
REVOKE ALL ON FUNCTION api.post_succeeded_refund_finance_entry(uuid,uuid,uuid) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION api.post_succeeded_refund_finance_entry(uuid,uuid,uuid) TO service_role;
COMMIT;