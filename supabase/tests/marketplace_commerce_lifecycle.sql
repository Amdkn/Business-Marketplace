-- Structural regression for Marketplace publication, order, event and entitlement lifecycle.
-- No business rows or payment records are created.
DO $test$
DECLARE
  v_def text;
  v_fn regprocedure;
  v_security_definer boolean;
  v_config text[];
BEGIN
  -- Order idempotency and immutable snapshots.
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid='commerce.orders'::regclass AND conname='orders_buyer_organization_id_idempotency_key_key' AND contype='u') THEN
    RAISE EXCEPTION 'Order idempotency boundary is missing';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid='commerce.orders'::regclass AND conname='order_parties_differ' AND contype='c') THEN
    RAISE EXCEPTION 'Buyer/seller separation constraint is missing';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid='commerce.order_events'::regclass AND conname='order_events_order_id_sequence_number_key' AND contype='u') THEN
    RAISE EXCEPTION 'Order event sequence uniqueness is missing';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgrelid='commerce.order_events'::regclass AND tgname='order_events_append_only' AND NOT tgisinternal) THEN
    RAISE EXCEPTION 'Order events must be append-only';
  END IF;

  -- Accepted-by-buyer is the entitlement grant boundary.
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgrelid='commerce.orders'::regclass AND tgname='orders_grant_capability_entitlement_after_acceptance' AND NOT tgisinternal) THEN
    RAISE EXCEPTION 'Buyer acceptance must grant capability entitlement';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid='commerce.capability_entitlements'::regclass AND conname='capability_entitlements_order_id_key' AND contype='u') THEN
    RAISE EXCEPTION 'An order must not grant multiple entitlements';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conrelid='commerce.capability_entitlements'::regclass AND conname='capability_entitlements_distinct_parties' AND contype='c') THEN
    RAISE EXCEPTION 'Entitlement buyer/seller separation is missing';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgrelid='commerce.capability_entitlements'::regclass AND tgname='capability_entitlements_suspend_installations' AND NOT tgisinternal) THEN
    RAISE EXCEPTION 'Entitlement suspension/revocation must propagate to installations';
  END IF;

  -- Private commerce data is only reachable through the authorized API layer.
  IF has_table_privilege('anon','commerce.orders','SELECT')
     OR has_table_privilege('authenticated','commerce.orders','SELECT')
     OR has_table_privilege('anon','commerce.order_events','SELECT')
     OR has_table_privilege('authenticated','commerce.order_events','SELECT')
     OR has_table_privilege('anon','commerce.capability_entitlements','SELECT')
     OR has_table_privilege('authenticated','commerce.capability_entitlements','SELECT') THEN
    RAISE EXCEPTION 'Commerce engine tables must not be directly readable by browser roles';
  END IF;

  FOREACH v_fn IN ARRAY ARRAY[
    'api.create_marketplace_order(uuid,uuid,uuid,text)'::regprocedure,
    'api.transition_marketplace_order(uuid,uuid,uuid,text,text)'::regprocedure
  ] LOOP
    SELECT p.prosecdef,p.proconfig INTO v_security_definer,v_config
    FROM pg_proc p WHERE p.oid=v_fn;
    IF v_security_definer IS DISTINCT FROM true OR NOT EXISTS (
      SELECT 1 FROM unnest(v_config) s WHERE s LIKE 'search_path=pg_catalog,%'
    ) THEN
      RAISE EXCEPTION 'Commerce API function % must be SECURITY DEFINER with pinned search_path',v_fn;
    END IF;
    IF has_function_privilege('anon',v_fn,'EXECUTE')
       OR has_function_privilege('authenticated',v_fn,'EXECUTE')
       OR NOT has_function_privilege('service_role',v_fn,'EXECUTE') THEN
      RAISE EXCEPTION 'Commerce API function % has an invalid browser/service-role execution boundary',v_fn;
    END IF;
  END LOOP;

  RAISE NOTICE 'PASS: commerce order idempotency, immutable event stream, buyer acceptance entitlement and private API boundary';
END
$test$;
