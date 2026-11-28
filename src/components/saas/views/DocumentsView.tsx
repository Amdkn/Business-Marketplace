// Workspace document vault — strict metadata writes + private Supabase Storage.
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Card } from '../components/Card';
import { Modal } from '../components/Modal';
import { documentsRepo } from '../data/documents.repo';
import { uploadWorkspaceDocument, createWorkspaceDocumentSignedUrl, removeWorkspaceDocument } from '../data/document-storage';
import type { Document } from '../lib/types';
import { FileText, Search, Eye, Download, Upload, ExternalLink } from 'lucide-react';
import { BackButton } from '../components/BackButton';
import { EmptyState } from '../components/EmptyState';
import { formatDate, safeArray, safeStr } from '../lib/safe';

export const DocumentsView: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [signing, setSigning] = useState(false);
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [viewTarget, setViewTarget] = useState<Document | null>(null);

  const load = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const rows = await documentsRepo.list();
      setDocuments(safeArray<Document>(rows));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Failed to load documents');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const input = event.currentTarget;
    const file = input.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError(null);
    const documentId = crypto.randomUUID();
    let storagePath: string | null = null;
    try {
      storagePath = await uploadWorkspaceDocument(file, documentId);
      await documentsRepo.create({
        id: documentId,
        clientId: '',
        title: file.name,
        fileUrl: storagePath,
        mimeType: file.type,
        uploadedBy: null,
      });
      await load();
    } catch (reason) {
      if (storagePath) {
        try { await removeWorkspaceDocument(storagePath); } catch { /* preserve original failure */ }
      }
      setUploadError(reason instanceof Error ? reason.message : 'Document upload failed.');
    } finally {
      setUploading(false);
      input.value = '';
    }
  };

  const handleSignedLink = async (): Promise<void> => {
    if (!viewTarget?.fileUrl) return;
    setSigning(true);
    setError(null);
    setSignedUrl(null);
    try {
      setSignedUrl(await createWorkspaceDocumentSignedUrl(viewTarget.fileUrl));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to create a secure file link.');
    } finally {
      setSigning(false);
    }
  };

  const list = useMemo(() => {
    const q = search.trim().toLowerCase();
    const rows = safeArray<Document>(documents);
    if (!q) return rows;
    return rows.filter((document) => safeStr(document.title).toLowerCase().includes(q));
  }, [documents, search]);

  if (loading) {
    return <div className="space-y-4 animate-pulse" role="status" aria-label="Loading documents"><div className="h-8 bg-stone-200 rounded w-1/3" /><div className="h-32 bg-stone-100 rounded" /></div>;
  }
  if (error && documents.length === 0) {
    return <div className="p-6 bg-rose-50 border border-rose-200 rounded-lg text-rose-700" role="alert"><p className="font-semibold">Error loading documents</p><p className="text-sm mt-1">{error}</p><button type="button" onClick={() => void load()} className="text-sm underline mt-2">Retry</button></div>;
  }

  const allDocs = safeArray<Document>(documents);
  const linkedClientCount = new Set(allDocs.map((document) => document.clientId).filter(Boolean)).size;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <BackButton />
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Document Vault</h1>
          <p className="text-slate-500 text-sm mt-1">Private workspace files and client-linked documents</p>
        </div>
        <label className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition-colors ${uploading ? 'bg-stone-100 text-slate-400 cursor-wait' : 'bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer'}`}>
          <Upload className="w-4 h-4" /> {uploading ? 'Uploading…' : 'Upload document'}
          <input type="file" accept=".pdf,.docx,.xlsx,.pptx,.png,.jpg,.jpeg,.txt,.csv,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.openxmlformats-officedocument.presentationml.presentation,image/jpeg,image/png,text/plain,text/csv" className="sr-only" disabled={uploading} onChange={(event) => void handleUpload(event)} />
        </label>
      </div>

      {(error || uploadError) && <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-sm" role="alert">{error || uploadError}</div>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5"><p className="text-sm font-medium text-slate-500">Total Documents</p><h3 className="text-2xl font-bold text-slate-900 mt-1">{allDocs.length}</h3><p className="text-xs font-medium text-slate-400 mt-2">workspace records</p></Card>
        <Card className="p-5"><p className="text-sm font-medium text-slate-500">Linked Clients</p><h3 className="text-2xl font-bold text-slate-900 mt-1">{linkedClientCount}</h3><p className="text-xs font-medium text-slate-400 mt-2">distinct client IDs</p></Card>
        <Card className="p-5"><p className="text-sm font-medium text-slate-500">File Types</p><h3 className="text-2xl font-bold text-slate-900 mt-1">{new Set(allDocs.map((document) => document.mimeType || 'unknown')).size}</h3><p className="text-xs font-medium text-slate-400 mt-2">distinct MIME types</p></Card>
      </div>

      <Card>
        <div className="p-4 border-b border-stone-200">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search documents by title..." className="w-full pl-9 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" />
          </div>
        </div>

        {list.length === 0 ? (
          <EmptyState title={documents.length === 0 ? 'No documents yet' : 'No documents match your search'} description={documents.length === 0 ? 'Upload a private workspace document to create its metadata record and secure storage object.' : 'Try a different search term.'} />
        ) : (
          <div className="divide-y divide-stone-100">
            {list.map((document) => (
              <div key={document.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-stone-50 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-blue-50 text-blue-600 border border-blue-100"><FileText className="w-6 h-6" /></div>
                  <div>
                    <h4 className="font-semibold text-slate-900">{document.title}</h4>
                    <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-slate-500">
                      <span className="font-mono text-xs">client: {document.clientId ? `${document.clientId.slice(0, 8)}…` : 'workspace'}</span>
                      <span>{document.mimeType || 'unknown type'}</span>
                      <span className="font-mono text-xs">{formatDate(document.createdAt)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-4 md:mt-0 md:justify-end">
                  <button type="button" onClick={() => { setViewTarget(document); setSignedUrl(null); }} className="px-3 py-1.5 flex items-center gap-2 text-sm font-medium text-slate-600 bg-white border border-stone-200 rounded hover:bg-stone-50 transition-colors"><Eye className="w-4 h-4" /> Details</button>
                  <button type="button" onClick={() => { setViewTarget(document); setSignedUrl(null); }} disabled={!document.fileUrl} title={document.fileUrl ? 'Open details and generate a secure download link.' : 'No file object is attached.'} className="px-3 py-1.5 flex items-center gap-2 text-sm font-medium text-emerald-700 bg-emerald-50 border border-emerald-100 rounded hover:bg-emerald-100 disabled:text-slate-400 disabled:bg-stone-50 disabled:cursor-not-allowed"><Download className="w-4 h-4" /> Download</button>
                  <button type="button" disabled title="No e-sign provider is connected; no signature request can be sent." className="px-3 py-1.5 text-sm font-medium text-slate-400 bg-stone-50 rounded cursor-not-allowed">E-sign unavailable</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Modal
        open={viewTarget !== null}
        onClose={() => { setViewTarget(null); setSignedUrl(null); }}
        title={viewTarget?.title ?? 'Document'}
        size="md"
        footer={
          <div className="flex items-center justify-between gap-3 w-full">
            {signedUrl ? <a href={signedUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm font-semibold text-emerald-700 hover:underline"><ExternalLink className="w-4 h-4" /> Open secure file</a> : <button type="button" onClick={() => void handleSignedLink()} disabled={!viewTarget?.fileUrl || signing} className="px-4 py-2 rounded-lg border border-stone-200 text-sm font-medium text-slate-700 disabled:text-slate-400 disabled:cursor-not-allowed">{signing ? 'Preparing link…' : 'Generate secure link'}</button>}
            <button type="button" onClick={() => { setViewTarget(null); setSignedUrl(null); }} className="bg-emerald-600 text-white hover:bg-emerald-700 px-4 py-2 rounded-lg text-sm font-medium">Close</button>
          </div>
        }
      >
        {viewTarget && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><p className="text-xs text-slate-500 font-semibold uppercase">Client ID</p><p className="text-slate-800 font-mono text-xs mt-1 break-all">{viewTarget.clientId || 'Workspace document'}</p></div>
              <div><p className="text-xs text-slate-500 font-semibold uppercase">MIME Type</p><p className="text-slate-800 font-medium mt-1">{viewTarget.mimeType}</p></div>
              <div><p className="text-xs text-slate-500 font-semibold uppercase">Created</p><p className="text-slate-800 font-medium mt-1">{formatDate(viewTarget.createdAt)}</p></div>
              <div><p className="text-xs text-slate-500 font-semibold uppercase">Storage</p><p className="text-slate-800 font-medium mt-1">{viewTarget.fileUrl ? 'Private workspace bucket' : 'Metadata only'}</p></div>
            </div>
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-sm text-emerald-800">Files remain private. Secure links expire after five minutes and are scoped to the active workspace.</div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default DocumentsView;
