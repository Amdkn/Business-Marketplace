import { supabase, SUPABASE_READY } from '../lib/supabase';
import { getActiveOrgId, getActiveWorkspaceId } from '../lib/tenant';

const BUCKET = 'marketplace-documents';
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'image/jpeg',
  'image/png',
  'text/plain',
  'text/csv',
]);

function tenantPrefix(): string {
  if (!SUPABASE_READY) throw new Error('Marketplace Supabase is not configured.');
  const organizationId = getActiveOrgId();
  const workspaceId = getActiveWorkspaceId();
  if (!organizationId || !workspaceId) throw new Error('An active organization and workspace are required.');
  return `${organizationId}/${workspaceId}/`;
}

function assertTenantPath(path: string): void {
  if (!path.startsWith(tenantPrefix())) {
    throw new Error('Document path is outside the active workspace.');
  }
}

function safeFilename(name: string): string {
  const safe = name.normalize('NFKC').replace(/[^A-Za-z0-9._-]+/g, '_').replace(/^\.+/, '').slice(-120);
  return safe || 'document';
}

export async function uploadWorkspaceDocument(file: File, documentId: string): Promise<string> {
  const prefix = tenantPrefix();
  if (file.size <= 0 || file.size > MAX_FILE_SIZE) throw new Error('File size must be between 1 byte and 10 MB.');
  if (!ALLOWED_MIME_TYPES.has(file.type)) throw new Error('This file type is not allowed in the private document vault.');
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(documentId)) {
    throw new Error('A valid document identifier is required.');
  }
  const path = `${prefix}${documentId}/${safeFilename(file.name)}`;
  const { data, error } = await supabase.storage.from(BUCKET).upload(path, file, {
    upsert: false,
    contentType: file.type,
  });
  if (error) throw new Error(`[document storage] ${error.message}`);
  return data.path;
}

export async function createWorkspaceDocumentSignedUrl(path: string, expiresIn = 300): Promise<string> {
  assertTenantPath(path);
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, expiresIn);
  if (error) throw new Error(`[document storage] ${error.message}`);
  return data.signedUrl;
}

export async function removeWorkspaceDocument(path: string): Promise<void> {
  assertTenantPath(path);
  const { error } = await supabase.storage.from(BUCKET).remove([path]);
  if (error) throw new Error(`[document storage cleanup] ${error.message}`);
}
