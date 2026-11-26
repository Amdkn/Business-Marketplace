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
 RAISE NOTICE 'PASS: Marketplace finance ledger baseline';
END
$test$;