import React, { useCallback, useEffect, useState } from 'react';
import { Card } from '../components/Card';
import { ViewShell } from '../components/ViewShell';
import { Activity, Database, Server, ShieldCheck } from 'lucide-react';
import { supabase, SUPABASE_READY } from '../lib/supabase';

interface MarketplaceHealth {
  status: string;
  service: string;
  version: string;
  persistence: string;
  database?: {
    database_name?: string;
    checked_at?: string;
  };
}

export const ItDataView: React.FC = () => {
  const [health, setHealth] = useState<MarketplaceHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (): Promise<void> => {
    if (!SUPABASE_READY) {
      setError('Marketplace Supabase is not configured.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { data, error: invokeError } = await supabase.functions.invoke('marketplace-api', { method: 'GET' });
      if (invokeError) throw invokeError;
      if (!data || data.status !== 'ok') throw new Error('Marketplace API health endpoint did not return an OK status.');
      setHealth(data as MarketplaceHealth);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to verify Marketplace API health.');
      setHealth(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const checkedAt = health?.database?.checked_at
    ? new Date(health.database.checked_at).toLocaleString()
    : 'Not reported';

  return (
    <ViewShell
      title="IT & Infrastructure"
      subtitle="Live Marketplace API and database connectivity. Unmeasured telemetry is shown as unavailable."
      loading={loading}
      error={error}
      isEmpty={false}
      emptyTitle=""
      onRetry={() => void load()}
      actions={
        <span className={`flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-lg border ${
          health?.status === 'ok'
            ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
            : 'text-slate-500 bg-stone-50 border-stone-200'
        }`}>
          <span className={`h-2 w-2 rounded-full ${health?.status === 'ok' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
          {health?.status === 'ok' ? 'API reachable' : 'Status unavailable'}
        </span>
      }
    >
      {health && (
        <div className="space-y-8">
          <section>
            <h2 className="text-lg font-medium text-slate-900 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-600" /> Verified Connectivity
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700"><Server className="w-5 h-5" /></div>
                  <div>
                    <h3 className="font-semibold text-slate-900">Marketplace API</h3>
                    <p className="text-xs text-emerald-700">HTTP health check passed</p>
                  </div>
                </div>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between gap-4"><dt className="text-slate-500">Service</dt><dd className="font-mono text-slate-800">{health.service}</dd></div>
                  <div className="flex justify-between gap-4"><dt className="text-slate-500">API version</dt><dd className="font-mono text-slate-800">{health.version}</dd></div>
                  <div className="flex justify-between gap-4"><dt className="text-slate-500">Persistence</dt><dd className="text-slate-800">{health.persistence}</dd></div>
                </dl>
              </Card>
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 rounded-xl bg-blue-50 border border-blue-100 text-blue-700"><Database className="w-5 h-5" /></div>
                  <div>
                    <h3 className="font-semibold text-slate-900">Database connection</h3>
                    <p className="text-xs text-emerald-700">Server-side query passed</p>
                  </div>
                </div>
                <dl className="space-y-2 text-sm">
                  <div className="flex justify-between gap-4"><dt className="text-slate-500">Connection</dt><dd className="font-semibold text-emerald-700">Healthy</dd></div>
                  <div className="flex justify-between gap-4"><dt className="text-slate-500">Database</dt><dd className="font-mono text-slate-800">{health.database?.database_name ?? 'Connected'}</dd></div>
                  <div className="flex justify-between gap-4"><dt className="text-slate-500">Last checked</dt><dd className="text-slate-800 text-right">{checkedAt}</dd></div>
                </dl>
              </Card>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-medium text-slate-900 mb-4 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" /> Operational Telemetry
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-5">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Backup history</p>
                <p className="text-lg font-semibold text-slate-500 mt-2">Not exposed</p>
                <p className="text-xs text-slate-500 mt-2">No verified backup timestamp is available through this health endpoint.</p>
              </Card>
              <Card className="p-5">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Database size</p>
                <p className="text-lg font-semibold text-slate-500 mt-2">Not reported</p>
                <p className="text-xs text-slate-500 mt-2">Storage metrics require a separate platform telemetry source.</p>
              </Card>
              <Card className="p-5">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">API request volume</p>
                <p className="text-lg font-semibold text-slate-500 mt-2">Not measured</p>
                <p className="text-xs text-slate-500 mt-2">No request counter or observability ingestion is connected to this view.</p>
              </Card>
            </div>
          </section>
        </div>
      )}
    </ViewShell>
  );
};

export default ItDataView;
