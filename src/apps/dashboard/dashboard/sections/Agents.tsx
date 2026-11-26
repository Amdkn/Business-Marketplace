import { useEffect, useState } from 'react';
import { Bot, ShieldCheck } from 'lucide-react';
import { SectionTitle, Panel, Pill } from '../Primitives';
import { listWorkspaceAgents, type WorkspaceAgent } from '../../../people/people.repo';
import { useShellStore } from '../../../../stores/shell.store';

export function Agents() {
  const [agents, setAgents] = useState<WorkspaceAgent[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const openApp = useShellStore((state) => state.openApp);

  useEffect(() => {
    let cancelled = false;
    listWorkspaceAgents()
      .then((rows) => { if (!cancelled) setAgents(rows); })
      .catch((reason: unknown) => { if (!cancelled) setError(reason instanceof Error ? reason.message : 'Unable to load workspace agents'); });
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="flex flex-col gap-5 p-7">
      <SectionTitle eyebrow="Core" title="Agents" subtitle="Canonical agent principals with active workspace delegations. Runtime telemetry is not inferred from identity status."
        action={<Pill tone="neutral">{agents?.length ?? '—'} assigned</Pill>} />
      {error && <Panel pad="p-4"><p className="text-sm" style={{ color: '#dc2626' }} role="alert">{error}</p></Panel>}
      {agents === null && !error && <Panel pad="p-6"><p className="text-sm" style={{ color: 'var(--theme-text-muted)' }} role="status">Loading canonical workspace assignments…</p></Panel>}
      {agents && agents.length === 0 && <Panel pad="p-8" className="flex flex-col items-center gap-3 text-center">
        <Bot className="h-8 w-8" style={{ color: 'var(--theme-text-muted)' }} />
        <div className="text-sm font-semibold" style={{ color: 'var(--theme-text)' }}>No delegated agents</div>
        <p className="max-w-md text-xs leading-relaxed" style={{ color: 'var(--theme-text-muted)' }}>Register a canonical principal and assign it to this workspace from People → Agents. No dashboard seed agents are inserted into real tenants.</p>
        <button type="button" onClick={() => openApp('people', 'agents')} className="rounded-lg px-3 py-2 text-xs font-semibold" style={{ background: 'var(--theme-surface-hover)', color: 'var(--theme-text)' }}>Open People → Agents</button>
      </Panel>}
      {agents && agents.length > 0 && <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        {agents.map((agent) => <Panel key={agent.id} pad="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="truncate text-sm font-bold" style={{ color: 'var(--theme-text)' }}>{agent.displayName}</div>
              <div className="mt-1 truncate font-mono text-[10px]" style={{ color: 'var(--theme-text-dim)' }}>{agent.agentKey}</div>
            </div>
            <Pill tone={agent.principalStatus === 'ACTIVE' ? 'ok' : 'warn'}>{agent.principalStatus}</Pill>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 border-t pt-3 text-[11px]" style={{ borderColor: 'var(--panel-border-subtle)' }}>
            <div><div style={{ color: 'var(--theme-text-dim)' }}>Class</div><div className="mt-1 font-semibold" style={{ color: 'var(--theme-text)' }}>{agent.agentClass}</div></div>
            <div><div style={{ color: 'var(--theme-text-dim)' }}>Runtime</div><div className="mt-1 font-semibold" style={{ color: 'var(--theme-text)' }}>{agent.runtime}</div></div>
            <div><div style={{ color: 'var(--theme-text-dim)' }}>Delegated permissions</div><div className="mt-1 font-semibold" style={{ color: 'var(--theme-text)' }}>{agent.permissionCodes.length}</div></div>
            <div><div style={{ color: 'var(--theme-text-dim)' }}>Execution</div><div className="mt-1 font-semibold" style={{ color: 'var(--theme-text)' }}>Not reported</div></div>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-[10px]" style={{ color: 'var(--theme-text-muted)' }}><ShieldCheck className="h-3 w-3" /> Workspace delegation verified</div>
        </Panel>)}
      </div>}
    </div>
  );
}
