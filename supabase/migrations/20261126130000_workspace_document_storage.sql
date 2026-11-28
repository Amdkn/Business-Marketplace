-- Private tenant-scoped document storage for Marketplace workspaces.
-- Object path: <organization UUID>/<workspace UUID>/<document UUID>/<filename>.

INSERT INTO storage.buckets (
  id, name, public, file_size_limit, allowed_mime_types
) VALUES (
  'marketplace-documents',
  'marketplace-documents',
  false,
  10485760,
  ARRAY[
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'image/jpeg',
    'image/png',
    'text/plain',
    'text/csv'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  public = false,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS marketplace_documents_read ON storage.objects;
CREATE POLICY marketplace_documents_read
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'marketplace-documents'
  AND CASE
    WHEN array_length(storage.foldername(name), 1) >= 3
      AND (storage.foldername(name))[1] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
      AND (storage.foldername(name))[2] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    THEN identity.is_active_workspace_member(
      ((storage.foldername(name))[1])::uuid,
      ((storage.foldername(name))[2])::uuid
    )
    ELSE false
  END
);

DROP POLICY IF EXISTS marketplace_documents_upload ON storage.objects;
CREATE POLICY marketplace_documents_upload
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'marketplace-documents'
  AND CASE
    WHEN array_length(storage.foldername(name), 1) >= 3
      AND (storage.foldername(name))[1] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
      AND (storage.foldername(name))[2] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    THEN identity.can_manage_workspace(
      ((storage.foldername(name))[1])::uuid,
      ((storage.foldername(name))[2])::uuid
    )
    ELSE false
  END
);

DROP POLICY IF EXISTS marketplace_documents_delete ON storage.objects;
CREATE POLICY marketplace_documents_delete
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'marketplace-documents'
  AND CASE
    WHEN array_length(storage.foldername(name), 1) >= 3
      AND (storage.foldername(name))[1] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
      AND (storage.foldername(name))[2] ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
    THEN identity.can_manage_workspace(
      ((storage.foldername(name))[1])::uuid,
      ((storage.foldername(name))[2])::uuid
    )
    ELSE false
  END
);

COMMENT ON POLICY marketplace_documents_read ON storage.objects
IS 'Private document objects are readable only by active members of the organization/workspace encoded in the object path.';
COMMENT ON POLICY marketplace_documents_upload ON storage.objects
IS 'Only workspace managers may upload objects into the private Marketplace document bucket.';
COMMENT ON POLICY marketplace_documents_delete ON storage.objects
IS 'Only workspace managers may delete objects from the private Marketplace document bucket.';
