BEGIN;
CREATE OR REPLACE FUNCTION finance.prevent_posted_journal_entry_mutation()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,finance AS $$
BEGIN
 IF OLD.entry_status='POSTED' THEN RAISE EXCEPTION 'Posted journal entries are immutable; create a reversing entry'; END IF;
 IF TG_OP='DELETE' THEN RETURN OLD; END IF;
 RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION finance.prevent_posted_journal_entry_mutation() FROM PUBLIC,anon,authenticated;
CREATE TRIGGER journal_entries_immutable_after_post BEFORE UPDATE OR DELETE ON finance.journal_entries
FOR EACH ROW EXECUTE FUNCTION finance.prevent_posted_journal_entry_mutation();
CREATE OR REPLACE FUNCTION finance.validate_payment_intent()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,finance,commerce AS $$
DECLARE v_order commerce.orders%ROWTYPE;
BEGIN
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
 (OLD.payment_status='PARTIALLY_REFUNDED' AND NEW.payment_status='REFUNDED')) THEN
 RAISE EXCEPTION 'Invalid payment transition: % -> %',OLD.payment_status,NEW.payment_status; END IF; END IF;
 NEW.updated_at:=now(); RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION finance.validate_payment_intent() FROM PUBLIC,anon,authenticated;
CREATE TRIGGER payment_intents_validate_order_and_transition BEFORE INSERT OR UPDATE ON finance.payment_intents FOR EACH ROW EXECUTE FUNCTION finance.validate_payment_intent();
CREATE OR REPLACE FUNCTION finance.require_verified_payment_webhook()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,finance AS $$
BEGIN
 IF NEW.processing_status IN ('PROCESSING','PROCESSED') AND NEW.signature_verified IS NOT TRUE THEN RAISE EXCEPTION 'Payment webhook signature must be verified before processing'; END IF;
 IF NEW.processing_status='PROCESSED' AND NEW.processed_at IS NULL THEN NEW.processed_at:=now(); END IF; RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION finance.require_verified_payment_webhook() FROM PUBLIC,anon,authenticated;
CREATE TRIGGER payment_webhook_signature_gate BEFORE INSERT OR UPDATE ON finance.payment_webhook_receipts FOR EACH ROW EXECUTE FUNCTION finance.require_verified_payment_webhook();
CREATE OR REPLACE FUNCTION finance.validate_refund()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,finance AS $$
DECLARE v_payment finance.payment_intents%ROWTYPE; v_reserved numeric(20,6);
BEGIN
 SELECT * INTO v_payment FROM finance.payment_intents WHERE id=NEW.payment_intent_id FOR UPDATE;
 IF NOT FOUND OR v_payment.order_id<>NEW.order_id OR v_payment.currency<>NEW.currency THEN RAISE EXCEPTION 'Refund must reference its payment intent order and currency'; END IF;
 IF NEW.amount>v_payment.amount THEN RAISE EXCEPTION 'Refund exceeds payment amount'; END IF;
 SELECT coalesce(sum(amount),0) INTO v_reserved FROM finance.refunds WHERE payment_intent_id=NEW.payment_intent_id
 AND refund_status IN ('REQUESTED','PENDING','SUCCEEDED') AND id IS DISTINCT FROM NEW.id;
 IF v_reserved+NEW.amount>v_payment.amount THEN RAISE EXCEPTION 'Cumulative refunds exceed payment amount'; END IF;
 NEW.updated_at:=now(); RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION finance.validate_refund() FROM PUBLIC,anon,authenticated;
CREATE TRIGGER refunds_validate_payment_and_total BEFORE INSERT OR UPDATE ON finance.refunds FOR EACH ROW EXECUTE FUNCTION finance.validate_refund();
CREATE OR REPLACE FUNCTION finance.validate_payout_item_currency()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,finance AS $$
DECLARE v_currency char(3);
BEGIN SELECT currency INTO v_currency FROM finance.payout_batches WHERE id=NEW.payout_batch_id FOR SHARE;
 IF v_currency IS DISTINCT FROM NEW.currency THEN RAISE EXCEPTION 'Payout item currency must match its batch'; END IF; RETURN NEW; END $$;
REVOKE ALL ON FUNCTION finance.validate_payout_item_currency() FROM PUBLIC,anon,authenticated;
CREATE TRIGGER payout_items_currency_guard BEFORE INSERT OR UPDATE ON finance.payout_items FOR EACH ROW EXECUTE FUNCTION finance.validate_payout_item_currency();
COMMIT;