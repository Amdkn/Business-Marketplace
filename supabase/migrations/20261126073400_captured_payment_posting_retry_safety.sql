CREATE OR REPLACE FUNCTION api.post_captured_order_finance_entry(
 p_actor_user_id uuid,p_owner_organization_id uuid,p_payment_intent_id uuid
)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER
SET search_path=pg_catalog,identity,commerce,finance,api
AS $function$
DECLARE v_payment finance.payment_intents%ROWTYPE; v_order commerce.orders%ROWTYPE;
 v_fee finance.order_fee_snapshots%ROWTYPE; v_psp uuid; v_seller uuid; v_revenue uuid;
 v_lines jsonb:='[]'::jsonb; v_entry_id uuid;
BEGIN
 PERFORM 1 FROM identity.organization_memberships m WHERE m.organization_id=p_owner_organization_id AND m.user_id=p_actor_user_id AND m.membership_status='ACTIVE';
 IF NOT FOUND THEN RAISE EXCEPTION 'Active organization membership required'; END IF;
 PERFORM 1 FROM identity.role_bindings rb WHERE rb.organization_id=p_owner_organization_id AND rb.subject_user_id=p_actor_user_id
 AND rb.binding_status='ACTIVE' AND rb.starts_at<=now() AND (rb.expires_at IS NULL OR rb.expires_at>now())
 AND rb.role_code IN ('S0_SOVEREIGN','B1_CEO','B2_MANAGER','B2.2');
 IF NOT FOUND THEN RAISE EXCEPTION 'Finance posting role required'; END IF;
 PERFORM pg_advisory_xact_lock(hashtextextended(p_payment_intent_id::text||':captured-finance-posting',0));
 SELECT * INTO v_payment FROM finance.payment_intents WHERE id=p_payment_intent_id FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Payment intent not found'; END IF;
 SELECT * INTO v_order FROM commerce.orders WHERE id=v_payment.order_id;
 IF NOT FOUND THEN RAISE EXCEPTION 'Payment order not found'; END IF;
 IF v_payment.buyer_organization_id<>v_order.buyer_organization_id OR v_payment.seller_organization_id<>v_order.seller_organization_id
 OR v_payment.amount<>v_order.price_amount_snapshot OR v_payment.currency<>v_order.currency_snapshot
 THEN RAISE EXCEPTION 'Captured payment facts do not match immutable order facts'; END IF;
 SELECT * INTO v_fee FROM finance.order_fee_snapshots WHERE order_id=v_order.id;
 IF NOT FOUND THEN RAISE EXCEPTION 'Immutable order fee snapshot is required before capture posting'; END IF;
 IF v_fee.owner_organization_id<>p_owner_organization_id OR v_fee.gross_amount<>v_payment.amount
 OR v_fee.currency<>v_payment.currency OR v_fee.fee_amount+v_fee.seller_net_amount<>v_payment.amount
 THEN RAISE EXCEPTION 'Fee snapshot does not reconcile to captured payment'; END IF;
 SELECT id INTO v_entry_id FROM finance.journal_entries WHERE organization_id=p_owner_organization_id
 AND idempotency_key='payment-capture:'||v_payment.id::text AND source_type='PAYMENT' AND source_id=v_payment.id;
 IF FOUND THEN
  RETURN jsonb_build_object('journal_entry_id',v_entry_id,'payment_intent_id',v_payment.id,'order_id',v_order.id,
   'gross_amount',v_payment.amount,'platform_fee',v_fee.fee_amount,'seller_payable',v_fee.seller_net_amount,
   'currency',v_payment.currency,'accounting_status','POSTED','idempotent_reuse',true);
 END IF;
 IF v_payment.payment_status<>'CAPTURED' OR v_payment.captured_at IS NULL OR v_payment.provider_payment_id IS NULL
 THEN RAISE EXCEPTION 'A provider-confirmed captured payment is required before journal posting'; END IF;
 SELECT id INTO v_psp FROM finance.ledger_accounts WHERE organization_id=p_owner_organization_id AND currency=v_payment.currency
 AND system_key='PSP_CLEARING' AND account_type='ASSET' AND normal_balance='DEBIT' AND account_status='ACTIVE';
 SELECT id INTO v_seller FROM finance.ledger_accounts WHERE organization_id=p_owner_organization_id AND currency=v_payment.currency
 AND system_key='SELLER_PAYABLE' AND account_type='LIABILITY' AND normal_balance='CREDIT' AND account_status='ACTIVE';
 SELECT id INTO v_revenue FROM finance.ledger_accounts WHERE organization_id=p_owner_organization_id AND currency=v_payment.currency
 AND system_key='PLATFORM_FEE_REVENUE' AND account_type='REVENUE' AND normal_balance='CREDIT' AND account_status='ACTIVE';
 IF v_psp IS NULL OR (v_fee.seller_net_amount>0 AND v_seller IS NULL) OR (v_fee.fee_amount>0 AND v_revenue IS NULL)
 THEN RAISE EXCEPTION 'Required active Finance chart accounts are missing for captured payment currency'; END IF;
 v_lines:=jsonb_build_array(jsonb_build_object('account_id',v_psp,'debit_amount',v_payment.amount::text,'credit_amount','0'));
 IF v_fee.seller_net_amount>0 THEN v_lines:=v_lines||jsonb_build_array(jsonb_build_object('account_id',v_seller,'debit_amount','0','credit_amount',v_fee.seller_net_amount::text)); END IF;
 IF v_fee.fee_amount>0 THEN v_lines:=v_lines||jsonb_build_array(jsonb_build_object('account_id',v_revenue,'debit_amount','0','credit_amount',v_fee.fee_amount::text)); END IF;
 v_entry_id:=api.post_finance_journal_entry(p_actor_user_id,p_owner_organization_id,
  'CAPTURE-'||replace(v_payment.id::text,'-',''),'payment-capture:'||v_payment.id::text,'PAYMENT',v_payment.id,
  'Captured marketplace order payment '||v_order.order_number,v_payment.currency,v_lines);
 RETURN jsonb_build_object('journal_entry_id',v_entry_id,'payment_intent_id',v_payment.id,'order_id',v_order.id,
  'gross_amount',v_payment.amount,'platform_fee',v_fee.fee_amount,'seller_payable',v_fee.seller_net_amount,
  'currency',v_payment.currency,'accounting_status','POSTED','idempotent_reuse',false);
END
$function$;