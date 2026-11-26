// Marketplace Agent Directory — canonical identity + workspace delegation.
// Runtime telemetry is shown only when a real ingestion source is available.
import { useEffect, useState } from 'react';
import { agentsRepo } from '../data/agents.repo';
import type { Agent } from '../lib/types';
import { AGENT_ROLE_LABEL, AGENT_STATUS_LABEL } from '../lib/statusLabels';
import { EmptyState } from '../components/EmptyState';

export const AgentRootView = (): React.ReactElement => {
  const [agents, setAgents] = useState<Agent[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [revision, setRevision] = useState(0);
  const [creating, setCreating] = useState(false);
  const [agentKey, setAgentKey] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [agentClass, setAgentClass] = useState('SPECIALIST');
  const [runtime, setRuntime] = useState('');
  const [permissionCodes, setPermissionCodes] = useState('');

  useEffect(() => {
    let cancelled = false;
    setError(null);
    agentsRepo.list()
      .then((rows) => { if (!cancelled) setAgents(rows); })
      .catch((reason: unknown) => {
        if (!cancelled) setError(reason instanceof Error ? reason.message : 'Failed to load agents');
      });
    return () => { cancelled = true; };
  }, [revision]);

  const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const codes = permissionCodes.split(',').map((code) => code.trim()).filter(Boolean);
    if (!codes.length) {
      setError('At least one approved permission code is required.');
      return;
    }
    try {
      setError(null);
      await agentsRepo.register({ agentKey, displayName, agentClass, runtime, permissionCodes: codes });
      setAgentKey('');
      setDisplayName('');
      setRuntime('');
      setPermissionCodes('');
      setCreating(false);
      setAgents(null);
      setRevision((value) => value + 1);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to register agent');
    }
  };

  const handleRevoke = async (agent: Agent) => {
    if (!agent.delegationId) {
      setError('This agent record has no active workspace delegation to revoke.');
      return;
    }
    if (!window.confirm(`Remove ${agent.name} from this workspace? The canonical agent identity will remain in the organization registry.`)) return;
    try {
      setError(null);
      await agentsRepo.revoke(agent.delegationId);
      setAgents(null);
      setRevision((value) => value + 1);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to revoke delegation');
    }
  };

  if (agents === null && !error) {
    return <div className="space-y-4 animate-pulse" role="status" aria-label="Loading agents">
      <div className="h-8 w-1/3 rounded bg-stone-200" />
      <div className="h-32 rounded-2xl bg-stone-100" />
    </div>;
  }

  return <div className="space-y-6">
    <header className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="font-mono text-xs uppercase tracking-widest text-stone-500">Marketplace · People & Agents</p>
        <h1 className="mt-2 text-3xl font-semibold text-ink">Agent directory</h1>
        <p className="mt-2 text-sm text-stone-600">Canonical agent principals with explicit workspace delegations. Runtime telemetry remains unavailable until an ingestion source is connected.</p>
      </div>
      <button type="button" onClick={() => setCreating((value) => !value)} className="rounded-xl bg-stone-900 px-4 py-2.5 text-sm font-semibold text-white">
        {creating ? 'Cancel' : 'Register agent'}
      </button>
    </header>

    {error && <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700" role="alert">{error}</div>}

    {creating && <form onSubmit={handleCreate} className="grid gap-3 rounded-2xl border border-stone-200 bg-white p-5 md:grid-cols-2">
      <label className="grid gap-1 text-sm">Agent key
        <input required minLength={2} maxLength={96} value={agentKey} onChange={(event) => setAgentKey(event.target.value)} placeholder="AGENT.SPECIALIST.01" className="rounded-lg border border-stone-300 px-3 py-2" />
      </label>
      <label className="grid gap-1 text-sm">Display name
        <input required maxLength={160} value={displayName} onChange={(event) => setDisplayName(event.target.value)} placeholder="Agent display name" className="rounded-lg border border-stone-300 px-3 py-2" />
      </label>
      <label className="grid gap-1 text-sm">Agent class
        <select value={agentClass} onChange={(event) => setAgentClass(event.target.value)} className="rounded-lg border border-stone-300 px-3 py-2">
          {['GOVERNANCE','ORCHESTRATOR','AREA_OWNER','DEPARTMENT_OWNER','MANAGER','TECHNICIAN','SPECIALIST'].map((value) => <option key={value} value={value}>{value}</option>)}
        </select>
      </label>
      <label className="grid gap-1 text-sm">Runtime
        <input required maxLength={120} value={runtime} onChange={(event) => setRuntime(event.target.value)} placeholder="Runtime adapter / execution environment" className="rounded-lg border border-stone-300 px-3 py-2" />
      </label>
      <label className="grid gap-1 text-sm md:col-span-2">Approved permission codes
        <input required value={permissionCodes} onChange={(event) => setPermissionCodes(event.target.value)} placeholder="Paste approved codes, separated by commas" className="rounded-lg border border-stone-300 px-3 py-2" />
        <span className="text-xs text-stone-500">These codes become an explicit workspace-scoped delegation. The API rejects empty, duplicate or malformed codes.</span>
      </label>
      <div className="md:col-span-2 flex justify-end">
        <button type="submit" className="rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white">Create principal + workspace delegation</button>
      </div>
    </form>}

    {agents && agents.length === 0 ? <EmptyState title="No agents assigned" description="Register a canonical principal and delegate it to this workspace to make it appear here. No sample agents are inserted." /> : null}
    {agents && agents.length > 0 && <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3" aria-label="Workspace agent assignments">
      {agents.map((agent) => {
        const status = agent.status ?? 'paused';
        return <article key={agent.id} className="rounded-2xl border border-stone-200 bg-white p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="truncate text-lg font-semibold text-ink">{agent.name}</h2>
              <p className="mt-1 text-xs uppercase tracking-wide text-stone-500">{agent.agentClass ?? (agent.role ? AGENT_ROLE_LABEL[agent.role] : 'Role not assigned')}</p>
              <p className="mt-2 truncate font-mono text-xs text-stone-500">{agent.agentKey}</p>
            </div>
            <span className="rounded-full bg-stone-100 px-2.5 py-1 text-xs text-stone-700">{AGENT_STATUS_LABEL[status] ?? status}</span>
          </div>
          <dl className="mt-5 grid grid-cols-2 gap-3 border-t border-stone-100 pt-4 text-xs">
            <div><dt className="text-stone-500">Runtime</dt><dd className="mt-1 font-medium text-stone-800">{agent.runtime || 'Not configured'}</dd></div>
            <div><dt className="text-stone-500">Permissions</dt><dd className="mt-1 font-medium text-stone-800">{agent.permissionCodes?.length ?? 0} delegated</dd></div>
            <div><dt className="text-stone-500">Runtime state</dt><dd className="mt-1 font-medium text-stone-800">Not reported</dd></div>
            <div><dt className="text-stone-500">Telemetry</dt><dd className="mt-1 font-medium text-stone-800">Unavailable</dd></div>
          </dl>
          <button type="button" onClick={() => void handleRevoke(agent)} className="mt-4 w-full rounded-lg border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50">Revoke workspace assignment</button>
        </article>;
      })}
    </section>}
  </div>;
};

export default AgentRootView;
