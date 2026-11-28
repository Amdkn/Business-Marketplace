CREATE INDEX IF NOT EXISTS growth_acquisition_workspace_org_idx ON workspace_data.growth_acquisition (workspace_id, organization_id);
CREATE INDEX IF NOT EXISTS growth_partenariats_workspace_org_idx ON workspace_data.growth_partenariats (workspace_id, organization_id);
CREATE INDEX IF NOT EXISTS product_mvps_workspace_org_idx ON workspace_data.product_mvps (workspace_id, organization_id);
