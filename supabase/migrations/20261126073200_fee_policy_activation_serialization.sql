CREATE OR REPLACE FUNCTION api.activate_fee_policy(p_actor_user_id uuid,p_owner_organization_id uuid,p_policy_id uuid)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,identity,finance,api
AS $function$
DECLARE v_policy finance.fee_policies%ROWTYPE;
BEGIN
 PERFORM 1 FROM identity.organization_memberships m WHERE m.organization_id=p_owner_organization_id AND m.user_id=p_actor_user_id AND m.membership_status='ACTIVE';
 IF NOT FOUND THEN RAISE EXCEPTION 'Active organization membership required'; END IF;
 PERFORM 1 FROM identity.role_bindings rb WHERE rb.organization_id=p_owner_organization_id AND rb.subject_user_id=p_actor_user_id
 AND rb.binding_status='ACTIVE' AND rb.starts_at<=now() AND (rb.expires_at IS NULL OR rb.expires_at>now())
 AND rb.role_code IN ('S0_SOVEREIGN','B1_CEO','B2_MANAGER','B2.2');
 IF NOT FOUND THEN RAISE EXCEPTION 'Finance administration role required'; END IF;
 SELECT * INTO v_policy FROM finance.fee_policies WHERE id=p_policy_id AND owner_organization_id=p_owner_organization_id;
 IF NOT FOUND OR v_policy.policy_status<>'DRAFT' THEN RAISE EXCEPTION 'Draft fee policy not found'; END IF;
 PERFORM pg_advisory_xact_lock(hashtextextended(
   p_owner_organization_id::text||':fee-policy:'||v_policy.policy_key||':'||v_policy.scope_type||':'||
   coalesce(v_policy.scope_organization_id::text,'*')||':'||coalesce(v_policy.currency::text,'*'),0));
 SELECT * INTO v_policy FROM finance.fee_policies WHERE id=p_policy_id AND owner_organization_id=p_owner_organization_id FOR UPDATE;
 IF NOT FOUND OR v_policy.policy_status<>'DRAFT' THEN RAISE EXCEPTION 'Draft fee policy not found'; END IF;
 IF v_policy.effective_to IS NOT NULL AND v_policy.effective_to<=now() THEN RAISE EXCEPTION 'Fee policy effective window has expired'; END IF;
 IF EXISTS(SELECT 1 FROM finance.fee_policies p WHERE p.owner_organization_id=v_policy.owner_organization_id
 AND p.policy_key=v_policy.policy_key AND p.scope_type=v_policy.scope_type
 AND p.scope_organization_id IS NOT DISTINCT FROM v_policy.scope_organization_id
 AND p.currency IS NOT DISTINCT FROM v_policy.currency AND p.policy_status='ACTIVE'
 AND tstzrange(p.effective_from,p.effective_to,'[)') && tstzrange(v_policy.effective_from,v_policy.effective_to,'[)'))
 THEN RAISE EXCEPTION 'Fee policy effective window overlaps an active version'; END IF;
 UPDATE finance.fee_policies SET policy_status='ACTIVE',activated_at=now() WHERE id=p_policy_id;
 RETURN p_policy_id;
END $function$;