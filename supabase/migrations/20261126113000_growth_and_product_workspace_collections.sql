-- Persist the three non-standard CMS collections used by Product and Growth.
-- These are dedicated workspace records, not local-only demo stores.
CREATE TABLE IF NOT EXISTS workspace_data.growth_acquisition (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  organization_id uuid NOT NULL REFERENCES identity.organizations(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL,
  created_by_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  title text NOT NULL CHECK (length(btrim(title)) BETWEEN 1 AND 240),
  category text,
  virality numeric CHECK (virality IS NULL OR virality BETWEEN 0 AND 25),
  conversion numeric CHECK (conversion IS NULL OR conversion BETWEEN 0 AND 25),
  cost numeric CHECK (cost IS NULL OR cost BETWEEN 0 AND 25),
  ease numeric CHECK (ease IS NULL OR ease BETWEEN 0 AND 25),
  global numeric CHECK (global IS NULL OR global BETWEEN 0 AND 100),
  verdict text,
  what_works text,
  what_failed text,
  extra_data jsonb NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(extra_data) = 'object'),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT growth_acquisition_workspace_org_fkey
    FOREIGN KEY (workspace_id, organization_id)
    REFERENCES enterprise.workspaces(id, organization_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS workspace_data.growth_partenariats (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  organization_id uuid NOT NULL REFERENCES identity.organizations(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL,
  created_by_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  title text NOT NULL CHECK (length(btrim(title)) BETWEEN 1 AND 240),
  type text,
  brings text,
  expects text,
  state text,
  contact text,
  touched text,
  extra_data jsonb NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(extra_data) = 'object'),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT growth_partenariats_workspace_org_fkey
    FOREIGN KEY (workspace_id, organization_id)
    REFERENCES enterprise.workspaces(id, organization_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS workspace_data.product_mvps (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  organization_id uuid NOT NULL REFERENCES identity.organizations(id) ON DELETE CASCADE,
  workspace_id uuid NOT NULL,
  created_by_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  title text NOT NULL CHECK (length(btrim(title)) BETWEEN 1 AND 240),
  feature text,
  client text,
  body text,
  overflow text,
  weeks_to_ship numeric CHECK (weeks_to_ship IS NULL OR weeks_to_ship > 0),
  eta text,
  owner text,
  success_metric text,
  notes text,
  extra_data jsonb NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(extra_data) = 'object'),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT product_mvps_workspace_org_fkey
    FOREIGN KEY (workspace_id, organization_id)
    REFERENCES enterprise.workspaces(id, organization_id) ON DELETE CASCADE
);

DO $$
DECLARE
  v_table text;
  v_policy text;
BEGIN
  FOREACH v_table IN ARRAY ARRAY['growth_acquisition','growth_partenariats','product_mvps'] LOOP
    EXECUTE format('ALTER TABLE workspace_data.%I ENABLE ROW LEVEL SECURITY', v_table);
    EXECUTE format('REVOKE ALL ON TABLE workspace_data.%I FROM PUBLIC, anon', v_table);
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE workspace_data.%I TO authenticated', v_table);
    EXECUTE format('CREATE INDEX IF NOT EXISTS %I ON workspace_data.%I (organization_id, workspace_id, created_at DESC)', v_table || '_workspace_created_idx', v_table);
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
