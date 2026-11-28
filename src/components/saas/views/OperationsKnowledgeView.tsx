// Operations & Knowledge — shared read models for workspace SOPs and documents.
// Creation is delegated to the canonical SOP Library; this page is a cross-domain index.

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { sopsRepo } from '../data/sops.repo';
import { documentsRepo } from '../data/documents.repo';
import type { Sop, Document } from '../lib/types';
import { SOP_STATUS_LABEL } from '../lib/statusLabels';
import { BookOpen, FileText, Plus, ExternalLink } from 'lucide-react';
import { BackButton } from '../components/BackButton';
import { EmptyState } from '../components/EmptyState';
import { formatDate, safeArray } from '../lib/safe';

export const OperationsKnowledgeView: React.FC = () => {
  const [sops, setSops] = useState<Sop[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([sopsRepo.list(), documentsRepo.list()])
      .then(([sopRows, documentRows]) => {
        if (cancelled) return;
        setSops(safeArray<Sop>(sopRows));
        setDocuments(safeArray<Document>(documentRows));
      })
      .catch((reason) => {
        if (!cancelled) setError(reason instanceof Error ? reason.message : 'Unable to load workspace knowledge.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return <div className="space-y-4 animate-pulse" role="status" aria-label="Loading workspace knowledge"><div className="h-8 bg-stone-200 rounded w-1/3" /><div className="h-32 bg-stone-100 rounded" /></div>;
  }

  if (error) {
    return <div className="p-6 bg-rose-50 border border-rose-200 rounded-lg text-rose-700" role="alert">Unable to load workspace knowledge: {error}</div>;
  }

  const sopList = safeArray<Sop>(sops);
  const documentList = safeArray<Document>(documents);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <BackButton />
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">Operations & Knowledge</h1>
          <p className="text-slate-500 text-sm mt-1">Workspace index · {sopList.length} SOPs · {documentList.length} document records</p>
        </div>
        <Link to="/sop" className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors shadow-sm">
          <Plus className="w-4 h-4" /> New Procedure
        </Link>
      </div>

      <section className="space-y-4">
        <h2 className="text-lg font-medium text-slate-900 flex items-center gap-2"><BookOpen className="w-5 h-5 text-emerald-600" /> Standard Operating Procedures</h2>
        {sopList.length === 0 ? (
          <EmptyState title="No SOPs yet" description="The workspace procedure library is empty." />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sopList.map((sop) => {
              const status = sop.status ?? 'draft';
              return (
                <Card key={sop.id} className="p-5 hover:border-emerald-200 transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-600 shrink-0"><BookOpen className="w-5 h-5" /></div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-slate-900 truncate">{sop.title || '(untitled)'}</h3>
                        {sop.category && <p className="text-xs text-slate-500 mt-0.5">{sop.category}</p>}
                      </div>
                    </div>
                    <Badge variant={status === 'published' ? 'success' : 'warning'}>{SOP_STATUS_LABEL[status]}</Badge>
                  </div>
                  <div className="flex items-center gap-2 pt-3 border-t border-stone-100">
                    <Link to="/sop" className="flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700 font-medium">Open <ExternalLink className="w-3 h-3" /></Link>
                    <span className="ml-auto text-[10px] text-slate-400 font-mono">{sop.id ? `${sop.id.slice(0, 8)}…` : '—'}</span>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-medium text-slate-900 flex items-center gap-2"><FileText className="w-5 h-5 text-emerald-600" /> Documents & Artefacts</h2>
          <Link to="/documents" className="text-xs font-semibold text-emerald-700 hover:text-emerald-800">Open Document Vault</Link>
        </div>
        {documentList.length === 0 ? (
          <EmptyState title="No document records" description="The workspace document registry is empty. File upload and download remain unavailable until private storage is configured." />
        ) : (
          <Card className="divide-y divide-stone-100">
            {documentList.map((document) => (
              <div key={document.id} className="px-5 py-4 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{document.title}</p>
                  <p className="text-xs text-slate-500 mt-1">{document.clientId ? `Client ${document.clientId}` : 'Workspace document'} · {formatDate(document.createdAt)}</p>
                </div>
                <Badge variant="default">{document.fileUrl ? 'File reference' : 'Metadata only'}</Badge>
              </div>
            ))}
          </Card>
        )}
      </section>
    </div>
  );
};

export default OperationsKnowledgeView;
