import React, { useEffect, useMemo, useState } from 'react';
import { Hexagon, MessageSquare, Send } from 'lucide-react';
import { agentsRepo } from '../../data/agents.repo';
import type { Agent } from '../../lib/types';
import { EmptyState } from '../../components/EmptyState';
import { safeArray } from '../../lib/safe';

export const MissionChatView = (): React.ReactElement => {
  const [agents, setAgents] = useState<Agent[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeAgentId, setActiveAgentId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    agentsRepo.list()
      .then((rows) => {
        if (cancelled) return;
        setAgents(safeArray<Agent>(rows));
        setActiveAgentId((current) => current ?? rows[0]?.id ?? null);
      })
      .catch((reason: unknown) => {
        if (!cancelled) setError(reason instanceof Error ? reason.message : 'Unable to load the agent directory.');
      });
    return () => { cancelled = true; };
  }, []);

  const activeAgent = useMemo<Agent | null>(() => {
    if (!agents || !activeAgentId) return null;
    return safeArray<Agent>(agents).find((agent) => agent.id === activeAgentId) ?? null;
  }, [agents, activeAgentId]);

  if (error !== null) {
    return (
      <div className="p-6 bg-rose-50 border border-rose-200 rounded-lg text-rose-700" role="alert">
        <p className="font-semibold">Unable to load the agent directory</p>
        <p className="text-sm mt-1">{error}</p>
      </div>
    );
  }

  if (agents === null) {
    return <div className="space-y-4 animate-pulse" role="status"><div className="h-96 bg-stone-100 rounded-3xl" /></div>;
  }

  if (agents.length === 0) {
    return (
      <EmptyState
        title="No agents available"
        description="Register an agent principal before opening an agent workspace."
        icon={<MessageSquare className="size-10 text-her-muted" />}
      />
    );
  }

  return (
    <div className="space-y-5">
      <header>
        <div className="flex items-center gap-2 font-mono text-[10px] tracking-[0.22em] uppercase text-her-muted">
          <Hexagon className="size-3 text-ember" /> Agent directory
        </div>
        <h1 className="font-display leading-[0.95] tracking-tight mt-2 text-ink" style={{ fontSize: 'clamp(36px, 5vw, 60px)' }}>
          Chat<span className="text-ember">.</span>
        </h1>
      </header>

      <section className="grid grid-cols-12 gap-4 min-h-[520px]">
        <aside className="col-span-12 md:col-span-3 rounded-3xl bg-her-surface border border-her-border p-3 overflow-y-auto">
          <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-her-muted px-2 py-1">Registered agents · {agents.length}</div>
          <ul className="mt-1 space-y-1">
            {agents.map((agent) => {
              const initials = agent.name.split(/\s+/).map((part) => part[0] ?? '').slice(0, 2).join('').toUpperCase() || '??';
              const isActive = agent.id === activeAgentId;
              return (
                <li key={agent.id}>
                  <button
                    type="button"
                    onClick={() => setActiveAgentId(agent.id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-2xl text-left transition-colors ${
                      isActive ? 'bg-ink text-cream' : 'hover:bg-cream'
                    }`}
                  >
                    <span className={`size-8 rounded-lg grid place-items-center font-display italic text-[14px] ${isActive ? 'bg-cream/15 text-cream' : 'bg-ink text-cream'}`}>{initials}</span>
                    <div className="min-w-0 flex-1">
                      <div className={`font-sans text-[13px] truncate ${isActive ? 'text-cream' : 'text-ink'}`}>{agent.name}</div>
                      <div className={`font-mono text-[9px] uppercase tracking-wider ${isActive ? 'text-cream/65' : 'text-her-muted'}`}>{agent.role}</div>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </aside>

        <article className="col-span-12 md:col-span-9 rounded-3xl bg-ink text-cream border border-ink flex flex-col overflow-hidden">
          <header className="p-4 border-b border-cream/10 flex items-center gap-3">
            <span className="size-9 rounded-xl bg-cream/10 grid place-items-center font-display italic">
              {activeAgent ? activeAgent.name.slice(0, 2).toUpperCase() : '?'}
            </span>
            <div>
              <div className="font-display text-[18px]">{activeAgent?.name ?? '—'}</div>
              <div className="font-mono text-[10px] uppercase tracking-wider text-cream/65">
                {activeAgent?.role ?? 'idle'} · registered principal
              </div>
            </div>
          </header>

          <div className="flex-1 min-h-0 grid place-items-center px-6 py-10 text-center">
            <div className="max-w-lg">
              <MessageSquare className="size-9 text-ember mx-auto mb-4" />
              <h2 className="font-display text-2xl">Agent runtime unavailable</h2>
              <p className="font-sans text-sm text-cream/65 mt-3 leading-relaxed">
                The agent directory is connected, but no inference or execution runtime is attached to this chat surface.
                Messages are not sent, simulated, or stored.
              </p>
            </div>
          </div>

          <footer className="p-3 border-t border-cream/10">
            <div className="flex items-center gap-2 px-3 h-12 rounded-full bg-cream/8 border border-cream/15">
              <input
                type="text"
                disabled
                placeholder="Chat unavailable until an agent runtime is connected"
                aria-label="Agent chat unavailable"
                className="flex-1 bg-transparent outline-none font-sans text-[13px] text-cream/50 placeholder:text-cream/40"
              />
              <button type="button" disabled title="No agent inference or execution runtime is connected." className="size-9 rounded-full bg-cream/10 text-cream/40 grid place-items-center cursor-not-allowed">
                <Send className="size-4" />
              </button>
            </div>
          </footer>
        </article>
      </section>
    </div>
  );
};

export default MissionChatView;
