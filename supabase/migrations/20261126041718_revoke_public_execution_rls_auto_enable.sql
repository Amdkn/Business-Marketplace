-- Historical source reconstruction for cloud migration 20261126041718.
-- The original migration body was not present in the V5 PR #63 source tree.
-- This statement reproduces the verified live privilege state, but is NOT
-- represented as a byte-for-byte recovery of the original historical file.
-- The hosted Marketplace project already has this state. Do not replay there.
REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM PUBLIC, anon, authenticated;
