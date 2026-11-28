CREATE OR REPLACE FUNCTION api.post_finance_journal_entry(
 p_actor_user_id uuid,p_organization_id uuid,p_entry_number text,p_idempotency_key text,p_source_type text,
 p_source_id uuid,p_description text,p_currency char(3),p_lines jsonb
)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,identity,finance,api
AS $function$
DECLARE v_hash text; v_entry_id uuid; v_existing_hash text; v_line_count integer; v_debits numeric(20,6);
 v_credits numeric(20,6); v_line jsonb; v_account_id uuid; v_debit numeric(20,6); v_credit numeric(20,6); v_index integer:=0;
BEGIN
 IF p_actor_user_id IS NULL OR p_organization_id IS NULL OR p_entry_number IS NULL OR length(btrim(p_entry_number))=0
 OR p_idempotency_key IS NULL OR length(p_idempotency_key) NOT BETWEEN 8 AND 200 OR p_description IS NULL
 OR length(btrim(p_description))=0 OR p_currency !~ '^[A-Z]{3}$'
 OR p_source_type NOT IN ('ORDER','PAYMENT','REFUND','PAYOUT','FEE','ADJUSTMENT','REVERSAL','OPENING_BALANCE')
 OR jsonb_typeof(p_lines)<>'array' THEN RAISE EXCEPTION 'Invalid journal posting request'; END IF;
 PERFORM 1 FROM identity.organization_memberships m WHERE m.organization_id=p_organization_id AND m.user_id=p_actor_user_id AND m.membership_status='ACTIVE';
 IF NOT FOUND THEN RAISE EXCEPTION 'Active organization membership required'; END IF;
 PERFORM 1 FROM identity.role_bindings rb WHERE rb.organization_id=p_organization_id AND rb.subject_user_id=p_actor_user_id
 AND rb.binding_status='ACTIVE' AND rb.starts_at<=now() AND (rb.expires_at IS NULL OR rb.expires_at>now())
 AND rb.role_code IN ('S0_SOVEREIGN','B1_CEO','B2_MANAGER','B2.2');
 IF NOT FOUND THEN RAISE EXCEPTION 'Finance posting role required'; END IF;
 SELECT count(*),coalesce(sum((x->>'debit_amount')::numeric),0),coalesce(sum((x->>'credit_amount')::numeric),0)
 INTO v_line_count,v_debits,v_credits FROM jsonb_array_elements(p_lines) x;
 IF v_line_count<2 OR v_debits<=0 OR v_debits<>v_credits THEN RAISE EXCEPTION 'Journal lines must balance with at least two lines'; END IF;
 IF EXISTS(SELECT 1 FROM jsonb_array_elements(p_lines) x WHERE (x->>'account_id') IS NULL OR (x->>'debit_amount') IS NULL
 OR (x->>'credit_amount') IS NULL OR (x->>'debit_amount')::numeric<0 OR (x->>'credit_amount')::numeric<0
 OR NOT (((x->>'debit_amount')::numeric>0 AND (x->>'credit_amount')::numeric=0)
 OR ((x->>'credit_amount')::numeric>0 AND (x->>'debit_amount')::numeric=0)))
 THEN RAISE EXCEPTION 'Each journal line must contain one positive debit or credit and a valid account'; END IF;
 -- Serialize all postings that touch the same accounts; sorted IDs prevent lock-order deadlocks.
 PERFORM a.id FROM finance.ledger_accounts a
 WHERE a.id IN (SELECT (x->>'account_id')::uuid FROM jsonb_array_elements(p_lines) x)
 ORDER BY a.id FOR UPDATE;
 IF EXISTS(SELECT 1 FROM jsonb_array_elements(p_lines) x WHERE NOT EXISTS(
 SELECT 1 FROM finance.ledger_accounts a WHERE a.id=(x->>'account_id')::uuid
 AND a.organization_id=p_organization_id AND a.currency=p_currency AND a.account_status='ACTIVE'))
 THEN RAISE EXCEPTION 'Every journal account must be active and belong to the organization and currency'; END IF;
 v_hash:=md5(jsonb_build_object('organization_id',p_organization_id,'entry_number',p_entry_number,'source_type',p_source_type,
 'source_id',p_source_id,'description',p_description,'currency',p_currency,'lines',p_lines)::text);
 INSERT INTO finance.journal_entries(organization_id,entry_number,idempotency_key,source_type,source_id,description,currency,
 entry_status,created_by_user_id,metadata)
 VALUES(p_organization_id,p_entry_number,p_idempotency_key,p_source_type,p_source_id,p_description,p_currency,'DRAFT',
 p_actor_user_id,jsonb_build_object('request_hash',v_hash))
 ON CONFLICT(organization_id,idempotency_key) DO NOTHING RETURNING id INTO v_entry_id;
 IF v_entry_id IS NULL THEN
 SELECT id,metadata->>'request_hash' INTO v_entry_id,v_existing_hash FROM finance.journal_entries
 WHERE organization_id=p_organization_id AND idempotency_key=p_idempotency_key;
 IF v_existing_hash IS DISTINCT FROM v_hash THEN RAISE EXCEPTION 'Idempotency key reused with a different journal payload'; END IF;
 RETURN v_entry_id; END IF;
 FOR v_line IN SELECT value FROM jsonb_array_elements(p_lines) LOOP
  v_index:=v_index+1; v_account_id:=(v_line->>'account_id')::uuid;
  v_debit:=(v_line->>'debit_amount')::numeric; v_credit:=(v_line->>'credit_amount')::numeric;
  INSERT INTO finance.journal_lines(journal_entry_id,organization_id,currency,account_id,line_number,description,debit_amount,credit_amount)
  VALUES(v_entry_id,p_organization_id,p_currency,v_account_id,v_index,nullif(v_line->>'description',''),v_debit,v_credit);
 END LOOP;
 UPDATE finance.journal_entries SET entry_status='POSTED',posted_at=now() WHERE id=v_entry_id;
 RETURN v_entry_id;
END
$function$;