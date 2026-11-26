import React, { useEffect, useState } from 'react';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { Cpu } from 'lucide-react';
import { BackButton } from '../components/BackButton';
import { EmptyState } from '../components/EmptyState';
import { agentsRepo } from '../data/agents.repo';
import type { Agent } from '../lib/types';

export const PeopleAgentsView: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    agentsRepo.list()
      .then(setAgents)
      .catch((e) => setError(e instanceof Error ? e.message : 'Unable to load delegated agents'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="space-y-4 animate-pulse" role="status" aria-label="Loading">
      <div className="h-8 bg-stone-200 rounded w-1/3" />
      <div className="h-32 bg-stone-100 rounded" />
    </div>;
  }

  if (error) {
    return <div className="p-6 bg-rose-50 border border-rose-200 rounded-lg text-rose-700" role="alert">
      <p className="font-semibold">Unable to load AI agents</p>
      <p className="text-sm mt-1">{error}</p>
    </div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <BackButton />
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">AI Agent Network</h1>
          <p className="text-slate-500 text-sm mt-1">Canonical agent principals with active delegation to this workspace.</p>
        </div>
        <Badge variant="default">{agents.length} agents</Badge>
      </div>
      {agents.length === 0 ? (
        <EmptyState title="No delegated agents yet" description="The workspace has no active agent principals delegated to it. Register an agent through the Marketplace agent registry to make it available here." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {agents.map((agent) => (
            <Card key={agent.id} className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <Cpu className="w-4 h-4 text-emerald-600 shrink-0" />
                  <h3 className="font-semibold text-slate-900 truncate">{agent.name}</h3>
                </div>
                <Badge variant={agent.status === 'active' ? 'success' : 'warning'}>{agent.status}</Badge>
              </div>
              <p className="text-xs text-slate-500 mt-2">{agent.agentClass || 'Agent'} · {agent.runtime || 'Runtime unspecified'}</p>
              <p className="text-[11px] text-slate-400 font-mono mt-1">{agent.agentKey}</p>
              <div className="flex flex-wrap gap-1.5 mt-4">
                {(agent.permissionCodes ?? []).map((permission) => (
                  <span key={permission} className="text-[10px] px-2 py-1 rounded bg-stone-100 text-slate-600 border border-stone-200">{permission}</span>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default PeopleAgentsView;
