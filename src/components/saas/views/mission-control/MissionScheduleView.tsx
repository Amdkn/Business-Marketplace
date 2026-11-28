// Mission Control weekly schedule — reads persisted workspace missions only.
import { useEffect, useMemo, useState } from 'react';
import { CalendarClock, Hexagon } from 'lucide-react';
import { EmptyState } from '../../components/EmptyState';
import {
  listWorkspaceAgents,
  listScheduledMissions,
  type ScheduledMission,
} from '../../../../apps/people/people.repo';

const DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'] as const;

export const MissionScheduleView = (): React.ReactElement => {
  const [missions, setMissions] = useState<ScheduledMission[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    listWorkspaceAgents()
      .then((agents) => listScheduledMissions(agents))
      .then((rows) => { if (!cancelled) setMissions(rows); })
      .catch((reason: unknown) => {
        if (!cancelled) setError(reason instanceof Error ? reason.message : 'Unable to load persisted schedule');
      });
    return () => { cancelled = true; };
  }, []);

  const grouped = useMemo(() => {
    const result: Record<string, ScheduledMission[]> = Object.fromEntries(DAYS.map((day) => [day, []]));
    for (const mission of missions ?? []) result[mission.day].push(mission);
    for (const day of DAYS) result[day].sort((a, b) => a.startHour - b.startHour);
    return result;
  }, [missions]);

  if (error) return <div className="rounded-xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700" role="alert">
    <p className="font-semibold">Unable to load the workspace schedule</p><p className="mt-1">{error}</p>
  </div>;

  if (missions === null) return <div className="space-y-4 animate-pulse" role="status" aria-label="Loading persisted schedule">
    <div className="h-8 w-1/3 rounded bg-stone-200" /><div className="h-64 rounded-3xl bg-stone-100" />
  </div>;

  return <div className="space-y-5">
    <header className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <div className="flex items-center gap-2 font-mono text-[10px] tracking-[0.22em] uppercase text-her-muted">
          <Hexagon className="size-3 text-ember" /> Marketplace · Workspace missions
        </div>
        <h1 className="font-display leading-[0.95] tracking-tight mt-2 text-ink" style={{ fontSize: 'clamp(36px, 5vw, 60px)' }}>Schedule<span className="text-ember">.</span></h1>
        <p className="font-sans text-[13px] text-her-muted mt-2 max-w-xl">Weekly plan from persisted missions. This view does not infer execution activity from timestamps.</p>
      </div>
      <div className="font-mono text-[10px] uppercase tracking-wider text-her-muted">{missions.length} persisted missions</div>
    </header>

    {missions.length === 0 ? <EmptyState title="No scheduled missions" description="Create a mission in People → Cadence. It will appear here after it is saved to the shared workspace register." icon={<CalendarClock className="size-10 text-her-muted" />} /> :
      <section className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        {DAYS.map((day) => <article key={day} className="rounded-2xl border border-her-border bg-her-surface p-4">
          <header className="mb-3 flex items-center justify-between border-b border-her-border pb-2">
            <h2 className="font-mono text-[11px] font-semibold uppercase tracking-widest text-ink">{day}</h2>
            <span className="font-mono text-[10px] text-her-muted">{grouped[day].length} missions</span>
          </header>
          {grouped[day].length === 0 ? <p className="py-4 text-center text-xs text-her-muted">No planned work</p> :
            <ul className="space-y-2">{grouped[day].map((mission) => <li key={mission.id} className="rounded-xl border border-her-border bg-cream p-3">
              <div className="flex items-start justify-between gap-2">
                <span className="font-mono text-[10px] text-her-muted">{String(mission.startHour).padStart(2,'0')}:00–{String(mission.endHour).padStart(2,'0')}:00 UTC</span>
                <span className="font-mono text-[9px] uppercase tracking-wider text-her-muted">{mission.status}</span>
              </div>
              <p className="mt-1 text-[12px] font-semibold text-ink">{mission.label}</p>
              <p className="mt-1 text-[10px] text-her-muted">{mission.agent} · {mission.kind}</p>
            </li>)}</ul>}
        </article>)}
      </section>}
  </div>;
};

export default MissionScheduleView;
