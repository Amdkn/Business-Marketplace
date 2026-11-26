BEGIN;
CREATE OR REPLACE FUNCTION finance.validate_payment_intent()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,finance,commerce AS $$
DECLARE v_order commerce.orders%ROWTYPE;
BEGIN
 IF TG_OP='UPDATE' AND (NEW.order_id IS DISTINCT FROM OLD.order_id OR NEW.buyer_organization_id IS DISTINCT FROM OLD.buyer_organization_id
 OR NEW.seller_organization_id IS DISTINCT FROM OLD.seller_organization_id OR NEW.provider_key IS DISTINCT FROM OLD.provider_key
 OR NEW.idempotency_key IS DISTINCT FROM OLD.idempotency_key OR NEW.amount IS DISTINCT FROM OLD.amount OR NEW.currency IS DISTINCT FROM OLD.currency)
 THEN RAISE EXCEPTION 'Payment intent identity, parties, amount, currency and idempotency key are immutable'; END IF;
 SELECT * INTO v_order FROM commerce.orders WHERE id=NEW.order_id FOR SHARE;
 IF NOT FOUND OR v_order.buyer_organization_id<>NEW.buyer_organization_id OR v_order.seller_organization_id<>NEW.seller_organization_id
 OR v_order.price_amount_snapshot<>NEW.amount OR v_order.currency_snapshot<>NEW.currency THEN
 RAISE EXCEPTION 'Payment intent must match the immutable order parties, amount and currency'; END IF;
 IF TG_OP='UPDATE' AND OLD.payment_status IS DISTINCT FROM NEW.payment_status THEN
 IF NOT ((OLD.payment_status='CREATED' AND NEW.payment_status IN ('REQUIRES_ACTION','PROCESSING','AUTHORIZED','CAPTURED','FAILED','CANCELLED')) OR
 (OLD.payment_status='REQUIRES_ACTION' AND NEW.payment_status IN ('PROCESSING','AUTHORIZED','CAPTURED','FAILED','CANCELLED')) OR
 (OLD.payment_status='PROCESSING' AND NEW.payment_status IN ('AUTHORIZED','CAPTURED','FAILED')) OR
 (OLD.payment_status='AUTHORIZED' AND NEW.payment_status IN ('CAPTURED','FAILED','CANCELLED')) OR
 (OLD.payment_status='CAPTURED' AND NEW.payment_status IN ('PARTIALLY_REFUNDED','REFUNDED')) OR
 (OLD.payment_status='PARTIALLY_REFUNDED' AND NEW.payment_status='REFUNDED'))
 THEN RAISE EXCEPTION 'Invalid payment transition: % -> %',OLD.payment_status,NEW.payment_status; END IF; END IF;
 NEW.updated_at:=now(); RETURN NEW;
END $$;
COMMIT;