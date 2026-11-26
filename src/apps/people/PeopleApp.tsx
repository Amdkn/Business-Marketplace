/** People / Agents — Domaine 1 of the SOB Convergence: RH & Méta-Gouvernance.
 *  Agent Factory where B2 Visionaries (Green Lanterns) design and B3 specialists
 *  (X-Men) ship. B1 Gatekeeper (the coach) approves what ships.
 *  Subpages:
 *    - Overview  → operating doctrine + today's standup
 *    - Team      → human squad (X-Men)
 *    - Agents    → agent list
 *    - Squads    → canonical workspace agent principals and delegations
 *    - Content   → per-agent docs library
 *    - Cadence   → persisted weekly mission planning
 *    - Culture   → operating values
 *  2-level subpage nav: section (left sidebar) → item detail (drill via CMS). */
import { useEffect, useMemo, useState } from 'react';
import {
  Users, Bot, Heart, Cpu, FileText, Calendar, Zap,
  Atom, LayoutDashboard, Crown, Activity, CheckCircle2, Play,
  UserSearch, Brain, BookMarked,
  ListChecks, Plus, Trash2, X,
} from 'lucide-react';
import { AppFrame, SectionHead, type AppSection } from '../../components/AppFrame';
import { Badge } from '../_ui/kit';
import { useShellStore } from '../../stores/shell.store';
import { useCollectionDrill } from '../../hooks/useCollectionDrill';
import { CollectionRepeater } from '../../components/cms/CollectionRepeater';
import { DynamicPageView } from '../../components/cms/DynamicPageView';
import { registerItemDetail } from '../../components/cms/itemDetailRegistry';
import { PeopleItemDetail } from './PeopleItemDetail';
import { useWindowPage } from '../../contexts/WindowContext';
import { AppDetailOverlay } from '../../components/cms/AppDetailOverlay';
import { ApprovalsView } from './ApprovalsView';
import { useCmsCollectionStatus } from './useCmsCollectionStatus';
import { UnknownCollectionBanner } from '../../components/UnknownCollectionBanner';
import { useScenariosStore } from '../../stores/scenarios.store';

registerItemDetail('people', PeopleItemDetail);
import { launchTour, TOUR_IDS } from '../../lib/tours';
import { PeopleDetailPage, type PeopleDetailItem } from './PeopleDetailPage';
import { DAYS, HOURS } from './fleet';
import { seedPeopleCms } from './seed';
import {
  listWorkspaceAgents, listWorkspaceMembers, listScheduledMissions, createScheduledMission, deleteScheduledMission,
  type WorkspaceAgent, type WorkspaceMember, type ScheduledMission, type ScheduleKind,
} from './people.repo';

seedPeopleCms();

// Green Lantern accent — emerald. Matches Domaine 1 brand for the SOB convergence.
const ACCENT = '#059669';
const ACCENT_SOFT = '#10b981';

function Culture() {
  const values = [
    { id: 'client-first',     label: 'Client outcomes first',  body: 'Everything we ship has to move a client needle. If it does not, it is craft for its own sake.' },
    { id: 'ship-bias',        label: 'Bias to shipped, not perfect', body: 'A shipped thing that is wrong is a fixable thing. A perfect thing in a drawer is a missed quarter.' },
    { id: 'sober-default',    label: 'Sober by default',       body: 'No breathless copy. No hype. Concrete numbers, plain language, calibrated tone.' },
    { id: 'own-mistake',      label: 'Own the mistake, keep the receipt', body: 'When a call is wrong, name it, fix it, and write down what we changed so we do not relearn it.' },
  ];
  const openMemory = (anchorKind: string) => {
    if (typeof window === 'undefined') return;
    window.dispatchEvent(
      new CustomEvent('coach-os:open-app-section', {
        detail: { appId: 'people', sectionId: 'memory', query: { anchorKind } },
      }),
    );
  };

  return (
    <div className="p-7">
      <SectionHead
        title="Culture"
        subtitle="The operating values every agent inherits"
        action={
          <div className="flex items-center gap-1.5">
            <Badge tone="accent">{values.length} valeurs</Badge>
          </div>
        }
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {values.map((v) => (
          <div
            key={v.id}
            data-culture-value={v.id}
            className="bg-[var(--panel-solid)] rounded-xl border border-[var(--panel-border)] shadow-sm p-5 flex flex-col gap-2"
          >
            <div className="flex items-start gap-3">
              <Heart className="w-5 h-5 text-[var(--theme-text-muted)] shrink-0 mt-0.5" />
              <span className="text-sm font-semibold text-[var(--theme-text)]">{v.label}</span>
            </div>
            <p className="text-[12.5px] leading-relaxed" style={{ color: 'var(--theme-text-muted)' }}>
              {v.body}
            </p>
            <div className="pt-2 mt-auto border-t border-[var(--panel-border-subtle)]">
              <button
                type="button"
                onClick={() => openMemory(v.id)}
                className="text-[10.5px] font-semibold uppercase tracking-wider hover:underline"
                style={{ color: ACCENT }}
                data-culture-link={v.id}
                title="Voir les faits liés dans Mémoire"
              >
                Voir la mémoire liée →
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Overview — the default landing. Sets the doctrine (Agent Factory + B1 Gatekeeper),
 *  shows the daily standup, and gives the coach ONE primary action.
 *  Implements the Border Beam visual effect on the standup hero card. */
function Overview() {
  const pendingScenarios = useScenariosStore((s) => s.scenarioOrder.filter((id) => s.scenarios[id]?.status === 'pending').length);

  // T2 — first standup tour. Fires once when the user lands on the People
  // Overview section (after the localStorage guard in launchTour is checked).
  useEffect(() => {
    void launchTour(TOUR_IDS.FIRST_STANDUP);
  }, []);

  const steps: { n: string; title: string; body: string }[] = [
    { n: '1', title: 'Standup at 9am',       body: 'Your agents post overnight work to your inbox.' },
    { n: '2', title: 'Agents ship work',      body: 'Specialists run on autopilot inside the boundaries you set.' },
    { n: '3', title: 'You approve in 10 min', body: 'Yes or no on the queue. Ship or kill. Move on.' },
  ];

  return (
    <div className="p-7 h-full flex flex-col gap-6 overflow-y-auto custom-scrollbar">
      {/* Eyebrow + Headline */}
      <div className="flex flex-col gap-1.5">
        <span className="text-[10.5px] font-extrabold uppercase tracking-[0.18em]" style={{ color: ACCENT }}>
          Domaine 01 · RH & Méta-Gouvernance
        </span>
        <h1 className="text-[28px] font-bold tracking-tight text-[var(--theme-text)]" style={{ fontFamily: 'var(--theme-font-display)' }}>
          Your Agent Directory. Your daily governance.
        </h1>
        <p className="text-[13.5px] text-[var(--theme-text-muted)] max-w-2xl leading-relaxed">
          Govern canonical agent identities and workspace delegations here. Runtime status and execution metrics appear only after a real runtime feed is connected.
        </p>
      </div>

      {/* How it works — 3 steps, capped, concrete */}
      <div className="flex flex-col gap-2.5">
        <div className="text-[10px] font-mono uppercase tracking-wider text-[var(--theme-text-dim)]">— HOW IT WORKS</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {steps.map((s) => (
            <div key={s.n} className="bg-[var(--panel-solid)] rounded-2xl border border-[var(--panel-border)] shadow-sm p-4 flex items-start gap-3">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[color:#fff] text-[13px] font-extrabold shrink-0"
                style={{ background: ACCENT }}
              >
                {s.n}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[13px] font-bold text-[var(--theme-text)]">{s.title}</div>
                <div className="text-[11.5px] text-[var(--theme-text-muted)] mt-0.5 leading-snug">{s.body}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Today's Standup — Border Beam on the hero card */}
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--theme-text-dim)]">— TODAY'S STANDUP</span>
          <span className="text-[10px] font-mono text-[var(--theme-text-dim)]">· {new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
        </div>
        <div className="relative rounded-2xl p-[2px] overflow-hidden" style={{ background: 'linear-gradient(120deg, transparent 0%, rgba(16,185,129,0.0) 30%, #10b981 50%, rgba(16,185,129,0.0) 70%, transparent 100%)', backgroundSize: '200% 200%', animation: 'border-beam 4s linear infinite' }}>
          <style>{`
            @keyframes border-beam {
              0%   { background-position: 0% 50%; }
              100% { background-position: 200% 50%; }
            }
          `}</style>
          <div className="bg-[var(--panel-solid)] rounded-2xl p-6">
            <div className="flex items-start gap-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-[color:#fff] shrink-0"
                style={{ background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_SOFT})`, boxShadow: `0 6px 18px ${ACCENT}30` }}
              >
                <Crown className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[15px] font-bold text-[var(--theme-text)]">B1 Gatekeeper standing by</span>
                  <span
                    className="text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded"
                    style={{ color: '#15803d', background: 'rgba(22,163,74,0.12)', border: '1px solid #86efac' }}
                  >
                    You
                  </span>
                </div>
                <p className="text-[12.5px] text-[var(--theme-text-muted)] mt-1 leading-snug">
                  Runtime telemetry is not connected. Review workspace agent assignments and pending human approvals.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (typeof window === 'undefined') return;
                  // `coach-os:open-app-section` est le SEUL événement de navigation
                  // inter-sections que quelqu'un écoute (cf. AppFrame). Un
                  // `coach-os:navigate` part dans le vide : le bouton paraît câblé
                  // et ne fait rien.
                  window.dispatchEvent(
                    new CustomEvent('coach-os:open-app-section', {
                      detail: { appId: 'people', sectionId: 'approvals' },
                    }),
                  );
                }}
                className="inline-flex items-center gap-1.5 text-[12px] font-bold text-[color:#fff] px-3.5 py-2 rounded-xl shrink-0 transition-all hover:scale-[1.02] active:scale-[0.99]"
                style={{ background: ACCENT, boxShadow: `0 4px 12px ${ACCENT}30` }}
              >
                <Play className="w-3.5 h-3.5" /> Start standup
              </button>
            </div>

            {/* Runtime telemetry is unavailable until a runtime feed is connected. */}
            <div className="grid grid-cols-3 gap-3 mt-5">
              <div
                className="rounded-xl p-3.5"
                style={{ background: 'rgba(22,163,74,0.10)', border: '1px solid #86efac' }}
              >
                <div className="flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5" style={{ color: '#15803d' }} />
                  <span className="text-[9.5px] font-mono uppercase tracking-wider" style={{ color: '#15803d' }}>Runtime state</span>
                </div>
                <div className="text-[24px] font-bold mt-1 tabular-nums" style={{ color: '#166534' }}>—</div>
                <div className="text-[10.5px] mt-0.5 truncate" style={{ color: '#15803d' }}>
                  Not reported
                </div>
              </div>
              <div className="rounded-xl bg-[var(--theme-surface-hover)] border border-[var(--panel-border-subtle)] p-3.5">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[var(--theme-text-muted)]" />
                  <span className="text-[9.5px] font-mono uppercase tracking-wider text-[var(--theme-text-muted)]">Current activity</span>
                </div>
                <div className="text-[24px] font-bold text-[var(--theme-text)] mt-1 tabular-nums">—</div>
                <div className="text-[10.5px] text-[var(--theme-text-muted)] mt-0.5 truncate">
                  Not reported
                </div>
              </div>
              <div
                className="rounded-xl p-3.5"
                style={{ background: 'rgba(245,158,11,0.10)', border: '1px solid #fcd34d' }}
              >
                <div className="flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5" style={{ color: '#b45309' }} />
                  <span className="text-[9.5px] font-mono uppercase tracking-wider" style={{ color: '#b45309' }}>Telemetry</span>
                </div>
                <div className="text-[24px] font-bold mt-1 tabular-nums" style={{ color: '#92400e' }}>—</div>
                <div className="text-[10.5px] mt-0.5 truncate" style={{ color: '#b45309' }}>
                  Not reported
                </div>
              </div>
            </div>

            {/* Next concrete action */}
            <div className="mt-5 pt-4 border-t border-[var(--panel-border-subtle)] flex items-center gap-2 text-[11.5px] text-[var(--theme-text-muted)]">
              <span className="text-[9.5px] font-mono uppercase tracking-wider text-[var(--theme-text-dim)]">Next</span>
              {pendingScenarios > 0 ? (
                <>
                  <span>Open <span className="font-semibold text-[var(--theme-text)]">Approvals</span> — {pendingScenarios} scénario{pendingScenarios === 1 ? '' : 's'} à trancher</span>
                  <span className="ml-auto text-[9.5px] font-mono text-[var(--theme-text-dim)]">~10 min</span>
                </>
              ) : (
                <>
                  <span>Open <span className="font-semibold text-[var(--theme-text)]">Squads</span> to review workspace agent assignments</span>
                  <span className="ml-auto text-[9.5px] font-mono text-[var(--theme-text-dim)]">~10 min</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer micro-CTA (i-have-adhd: action-first, one primary) */}
      <div className="flex items-center justify-between text-[11px] text-[var(--theme-text-muted)]">
        <span>Marketplace agent identities and delegated authority remain under workspace governance.</span>
        <span className="font-mono uppercase tracking-wider text-[9.5px]">v2.0 · SOB Convergence</span>
      </div>
    </div>
  );
}

/** Fleet card — per-agent status card matching the template's "agent-cards"
 *  section. Clickable to open the agent's detail page. */
function Fleet({ onAgentClick }: { onAgentClick: (agent: WorkspaceAgent) => void }) {
  const [agents, setAgents] = useState<WorkspaceAgent[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    listWorkspaceAgents()
      .then((rows) => { if (!cancelled) setAgents(rows); })
      .catch((reason: unknown) => {
        if (!cancelled) setError(reason instanceof Error ? reason.message : 'Unable to load workspace agents');
      });
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="p-7 h-full flex flex-col gap-5 overflow-y-auto custom-scrollbar">
      <SectionHead
        title="Workspace Agent Bench"
        subtitle="Canonical principals delegated to this workspace · runtime metrics are not yet ingested"
        action={<Badge tone="accent">{agents?.length ?? '—'} assigned</Badge>}
      />
      {error && <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700" role="alert">{error}</div>}
      {agents === null && !error && <div className="animate-pulse rounded-xl bg-[var(--theme-surface-hover)] p-8" role="status">Loading canonical agent assignments…</div>}
      {agents && agents.length === 0 && <div className="rounded-2xl border border-dashed border-[var(--panel-border)] p-8 text-center text-sm text-[var(--theme-text-muted)]">No agent principal has an active delegation to this workspace.</div>}
      {agents && agents.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {agents.map((agent) => (
            <button key={agent.id} type="button" onClick={() => onAgentClick(agent)}
              className="rounded-2xl border border-[var(--panel-border)] bg-[var(--panel-solid)] p-5 text-left shadow-sm transition hover:shadow-md">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="truncate text-sm font-bold text-[var(--theme-text)]">{agent.displayName}</div>
                  <div className="mt-1 truncate font-mono text-[10px] text-[var(--theme-text-dim)]">{agent.agentKey}</div>
                </div>
                <Badge tone={agent.principalStatus === 'ACTIVE' ? 'ok' : 'warn'}>{agent.principalStatus}</Badge>
              </div>
              <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-[var(--panel-border-subtle)] pt-3 text-[11px]">
                <div><dt className="text-[var(--theme-text-dim)]">Class</dt><dd className="mt-1 font-semibold text-[var(--theme-text)]">{agent.agentClass}</dd></div>
                <div><dt className="text-[var(--theme-text-dim)]">Runtime</dt><dd className="mt-1 truncate font-semibold text-[var(--theme-text)]">{agent.runtime}</dd></div>
                <div><dt className="text-[var(--theme-text-dim)]">Delegated permissions</dt><dd className="mt-1 font-semibold text-[var(--theme-text)]">{agent.permissionCodes.length}</dd></div>
                <div><dt className="text-[var(--theme-text-dim)]">Telemetry</dt><dd className="mt-1 font-semibold text-[var(--theme-text)]">Unavailable</dd></div>
              </dl>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function Content() {
  const contentDrill = useCollectionDrill('content', 'Content');
  // Brief FIX-7 — silence bruyant. Le décompte seul ne dit pas si la
  // collection existe — un 0 peut venir d'un registre absent.
  const contentRead = useCmsCollectionStatus('content');
  const contentCount = contentRead.items.length;
  return (
    <div className="p-7 flex flex-col gap-3">
      <UnknownCollectionBanner collectionId="content" status={contentRead.status} appName="People" testFilePath="src/apps/people/seed-collections.test.ts" />
      <SectionHead
        title="Content library"
        subtitle="Per-agent docs · versioned by date"
        action={<Badge tone="accent">{contentCount} pieces</Badge>}
      />
      <CollectionRepeater collectionId="content" onOpen={contentDrill.open} />
    </div>
  );
}

function heatColor(value: number): string {
  // 0 = transparent, 100 = ember (orange) full opacity
  if (value === 0) return 'rgba(0,0,0,0)';
  const opacity = Math.min(0.95, Math.max(0.06, value / 100));
  return `rgba(var(--theme-accent-rgb), ${opacity.toFixed(2)})`;
}

const TASK_KIND_COLOR: Record<ScheduleKind, string> = {
  sync:    '#0891b2',
  run:     '#0d9488',
  audit:   '#9333ea',
  review:  '#ca8a04',
  'sync-up': '#b91c1c',
};

/** Map task kind to the SOB sprint cadence terminology coaches actually use. */
const TASK_KIND_LABEL: Record<ScheduleKind, string> = {
  sync:     'Daily Standup',
  run:      'Sprint Work',
  audit:    'Sprint Review',
  review:   'Sprint Review',
  'sync-up': 'Retrospective',
};

function Schedule() {
  const addToast = useShellStore((state) => state.addToast);
  const [agents, setAgents] = useState<WorkspaceAgent[]>([]);
  const [tasks, setTasks] = useState<ScheduledMission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [picked, setPicked] = useState<{ day: typeof DAYS[number]; hour: number } | null>(null);
  const [agentFilter, setAgentFilter] = useState<string>('all');
  const [composerOpen, setComposerOpen] = useState(false);
  const [composerLabel, setComposerLabel] = useState('');
  const [composerAgentId, setComposerAgentId] = useState('');
  const [composerKind, setComposerKind] = useState<ScheduleKind>('run');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const refresh = async () => {
    const currentAgents = await listWorkspaceAgents();
    const currentTasks = await listScheduledMissions(currentAgents);
    setAgents(currentAgents);
    setTasks(currentTasks);
  };

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([listWorkspaceAgents()])
      .then(async ([currentAgents]) => {
        const currentTasks = await listScheduledMissions(currentAgents);
        if (!cancelled) {
          setAgents(currentAgents);
          setTasks(currentTasks);
          setError(null);
        }
      })
      .catch((reason: unknown) => {
        if (!cancelled) setError(reason instanceof Error ? reason.message : 'Unable to load persisted missions');
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => { void launchTour(TOUR_IDS.CADENCE); }, []);

  useEffect(() => {
    if (!confirmDeleteId) return;
    const handle = window.setTimeout(() => setConfirmDeleteId(null), 4000);
    return () => window.clearTimeout(handle);
  }, [confirmDeleteId]);

  const agentOptions = useMemo(() => agents.map((agent) => ({ id: agent.id, name: agent.displayName })), [agents]);
  const filteredTasks = picked
    ? tasks.filter((task) =>
        task.day === picked.day &&
        picked.hour >= task.startHour &&
        picked.hour < task.endHour &&
        (agentFilter === 'all' || task.agent === agentFilter))
    : [];

  const hourCounts = useMemo(
    () => Array.from({ length: 24 }, (_, hour) =>
      tasks.filter((task) => hour >= task.startHour && hour < task.endHour).length),
    [tasks],
  );
  const peakHour = hourCounts.indexOf(Math.max(...hourCounts, 0));
  const quietestHour = hourCounts.indexOf(Math.min(...hourCounts, 0));
  const weekdayAvg = useMemo(() => {
    const weekdays: ReadonlyArray<typeof DAYS[number]> = ['Mon','Tue','Wed','Thu','Fri'];
    const slots = new Set<string>();
    for (const task of tasks) {
      if (!weekdays.includes(task.day)) continue;
      for (let hour = task.startHour; hour < task.endHour; hour += 1) slots.add(`${task.day}-${hour}`);
    }
    return Math.round((slots.size / 120) * 100);
  }, [tasks]);
  const plannedGrid = useMemo(() => DAYS.map((day) =>
    HOURS.map((hour) => Math.min(100, tasks.filter((task) =>
      task.day === day && hour >= task.startHour && hour < task.endHour).length * 45))),
  [tasks]);

  const submitTask = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!picked || !composerLabel.trim()) return;
    setSaving(true);
    setError(null);
    try {
      await createScheduledMission({
        day: picked.day,
        startHour: picked.hour,
        endHour: Math.min(24, picked.hour + 1),
        agentPrincipalId: composerAgentId || null,
        label: composerLabel,
        kind: composerKind,
      });
      await refresh();
      setComposerLabel('');
      setComposerAgentId('');
      setComposerKind('run');
      setComposerOpen(false);
      addToast({ source: 'Cadence', type: 'success', message: 'Mission persistée dans le workspace.' });
    } catch (reason) {
      const message = reason instanceof Error ? reason.message : 'Unable to persist mission';
      setError(message);
      addToast({ source: 'Cadence', type: 'warning', message });
    } finally {
      setSaving(false);
    }
  };

  const cancelComposer = () => {
    setComposerOpen(false);
    setComposerLabel('');
    setComposerAgentId('');
    setComposerKind('run');
  };

  const handleDeleteClick = async (id: string) => {
    if (confirmDeleteId !== id) {
      setConfirmDeleteId(id);
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await deleteScheduledMission(id);
      await refresh();
      setConfirmDeleteId(null);
      addToast({ source: 'Cadence', type: 'success', message: 'Mission supprimée du workspace.' });
    } catch (reason) {
      const message = reason instanceof Error ? reason.message : 'Unable to delete mission';
      setError(message);
      addToast({ source: 'Cadence', type: 'warning', message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-7 h-full flex flex-col gap-5 overflow-y-auto custom-scrollbar">
      <SectionHead
        title="Standup Cadence"
        subtitle="Persisted workspace missions · planned work, not runtime activity"
        action={<Badge tone="accent">Weekly · UTC</Badge>}
      />
      {error && <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700" role="alert">{error}</div>}
      {loading && <div className="rounded-xl bg-[var(--theme-surface-hover)] p-5 text-sm text-[var(--theme-text-muted)]" role="status">Loading persisted workspace missions…</div>}

      <div className="bg-[var(--panel-solid)] rounded-2xl border border-[var(--panel-border)] shadow-sm p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-[var(--theme-text-dim)]">— PLANNED MISSIONS · 7d × 24h</div>
            <div className="text-[12px] text-[var(--theme-text-muted)] mt-0.5">La densité représente les missions planifiées et enregistrées, pas une activité d'exécution.</div>
            {picked && <div className="text-[11px] text-[var(--theme-text-dim)] mt-1">{picked.day} · {String(picked.hour).padStart(2, '0')}:00 UTC</div>}
          </div>
          <div className="flex gap-1 text-[9px] font-mono uppercase text-[var(--theme-text-dim)]"><span>empty</span><span>→</span><span>scheduled</span></div>
        </div>
        <div className="overflow-x-auto custom-scrollbar">
          <div className="min-w-[700px]">
            <div className="grid" style={{ gridTemplateColumns: '40px repeat(24, 1fr)', gap: '2px' }}>
              <div />
              {HOURS.map((hour) => <div key={hour} className="text-[9px] font-mono text-[var(--theme-text-dim)] text-center">{hour % 6 === 0 ? hour : ''}</div>)}
            </div>
            {DAYS.map((day, dayIndex) => (
              <div key={day} className="grid mt-1" style={{ gridTemplateColumns: '40px repeat(24, 1fr)', gap: '2px' }}>
                <div className="text-[10px] font-mono uppercase text-[var(--theme-text-muted)] font-semibold pr-2 text-right self-center">{day}</div>
                {HOURS.map((hour) => {
                  const isPicked = picked?.day === day && picked.hour === hour;
                  const count = tasks.filter((task) => task.day === day && hour >= task.startHour && hour < task.endHour).length;
                  return <button key={hour} type="button" disabled={loading}
                    onClick={() => { setPicked({ day, hour }); setConfirmDeleteId(null); }}
                    data-cadence-cell data-day={day} data-hour={hour}
                    aria-label={`${day} ${hour}:00 — ${count} persisted planned missions`}
                    className="h-5 rounded-sm transition-all hover:ring-1 hover:ring-[var(--theme-accent)] focus:outline-none disabled:cursor-not-allowed"
                    style={{ background: heatColor(plannedGrid[dayIndex][hour]), boxShadow: isPicked ? '0 0 0 2px var(--theme-accent)' : count ? 'inset 0 0 0 1px rgba(255,255,255,0.2)' : 'none' }} />;
                })}
              </div>
            ))}
          </div>
        </div>
        <div className="mt-4 pt-3 border-t border-[var(--panel-border-subtle)] grid grid-cols-3 gap-4">
          <div><div className="text-[9px] font-mono uppercase tracking-wider text-[var(--theme-text-dim)]">Peak planned hour</div><div className="text-[20px] font-bold text-[var(--theme-text)] mt-0.5">{tasks.length ? `${String(peakHour).padStart(2, '0')}:00 UTC` : '—'}</div></div>
          <div><div className="text-[9px] font-mono uppercase tracking-wider text-[var(--theme-text-dim)]">Least scheduled</div><div className="text-[20px] font-bold text-[var(--theme-text)] mt-0.5">{tasks.length ? `${String(quietestHour).padStart(2, '0')}:00 UTC` : '—'}</div></div>
          <div><div className="text-[9px] font-mono uppercase tracking-wider text-[var(--theme-text-dim)]">Weekday coverage</div><div className="text-[20px] font-bold mt-0.5" style={{ color: '#15803d' }}>{tasks.length ? `${weekdayAvg}%` : '—'}</div></div>
        </div>
      </div>

      {picked && <div data-cadence-detail className="bg-[var(--panel-solid)] rounded-2xl border border-[var(--panel-border)] shadow-sm p-5">
        <div className="flex items-center gap-2 mb-3">
          <div className="text-[10px] font-mono uppercase tracking-wider text-[var(--theme-text-dim)]">— SLOT · {picked.day} {String(picked.hour).padStart(2, '0')}:00 UTC</div>
          <select value={agentFilter} onChange={(event) => setAgentFilter(event.target.value)} data-cadence-agent-filter
            className="ml-auto px-2 py-1 rounded-lg text-[10.5px] font-semibold outline-none"
            style={{ background: 'var(--theme-bg)', color: 'var(--theme-text)', border: '1px solid var(--panel-border)' }}>
            <option value="all">Tous les agents</option>
            {agentOptions.map((agent) => <option key={agent.id} value={agent.name}>{agent.name}</option>)}
          </select>
          <button type="button" onClick={() => { setPicked(null); setAgentFilter('all'); setConfirmDeleteId(null); setComposerOpen(false); }}
            className="text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] text-[11px] font-semibold" data-cadence-close>Fermer</button>
        </div>

        {composerOpen && <form data-cadence-composer onSubmit={submitTask} className="mb-4 rounded-xl border p-3 flex flex-col gap-2"
          style={{ background: 'var(--canvas)', borderColor: 'var(--panel-border-subtle)' }}>
          <div className="flex items-center justify-between">
            <div className="text-[10.5px] font-semibold uppercase tracking-wider text-[var(--theme-text-dim)]">Nouvelle mission · {picked.day} {String(picked.hour).padStart(2, '0')}:00–{String(Math.min(24,picked.hour+1)).padStart(2, '0')}:00</div>
            <button type="button" onClick={cancelComposer} aria-label="Annuler" className="w-5 h-5 rounded-md flex items-center justify-center hover:bg-[var(--theme-surface-hover)]" style={{ color: 'var(--theme-text-muted)' }}><X className="w-3 h-3" /></button>
          </div>
          <input autoFocus required value={composerLabel} onChange={(event) => setComposerLabel(event.target.value)}
            onKeyDown={(event) => { if (event.key === 'Escape') cancelComposer(); }}
            placeholder="Intitulé de la mission…" data-cadence-composer-label
            className="px-2.5 py-1.5 rounded-lg text-[12px] outline-none"
            style={{ background: 'var(--theme-bg)', color: 'var(--theme-text)', border: '1px solid var(--panel-border)' }} />
          <div className="flex items-center gap-2">
            <select value={composerAgentId} onChange={(event) => setComposerAgentId(event.target.value)} data-cadence-composer-agent
              className="flex-1 px-2.5 py-1.5 rounded-lg text-[12px] outline-none"
              style={{ background: 'var(--theme-bg)', color: 'var(--theme-text)', border: '1px solid var(--panel-border)' }}>
              <option value="">Non assignée</option>
              {agents.map((agent) => <option key={agent.id} value={agent.id}>{agent.displayName}</option>)}
            </select>
            <select value={composerKind} onChange={(event) => setComposerKind(event.target.value as ScheduleKind)} data-cadence-composer-kind
              className="flex-1 px-2.5 py-1.5 rounded-lg text-[12px] outline-none"
              style={{ background: 'var(--theme-bg)', color: 'var(--theme-text)', border: '1px solid var(--panel-border)' }}>
              {(['sync','run','audit','review','sync-up'] as ScheduleKind[]).map((kind) => <option key={kind} value={kind}>{TASK_KIND_LABEL[kind]}</option>)}
            </select>
          </div>
          <div className="flex items-center justify-end gap-2">
            <button type="button" onClick={cancelComposer} className="h-7 px-3 rounded-lg text-[11px] font-semibold" style={{ color: 'var(--theme-text-muted)' }}>Annuler</button>
            <button type="submit" disabled={saving || !composerLabel.trim()} data-cadence-composer-submit
              className="h-7 px-3 rounded-lg text-[11px] font-semibold text-white disabled:opacity-50" style={{ background: ACCENT }}>
              {saving ? 'Enregistrement…' : 'Planifier'}
            </button>
          </div>
        </form>}

        {filteredTasks.length === 0 ? <div data-cadence-empty className="flex flex-col items-center gap-2 py-6 rounded-xl border border-dashed text-center"
          style={{ borderColor: 'var(--panel-border)', background: 'var(--theme-surface)', color: 'var(--theme-text-muted)' }}>
          <div className="text-[12.5px] font-semibold" style={{ color: 'var(--theme-text)' }}>Aucune mission sur ce créneau{agentFilter !== 'all' ? ` pour ${agentFilter}` : ''}.</div>
          <div className="text-[11px]" style={{ color: 'var(--theme-text-dim)' }}>La mission sera enregistrée dans le registre partagé du workspace.</div>
          {!composerOpen && <button type="button" onClick={() => setComposerOpen(true)} data-cadence-empty-create
            className="mt-1 flex items-center gap-1.5 h-7 px-3 rounded-lg text-[11px] font-semibold uppercase tracking-wider"
            style={{ background: ACCENT, color: '#ffffff' }}><Plus className="w-3 h-3" />Planifier une mission</button>}
        </div> : <ul className="flex flex-col gap-2">
          {filteredTasks.map((task) => {
            const kindColor = TASK_KIND_COLOR[task.kind];
            const confirming = confirmDeleteId === task.id;
            return <li key={task.id} data-cadence-task={task.id} className="flex items-center gap-3 px-3 py-2 rounded-lg"
              style={{ background: 'var(--canvas)', border: '1px solid var(--panel-border-subtle)' }}>
              <span className="font-mono text-[10px] uppercase text-[var(--theme-text-muted)] w-10 shrink-0">{task.day}</span>
              <span className="font-mono text-[11px] text-[var(--theme-text)] tabular-nums w-24 shrink-0">{String(task.startHour).padStart(2, '0')}:00–{String(task.endHour).padStart(2, '0')}:00</span>
              <span className="inline-flex items-center text-[9.5px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded shrink-0"
                style={{ color: kindColor, background: `${kindColor}1a` }}>{TASK_KIND_LABEL[task.kind]}</span>
              <span className="text-[12.5px] text-[var(--theme-text)] truncate flex-1">{task.label}</span>
              <span className="text-[10px] font-mono text-[var(--theme-text-dim)] shrink-0">@ {task.agent}</span>
              <button type="button" disabled={saving} onClick={() => void handleDeleteClick(task.id)}
                aria-label={confirming ? `Confirmer la suppression de ${task.label}` : `Supprimer ${task.label}`}
                data-cadence-delete={task.id} className="h-6 px-2 rounded-md text-[10px] font-semibold uppercase tracking-wider"
                style={confirming ? { background: '#dc2626', color: '#fff' } : { background: 'transparent', color: 'var(--theme-text-dim)' }}>
                <Trash2 className="w-3 h-3" />{confirming ? 'Confirmer ?' : ''}
              </button>
            </li>;
          })}
        </ul>}
      </div>}

      <div className="bg-[var(--panel-solid)] rounded-2xl border border-[var(--panel-border)] shadow-sm p-5">
        <div className="flex items-center gap-2 mb-3"><Zap className="w-4 h-4" style={{ color: '#15803d' }} />
          <div className="text-[10px] font-mono uppercase tracking-wider text-[var(--theme-text-dim)]">— WORKSPACE MISSION REGISTER</div>
          <Badge tone="accent">{tasks.length} persisted</Badge>
        </div>
        {tasks.length === 0 ? <div className="py-5 text-center text-sm text-[var(--theme-text-muted)]">No scheduled missions have been created in this workspace.</div> :
          <div className="flex flex-col gap-2">{tasks.map((task) => <div key={task.id} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[var(--theme-surface-hover)]">
            <span className="w-10 shrink-0 font-mono text-[10px] text-[var(--theme-text-muted)]">{task.day}</span>
            <span className="w-24 shrink-0 font-mono text-[11px] text-[var(--theme-text)]">{String(task.startHour).padStart(2,'0')}:00–{String(task.endHour).padStart(2,'0')}:00</span>
            <span className="flex-1 truncate text-[12px] text-[var(--theme-text)]">{task.label}</span>
            <span className="text-[10px] text-[var(--theme-text-dim)]">@ {task.agent}</span>
          </div>)}</div>}
      </div>
    </div>
  );
}

export function PeopleApp() {
  const personasDrill = useCollectionDrill('personas', 'Personas');
  const memoryDrill = useCollectionDrill('memory', 'Mémoire');
  const codexDrill = useCollectionDrill('codex', 'Codex');
  const contentDrill = useCollectionDrill('content', 'Content');
  // Brief FIX-7 — silence bruyant. Six collections consommées ici, chacune
  // avec son discriminant (`status: 'registered' | 'unknown'`) pour qu'un
  // défaut de registre ne se déguise pas en section vide.
  const personasRead = useCmsCollectionStatus('personas');
  const memoryRead = useCmsCollectionStatus('memory');
  const codexRead = useCmsCollectionStatus('codex');
  const personasCount = personasRead.items.length;
  const memoryCount = memoryRead.items.length;
  const codexCount = codexRead.items.length;
  const [detail, setDetail] = useState<PeopleDetailItem | null>(null);
  const { setDetail: setWindowDetail } = useWindowPage();

  useEffect(() => {
    if (detail) {
      setWindowDetail({ label: detail.title, onBack: () => setDetail(null) });
    } else {
      setWindowDetail(null);
    }
  }, [detail, setWindowDetail]);

  /** Open the canonical agent principal detail; no runtime metrics are inferred. */
  const openAgentDetail = (agent: WorkspaceAgent) => {
    setDetail({
      id: agent.id,
      title: agent.displayName,
      subtitle: `${agent.agentClass} · ${agent.runtime}`,
      status: agent.principalStatus,
      initials: agent.displayName.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase(),
      fields: [],
      squad: [{ name: agent.agentClass, color: '#059669' }],
      meta: [
        { label: 'Agent key', value: agent.agentKey },
        { label: 'Runtime', value: agent.runtime },
        { label: 'Principal status', value: agent.principalStatus },
        { label: 'Delegated permissions', value: agent.permissionCodes.join(', ') || 'None' },
        { label: 'Runtime telemetry', value: 'Unavailable' },
      ],
    });
  };

  // T3 — squad drill-down tour. Fires the first time the user opens a
  // Fleet agent's detail page. The launchTour guard keeps it idempotent.
  useEffect(() => {
    if (detail !== null) {
      void launchTour(TOUR_IDS.SQUAD_DRILLDOWN);
    }
  }, [detail]);

  const Team = () => {
    const [members, setMembers] = useState<WorkspaceMember[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    useEffect(() => {
      let cancelled = false;
      listWorkspaceMembers()
        .then((rows) => { if (!cancelled) setMembers(rows); })
        .catch((reason: unknown) => { if (!cancelled) setError(reason instanceof Error ? reason.message : 'Unable to load workspace members'); });
      return () => { cancelled = true; };
    }, []);
    return (
      <div className="p-7 flex flex-col gap-4">
        <SectionHead title="Team" subtitle="Human identities from identity.profiles and active workspace memberships." action={<Badge tone="accent">{members?.length ?? '—'} members</Badge>} />
        {error && <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</div>}
        {members === null && !error && <div role="status" className="rounded-xl bg-[var(--theme-surface-hover)] p-6 text-sm text-[var(--theme-text-muted)]">Loading workspace membership…</div>}
        {members && members.length === 0 && <div className="rounded-2xl border border-dashed border-[var(--panel-border)] p-8 text-center text-sm text-[var(--theme-text-muted)]">No active human membership is assigned to this workspace.</div>}
        {members && members.length > 0 && <div className="overflow-x-auto rounded-2xl border border-[var(--panel-border)] bg-[var(--panel-solid)]">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-[var(--panel-border)] text-[10px] uppercase tracking-wider text-[var(--theme-text-dim)]">
              <tr><th className="px-4 py-3">Member</th><th className="px-4 py-3">Organization role</th><th className="px-4 py-3">Workspace role</th><th className="px-4 py-3">Membership</th></tr>
            </thead>
            <tbody>{members.map((member) => <tr key={member.id} className="border-b border-[var(--panel-border-subtle)] last:border-0">
              <td className="px-4 py-3"><div className="font-semibold text-[var(--theme-text)]">{member.name}</div><div className="mt-0.5 font-mono text-[10px] text-[var(--theme-text-dim)]">{member.id}</div></td>
              <td className="px-4 py-3 text-[var(--theme-text-muted)]">{member.roleCode ?? 'Not assigned'}</td>
              <td className="px-4 py-3 text-[var(--theme-text-muted)]">{member.workspaceRole}</td>
              <td className="px-4 py-3"><Badge tone={member.membershipStatus === 'ACTIVE' ? 'ok' : 'warn'}>{member.membershipStatus}</Badge></td>
            </tr>)}</tbody>
          </table>
        </div>}
      </div>
    );
  };

  const Agents = () => <Fleet onAgentClick={openAgentDetail} />;

  const Personas = () => {
    return (
      <div className="p-7 flex flex-col gap-3">
        <UnknownCollectionBanner collectionId="personas" status={personasRead.status} appName="People" testFilePath="src/apps/people/seed-collections.test.ts" />
        <SectionHead
          title="Personas"
          subtitle="Premier-class profiles drawn from real sources. The anchor makes the difference — a persona without one is an invention."
          action={<Badge tone="accent">{personasCount} profiles</Badge>}
        />
        <CollectionRepeater collectionId="personas" onOpen={personasDrill.open} />
      </div>
    );
  };

  const Memoire = () => {
    return (
      <div className="p-7 flex flex-col gap-3">
        <UnknownCollectionBanner collectionId="memory" status={memoryRead.status} appName="People" testFilePath="src/apps/people/seed-collections.test.ts" />
        <SectionHead
          title="Mémoire"
          subtitle="Curated organisational memory. Raw memory is a dump — what matters here is what has been checked."
          action={<Badge tone="accent">{memoryCount} facts</Badge>}
        />
        <CollectionRepeater collectionId="memory" onOpen={memoryDrill.open} />
      </div>
    );
  };

  const Codex = () => {
    return (
      <div className="p-7 flex flex-col gap-3">
        <UnknownCollectionBanner collectionId="codex" status={codexRead.status} appName="People" testFilePath="src/apps/people/seed-collections.test.ts" />
        <SectionHead
          title="Codex"
          subtitle="Patterns that have proven themselves. A success repeated once is an anecdote; a method is a success repeated enough."
          action={<Badge tone="accent">{codexCount} patterns</Badge>}
        />
        <CollectionRepeater collectionId="codex" onOpen={codexDrill.open} />
      </div>
    );
  };

  const sections: AppSection[] = [
    { id: 'overview',  label: 'Overview',   icon: LayoutDashboard, render: Overview },
    { id: 'approvals', label: 'Approvals',  icon: ListChecks,       render: () => <ApprovalsView /> },
    { id: 'team',      label: 'Team',       icon: Users,            render: Team },
    { id: 'agents',    label: 'Agents',     icon: Bot,              render: Agents },
    { id: 'fleet',     label: 'Squads',     icon: Cpu,              render: () => <Fleet onAgentClick={openAgentDetail} /> },
    { id: 'content',   label: 'Content',    icon: FileText,         render: Content },
    { id: 'schedule',  label: 'Cadence',    icon: Calendar,         render: Schedule },
    { id: 'culture',   label: 'Culture',    icon: Heart,            render: Culture },
    { id: 'personas',  label: 'Personas',   icon: UserSearch,       render: Personas },
    { id: 'memory',    label: 'Mémoire',    icon: Brain,            render: Memoire },
    { id: 'codex',     label: 'Codex',      icon: BookMarked,       render: Codex },
  ];

  const groups: Record<string, string> = {
    overview:  'SOB',
    approvals: 'SOB',
    team:      'Squads',
    agents:    'Squads',
    fleet:     'B3 Agents',
    content:   'B3 Agents',
    schedule:  'Cadence',
    culture:   'Culture',
    personas:  'Profondeur',
    memory:    'Profondeur',
    codex:     'Profondeur',
  };

  // Picked drill (if any) — one of the 5 CMS collections exposed via
  // useCollectionDrill. The DynamicPageView is rendered in the overlay
  // (sibling of AppFrame) so it inherits the global topbar theme instead
  // of the per-app theme that AppFrame writes on its content.
  const drillViews: ReadonlyArray<{
    drill: { openId: string | null; open: (id: string) => void; close: () => void };
    collectionId: string;
  }> = [
    { drill: personasDrill, collectionId: 'personas' },
    { drill: memoryDrill,   collectionId: 'memory' },
    { drill: codexDrill,    collectionId: 'codex' },
    { drill: contentDrill,  collectionId: 'content' },
  ];
  const activeDrill = drillViews.find((d) => d.drill.openId) ?? null;

  return (
    <>
      <AppFrame title="RH & Méta-Gouvernance" subtitle="Agent Factory · B1 Gatekeeper" icon={Atom} accent={ACCENT} sections={sections} groups={groups} />
      {detail ? (
        <AppDetailOverlay
          appId="people"
          accent="#0891b2"
          onBack={() => setDetail(null)}
          motion={{ kind: 'slide-left', durationMs: 220 }}
        >
          <PeopleDetailPage item={detail} onBack={() => setDetail(null)} />
        </AppDetailOverlay>
      ) : activeDrill && activeDrill.drill.openId ? (
        <AppDetailOverlay
          appId="people"
          accent="#0891b2"
          onBack={() => activeDrill.drill.close()}
          motion={{ kind: 'slide-left', durationMs: 220 }}
        >
          <DynamicPageView
            collectionId={activeDrill.collectionId}
            itemId={activeDrill.drill.openId}
            onBack={() => activeDrill.drill.close()}
            onNavigate={activeDrill.drill.open}
          />
        </AppDetailOverlay>
      ) : null}
    </>
  );
}
