-- Complete persistence for the Product and Growth collections exposed by CollectionRepeater.
CREATE TABLE IF NOT EXISTS workspace_data.growth_strategie (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  organization_id uuid NOT NULL REFERENCES identity.organizations(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL,
  created_by_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  title text NOT NULL CHECK (length(btrim(title)) BETWEEN 1 AND 240),
  phase text,
  objective text,
  duration text,
  criteria text,
  state text,
  focus text,
  extra_data jsonb NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(extra_data) = 'object'),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT growth_strategie_workspace_org_fkey
    FOREIGN KEY (workspace_id, organization_id)
    REFERENCES enterprise.workspaces(id, organization_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS workspace_data.growth_aeo (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  organization_id uuid NOT NULL REFERENCES identity.organizations(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL,
  created_by_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  title text NOT NULL CHECK (length(btrim(title)) BETWEEN 1 AND 240),
  intent text,
  position text,
  cited text,
  tracked_since text,
  history text,
  competitor text,
  extra_data jsonb NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(extra_data) = 'object'),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT growth_aeo_workspace_org_fkey
    FOREIGN KEY (workspace_id, organization_id)
    REFERENCES enterprise.workspaces(id, organization_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS workspace_data.product_rankings (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  organization_id uuid NOT NULL REFERENCES identity.organizations(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL,
  created_by_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  title text NOT NULL CHECK (length(btrim(title)) BETWEEN 1 AND 240),
  tier text,
  body text,
  score numeric CHECK (score IS NULL OR score BETWEEN 0 AND 100),
  area text,
  owner text,
  source text,
  reviewed_on text,
  next_step text,
  extra_data jsonb NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(extra_data) = 'object'),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT product_rankings_workspace_org_fkey
    FOREIGN KEY (workspace_id, organization_id)
    REFERENCES enterprise.workspaces(id, organization_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS workspace_data.product_launches (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  organization_id uuid NOT NULL REFERENCES identity.organizations(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL,
  created_by_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  title text NOT NULL CHECK (length(btrim(title)) BETWEEN 1 AND 240),
  stage text,
  state text,
  cohort text,
  body text,
  started_at text,
  eta text,
  owner text,
  metric text,
  extra_data jsonb NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(extra_data) = 'object'),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT product_launches_workspace_org_fkey
    FOREIGN KEY (workspace_id, organization_id)
    REFERENCES enterprise.workspaces(id, organization_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS workspace_data.product_ideas (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  organization_id uuid NOT NULL REFERENCES identity.organizations(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL,
  created_by_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  title text NOT NULL CHECK (length(btrim(title)) BETWEEN 1 AND 240),
  trend text,
  opportunity text,
  demand text,
  economic_size text,
  summary text,
  body text,
  source text,
  raised_by text,
  raised_on text,
  ask text,
  extra_data jsonb NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(extra_data) = 'object'),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT product_ideas_workspace_org_fkey
    FOREIGN KEY (workspace_id, organization_id)
    REFERENCES enterprise.workspaces(id, organization_id) ON DELETE CASCADE
);

DO $$
DECLARE
  v_table text;
BEGIN
  FOREACH v_table IN ARRAY ARRAY['growth_strategie','growth_aeo','product_rankings','product_launches','product_ideas'] LOOP
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
