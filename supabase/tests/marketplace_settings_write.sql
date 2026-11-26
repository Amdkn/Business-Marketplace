-- Rollback-only persistence contract test for authenticated Settings API targets.
BEGIN;

DO $$
DECLARE
  v_user_id uuid;
  v_organization_id uuid;
  v_old_display_name text;
  v_old_organization_name text;
  v_test_display_name text;
  v_test_organization_name text;
  v_saved_display_name text;
  v_saved_organization_name text;
BEGIN
  SELECT u.id, m.organization_id
  INTO v_user_id, v_organization_id
  FROM auth.users u
  JOIN identity.organization_memberships m ON m.user_id = u.id
  WHERE m.membership_status = 'ACTIVE'
  ORDER BY m.created_at
  LIMIT 1;

  IF v_user_id IS NULL OR v_organization_id IS NULL THEN
    RAISE EXCEPTION 'An active identity/organization fixture is required';
  END IF;

  SELECT display_name INTO v_old_display_name
  FROM identity.profiles WHERE id = v_user_id;
  SELECT name INTO v_old_organization_name
  FROM identity.organizations WHERE id = v_organization_id;

  v_test_display_name := COALESCE(NULLIF(v_old_display_name, ''), 'Marketplace Profile') || ' rollback-test';
  v_test_organization_name := v_old_organization_name || ' rollback-test';

  INSERT INTO identity.profiles (id, display_name)
  VALUES (v_user_id, v_test_display_name)
  ON CONFLICT (id) DO UPDATE SET display_name = EXCLUDED.display_name;

  UPDATE identity.organizations
  SET name = v_test_organization_name
  WHERE id = v_organization_id;

  SELECT p.display_name, o.name
  INTO v_saved_display_name, v_saved_organization_name
  FROM identity.profiles p
  CROSS JOIN identity.organizations o
  WHERE p.id = v_user_id AND o.id = v_organization_id;

  IF v_saved_display_name <> v_test_display_name OR v_saved_organization_name <> v_test_organization_name THEN
    RAISE EXCEPTION 'Settings persistence write/read round-trip failed';
  END IF;
END;
$$;

ROLLBACK;
