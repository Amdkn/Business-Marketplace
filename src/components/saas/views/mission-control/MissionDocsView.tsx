// src/components/views/mission-control/MissionDocsView.tsx
// Hermes — Docs sub-page (route /agent-root/docs)
// Static help/manual page describing the 8 Hermes Mission Control routes.

import { Hexagon } from 'lucide-react';

interface DocSection {
  id: string;
  title: string;
  body: string;
}

const SECTIONS: ReadonlyArray<DocSection> = [
  {
    id: 'overview',
    title: 'Overview · /agent-root',
    body:
      'The Mission Control hub. Workspace and agent information is read from canonical tenant-scoped sources. Runtime throughput, success rates and routing telemetry are not reported unless a live ingestion source is connected.',
  },
  {
    id: 'agents',
    title: 'Agents · /agent-root/agents',
    body:
      'Canonical agent directory backed by agent principals and explicit workspace delegations. Operators can register a principal with approved permission codes and revoke its workspace assignment. Runtime load, tokens, latency and model telemetry remain unavailable without an ingestion/runtime connection.',
  },
  {
    id: 'tasks',
    title: 'Tasks · /agent-root/tasks',
    body:
      'Workspace-backed mission Kanban with To do / In progress / Done columns, persisted creation, priority filtering, title search and drag-and-drop ordering. Status and position changes are written to the workspace mission register; this board does not execute missions.',
  },
  {
    id: 'office',
    title: 'Office · /agent-root/office',
    body:
      'A 3D spatial visualization of the agent-office concept. Buildings and visual states are presentation elements, not evidence of live agent activity. Use the Agent Directory for canonical principals and workspace assignments.',
  },
  {
    id: 'content',
    title: 'Content · /agent-root/content',
    body:
      'Workspace document register with title search, persisted document metadata and links to non-placeholder file URLs. The New Doc and upload workflows remain unavailable until document authoring and storage are connected; uploader counts are not agent-execution telemetry.',
  },
  {
    id: 'schedule',
    title: 'Schedule · /agent-root/schedule',
    body:
      'Read-only weekly projection of persisted workspace missions. Schedule metadata is shared with People → Cadence; times are displayed in UTC. Creating or editing schedule entries happens through the canonical People cadence workflow.',
  },
  {
    id: 'chat',
    title: 'Chat · /agent-root/chat',
    body:
      'Agent directory-linked chat shell. No inference or execution runtime is connected; the composer is disabled and messages are not sent, simulated or stored.',
  },
  {
    id: 'docs',
    title: 'Docs · /agent-root/docs',
    body:
      'This page. The Mission Control manual documents route behavior and the boundary between persisted workspace data, visual presentation and connected runtime capabilities.',
  },
];

export const MissionDocsView = (): React.ReactElement => {
  return (
    <div className="space-y-5">
      <header>
        <div className="flex items-center gap-2 font-mono text-[10px] tracking-[0.22em] uppercase text-her-muted">
          <Hexagon className="size-3 text-ember" /> Mission Control Guide
        </div>
        <h1 className="font-display leading-[0.95] tracking-tight mt-2 text-ink" style={{ fontSize: 'clamp(36px, 5vw, 60px)' }}>
          Docs<span className="text-ember">.</span>
        </h1>
        <p className="font-sans text-[14px] text-her-muted mt-3 max-w-2xl">
          Mission Control surfaces combine canonical workspace records and visual tools. Supabase access is scoped through organization and workspace authorization; visualizations do not imply a live agent runtime.
        </p>
      </header>

      <nav aria-label="Documentation table of contents" className="rounded-3xl bg-cream border border-her-border p-5">
        <h2 className="font-mono text-[10px] uppercase tracking-[0.22em] text-her-muted">Table of contents</h2>
        <ul className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2 font-mono text-[12px]">
          {SECTIONS.map((s) => (
            <li key={s.id}>
              <a href={`#${s.id}`} className="block px-3 py-2 rounded-xl hover:bg-her-surface text-ink transition-colors">
                {s.title}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="space-y-4">
        {SECTIONS.map((s) => (
          <article key={s.id} id={s.id} className="rounded-3xl bg-her-surface border border-her-border p-6 scroll-mt-32">
            <h3 className="font-display text-[24px] text-ink">{s.title}</h3>
            <p className="font-sans text-[14px] text-ink/80 mt-3 leading-relaxed">{s.body}</p>
          </article>
        ))}
      </div>

      <footer className="rounded-3xl bg-ink text-cream p-6">
        <h3 className="font-display text-[20px]">Schema</h3>
        <ul className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-[12px]">
          <li className="rounded-2xl bg-cream/8 border border-cream/15 p-3">
            <code className="text-ember">Marketplace schema migrations</code>
            <p className="text-cream/65 mt-1">agents table — 8 columns, RLS by org_id.</p>
          </li>
          <li className="rounded-2xl bg-cream/8 border border-cream/15 p-3">
            <code className="text-ember">sql/07_hermes_agent_root.sql</code>
            <p className="text-cream/65 mt-1">9 nullable Hermes telemetry columns.</p>
          </li>
          <li className="rounded-2xl bg-cream/8 border border-cream/15 p-3">
            <code className="text-ember">sql/08_hermes_missions.sql</code>
            <p className="text-cream/65 mt-1">missions table — Kanban (todo/doing/done), RLS by org_id.</p>
          </li>
          <li className="rounded-2xl bg-cream/8 border border-cream/15 p-3">
            <code className="text-ember">sql/03_rls_policies.sql</code>
            <p className="text-cream/65 mt-1">RLS policies reused by all tenant tables.</p>
          </li>
        </ul>
      </footer>
    </div>
  );
};

export default MissionDocsView;
