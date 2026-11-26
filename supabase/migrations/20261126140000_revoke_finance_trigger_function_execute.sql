-- Trigger functions are invoked by their attached triggers, not by browser callers.
-- Remove inherited/default EXECUTE grants from public API roles.
REVOKE ALL ON FUNCTION finance.guard_fee_policy_mutation() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION finance.reject_order_fee_snapshot_mutation() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION finance.reject_refund_fee_allocation_mutation() FROM PUBLIC, anon, authenticated;
