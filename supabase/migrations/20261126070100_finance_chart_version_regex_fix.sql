BEGIN;
ALTER TABLE finance.ledger_accounts DROP CONSTRAINT ledger_accounts_chart_version_check;
ALTER TABLE finance.ledger_accounts ADD CONSTRAINT ledger_accounts_chart_version_check
  CHECK (chart_version IS NULL OR chart_version ~ '^[0-9]{4}[.][0-9]+$');
CREATE OR REPLACE FUNCTION api.provision_finance_chart_of_accounts(
  p_actor_user_id uuid,p_organization_id uuid,p_currency char(3),p_chart_version text DEFAULT '2026.1'
)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog,identity,finance,api
AS $function$
DECLARE v_existing_count integer; v_template_count integer; v_conflict text; v_accounts jsonb;
BEGIN
  IF p_actor_user_id IS NULL OR p_organization_id IS NULL OR p_currency !~ '^[A-Z]{3}$'
     OR p_chart_version IS NULL OR p_chart_version !~ '^[0-9]{4}[.][0-9]+$' THEN RAISE EXCEPTION 'Invalid chart provisioning request'; END IF;
  PERFORM 1 FROM identity.organizations o WHERE o.id=p_organization_id AND o.status='ACTIVE';
  IF NOT FOUND THEN RAISE EXCEPTION 'Active organization required'; END IF;
  PERFORM 1 FROM identity.organization_memberships m WHERE m.organization_id=p_organization_id AND m.user_id=p_actor_user_id AND m.membership_status='ACTIVE';
  IF NOT FOUND THEN RAISE EXCEPTION 'Active organization membership required'; END IF;
  PERFORM 1 FROM identity.role_bindings rb WHERE rb.organization_id=p_organization_id AND rb.subject_user_id=p_actor_user_id
    AND rb.binding_status='ACTIVE' AND rb.starts_at<=now() AND (rb.expires_at IS NULL OR rb.expires_at>now())
    AND rb.role_code IN ('S0_SOVEREIGN','B1_CEO','B2_MANAGER','B2.2');
  IF NOT FOUND THEN RAISE EXCEPTION 'Finance administration role required'; END IF;
  PERFORM pg_advisory_xact_lock(hashtextextended(p_organization_id::text || ':finance-chart:' || p_currency::text || ':' || p_chart_version,0));
  SELECT count(*) INTO v_template_count FROM finance.chart_account_templates WHERE chart_version=p_chart_version AND is_required;
  IF v_template_count=0 THEN RAISE EXCEPTION 'Unknown or empty chart version'; END IF;
  SELECT string_agg(t.system_key,', ' ORDER BY t.sort_order) INTO v_conflict
  FROM finance.chart_account_templates t JOIN finance.ledger_accounts a
    ON a.organization_id=p_organization_id AND a.currency=p_currency AND (a.system_key=t.system_key OR a.account_code=t.account_code)
  WHERE t.chart_version=p_chart_version AND (a.system_key IS DISTINCT FROM t.system_key OR a.account_code IS DISTINCT FROM t.account_code
    OR a.account_name IS DISTINCT FROM t.account_name OR a.account_type IS DISTINCT FROM t.account_type
    OR a.normal_balance IS DISTINCT FROM t.normal_balance OR a.chart_version IS DISTINCT FROM t.chart_version);
  IF v_conflict IS NOT NULL THEN RAISE EXCEPTION 'Chart provisioning conflicts with existing organization accounts: %',v_conflict; END IF;
  INSERT INTO finance.ledger_accounts(organization_id,account_code,account_name,account_type,normal_balance,currency,system_key,chart_version)
  SELECT p_organization_id,t.account_code,t.account_name,t.account_type,t.normal_balance,p_currency,t.system_key,t.chart_version
  FROM finance.chart_account_templates t WHERE t.chart_version=p_chart_version AND t.is_required
  ON CONFLICT (organization_id,system_key,currency) WHERE system_key IS NOT NULL DO NOTHING;
  SELECT count(*) INTO v_existing_count FROM finance.ledger_accounts a JOIN finance.chart_account_templates t
    ON t.system_key=a.system_key AND t.chart_version=a.chart_version
  WHERE a.organization_id=p_organization_id AND a.currency=p_currency AND t.chart_version=p_chart_version AND t.is_required;
  IF v_existing_count<>v_template_count THEN RAISE EXCEPTION 'Chart provisioning incomplete: expected %, found %',v_template_count,v_existing_count; END IF;
  SELECT jsonb_agg(jsonb_build_object('id',a.id,'system_key',a.system_key,'account_code',a.account_code,'account_name',a.account_name,
    'account_type',a.account_type,'normal_balance',a.normal_balance,'currency',a.currency,'chart_version',a.chart_version,
    'account_status',a.account_status) ORDER BY t.sort_order) INTO v_accounts
  FROM finance.ledger_accounts a JOIN finance.chart_account_templates t ON t.system_key=a.system_key AND t.chart_version=a.chart_version
  WHERE a.organization_id=p_organization_id AND a.currency=p_currency AND t.chart_version=p_chart_version AND t.is_required;
  RETURN jsonb_build_object('organization_id',p_organization_id,'currency',p_currency,'chart_version',p_chart_version,
    'created_or_reused_count',v_existing_count,'accounts',coalesce(v_accounts,'[]'::jsonb));
END
$function$;
COMMIT;