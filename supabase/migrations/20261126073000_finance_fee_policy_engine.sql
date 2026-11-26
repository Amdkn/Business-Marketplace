BEGIN;
CREATE TABLE finance.fee_policies (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 owner_organization_id uuid NOT NULL REFERENCES identity.organizations(id) ON DELETE RESTRICT,
 policy_key text NOT NULL CHECK(policy_key ~ '^[a-z][a-z0-9_.-]{2,79}$'),
 version integer NOT NULL CHECK(version>0),
 policy_name text NOT NULL CHECK(length(btrim(policy_name)) BETWEEN 3 AND 160),
 scope_type text NOT NULL CHECK(scope_type IN ('PLATFORM','SELLER_ORGANIZATION')),
 scope_organization_id uuid REFERENCES identity.organizations(id) ON DELETE RESTRICT,
 currency char(3) CHECK(currency IS NULL OR currency ~ '^[A-Z]{3}$'),
 fee_rate_bps integer NOT NULL DEFAULT 0 CHECK(fee_rate_bps BETWEEN 0 AND 10000),
 fixed_fee_amount numeric(20,6) NOT NULL DEFAULT 0 CHECK(fixed_fee_amount>=0),
 minimum_fee_amount numeric(20,6) CHECK(minimum_fee_amount IS NULL OR minimum_fee_amount>=0),
 maximum_fee_amount numeric(20,6) CHECK(maximum_fee_amount IS NULL OR maximum_fee_amount>=0),
 rounding_scale smallint NOT NULL DEFAULT 2 CHECK(rounding_scale BETWEEN 0 AND 6),
 effective_from timestamptz NOT NULL DEFAULT now(), effective_to timestamptz,
 policy_status text NOT NULL DEFAULT 'DRAFT' CHECK(policy_status IN ('DRAFT','ACTIVE','RETIRED')),
 created_by_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
 activated_at timestamptz, created_at timestamptz NOT NULL DEFAULT now(),
 CHECK((scope_type='PLATFORM' AND scope_organization_id IS NULL) OR (scope_type='SELLER_ORGANIZATION' AND scope_organization_id IS NOT NULL)),
 CHECK(effective_to IS NULL OR effective_to>effective_from),
 CHECK(maximum_fee_amount IS NULL OR minimum_fee_amount IS NULL OR maximum_fee_amount>=minimum_fee_amount)
);
CREATE UNIQUE INDEX fee_policies_version_scope_uidx ON finance.fee_policies
(owner_organization_id,policy_key,version,scope_type,
 coalesce(scope_organization_id,'00000000-0000-0000-0000-000000000000'::uuid),coalesce(currency,'XXX'::bpchar));
CREATE INDEX fee_policies_active_lookup_idx ON finance.fee_policies
(owner_organization_id,policy_key,scope_type,scope_organization_id,currency,effective_from,effective_to)
WHERE policy_status='ACTIVE';
CREATE TABLE finance.order_fee_snapshots (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 order_id uuid NOT NULL UNIQUE REFERENCES commerce.orders(id) ON DELETE RESTRICT,
 policy_id uuid NOT NULL REFERENCES finance.fee_policies(id) ON DELETE RESTRICT,
 owner_organization_id uuid NOT NULL REFERENCES identity.organizations(id) ON DELETE RESTRICT,
 policy_key text NOT NULL, policy_version integer NOT NULL,
 scope_type text NOT NULL CHECK(scope_type IN ('PLATFORM','SELLER_ORGANIZATION')),
 gross_amount numeric(20,6) NOT NULL CHECK(gross_amount>=0),
 fee_rate_bps integer NOT NULL CHECK(fee_rate_bps BETWEEN 0 AND 10000),
 fixed_fee_amount numeric(20,6) NOT NULL CHECK(fixed_fee_amount>=0),
 fee_amount numeric(20,6) NOT NULL CHECK(fee_amount>=0 AND fee_amount<=gross_amount),
 seller_net_amount numeric(20,6) NOT NULL CHECK(seller_net_amount>=0),
 currency char(3) NOT NULL CHECK(currency ~ '^[A-Z]{3}$'),
 rounding_scale smallint NOT NULL CHECK(rounding_scale BETWEEN 0 AND 6),
 calculation_details jsonb NOT NULL, created_at timestamptz NOT NULL DEFAULT now(),
 CHECK(gross_amount=fee_amount+seller_net_amount)
);
CREATE INDEX order_fee_snapshots_owner_created_idx ON finance.order_fee_snapshots(owner_organization_id,created_at DESC);
CREATE INDEX order_fee_snapshots_policy_idx ON finance.order_fee_snapshots(policy_id);
ALTER TABLE finance.fee_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance.order_fee_snapshots ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON finance.fee_policies,finance.order_fee_snapshots FROM PUBLIC,anon,authenticated;
GRANT SELECT,INSERT,UPDATE,DELETE ON finance.fee_policies,finance.order_fee_snapshots TO service_role;

CREATE OR REPLACE FUNCTION finance.guard_fee_policy_mutation()
RETURNS trigger LANGUAGE plpgsql SET search_path=pg_catalog,finance AS $$
BEGIN
 IF TG_OP='DELETE' THEN
  IF OLD.policy_status<>'DRAFT' THEN RAISE EXCEPTION 'Activated fee policies cannot be deleted'; END IF;
  RETURN OLD;
 END IF;
 IF OLD.policy_status<>'DRAFT' THEN
  IF (to_jsonb(NEW)-'policy_status') IS DISTINCT FROM (to_jsonb(OLD)-'policy_status') THEN RAISE EXCEPTION 'Activated fee policy terms are immutable'; END IF;
  IF OLD.policy_status='RETIRED' OR NEW.policy_status NOT IN ('ACTIVE','RETIRED') THEN RAISE EXCEPTION 'Invalid fee policy lifecycle transition'; END IF;
  IF OLD.policy_status='ACTIVE' AND NEW.policy_status='ACTIVE' THEN RAISE EXCEPTION 'Fee policy is already active'; END IF;
 ELSE
  IF NEW.policy_status NOT IN ('DRAFT','ACTIVE') THEN RAISE EXCEPTION 'Draft fee policy can only be activated'; END IF;
 END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER fee_policy_mutation_guard BEFORE UPDATE OR DELETE ON finance.fee_policies
FOR EACH ROW EXECUTE FUNCTION finance.guard_fee_policy_mutation();
CREATE OR REPLACE FUNCTION finance.reject_order_fee_snapshot_mutation()
RETURNS trigger LANGUAGE plpgsql SET search_path=pg_catalog,finance AS $$
BEGIN RAISE EXCEPTION 'Order fee snapshots are immutable'; END $$;
CREATE TRIGGER order_fee_snapshot_immutable BEFORE UPDATE OR DELETE ON finance.order_fee_snapshots
FOR EACH ROW EXECUTE FUNCTION finance.reject_order_fee_snapshot_mutation();

CREATE OR REPLACE FUNCTION api.create_fee_policy(
 p_actor_user_id uuid,p_owner_organization_id uuid,p_policy_key text,p_version integer,p_policy_name text,
 p_scope_type text,p_scope_organization_id uuid,p_currency char(3),p_fee_rate_bps integer,
 p_fixed_fee_amount numeric,p_minimum_fee_amount numeric,p_maximum_fee_amount numeric,
 p_rounding_scale smallint,p_effective_from timestamptz,p_effective_to timestamptz)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,identity,finance,api
AS $function$
DECLARE v_id uuid;
BEGIN
 IF p_actor_user_id IS NULL OR p_policy_key IS NULL OR p_policy_key !~ '^[a-z][a-z0-9_.-]{2,79}$'
 OR p_version IS NULL OR p_version<1 OR p_policy_name IS NULL OR length(btrim(p_policy_name)) NOT BETWEEN 3 AND 160
 OR p_scope_type NOT IN ('PLATFORM','SELLER_ORGANIZATION')
 OR (p_scope_type='PLATFORM' AND p_scope_organization_id IS NOT NULL)
 OR (p_scope_type='SELLER_ORGANIZATION' AND p_scope_organization_id IS NULL)
 OR (p_currency IS NOT NULL AND p_currency !~ '^[A-Z]{3}$')
 OR p_fee_rate_bps NOT BETWEEN 0 AND 10000 OR p_fixed_fee_amount<0
 OR (p_minimum_fee_amount IS NOT NULL AND p_minimum_fee_amount<0)
 OR (p_maximum_fee_amount IS NOT NULL AND p_maximum_fee_amount<0)
 OR (p_minimum_fee_amount IS NOT NULL AND p_maximum_fee_amount IS NOT NULL AND p_maximum_fee_amount<p_minimum_fee_amount)
 OR p_rounding_scale NOT BETWEEN 0 AND 6 OR p_effective_from IS NULL
 OR (p_effective_to IS NOT NULL AND p_effective_to<=p_effective_from) THEN RAISE EXCEPTION 'Invalid fee policy definition'; END IF;
 PERFORM 1 FROM identity.organizations o WHERE o.id=p_owner_organization_id AND o.status='ACTIVE';
 IF NOT FOUND THEN RAISE EXCEPTION 'Active fee policy owner organization required'; END IF;
 PERFORM 1 FROM identity.organization_memberships m WHERE m.organization_id=p_owner_organization_id AND m.user_id=p_actor_user_id AND m.membership_status='ACTIVE';
 IF NOT FOUND THEN RAISE EXCEPTION 'Active organization membership required'; END IF;
 PERFORM 1 FROM identity.role_bindings rb WHERE rb.organization_id=p_owner_organization_id AND rb.subject_user_id=p_actor_user_id
 AND rb.binding_status='ACTIVE' AND rb.starts_at<=now() AND (rb.expires_at IS NULL OR rb.expires_at>now())
 AND rb.role_code IN ('S0_SOVEREIGN','B1_CEO','B2_MANAGER','B2.2');
 IF NOT FOUND THEN RAISE EXCEPTION 'Finance administration role required'; END IF;
 IF p_scope_organization_id IS NOT NULL AND NOT EXISTS(SELECT 1 FROM identity.organizations WHERE id=p_scope_organization_id AND status='ACTIVE')
 THEN RAISE EXCEPTION 'Active seller scope organization required'; END IF;
 INSERT INTO finance.fee_policies(owner_organization_id,policy_key,version,policy_name,scope_type,scope_organization_id,
 currency,fee_rate_bps,fixed_fee_amount,minimum_fee_amount,maximum_fee_amount,rounding_scale,effective_from,effective_to,created_by_user_id)
 VALUES(p_owner_organization_id,p_policy_key,p_version,p_policy_name,p_scope_type,p_scope_organization_id,p_currency,
 p_fee_rate_bps,p_fixed_fee_amount,p_minimum_fee_amount,p_maximum_fee_amount,p_rounding_scale,p_effective_from,p_effective_to,p_actor_user_id)
 RETURNING id INTO v_id;
 RETURN v_id;
END $function$;

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
 PERFORM pg_advisory_xact_lock(hashtextextended(p_owner_organization_id::text||':fee-policy:'||p_policy_id::text,0));
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

CREATE OR REPLACE FUNCTION api.apply_order_fee_policy(p_actor_user_id uuid,p_owner_organization_id uuid,p_order_id uuid,p_policy_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,identity,commerce,finance,api
AS $function$
DECLARE v_policy finance.fee_policies%ROWTYPE; v_order commerce.orders%ROWTYPE;
 v_existing finance.order_fee_snapshots%ROWTYPE; v_fee numeric(20,6); v_gross numeric(20,6); v_net numeric(20,6);
BEGIN
 PERFORM 1 FROM identity.organization_memberships m WHERE m.organization_id=p_owner_organization_id AND m.user_id=p_actor_user_id AND m.membership_status='ACTIVE';
 IF NOT FOUND THEN RAISE EXCEPTION 'Active organization membership required'; END IF;
 PERFORM 1 FROM identity.role_bindings rb WHERE rb.organization_id=p_owner_organization_id AND rb.subject_user_id=p_actor_user_id
 AND rb.binding_status='ACTIVE' AND rb.starts_at<=now() AND (rb.expires_at IS NULL OR rb.expires_at>now())
 AND rb.role_code IN ('S0_SOVEREIGN','B1_CEO','B2_MANAGER','B2.2');
 IF NOT FOUND THEN RAISE EXCEPTION 'Finance administration role required'; END IF;
 PERFORM pg_advisory_xact_lock(hashtextextended(p_order_id::text||':order-fee-snapshot',0));
 SELECT * INTO v_order FROM commerce.orders WHERE id=p_order_id FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'Marketplace order not found'; END IF;
 IF v_order.order_status NOT IN ('PLACED','ACCEPTED') THEN RAISE EXCEPTION 'Fee snapshot must be applied before delivery or cancellation'; END IF;
 SELECT * INTO v_policy FROM finance.fee_policies WHERE id=p_policy_id AND owner_organization_id=p_owner_organization_id
 AND policy_status='ACTIVE' AND effective_from<=now() AND (effective_to IS NULL OR effective_to>now());
 IF NOT FOUND THEN RAISE EXCEPTION 'Active effective fee policy not found'; END IF;
 IF v_policy.currency IS NOT NULL AND v_policy.currency<>v_order.currency_snapshot THEN RAISE EXCEPTION 'Fee policy currency does not match order currency'; END IF;
 IF v_policy.scope_type='SELLER_ORGANIZATION' AND v_policy.scope_organization_id<>v_order.seller_organization_id THEN
 RAISE EXCEPTION 'Fee policy seller scope does not match order seller'; END IF;
 SELECT * INTO v_existing FROM finance.order_fee_snapshots WHERE order_id=p_order_id;
 IF FOUND THEN
  IF v_existing.policy_id<>p_policy_id OR v_existing.gross_amount<>v_order.price_amount_snapshot OR v_existing.currency<>v_order.currency_snapshot
  THEN RAISE EXCEPTION 'Order already has a different immutable fee snapshot'; END IF;
  RETURN jsonb_build_object('snapshot_id',v_existing.id,'order_id',v_existing.order_id,'policy_id',v_existing.policy_id,
  'policy_version',v_existing.policy_version,'gross_amount',v_existing.gross_amount,'fee_amount',v_existing.fee_amount,
  'seller_net_amount',v_existing.seller_net_amount,'currency',v_existing.currency,'idempotent_reuse',true);
 END IF;
 v_gross:=v_order.price_amount_snapshot;
 v_fee:=round(v_gross*v_policy.fee_rate_bps/10000+v_policy.fixed_fee_amount,v_policy.rounding_scale);
 IF v_policy.minimum_fee_amount IS NOT NULL THEN v_fee:=greatest(v_fee,v_policy.minimum_fee_amount); END IF;
 IF v_policy.maximum_fee_amount IS NOT NULL THEN v_fee:=least(v_fee,v_policy.maximum_fee_amount); END IF;
 v_fee:=least(greatest(v_fee,0),v_gross); v_net:=v_gross-v_fee;
 INSERT INTO finance.order_fee_snapshots(order_id,policy_id,owner_organization_id,policy_key,policy_version,scope_type,
 gross_amount,fee_rate_bps,fixed_fee_amount,fee_amount,seller_net_amount,currency,rounding_scale,calculation_details)
 VALUES(p_order_id,p_policy_id,p_owner_organization_id,v_policy.policy_key,v_policy.version,v_policy.scope_type,
 v_gross,v_policy.fee_rate_bps,v_policy.fixed_fee_amount,v_fee,v_net,v_order.currency_snapshot,v_policy.rounding_scale,
 jsonb_build_object('formula','round(gross * rate_bps / 10000 + fixed_fee, rounding_scale), then floor/cap, then cap at gross',
 'minimum_fee_amount',v_policy.minimum_fee_amount,'maximum_fee_amount',v_policy.maximum_fee_amount,
 'policy_effective_from',v_policy.effective_from,'policy_effective_to',v_policy.effective_to,'taxes_included',false,'payment_processing_included',false))
 RETURNING * INTO v_existing;
 RETURN jsonb_build_object('snapshot_id',v_existing.id,'order_id',v_existing.order_id,'policy_id',v_existing.policy_id,
 'policy_version',v_existing.policy_version,'gross_amount',v_existing.gross_amount,'fee_amount',v_existing.fee_amount,
 'seller_net_amount',v_existing.seller_net_amount,'currency',v_existing.currency,'idempotent_reuse',false);
END $function$;
REVOKE ALL ON FUNCTION api.create_fee_policy(uuid,uuid,text,integer,text,text,uuid,character,integer,numeric,numeric,numeric,smallint,timestamp with time zone,timestamp with time zone) FROM PUBLIC,anon,authenticated;
REVOKE ALL ON FUNCTION api.activate_fee_policy(uuid,uuid,uuid) FROM PUBLIC,anon,authenticated;
REVOKE ALL ON FUNCTION api.apply_order_fee_policy(uuid,uuid,uuid,uuid) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION api.create_fee_policy(uuid,uuid,text,integer,text,text,uuid,character,integer,numeric,numeric,numeric,smallint,timestamp with time zone,timestamp with time zone) TO service_role;
GRANT EXECUTE ON FUNCTION api.activate_fee_policy(uuid,uuid,uuid) TO service_role;
GRANT EXECUTE ON FUNCTION api.apply_order_fee_policy(uuid,uuid,uuid,uuid) TO service_role;
COMMIT;