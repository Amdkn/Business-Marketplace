BEGIN;
ALTER TABLE finance.payout_batches ADD COLUMN owner_organization_id uuid;
ALTER TABLE finance.payout_batches ALTER COLUMN owner_organization_id SET NOT NULL;
ALTER TABLE finance.payout_batches ADD CONSTRAINT payout_batches_owner_organization_id_fkey
 FOREIGN KEY(owner_organization_id) REFERENCES identity.organizations(id) ON DELETE RESTRICT;
CREATE INDEX payout_batches_owner_organization_idx ON finance.payout_batches(owner_organization_id);
CREATE OR REPLACE FUNCTION api.post_paid_payout_item_finance_entry(p_actor_user_id uuid,p_owner_organization_id uuid,p_payout_item_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,identity,finance,api
AS $function$
DECLARE v_item finance.payout_items%ROWTYPE; v_batch finance.payout_batches%ROWTYPE;
 v_seller_account uuid; v_psp_account uuid; v_seller_balance numeric(20,6); v_psp_balance numeric(20,6);
 v_entry_id uuid; v_lines jsonb;
BEGIN
 PERFORM 1 FROM identity.organization_memberships m WHERE m.organization_id=p_owner_organization_id AND m.user_id=p_actor_user_id AND m.membership_status='ACTIVE';
 IF NOT FOUND THEN RAISE EXCEPTION 'Active organization membership required'; END IF;
 PERFORM 1 FROM identity.role_bindings rb WHERE rb.organization_id=p_owner_organization_id AND rb.subject_user_id=p_actor_user_id
 AND rb.binding_status='ACTIVE' AND rb.starts_at<=now() AND (rb.expires_at IS NULL OR rb.expires_at>now())
 AND rb.role_code IN ('S0_SOVEREIGN','B1_CEO','B2_MANAGER','B2.2');
 IF NOT FOUND THEN RAISE EXCEPTION 'Finance posting role required'; END IF;
 SELECT * INTO v_item FROM finance.payout_items WHERE id=p_payout_item_id FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Payout item not found'; END IF;
 SELECT * INTO v_batch FROM finance.payout_batches WHERE id=v_item.payout_batch_id FOR UPDATE;
 IF NOT FOUND OR v_batch.owner_organization_id<>p_owner_organization_id THEN RAISE EXCEPTION 'Payout batch does not belong to Finance owner organization'; END IF;
 IF v_item.currency<>v_batch.currency THEN RAISE EXCEPTION 'Payout item currency does not match batch'; END IF;
 SELECT id INTO v_entry_id FROM finance.journal_entries WHERE organization_id=p_owner_organization_id
 AND idempotency_key='payout-settlement:'||v_item.id::text AND source_type='PAYOUT' AND source_id=v_item.id;
 IF FOUND THEN RETURN jsonb_build_object('journal_entry_id',v_entry_id,'payout_item_id',v_item.id,
 'seller_organization_id',v_item.seller_organization_id,'amount',v_item.amount,'currency',v_item.currency,
 'accounting_status','POSTED','idempotent_reuse',true); END IF;
 IF v_batch.payout_status<>'PAID' OR v_batch.provider_batch_id IS NULL OR v_batch.settled_at IS NULL
 OR v_item.payout_status<>'PAID' OR v_item.provider_payout_id IS NULL
 THEN RAISE EXCEPTION 'Provider-confirmed settled payout item and batch are required'; END IF;
 SELECT id INTO v_seller_account FROM finance.ledger_accounts WHERE organization_id=p_owner_organization_id AND currency=v_item.currency
 AND system_key='SELLER_PAYABLE' AND account_type='LIABILITY' AND normal_balance='CREDIT' AND account_status='ACTIVE';
 SELECT id INTO v_psp_account FROM finance.ledger_accounts WHERE organization_id=p_owner_organization_id AND currency=v_item.currency
 AND system_key='PSP_CLEARING' AND account_type='ASSET' AND normal_balance='DEBIT' AND account_status='ACTIVE';
 IF v_seller_account IS NULL OR v_psp_account IS NULL THEN RAISE EXCEPTION 'Required active payout ledger accounts are missing'; END IF;
 PERFORM a.id FROM finance.ledger_accounts a WHERE a.id IN (v_seller_account,v_psp_account) ORDER BY a.id FOR UPDATE;
 SELECT coalesce(sum(l.credit_amount-l.debit_amount),0) INTO v_seller_balance FROM finance.journal_lines l
 JOIN finance.journal_entries e ON e.id=l.journal_entry_id WHERE l.account_id=v_seller_account AND e.entry_status='POSTED';
 SELECT coalesce(sum(l.debit_amount-l.credit_amount),0) INTO v_psp_balance FROM finance.journal_lines l
 JOIN finance.journal_entries e ON e.id=l.journal_entry_id WHERE l.account_id=v_psp_account AND e.entry_status='POSTED';
 IF v_seller_balance<v_item.amount THEN RAISE EXCEPTION 'Insufficient seller payable balance for payout'; END IF;
 IF v_psp_balance<v_item.amount THEN RAISE EXCEPTION 'Insufficient PSP clearing balance for payout'; END IF;
 v_lines:=jsonb_build_array(jsonb_build_object('account_id',v_seller_account,'debit_amount',v_item.amount::text,'credit_amount','0'),
 jsonb_build_object('account_id',v_psp_account,'debit_amount','0','credit_amount',v_item.amount::text));
 v_entry_id:=api.post_finance_journal_entry(p_actor_user_id,p_owner_organization_id,
 'PAYOUT-'||replace(v_item.id::text,'-',''),'payout-settlement:'||v_item.id::text,'PAYOUT',v_item.id,
 'Settled marketplace seller payout '||v_item.id::text,v_item.currency,v_lines);
 RETURN jsonb_build_object('journal_entry_id',v_entry_id,'payout_item_id',v_item.id,
 'seller_organization_id',v_item.seller_organization_id,'amount',v_item.amount,'currency',v_item.currency,
 'accounting_status','POSTED','idempotent_reuse',false);
END
$function$;
REVOKE ALL ON FUNCTION api.post_paid_payout_item_finance_entry(uuid,uuid,uuid) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION api.post_paid_payout_item_finance_entry(uuid,uuid,uuid) TO service_role;
COMMIT;