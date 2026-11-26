CREATE INDEX IF NOT EXISTS growth_acquisition_created_by_idx ON workspace_data.growth_acquisition (created_by_user_id);
CREATE INDEX IF NOT EXISTS growth_partenariats_created_by_idx ON workspace_data.growth_partenariats (created_by_user_id);
CREATE INDEX IF NOT EXISTS product_mvps_created_by_idx ON workspace_data.product_mvps (created_by_user_id);
