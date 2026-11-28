BEGIN;
CREATE TABLE finance.chart_account_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chart_version text NOT NULL,
  system_key text NOT NULL,
  account_code text NOT NULL,
  account_name text NOT NULL,
  account_type text NOT NULL CHECK (account_type IN ('ASSET','LIABILITY','EQUITY','REVENUE','EXPENSE')),
  normal_balance text NOT NULL CHECK (normal_balance IN ('DEBIT','CREDIT')),
  description text NOT NULL,
  sort_order integer NOT NULL CHECK (sort_order > 0),
  is_required boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (chart_version, system_key),
  UNIQUE (chart_version, account_code),
  CHECK (
    (account_type IN ('ASSET','EXPENSE') AND normal_balance='DEBIT')
    OR (account_type IN ('LIABILITY','EQUITY','REVENUE') AND normal_balance='CREDIT')
  )
);
ALTER TABLE finance.chart_account_templates ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON finance.chart_account_templates FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON finance.chart_account_templates TO service_role;
ALTER TABLE finance.ledger_accounts ADD COLUMN chart_version text;
ALTER TABLE finance.ledger_accounts ADD CONSTRAINT ledger_accounts_chart_version_check
  CHECK (chart_version IS NULL OR chart_version ~ '^[0-9]{4}\\.[0-9]+$');
INSERT INTO finance.chart_account_templates
(chart_version,system_key,account_code,account_name,account_type,normal_balance,description,sort_order,is_required)
VALUES
('2026.1','CASH_OPERATING','1000','Operating Cash','ASSET','DEBIT','Bank cash and operating cash equivalents',10,true),
('2026.1','PSP_CLEARING','1010','Payment Processor Clearing','ASSET','DEBIT','Funds captured by payment providers and awaiting settlement',20,true),
('2026.1','ACCOUNTS_RECEIVABLE','1100','Accounts Receivable','ASSET','DEBIT','Amounts contractually due to the platform',30,true),
('2026.1','SELLER_PAYABLE','2000','Seller Payables','LIABILITY','CREDIT','Amounts owed to marketplace sellers',40,true),
('2026.1','REFUNDS_PAYABLE','2010','Refunds Payable','LIABILITY','CREDIT','Approved refunds not yet settled to buyers',50,true),
('2026.1','TAXES_PAYABLE','2020','Indirect Taxes Payable','LIABILITY','CREDIT','Collected sales tax, VAT or similar amounts pending remittance',60,true),
('2026.1','CHARGEBACKS_PAYABLE','2030','Chargebacks Payable','LIABILITY','CREDIT','Amounts owed or reserved for payment disputes',70,true),
('2026.1','RETAINED_EARNINGS','3000','Retained Earnings','EQUITY','CREDIT','Accumulated retained earnings',80,true),
('2026.1','OWNER_CONTRIBUTIONS','3100','Owner Contributions','EQUITY','CREDIT','Capital contributed by owners',90,true),
('2026.1','PLATFORM_FEE_REVENUE','4000','Platform Fee Revenue','REVENUE','CREDIT','Marketplace commissions and platform transaction fees',100,true),
('2026.1','SUBSCRIPTION_REVENUE','4010','Subscription Revenue','REVENUE','CREDIT','Recurring platform subscription revenue',110,true),
('2026.1','SERVICE_REVENUE','4020','Service Revenue','REVENUE','CREDIT','Other platform service revenue',120,true),
('2026.1','PAYMENT_PROCESSING_EXPENSE','5000','Payment Processing Expense','EXPENSE','DEBIT','Payment provider processing and transaction costs',130,true),
('2026.1','REFUND_CHARGEBACK_EXPENSE','5010','Refund and Chargeback Expense','EXPENSE','DEBIT','Non-recoverable refund and dispute costs',140,true),
('2026.1','COMPUTE_INFERENCE_COGS','5020','Compute and Inference Cost of Service','EXPENSE','DEBIT','Direct compute, inference and execution cost of service',150,true),
('2026.1','PLATFORM_OPERATIONS_EXPENSE','5030','Platform Operations Expense','EXPENSE','DEBIT','Direct platform delivery and operations expense',160,true)
ON CONFLICT (chart_version,system_key) DO NOTHING;
CREATE OR REPLACE FUNCTION api.provision_finance_chart_of_accounts(
  p_actor_user_id uuid,p_organization_id uuid,p_currency char(3),p_chart_version text DEFAULT '2026.1'
)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER
SET search_path=pg_catalog,identity,finance,api
AS $function$
DECLARE v_existing_count integer; v_template_count integer; v_conflict text; v_accounts jsonb;
BEGIN
  IF p_actor_user_id IS NULL OR p_organization_id IS NULL OR p_currency !~ '^[A-Z]{3}$'
     OR p_chart_version IS NULL OR p_chart_version !~ '^[0-9]{4}\\.[0-9]+$' THEN
    RAISE EXCEPTION 'Invalid chart provisioning request';
  END IF;
  PERFORM 1 FROM identity.organizations o WHERE o.id=p_organization_id AND o.status='ACTIVE';
  IF NOT FOUND THEN RAISE EXCEPTION 'Active organization required'; END IF;
  PERFORM 1 FROM identity.organization_memberships m WHERE m.organization_id=p_organization_id
    AND m.user_id=p_actor_user_id AND m.membership_status='ACTIVE';
  IF NOT FOUND THEN RAISE EXCEPTION 'Active organization membership required'; END IF;
  PERFORM 1 FROM identity.role_bindings rb WHERE rb.organization_id=p_organization_id
    AND rb.subject_user_id=p_actor_user_id AND rb.binding_status='ACTIVE'
    AND rb.starts_at<=now() AND (rb.expires_at IS NULL OR rb.expires_at>now())
    AND rb.role_code IN ('S0_SOVEREIGN','B1_CEO','B2_MANAGER','B2.2');
  IF NOT FOUND THEN RAISE EXCEPTION 'Finance administration role required'; END IF;
  PERFORM pg_advisory_xact_lock(hashtextextended(
    p_organization_id::text || ':finance-chart:' || p_currency::text || ':' || p_chart_version,0));
  SELECT count(*) INTO v_template_count FROM finance.chart_account_templates
    WHERE chart_version=p_chart_version AND is_required;
  IF v_template_count=0 THEN RAISE EXCEPTION 'Unknown or empty chart version'; END IF;
  SELECT string_agg(t.system_key,', ' ORDER BY t.sort_order) INTO v_conflict
  FROM finance.chart_account_templates t JOIN finance.ledger_accounts a
    ON a.organization_id=p_organization_id AND a.currency=p_currency
   AND (a.system_key=t.system_key OR a.account_code=t.account_code)
  WHERE t.chart_version=p_chart_version AND
    (a.system_key IS DISTINCT FROM t.system_key OR a.account_code IS DISTINCT FROM t.account_code
     OR a.account_name IS DISTINCT FROM t.account_name OR a.account_type IS DISTINCT FROM t.account_type
     OR a.normal_balance IS DISTINCT FROM t.normal_balance OR a.chart_version IS DISTINCT FROM t.chart_version);
  IF v_conflict IS NOT NULL THEN RAISE EXCEPTION 'Chart provisioning conflicts with existing organization accounts: %',v_conflict; END IF;
  INSERT INTO finance.ledger_accounts
    (organization_id,account_code,account_name,account_type,normal_balance,currency,system_key,chart_version)
  SELECT p_organization_id,t.account_code,t.account_name,t.account_type,t.normal_balance,p_currency,t.system_key,t.chart_version
  FROM finance.chart_account_templates t WHERE t.chart_version=p_chart_version AND t.is_required
  ON CONFLICT (organization_id,system_key,currency) WHERE system_key IS NOT NULL DO NOTHING;
  SELECT count(*) INTO v_existing_count FROM finance.ledger_accounts a
  JOIN finance.chart_account_templates t ON t.system_key=a.system_key AND t.chart_version=a.chart_version
  WHERE a.organization_id=p_organization_id AND a.currency=p_currency
    AND t.chart_version=p_chart_version AND t.is_required;
  IF v_existing_count<>v_template_count THEN
    RAISE EXCEPTION 'Chart provisioning incomplete: expected %, found %',v_template_count,v_existing_count;
  END IF;
  SELECT jsonb_agg(jsonb_build_object('id',a.id,'system_key',a.system_key,'account_code',a.account_code,
    'account_name',a.account_name,'account_type',a.account_type,'normal_balance',a.normal_balance,
    'currency',a.currency,'chart_version',a.chart_version,'account_status',a.account_status) ORDER BY t.sort_order)
  INTO v_accounts FROM finance.ledger_accounts a
  JOIN finance.chart_account_templates t ON t.system_key=a.system_key AND t.chart_version=a.chart_version
  WHERE a.organization_id=p_organization_id AND a.currency=p_currency
    AND t.chart_version=p_chart_version AND t.is_required;
  RETURN jsonb_build_object('organization_id',p_organization_id,'currency',p_currency,
    'chart_version',p_chart_version,'created_or_reused_count',v_existing_count,'accounts',coalesce(v_accounts,'[]'::jsonb));
END
$function$;
REVOKE ALL ON FUNCTION api.provision_finance_chart_of_accounts(uuid,uuid,character,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION api.provision_finance_chart_of_accounts(uuid,uuid,character,text) TO service_role;
COMMIT;