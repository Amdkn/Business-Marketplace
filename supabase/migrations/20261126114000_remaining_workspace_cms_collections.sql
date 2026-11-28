-- Persist the remaining finance, task, operations, audit, IT/R&D and settings CMS collections.
CREATE TABLE IF NOT EXISTS workspace_data.plancher_marges (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  organization_id uuid NOT NULL REFERENCES identity.organizations(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL,
  created_by_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  title text NOT NULL CHECK (length(btrim(title)) BETWEEN 1 AND 240),
  "category" text,
  "unit" text,
  "real_cost" numeric,
  "floor" numeric,
  "price" numeric,
  "gap" numeric,
  "margin_pct" numeric,
  "status" text,
  "note" text,
  extra_data jsonb NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(extra_data) = 'object'),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT plancher_marges_workspace_org_fkey
    FOREIGN KEY (workspace_id, organization_id)
    REFERENCES enterprise.workspaces(id, organization_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS workspace_data.courbe_demande (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  organization_id uuid NOT NULL REFERENCES identity.organizations(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL,
  created_by_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  title text NOT NULL CHECK (length(btrim(title)) BETWEEN 1 AND 240),
  "category" text,
  "scenarios" text,
  "elasticity" text,
  "sweet_spot" numeric,
  "sensitivity" text,
  "notes" text,
  extra_data jsonb NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(extra_data) = 'object'),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT courbe_demande_workspace_org_fkey
    FOREIGN KEY (workspace_id, organization_id)
    REFERENCES enterprise.workspaces(id, organization_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS workspace_data.budget_tokens (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  organization_id uuid NOT NULL REFERENCES identity.organizations(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL,
  created_by_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  title text NOT NULL CHECK (length(btrim(title)) BETWEEN 1 AND 240),
  "category" text,
  "monthly_tokens" numeric,
  "model_cost" numeric,
  "fte_role" text,
  "fte_salary" numeric,
  "coverage" text,
  "ratio" text,
  "monthly_saving" numeric,
  "status" text,
  "notes" text,
  extra_data jsonb NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(extra_data) = 'object'),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT budget_tokens_workspace_org_fkey
    FOREIGN KEY (workspace_id, organization_id)
    REFERENCES enterprise.workspaces(id, organization_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS workspace_data.formes_prix (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  organization_id uuid NOT NULL REFERENCES identity.organizations(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL,
  created_by_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  title text NOT NULL CHECK (length(btrim(title)) BETWEEN 1 AND 240),
  "offer" text,
  "pricing" text,
  "cashflow" text,
  "commitment" text,
  "risk" text,
  "best_for" text,
  extra_data jsonb NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(extra_data) = 'object'),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT formes_prix_workspace_org_fkey
    FOREIGN KEY (workspace_id, organization_id)
    REFERENCES enterprise.workspaces(id, organization_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS workspace_data.dods (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  organization_id uuid NOT NULL REFERENCES identity.organizations(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL,
  created_by_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  title text NOT NULL CHECK (length(btrim(title)) BETWEEN 1 AND 240),
  "context" text,
  "owner" text,
  "status" text,
  "last_edited" text,
  "dod" text,
  "signal" text,
  extra_data jsonb NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(extra_data) = 'object'),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT dods_workspace_org_fkey
    FOREIGN KEY (workspace_id, organization_id)
    REFERENCES enterprise.workspaces(id, organization_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS workspace_data.comparators (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  organization_id uuid NOT NULL REFERENCES identity.organizations(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL,
  created_by_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  title text NOT NULL CHECK (length(btrim(title)) BETWEEN 1 AND 240),
  "compared" text,
  "against" text,
  "verdict" text,
  "delta" text,
  "reviewer" text,
  "reviewed" text,
  extra_data jsonb NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(extra_data) = 'object'),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT comparators_workspace_org_fkey
    FOREIGN KEY (workspace_id, organization_id)
    REFERENCES enterprise.workspaces(id, organization_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS workspace_data.exposed_actions (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  organization_id uuid NOT NULL REFERENCES identity.organizations(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL,
  created_by_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  title text NOT NULL CHECK (length(btrim(title)) BETWEEN 1 AND 240),
  "audience" text,
  "channel" text,
  "shipped_at" date,
  "owner" text,
  "summary" text,
  "metric" text,
  extra_data jsonb NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(extra_data) = 'object'),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT exposed_actions_workspace_org_fkey
    FOREIGN KEY (workspace_id, organization_id)
    REFERENCES enterprise.workspaces(id, organization_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS workspace_data.processes (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  organization_id uuid NOT NULL REFERENCES identity.organizations(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL,
  created_by_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  title text NOT NULL CHECK (length(btrim(title)) BETWEEN 1 AND 240),
  "owner" text,
  "category" text,
  "inputs" text,
  "outputs" text,
  "depends_on" text,
  "cadence" text,
  "edge_cases" text,
  extra_data jsonb NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(extra_data) = 'object'),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT processes_workspace_org_fkey
    FOREIGN KEY (workspace_id, organization_id)
    REFERENCES enterprise.workspaces(id, organization_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS workspace_data.benchmarks (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  organization_id uuid NOT NULL REFERENCES identity.organizations(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL,
  created_by_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  title text NOT NULL CHECK (length(btrim(title)) BETWEEN 1 AND 240),
  "target" text,
  "difficulty" text,
  "pass_rate" numeric,
  "last_run" text,
  "status" text,
  "failure_mode" text,
  extra_data jsonb NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(extra_data) = 'object'),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT benchmarks_workspace_org_fkey
    FOREIGN KEY (workspace_id, organization_id)
    REFERENCES enterprise.workspaces(id, organization_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS workspace_data.audit_arbitrage (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  organization_id uuid NOT NULL REFERENCES identity.organizations(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL,
  created_by_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  title text NOT NULL CHECK (length(btrim(title)) BETWEEN 1 AND 240),
  "axis" text,
  "frequency" text,
  "level0" text,
  "level1" text,
  "level2" text,
  extra_data jsonb NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(extra_data) = 'object'),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT audit_arbitrage_workspace_org_fkey
    FOREIGN KEY (workspace_id, organization_id)
    REFERENCES enterprise.workspaces(id, organization_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS workspace_data.audit_contexte (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  organization_id uuid NOT NULL REFERENCES identity.organizations(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL,
  created_by_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  title text NOT NULL CHECK (length(btrim(title)) BETWEEN 1 AND 240),
  "axis" text,
  "frequency" text,
  "level0" text,
  "level1" text,
  "level2" text,
  extra_data jsonb NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(extra_data) = 'object'),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT audit_contexte_workspace_org_fkey
    FOREIGN KEY (workspace_id, organization_id)
    REFERENCES enterprise.workspaces(id, organization_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS workspace_data.audit_donnees (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  organization_id uuid NOT NULL REFERENCES identity.organizations(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL,
  created_by_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  title text NOT NULL CHECK (length(btrim(title)) BETWEEN 1 AND 240),
  "axis" text,
  "frequency" text,
  "level0" text,
  "level1" text,
  "level2" text,
  extra_data jsonb NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(extra_data) = 'object'),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT audit_donnees_workspace_org_fkey
    FOREIGN KEY (workspace_id, organization_id)
    REFERENCES enterprise.workspaces(id, organization_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS workspace_data.audit_automatabilite (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  organization_id uuid NOT NULL REFERENCES identity.organizations(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL,
  created_by_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  title text NOT NULL CHECK (length(btrim(title)) BETWEEN 1 AND 240),
  "axis" text,
  "frequency" text,
  "level0" text,
  "level1" text,
  "level2" text,
  extra_data jsonb NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(extra_data) = 'object'),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT audit_automatabilite_workspace_org_fkey
    FOREIGN KEY (workspace_id, organization_id)
    REFERENCES enterprise.workspaces(id, organization_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS workspace_data.audit_arbitrage_roi (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  organization_id uuid NOT NULL REFERENCES identity.organizations(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL,
  created_by_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  title text NOT NULL CHECK (length(btrim(title)) BETWEEN 1 AND 240),
  "axis" text,
  "frequency" text,
  "level0" text,
  "level1" text,
  "level2" text,
  extra_data jsonb NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(extra_data) = 'object'),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT audit_arbitrage_roi_workspace_org_fkey
    FOREIGN KEY (workspace_id, organization_id)
    REFERENCES enterprise.workspaces(id, organization_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS workspace_data.it_journal (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  organization_id uuid NOT NULL REFERENCES identity.organizations(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL,
  created_by_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  title text NOT NULL CHECK (length(btrim(title)) BETWEEN 1 AND 240),
  "actor" text,
  "action" text,
  "entity" text,
  "ts" text,
  "outcome" text,
  "projects" text,
  "note" text,
  extra_data jsonb NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(extra_data) = 'object'),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT it_journal_workspace_org_fkey
    FOREIGN KEY (workspace_id, organization_id)
    REFERENCES enterprise.workspaces(id, organization_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS workspace_data.it_loops (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  organization_id uuid NOT NULL REFERENCES identity.organizations(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL,
  created_by_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  title text NOT NULL CHECK (length(btrim(title)) BETWEEN 1 AND 240),
  "state" text,
  "metric" text,
  "capteur" text,
  "consigne" text,
  "controleur" text,
  "actionneur" text,
  "target" text,
  "tolerance" text,
  "last_action" text,
  "last_action_at" text,
  "note" text,
  extra_data jsonb NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(extra_data) = 'object'),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT it_loops_workspace_org_fkey
    FOREIGN KEY (workspace_id, organization_id)
    REFERENCES enterprise.workspaces(id, organization_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS workspace_data.it_drift (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  organization_id uuid NOT NULL REFERENCES identity.organizations(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL,
  created_by_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  title text NOT NULL CHECK (length(btrim(title)) BETWEEN 1 AND 240),
  "metric" text,
  "severity" text,
  "reference" text,
  "current" text,
  "detected" text,
  "threshold" text,
  "unit" text,
  "method" text,
  "note" text,
  extra_data jsonb NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(extra_data) = 'object'),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT it_drift_workspace_org_fkey
    FOREIGN KEY (workspace_id, organization_id)
    REFERENCES enterprise.workspaces(id, organization_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS workspace_data.it_evals (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  organization_id uuid NOT NULL REFERENCES identity.organizations(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL,
  created_by_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  title text NOT NULL CHECK (length(btrim(title)) BETWEEN 1 AND 240),
  "rate" text,
  "eval_type" text,
  "trials" numeric,
  "distribution" text,
  "failures" text,
  "ran_at" text,
  "note" text,
  extra_data jsonb NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(extra_data) = 'object'),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT it_evals_workspace_org_fkey
    FOREIGN KEY (workspace_id, organization_id)
    REFERENCES enterprise.workspaces(id, organization_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS workspace_data.settings_integrations (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  organization_id uuid NOT NULL REFERENCES identity.organizations(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL,
  created_by_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  title text NOT NULL CHECK (length(btrim(title)) BETWEEN 1 AND 240),
  "description" text,
  "status" text,
  "scope" text,
  extra_data jsonb NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(extra_data) = 'object'),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT settings_integrations_workspace_org_fkey
    FOREIGN KEY (workspace_id, organization_id)
    REFERENCES enterprise.workspaces(id, organization_id) ON DELETE CASCADE
);

DO $$
DECLARE
  v_table text;
BEGIN
  FOREACH v_table IN ARRAY ARRAY['plancher_marges','courbe_demande','budget_tokens','formes_prix','dods','comparators','exposed_actions','processes','benchmarks','audit_arbitrage','audit_contexte','audit_donnees','audit_automatabilite','audit_arbitrage_roi','it_journal','it_loops','it_drift','it_evals','settings_integrations'] LOOP
    EXECUTE format('ALTER TABLE workspace_data.%I ENABLE ROW LEVEL SECURITY', v_table);
    EXECUTE format('REVOKE ALL ON TABLE workspace_data.%I FROM PUBLIC, anon', v_table);
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE workspace_data.%I TO authenticated', v_table);
    EXECUTE format('CREATE INDEX IF NOT EXISTS %I ON workspace_data.%I (organization_id, workspace_id, created_at DESC)', v_table || '_workspace_created_idx', v_table);
    EXECUTE format('CREATE INDEX IF NOT EXISTS %I ON workspace_data.%I (workspace_id, organization_id)', v_table || '_workspace_org_idx', v_table);
    EXECUTE format('CREATE INDEX IF NOT EXISTS %I ON workspace_data.%I (created_by_user_id)', v_table || '_created_by_idx', v_table);
    EXECUTE format('DROP POLICY IF EXISTS %I ON workspace_data.%I', v_table || '_member_read', v_table);
    EXECUTE format('CREATE POLICY %I ON workspace_data.%I FOR SELECT TO authenticated USING (identity.is_active_workspace_member(organization_id, workspace_id))', v_table || '_member_read', v_table);
    EXECUTE format('DROP POLICY IF EXISTS %I ON workspace_data.%I', v_table || '_operator_insert', v_table);
    EXECUTE format('CREATE POLICY %I ON workspace_data.%I FOR INSERT TO authenticated WITH CHECK (created_by_user_id = (SELECT auth.uid()) AND identity.can_manage_workspace(organization_id, workspace_id))', v_table || '_operator_insert', v_table);
    EXECUTE format('DROP POLICY IF EXISTS %I ON workspace_data.%I', v_table || '_operator_update', v_table);
    EXECUTE format('CREATE POLICY %I ON workspace_data.%I FOR UPDATE TO authenticated USING (identity.can_manage_workspace(organization_id, workspace_id)) WITH CHECK (identity.can_manage_workspace(organization_id, workspace_id))', v_table || '_operator_update', v_table);
    EXECUTE format('DROP POLICY IF EXISTS %I ON workspace_data.%I', v_table || '_operator_delete', v_table);
    EXECUTE format('CREATE POLICY %I ON workspace_data.%I FOR DELETE TO authenticated USING (identity.can_manage_workspace(organization_id, workspace_id))', v_table || '_operator_delete', v_table);
    EXECUTE format('DROP TRIGGER IF EXISTS %I ON workspace_data.%I', v_table || '_tenant_guard', v_table);
    EXECUTE format('CREATE TRIGGER %I BEFORE UPDATE ON workspace_data.%I FOR EACH ROW EXECUTE FUNCTION workspace_data.guard_tenant_row()', v_table || '_tenant_guard', v_table);
  END LOOP;
END;
$$;

NOTIFY pgrst, 'reload config';
