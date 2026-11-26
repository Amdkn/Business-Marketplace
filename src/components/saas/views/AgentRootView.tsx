// Marketplace Agent Directory — tenant-scoped records only.
// Runtime telemetry is deliberately absent until a real ingest source exists.
// Never derive load, success, latency, tokens, task counts, or model routing from status.

import { useEffect, useState } from 'react';
import { agentsRepo } from '../data/agents.repo';
import type { Agent } from '../lib/types';
import { AGENT_ROLE_LABEL, AGENT_STATUS_LABEL } from '../lib/statusLabels';
import { EmptyState } from '../components/EmptyState';

export const AgentRootView = (): React.ReactElement => {
  const [agents, setAgents] = useState<Agent[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    agentsRepo.list()
      .then((rows) => { if (!cancelled) setAgents(rows); })
      .catch((reason: unknown) => {
        if (!cancelled) setError(reason instanceof Error ? reason.message : 'Failed to load agents');
      });
    return () => { cancelled = true; };
  }, []);

  if (error) {
    return <div className="p-6 rounded-xl border border-rose-200 bg-rose-50 text-rose-700" role="alert">
      <p className="font-semibold">Unable to load the agent directory</p>
      <p className="mt-1 text-sm">{error}</p>
    </div>;
  }

  if (agents === null) {
    return <div className="space-y-4 animate-pulse" role="status" aria-label="Loading agents">
      <div className="h-8 w-1/3 rounded bg-stone-200" />
      <div className="h-32 rounded-2xl bg-stone-100" />
    </div>;
  }

  if (agents.length === 0) {
    return <div className="space-y-5">
      <header>
        <p className="font-mono text-xs uppercase tracking-widest text-stone-500">Marketplace · People & Agents</p>
        <h1 className="mt-2 text-3xl font-semibold text-ink">Agent directory</h1>
        <p className="mt-2 text-sm text-stone-600">No agent principals are assigned to this workspace yet.</p>
      </header>
      <EmptyState title="No agents configured" description="Create or assign an agent through the governed identity and delegation workflow. Runtime metrics will appear only after a telemetry source is connected." />
    </div>;
  }

  return <div className="space-y-6">
    <header>
      <p className="font-mono text-xs uppercase tracking-widest text-stone-500">Marketplace · People & Agents</p>
      <h1 className="mt-2 text-3xl font-semibold text-ink">Agent directory</h1>
      <p className="mt-2 text-sm text-stone-600">{agents.length} tenant record{agents.length === 1 ? '' : 's'} · runtime telemetry unavailable until ingestion is configured.</p>
    </header>
    <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3" aria-label="Tenant agent records">
      {agents.map((agent) => {
        const status = agent.status ?? 'paused';
        return <article key={agent.id} className="rounded-2xl border border-stone-200 bg-white p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="truncate text-lg font-semibold text-ink">{agent.name}</h2>
              <p className="mt-1 text-xs uppercase tracking-wide text-stone-500">{agent.role ? AGENT_ROLE_LABEL[agent.role] : 'Role not assigned'}</p>
              {agent.email && <p className="mt-2 truncate font-mono text-xs text-stone-500">{agent.email}</p>}
            </div>
            <span className="rounded-full bg-stone-100 px-2.5 py-1 text-xs text-stone-700">{AGENT_STATUS_LABEL[status] ?? status}</span>
          </div>
          <dl className="mt-5 grid grid-cols-2 gap-3 border-t border-stone-100 pt-4 text-xs">
            <div><dt className="text-stone-500">Runtime state</dt><dd className="mt-1 font-medium text-stone-800">Not reported</dd></div>
            <div><dt className="text-stone-500">Current task</dt><dd className="mt-1 font-medium text-stone-800">Not reported</dd></div>
            <div><dt className="text-stone-500">Model</dt><dd className="mt-1 font-medium text-stone-800">Not configured</dd></div>
            <div><dt className="text-stone-500">Telemetry</dt><dd className="mt-1 font-medium text-stone-800">Unavailable</dd></div>
          </dl>
        </article>;
      })}
    </section>
  </div>;
};

export default AgentRootView;
