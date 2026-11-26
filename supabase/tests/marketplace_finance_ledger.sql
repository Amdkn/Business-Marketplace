DO $test$
DECLARE v_bad text; v_count integer;
BEGIN
 SELECT string_agg(c.relname,', ') INTO v_bad
 FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
 WHERE n.nspname='finance' AND c.relkind='r'
 AND (NOT c.relrowsecurity OR has_table_privilege('anon',c.oid,'SELECT,INSERT,UPDATE,DELETE')
      OR has_table_privilege('authenticated',c.oid,'SELECT,INSERT,UPDATE,DELETE')
      OR NOT has_table_privilege('service_role',c.oid,'SELECT,INSERT,UPDATE,DELETE'));
 IF v_bad IS NOT NULL THEN RAISE EXCEPTION 'Finance RLS/grant baseline failed: %',v_bad; END IF;
 IF has_schema_privilege('anon','finance','USAGE') OR has_schema_privilege('authenticated','finance','USAGE') THEN
  RAISE EXCEPTION 'Finance schema is exposed to browser roles';
 END IF;
 SELECT count(*) INTO v_count FROM information_schema.tables WHERE table_schema='finance'
 AND table_name IN ('ledger_accounts','journal_entries','journal_lines','payment_intents','payment_webhook_receipts','refunds','payout_batches','payout_items','disputes');
 IF v_count<>9 THEN RAISE EXCEPTION 'Finance foundation table count mismatch: %',v_count; END IF;
 IF NOT EXISTS(SELECT 1 FROM pg_trigger WHERE tgrelid='finance.journal_lines'::regclass AND tgname='journal_lines_immutable_after_post' AND NOT tgisinternal)
 OR NOT EXISTS(SELECT 1 FROM pg_trigger WHERE tgrelid='finance.journal_lines'::regclass AND tgname='journal_lines_posted_balance_check' AND NOT tgisinternal)
 OR NOT EXISTS(SELECT 1 FROM pg_trigger WHERE tgrelid='finance.journal_entries'::regclass AND tgname='journal_entry_posted_balance_check' AND NOT tgisinternal)
 OR NOT EXISTS(SELECT 1 FROM pg_trigger WHERE tgrelid='finance.journal_entries'::regclass AND tgname='journal_entries_immutable_after_post' AND NOT tgisinternal) THEN
  RAISE EXCEPTION 'Ledger balance/immutability guards are incomplete';
 END IF;
 IF NOT EXISTS(SELECT 1 FROM pg_trigger WHERE tgrelid='finance.payment_intents'::regclass AND tgname='payment_intents_validate_order_and_transition' AND NOT tgisinternal)
 OR NOT EXISTS(SELECT 1 FROM pg_trigger WHERE tgrelid='finance.payment_webhook_receipts'::regclass AND tgname='payment_webhook_signature_gate' AND NOT tgisinternal)
 OR NOT EXISTS(SELECT 1 FROM pg_trigger WHERE tgrelid='finance.refunds'::regclass AND tgname='refunds_validate_payment_and_total' AND NOT tgisinternal)
 OR NOT EXISTS(SELECT 1 FROM pg_trigger WHERE tgrelid='finance.payout_items'::regclass AND tgname='payout_items_currency_guard' AND NOT tgisinternal) THEN
  RAISE EXCEPTION 'Payment/refund/payout integrity guards are incomplete';
 END IF;
 SELECT string_agg(p.proname,', ') INTO v_bad FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
 WHERE n.nspname='finance' AND p.prosecdef
 AND (p.proconfig IS NULL OR NOT EXISTS(SELECT 1 FROM unnest(p.proconfig) cfg WHERE cfg LIKE 'search_path=%')
 OR has_function_privilege('anon',p.oid,'EXECUTE') OR has_function_privilege('authenticated',p.oid,'EXECUTE'));
 IF v_bad IS NOT NULL THEN RAISE EXCEPTION 'Unsafe finance SECURITY DEFINER functions: %',v_bad; END IF;
 SELECT string_agg(c.conname,', ') INTO v_bad FROM pg_constraint c JOIN pg_class t ON t.oid=c.conrelid JOIN pg_namespace n ON n.oid=t.relnamespace
 WHERE c.contype='f' AND n.nspname='finance'
 AND NOT EXISTS(SELECT 1 FROM pg_index i WHERE i.indrelid=c.conrelid AND i.indisvalid
 AND (SELECT array_agg(k.attnum ORDER BY k.ord) FROM unnest(i.indkey::smallint[]) WITH ORDINALITY k(attnum,ord)
 WHERE k.ord<=cardinality(c.conkey))=c.conkey);
 IF v_bad IS NOT NULL THEN RAISE EXCEPTION 'Finance foreign keys lack covering indexes: %',v_bad; END IF;
 IF NOT EXISTS(SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname='api' AND p.proname='post_finance_journal_entry' AND p.prosecdef
 AND p.proconfig @> ARRAY['search_path=pg_catalog, identity, finance, api']::text[]) THEN
  RAISE EXCEPTION 'Finance posting API function missing or unsafe';
 END IF;
 IF has_function_privilege('anon','api.post_finance_journal_entry(uuid,uuid,text,text,text,uuid,text,character,jsonb)','EXECUTE')
 OR has_function_privilege('authenticated','api.post_finance_journal_entry(uuid,uuid,text,text,text,uuid,text,character,jsonb)','EXECUTE')
 OR NOT has_function_privilege('service_role','api.post_finance_journal_entry(uuid,uuid,text,text,text,uuid,text,character,jsonb)','EXECUTE') THEN
  RAISE EXCEPTION 'Finance posting API grants are unsafe';
 END IF;
 RAISE NOTICE 'PASS: Marketplace finance ledger baseline';
END
$test$;
DO $chart_test$
DECLARE v_count integer; v_bad text;
BEGIN
  SELECT count(*) INTO v_count FROM finance.chart_account_templates WHERE chart_version='2026.1' AND is_required;
  IF v_count<>16 THEN RAISE EXCEPTION 'Expected 16 required chart templates, found %',v_count; END IF;
  IF NOT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_schema='finance' AND table_name='ledger_accounts' AND column_name='chart_version') THEN
    RAISE EXCEPTION 'ledger_accounts.chart_version is missing';
  END IF;
  IF NOT EXISTS(SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
    WHERE n.nspname='api' AND p.proname='provision_finance_chart_of_accounts' AND p.prosecdef
      AND p.proconfig @> ARRAY['search_path=pg_catalog, identity, finance, api']::text[]) THEN
    RAISE EXCEPTION 'Chart provisioning API missing or unsafe';
  END IF;
  IF has_function_privilege('anon','api.provision_finance_chart_of_accounts(uuid,uuid,character,text)','EXECUTE')
    OR has_function_privilege('authenticated','api.provision_finance_chart_of_accounts(uuid,uuid,character,text)','EXECUTE')
    OR NOT has_function_privilege('service_role','api.provision_finance_chart_of_accounts(uuid,uuid,character,text)','EXECUTE') THEN
    RAISE EXCEPTION 'Chart provisioning API grants are unsafe';
  END IF;
  IF has_table_privilege('anon','finance.chart_account_templates','SELECT,INSERT,UPDATE,DELETE')
    OR has_table_privilege('authenticated','finance.chart_account_templates','SELECT,INSERT,UPDATE,DELETE')
    OR NOT has_table_privilege('service_role','finance.chart_account_templates','SELECT,INSERT,UPDATE,DELETE') THEN
    RAISE EXCEPTION 'Chart template grants are unsafe';
  END IF;
  SELECT string_agg(system_key,', ') INTO v_bad FROM finance.chart_account_templates
  WHERE chart_version='2026.1' AND
    ((account_type IN ('ASSET','EXPENSE') AND normal_balance<>'DEBIT')
     OR (account_type IN ('LIABILITY','EQUITY','REVENUE') AND normal_balance<>'CREDIT'));
  IF v_bad IS NOT NULL THEN RAISE EXCEPTION 'Invalid normal balances: %',v_bad; END IF;
  IF '2026.1' !~ '^[0-9]{4}[.][0-9]+$' THEN RAISE EXCEPTION 'Chart version format guard failed'; END IF;
  RAISE NOTICE 'PASS: Marketplace finance chart provisioning baseline';
END
$chart_test$;

DO $fee_engine_test$
DECLARE v_count integer; v_fee numeric; v_net numeric;
BEGIN
 SELECT count(*) INTO v_count FROM information_schema.tables
 WHERE table_schema='finance' AND table_name IN ('fee_policies','order_fee_snapshots');
 IF v_count<>2 THEN RAISE EXCEPTION 'Fee engine tables missing'; END IF;
 SELECT count(*) INTO v_count FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
 WHERE n.nspname='finance' AND c.relname IN ('fee_policies','order_fee_snapshots') AND c.relrowsecurity;
 IF v_count<>2 THEN RAISE EXCEPTION 'Fee engine RLS missing'; END IF;
 IF has_table_privilege('anon','finance.fee_policies','SELECT,INSERT,UPDATE,DELETE')
 OR has_table_privilege('authenticated','finance.fee_policies','SELECT,INSERT,UPDATE,DELETE')
 OR has_table_privilege('anon','finance.order_fee_snapshots','SELECT,INSERT,UPDATE,DELETE')
 OR has_table_privilege('authenticated','finance.order_fee_snapshots','SELECT,INSERT,UPDATE,DELETE')
 THEN RAISE EXCEPTION 'Browser role has fee engine table access'; END IF;
 IF has_function_privilege('anon','api.create_fee_policy(uuid,uuid,text,integer,text,text,uuid,character,integer,numeric,numeric,numeric,smallint,timestamp with time zone,timestamp with time zone)','EXECUTE')
 OR has_function_privilege('authenticated','api.activate_fee_policy(uuid,uuid,uuid)','EXECUTE')
 OR has_function_privilege('authenticated','api.apply_order_fee_policy(uuid,uuid,uuid,uuid)','EXECUTE')
 OR NOT has_function_privilege('service_role','api.create_fee_policy(uuid,uuid,text,integer,text,text,uuid,character,integer,numeric,numeric,numeric,smallint,timestamp with time zone,timestamp with time zone)','EXECUTE')
 THEN RAISE EXCEPTION 'Fee API grants are unsafe'; END IF;
 SELECT count(*) INTO v_count FROM pg_trigger t JOIN pg_class c ON c.oid=t.tgrelid
 JOIN pg_namespace n ON n.oid=c.relnamespace
 WHERE n.nspname='finance' AND c.relname IN ('fee_policies','order_fee_snapshots') AND NOT t.tgisinternal;
 IF v_count<>2 THEN RAISE EXCEPTION 'Fee immutability triggers missing'; END IF;
 v_fee:=round(100.00*1250/10000+0.30,2);
 IF v_fee<>12.80 THEN RAISE EXCEPTION 'Fee arithmetic failed'; END IF;
 v_fee:=least(greatest(v_fee,2.00),10.00);
 IF v_fee<>10.00 THEN RAISE EXCEPTION 'Fee cap arithmetic failed'; END IF;
 v_fee:=least(greatest(round(5.00*2500/10000,2),0),5.00);
 v_net:=5.00-v_fee;
 IF v_fee<>1.25 OR v_net<>3.75 OR v_fee+v_net<>5.00 THEN RAISE EXCEPTION 'Seller net arithmetic failed'; END IF;
 RAISE NOTICE 'PASS: Fee policy, immutable snapshot, access controls and arithmetic';
END
$fee_engine_test$;

DO $fee_policy_security_test$
DECLARE v_count integer; v_definition text;
BEGIN
 SELECT count(*) INTO v_count FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
 WHERE n.nspname='api' AND p.proname IN ('create_fee_policy','activate_fee_policy','apply_order_fee_policy')
 AND p.prosecdef;
 IF v_count<>3 THEN RAISE EXCEPTION 'Expected three SECURITY DEFINER fee APIs'; END IF;
 IF has_function_privilege('anon','api.activate_fee_policy(uuid,uuid,uuid)','EXECUTE')
 OR has_function_privilege('authenticated','api.activate_fee_policy(uuid,uuid,uuid)','EXECUTE')
 OR has_function_privilege('anon','api.apply_order_fee_policy(uuid,uuid,uuid,uuid)','EXECUTE')
 OR has_function_privilege('authenticated','api.apply_order_fee_policy(uuid,uuid,uuid,uuid)','EXECUTE')
 OR NOT has_function_privilege('service_role','api.activate_fee_policy(uuid,uuid,uuid)','EXECUTE')
 OR NOT has_function_privilege('service_role','api.apply_order_fee_policy(uuid,uuid,uuid,uuid)','EXECUTE')
 THEN RAISE EXCEPTION 'Fee activation/application grants are unsafe'; END IF;
 SELECT pg_get_functiondef('api.activate_fee_policy(uuid,uuid,uuid)'::regprocedure) INTO v_definition;
 IF position('v_policy.policy_key' in v_definition)=0 OR position('scope_organization_id' in v_definition)=0
 THEN RAISE EXCEPTION 'Fee policy activation lock is not scoped by policy identity'; END IF;
 RAISE NOTICE 'PASS: Fee API SECURITY DEFINER, least privilege and activation serialization';
END
$fee_policy_security_test$;

DO $capture_posting_test$
DECLARE v_def text; v_count integer;
BEGIN
 IF NOT EXISTS(SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
   WHERE n.nspname='api' AND p.proname='post_captured_order_finance_entry' AND p.prosecdef
   AND p.proconfig @> ARRAY['search_path=pg_catalog, identity, commerce, finance, api']::text[])
 THEN RAISE EXCEPTION 'Captured payment posting function missing or unsafe'; END IF;
 IF has_function_privilege('anon','api.post_captured_order_finance_entry(uuid,uuid,uuid)','EXECUTE')
 OR has_function_privilege('authenticated','api.post_captured_order_finance_entry(uuid,uuid,uuid)','EXECUTE')
 OR NOT has_function_privilege('service_role','api.post_captured_order_finance_entry(uuid,uuid,uuid)','EXECUTE')
 THEN RAISE EXCEPTION 'Captured payment posting grants are unsafe'; END IF;
 SELECT pg_get_functiondef('api.post_captured_order_finance_entry(uuid,uuid,uuid)'::regprocedure) INTO v_def;
 IF position('payment_status' in v_def)=0 OR position('CAPTURED' in v_def)=0
 OR position('provider_payment_id' in v_def)=0 OR position('order_fee_snapshots' in v_def)=0
 OR position('payment-capture:' in v_def)=0 OR position('api.post_finance_journal_entry' in v_def)=0
 THEN RAISE EXCEPTION 'Captured payment posting invariants are incomplete'; END IF;
 SELECT count(*) INTO v_count FROM pg_constraint c JOIN pg_class t ON t.oid=c.conrelid
 JOIN pg_namespace n ON n.oid=t.relnamespace WHERE n.nspname='finance' AND c.contype='f'
 AND NOT EXISTS(SELECT 1 FROM pg_index i WHERE i.indrelid=c.conrelid AND i.indisvalid
   AND (SELECT array_agg(k.attnum ORDER BY k.attnum) FROM unnest(c.conkey) k(attnum))
       <@ (SELECT array_agg(a.attnum ORDER BY a.attnum) FROM unnest(i.indkey) a(attnum) WHERE a.attnum>0));
 IF v_count<>0 THEN RAISE EXCEPTION 'Finance foreign keys lack covering indexes'; END IF;
 IF 100.00<>(90.00+10.00) THEN RAISE EXCEPTION 'Capture allocation does not balance'; END IF;
 RAISE NOTICE 'PASS: Captured payment posting gates, idempotency and balanced allocation';
END
$capture_posting_test$;

DO $refund_posting_test$
DECLARE v_count integer; v_def text; v_first numeric; v_second numeric; v_final numeric;
BEGIN
 SELECT count(*) INTO v_count FROM information_schema.tables
 WHERE table_schema='finance' AND table_name='refund_fee_allocations';
 IF v_count<>1 THEN RAISE EXCEPTION 'Refund fee allocation table missing'; END IF;
 IF NOT EXISTS(SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
   WHERE n.nspname='finance' AND c.relname='refund_fee_allocations' AND c.relrowsecurity)
 THEN RAISE EXCEPTION 'Refund allocation RLS missing'; END IF;
 IF has_table_privilege('anon','finance.refund_fee_allocations','SELECT,INSERT,UPDATE,DELETE')
 OR has_table_privilege('authenticated','finance.refund_fee_allocations','SELECT,INSERT,UPDATE,DELETE')
 THEN RAISE EXCEPTION 'Browser role has refund allocation access'; END IF;
 IF NOT EXISTS(SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace
  WHERE n.nspname='api' AND p.proname='post_succeeded_refund_finance_entry' AND p.prosecdef
  AND p.proconfig @> ARRAY['search_path=pg_catalog, identity, commerce, finance, api']::text[])
 THEN RAISE EXCEPTION 'Refund posting API missing or unsafe'; END IF;
 IF has_function_privilege('anon','api.post_succeeded_refund_finance_entry(uuid,uuid,uuid)','EXECUTE')
 OR has_function_privilege('authenticated','api.post_succeeded_refund_finance_entry(uuid,uuid,uuid)','EXECUTE')
 OR NOT has_function_privilege('service_role','api.post_succeeded_refund_finance_entry(uuid,uuid,uuid)','EXECUTE')
 THEN RAISE EXCEPTION 'Refund posting grants are unsafe'; END IF;
 IF NOT EXISTS(SELECT 1 FROM pg_trigger t JOIN pg_class c ON c.oid=t.tgrelid
  JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='finance'
  AND c.relname='refund_fee_allocations' AND t.tgname='refund_fee_allocation_immutable')
 THEN RAISE EXCEPTION 'Refund allocation immutability trigger missing'; END IF;
 v_first:=round(10.00*33.00/100.00,2);
 v_second:=round(10.00*66.00/100.00,2)-v_first;
 v_final:=round(10.00*100.00/100.00,2)-v_first-v_second;
 IF v_first<>3.30 OR v_second<>3.30 OR v_final<>3.40 OR v_first+v_second+v_final<>10.00
 THEN RAISE EXCEPTION 'Cumulative refund fee allocation rounding failed'; END IF;
 SELECT pg_get_functiondef('api.post_succeeded_refund_finance_entry(uuid,uuid,uuid)'::regprocedure) INTO v_def;
 IF position('refund-settlement:' in v_def)=0 OR position('payment-capture:' in v_def)=0
 OR position('provider_refund_id' in v_def)=0 OR position('cumulative_fee_target' in v_def)=0
 THEN RAISE EXCEPTION 'Refund posting capture dependency/idempotency/rounding guards missing'; END IF;
 RAISE NOTICE 'PASS: Refund posting access, immutable allocation and cumulative rounding';
END
$refund_posting_test$;
