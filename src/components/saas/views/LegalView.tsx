// src/components/views/LegalView.tsx
// Zero Bug Sprint — rewritten to fix double-mapping bug (D6 #100b).
//
// PREVIOUSLY: this view called legalDocsRepo.list() then re-normalized the
// already-mapped rows as raw snake_case (read row.created_at, row.file_url).
//
// NOW: use the mapped fields directly (LegalDoc.createdAt, LegalDoc.fileUrl).
// D6 #98: LegalDoc.status enum is the canonical Postgres values.

import React, { useCallback, useEffect, useState } from 'react';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { legalDocsRepo } from '../data/legal-docs.repo';
import type { LegalDoc } from '../lib/types';
import { LEGAL_STATUS_LABEL } from '../lib/statusLabels';
import { useOrg } from '../lib/tenant';
import { FileText, File, CheckCircle, Clock, FileEdit, Lock, Download, RefreshCw, Archive, RotateCcw, Upload } from 'lucide-react';
import { uploadWorkspaceDocument, createWorkspaceDocumentSignedUrl, removeWorkspaceDocument } from '../data/document-storage';
import { BackButton } from '../components/BackButton';
import { EmptyState } from '../components/EmptyState';
import { formatDate, safeArray } from '../lib/safe';

const statusVariant = (s: LegalDoc['status']): 'success' | 'warning' | 'default' => {
  if (s === 'Signed') return 'success';
  if (s === 'Pending') return 'warning';
  return 'default';
};

export const LegalView: React.FC = () => {
  const { isMissing } = useOrg();
  const [docs, setDocs] = useState<LegalDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [mutatingId, setMutatingId] = useState<string | null>(null);
  const [signingId, setSigningId] = useState<string | null>(null);
  const [signedUrls, setSignedUrls] = useState<Record<string, string>>({});

  const load = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const rows = await legalDocsRepo.list();
      setDocs(safeArray<LegalDoc>(rows));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Failed to load legal docs');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const input = event.currentTarget;
    const file = input.files?.[0];
    if (!file) return;
    setUploadError(null);
    setUploading(true);
    const documentId = crypto.randomUUID();
    let storagePath: string | null = null;
    try {
      if (file.type !== 'application/pdf' && file.type !== 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        throw new Error('Legal Data Room accepts PDF and DOCX files only.');
      }
      storagePath = await uploadWorkspaceDocument(file, documentId);
      await legalDocsRepo.create({
        id: documentId,
        title: file.name,
        type: file.type === 'application/pdf' ? 'PDF' : 'DOCX',
        category: 'Corporate',
        status: 'Draft',
        fileUrl: storagePath,
        notes: null,
      });
      await load();
    } catch (reason) {
      if (storagePath) {
        try { await removeWorkspaceDocument(storagePath); } catch { /* surface the original failure */ }
      }
      setUploadError(reason instanceof Error ? reason.message : 'Legal document upload failed.');
    } finally {
      setUploading(false);
      input.value = '';
    }
  };

  const handleArchive = async (doc: LegalDoc): Promise<void> => {
    setMutatingId(doc.id);
    setError(null);
    try {
      await legalDocsRepo.update(doc.id, { status: doc.status === 'Archived' ? 'Draft' : 'Archived' });
      await load();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to update archive status.');
    } finally {
      setMutatingId(null);
    }
  };

  const handleSignedLink = async (doc: LegalDoc): Promise<void> => {
    if (!doc.fileUrl) return;
    setSigningId(doc.id);
    setError(null);
    try {
      const url = await createWorkspaceDocumentSignedUrl(doc.fileUrl);
      setSignedUrls((current) => ({ ...current, [doc.id]: url }));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to create a secure file link.');
    } finally {
      setSigningId(null);
    }
  };



  const list = safeArray<LegalDoc>(docs);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <BackButton />

      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Legal Data Room</h1>
          <p className="text-slate-500 text-sm mt-1">Secure repository for contracts and compliance.</p>
        </div>
        <div className="flex items-center gap-3">
          {isMissing && (
            <span className="px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 text-xs font-medium">
              No orgId — tenant isolation inactive
            </span>
          )}
          <label className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium shadow-sm transition-colors ${uploading ? 'bg-stone-100 text-slate-400 cursor-wait' : 'bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer'}`}>
            <Upload className="w-4 h-4" /> {uploading ? 'Uploading…' : 'Upload Document'}
            <input type="file" accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document" className="sr-only" disabled={uploading} onChange={(event) => void handleUpload(event)} />
          </label>
          <button
            onClick={load}
            className="flex items-center gap-2 px-3 py-2 border border-stone-200 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-stone-50 transition-colors"
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700 text-xs font-bold shadow-sm">
            <Lock className="w-4 h-4" />
            <span>Workspace RLS active</span>
          </div>
        </div>
      </div>

      {(error || uploadError) && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg text-rose-700" role="alert">
          <p className="font-semibold">Legal Data Room</p>
          <p className="text-sm mt-1">{error || uploadError}</p>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-pulse">
          <div className="lg:col-span-2 h-64 bg-stone-50 rounded-lg" />
          <div className="lg:col-span-1 h-64 bg-stone-50 rounded-lg" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Card className="overflow-hidden">
              <div className="px-6 py-4 border-b border-stone-200 flex justify-between items-center bg-stone-50">
                <h3 className="font-semibold text-slate-700 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-slate-400" /> Documents
                </h3>
                <span className="text-xs text-slate-500 font-medium">{list.length} document records</span>
              </div>

              {list.length === 0 ? (
                <EmptyState
                  title="No legal documents yet"
                  description="No legal document records exist in this workspace. Upload remains unavailable until private file storage is configured."
                />
              ) : (
                <div className="divide-y divide-stone-100">
                  {list.map((doc) => (
                    <div
                      key={doc.id}
                      className="p-4 px-6 flex items-center justify-between group hover:bg-emerald-50/30 transition-colors"
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <div
                          className={`p-2 rounded-xl border shrink-0 ${
                            doc.type === 'PDF'
                              ? 'bg-red-50 border-red-100 text-red-500'
                              : 'bg-blue-50 border-blue-100 text-blue-500'
                          }`}
                        >
                          {doc.type === 'PDF' ? <FileText className="w-5 h-5" /> : <File className="w-5 h-5" />}
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-sm font-semibold text-slate-800 group-hover:text-emerald-800 transition-colors truncate">
                            {doc.title}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] px-2 py-0.5 rounded bg-stone-100 text-slate-500 border border-stone-200 uppercase tracking-wide font-medium">
                              {doc.category}
                            </span>
                            <span className="text-xs text-slate-400">{formatDate(doc.createdAt)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <Badge variant={statusVariant(doc.status)}>
                          {doc.status === 'Signed' && <CheckCircle className="w-3 h-3 mr-1.5" />}
                          {doc.status === 'Pending' && <Clock className="w-3 h-3 mr-1.5" />}
                          {doc.status === 'Draft' && <FileEdit className="w-3 h-3 mr-1.5" />}
                          {LEGAL_STATUS_LABEL[doc.status]}
                        </Badge>
                        <button
                          type="button"
                          onClick={() => void handleSignedLink(doc)}
                          disabled={!doc.fileUrl || signingId === doc.id}
                          title={doc.fileUrl ? 'Create a five-minute secure download link.' : 'No file is attached to this record.'}
                          className="text-slate-500 hover:text-emerald-700 p-1 disabled:text-slate-300 disabled:cursor-not-allowed"
                          aria-label={`Create secure download link for ${doc.title}`}
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleArchive(doc)}
                          disabled={mutatingId === doc.id}
                          title={doc.status === 'Archived' ? 'Restore this legal document to Draft.' : 'Archive this legal document.'}
                          className="text-slate-500 hover:text-emerald-700 p-1 disabled:text-slate-300"
                          aria-label={doc.status === 'Archived' ? `Restore ${doc.title}` : `Archive ${doc.title}`}
                        >
                          {doc.status === 'Archived' ? <RotateCcw className="w-4 h-4" /> : <Archive className="w-4 h-4" />}
                        </button>
                        {signedUrls[doc.id] && <a href={signedUrls[doc.id]} target="_blank" rel="noreferrer" className="text-xs font-semibold text-emerald-700 hover:underline">Open file</a>}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="bg-stone-50 p-3 border-t border-stone-100 text-center text-xs text-slate-500">
                Archived records remain visible here and can be restored from their row action.
              </div>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="p-6 flex flex-col items-center justify-center text-center relative overflow-hidden">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
                Compliance Assessment
              </h3>
              <div className="text-2xl font-semibold text-slate-500 mb-4">Not assessed</div>
              <p className="text-sm text-slate-500">No evidence inventory or compliance audit engine is connected. The workspace compliance status is unknown.</p>
              <button type="button" disabled title="No compliance audit engine is connected." className="mt-6 w-full py-2.5 bg-stone-100 border border-stone-200 text-slate-400 rounded-xl text-sm font-bold cursor-not-allowed">
                Audit unavailable
              </button>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default LegalView;
