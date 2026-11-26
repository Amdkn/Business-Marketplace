/**
 * Sales Today — tenant-backed tasks, deals and workspace activity.
 * Calendar and call panels stay explicit empty states until their adapters
 * write records into this workspace; no prospect or meeting fixtures are shown.
 */
import { useEffect, useMemo, useState } from 'react';
import { CalendarDays, CheckCheck, CircleDashed, PhoneCall, Target } from 'lucide-react';
import { useCmsStore } from '../../../lib/cms/cms.store';
import { listWorkspaceActivity, type WorkspaceActivityEvent } from '../sales.repo';
import type { DetailItem } from '../SalesDetailPage';
import { ACCENT, Eyebrow, FONT_DISPLAY, Frame, RELANCE, WIN } from './Primitives';

function taskDetail(task: Record<string, unknown>): DetailItem {
  const title = String(task.label ?? task.title ?? 'Untitled task');
  const isDone = ['true', 'yes', 'done', 'completed'].includes(String(task.done ?? '').toLowerCase());
  return {
    id: String(task.id),
    kind: 'task',
    title,
    subtitle: String(task.when ?? ''),
    status: isDone ? 'done' : String(task.group ?? 'open'),
    summary: String(task.notes ?? task.body ?? 'No task notes recorded.'),
    fields: [
      { label: 'When', value: String(task.when ?? 'Not scheduled') },
      { label: 'Group', value: String(task.group ?? 'Unassigned') },
      { label: 'Status', value: isDone ? 'Done' : 'Open' },
    ],
  };
}

function formatDealValue(value: unknown, currency: string): string {
  const amount = Number(value);
  if (!Number.isFinite(amount)) return 'Value unknown';
  if (/^[A-Z]{3}$/.test(currency)) {
    try { return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(amount); } catch { /* unknown currency code */ }
  }
  return `${amount.toLocaleString()} · currency not set`;
}

function dealDetail(deal: Record<string, unknown>): DetailItem {
  const title = String(deal.client ?? deal.title ?? 'Untitled deal');
  return {
    id: String(deal.id),
    kind: 'deal',
    title,
    subtitle: String(deal.offer ?? ''),
    status: String(deal.stage ?? 'open'),
    summary: 'Workspace deal record.',
    fields: [
      { label: 'Offer', value: String(deal.offer ?? 'Not specified') },
      { label: 'Value', value: deal.value == null ? 'Not specified' : formatDealValue(deal.value, String(deal.currency ?? '')) },
      { label: 'Stage', value: String(deal.stage ?? 'Open') },
    ],
  };
}

function activitySummary(event: WorkspaceActivityEvent): string {
  const payload = event.eventPayload;
  for (const key of ['summary', 'message', 'title', 'description']) {
    const value = payload[key];
    if (typeof value === 'string' && value.trim()) return value;
  }
  return event.eventType;
}

function activityTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Unknown time';
  return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(date);
}

export function TodayPanel({ onSelect }: { onSelect: (item: DetailItem) => void }) {
  const tasks = useCmsStore((state) => state.items.tasks ?? []);
  const deals = useCmsStore((state) => state.items.deals ?? []);
  const [events, setEvents] = useState<WorkspaceActivityEvent[] | null>(null);
  const [activityError, setActivityError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    listWorkspaceActivity()
      .then((rows) => { if (!cancelled) setEvents(rows); })
      .catch((reason: unknown) => {
        if (!cancelled) setActivityError(reason instanceof Error ? reason.message : 'Unable to load workspace activity.');
      });
    return () => { cancelled = true; };
  }, []);

  const openTasks = useMemo(
    () => tasks.filter((task) => !['true', 'yes', 'done', 'completed'].includes(String(task.done ?? '').toLowerCase())),
    [tasks],
  );
  const activeDeals = useMemo(
    () => deals.filter((deal) => !['won', 'lost', 'closed'].includes(String(deal.stage ?? '').toLowerCase())),
    [deals],
  );
  const todayFocus = openTasks.filter((task) => String(task.group ?? '').toLowerCase() === 'today' || String(task.when ?? '').toLowerCase().includes('today'));
  const dateLabel = new Intl.DateTimeFormat(undefined, { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date());

  return (
    <div className="p-7 flex flex-col gap-8" style={{ color: 'var(--theme-text)', background: 'var(--theme-bg)' }}>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Eyebrow>Sales · Workspace snapshot</Eyebrow>
          <h1 className="mt-2 text-[36px] font-extrabold tracking-tight" style={{ fontFamily: FONT_DISPLAY }}>Today</h1>
          <p className="mt-2 text-sm" style={{ color: 'var(--theme-text-muted)' }}>{dateLabel} · live workspace records, not demo fixtures</p>
        </div>
        <div className="flex gap-3 text-xs font-mono">
          <span className="rounded-lg border px-3 py-2" style={{ borderColor: 'var(--panel-border)' }}>{openTasks.length} open tasks</span>
          <span className="rounded-lg border px-3 py-2" style={{ borderColor: 'var(--panel-border)' }}>{activeDeals.length} active deals</span>
        </div>
      </header>

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.5fr)_minmax(280px,1fr)]">
        <Frame accent="accent">
          <div className="p-6">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4" style={{ color: ACCENT }} />
              <Eyebrow>Today's focus · tasks table</Eyebrow>
            </div>
            {todayFocus.length > 0 ? (
              <div className="mt-4 space-y-3">
                {todayFocus.slice(0, 5).map((task) => (
                  <button key={task.id} type="button" onClick={() => onSelect(taskDetail(task))}
                    className="flex w-full items-start justify-between gap-4 rounded-xl border p-3 text-left transition hover:bg-[var(--theme-surface-hover)]"
                    style={{ borderColor: 'var(--panel-border-subtle)' }}>
                    <span>
                      <span className="block text-sm font-semibold">{String(task.label ?? task.title ?? 'Untitled task')}</span>
                      <span className="mt-1 block text-xs" style={{ color: 'var(--theme-text-muted)' }}>{String(task.when ?? 'Not scheduled')}</span>
                    </span>
                    <span className="rounded-md px-2 py-1 text-[10px] font-bold uppercase" style={{ background: 'rgba(21,128,61,0.10)', color: WIN }}>
                      {String(task.group ?? 'today')}
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="mt-4 rounded-xl border border-dashed p-6 text-sm" style={{ borderColor: 'var(--panel-border)', color: 'var(--theme-text-muted)' }}>
                No open task is marked for today. Create or schedule one in the Tasks workspace.
              </div>
            )}
          </div>
        </Frame>

        <Frame>
          <div className="p-6">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4" style={{ color: 'var(--theme-text-muted)' }} />
              <Eyebrow>Calendar connection</Eyebrow>
            </div>
            <p className="mt-4 text-sm font-semibold">No calendar event feed is connected.</p>
            <p className="mt-2 text-xs leading-relaxed" style={{ color: 'var(--theme-text-muted)' }}>
              This panel will show real workspace calendar events when a calendar adapter is connected. No appointments are inferred from sample data.
            </p>
          </div>
        </Frame>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <CheckCheck className="h-4 w-4" style={{ color: 'var(--theme-text)' }} />
            <h2 className="text-lg font-extrabold" style={{ fontFamily: FONT_DISPLAY }}>Open tasks</h2>
          </div>
          <Eyebrow>workspace_data.tasks</Eyebrow>
        </div>
        {openTasks.length === 0 ? (
          <div className="rounded-2xl border border-dashed p-6 text-sm" style={{ borderColor: 'var(--panel-border)', color: 'var(--theme-text-muted)' }}>No open tasks in this workspace.</div>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {openTasks.slice(0, 9).map((task) => (
              <button key={task.id} type="button" onClick={() => onSelect(taskDetail(task))}
                className="rounded-xl border p-4 text-left transition hover:bg-[var(--theme-surface-hover)]"
                style={{ borderColor: 'var(--panel-border)', background: 'var(--theme-surface)' }}>
                <span className="block text-sm font-semibold">{String(task.label ?? task.title ?? 'Untitled task')}</span>
                <span className="mt-1 block text-xs" style={{ color: 'var(--theme-text-muted)' }}>{String(task.when ?? 'Not scheduled')}</span>
                <span className="mt-3 block text-[10px] font-mono uppercase" style={{ color: ['true', 'yes', 'done', 'completed'].includes(String(task.done ?? '').toLowerCase()) ? WIN : RELANCE }}>{['true', 'yes', 'done', 'completed'].includes(String(task.done ?? '').toLowerCase()) ? 'Done' : String(task.group ?? 'Open')}</span>
              </button>
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <CircleDashed className="h-4 w-4" style={{ color: 'var(--theme-text)' }} />
            <h2 className="text-lg font-extrabold" style={{ fontFamily: FONT_DISPLAY }}>Active pipeline</h2>
          </div>
          <Eyebrow>workspace_data.deals</Eyebrow>
        </div>
        {activeDeals.length === 0 ? (
          <div className="rounded-2xl border border-dashed p-6 text-sm" style={{ borderColor: 'var(--panel-border)', color: 'var(--theme-text-muted)' }}>No active deal is registered in this workspace.</div>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {activeDeals.slice(0, 9).map((deal) => (
              <button key={deal.id} type="button" onClick={() => onSelect(dealDetail(deal))}
                className="rounded-xl border p-4 text-left transition hover:bg-[var(--theme-surface-hover)]"
                style={{ borderColor: 'var(--panel-border)', background: 'var(--theme-surface)' }}>
                <span className="block text-sm font-semibold">{String(deal.client ?? deal.title ?? 'Untitled deal')}</span>
                <span className="mt-1 block text-xs" style={{ color: 'var(--theme-text-muted)' }}>{String(deal.offer ?? 'Offer not specified')}</span>
                <span className="mt-3 flex items-center justify-between gap-2 text-[10px] font-mono uppercase">
                  <span style={{ color: 'var(--theme-text-muted)' }}>{String(deal.stage ?? 'Open')}</span>
                  <span style={{ color: ACCENT }}>{formatDealValue(deal.value, String(deal.currency ?? ''))}</span>
                </span>
              </button>
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="mb-4 flex items-center gap-2">
          <CircleDashed className="h-4 w-4" style={{ color: 'var(--theme-text)' }} />
          <h2 className="text-lg font-extrabold" style={{ fontFamily: FONT_DISPLAY }}>Workspace activity</h2>
          <Eyebrow>workspace_data.activity_events</Eyebrow>
        </div>
        {activityError && <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{activityError}</div>}
        {events === null && !activityError && <div role="status" className="rounded-xl border p-4 text-sm" style={{ borderColor: 'var(--panel-border)' }}>Loading workspace activity…</div>}
        {events && events.length === 0 && <div className="rounded-2xl border border-dashed p-6 text-sm" style={{ borderColor: 'var(--panel-border)', color: 'var(--theme-text-muted)' }}>No activity events have been recorded in this workspace.</div>}
        {events && events.length > 0 && (
          <ol className="space-y-2">
            {events.map((event) => (
              <li key={event.id} className="flex flex-wrap items-start gap-3 rounded-xl border p-3" style={{ borderColor: 'var(--panel-border)', background: 'var(--theme-surface)' }}>
                <span className="min-w-[112px] text-[10px] font-mono uppercase" style={{ color: 'var(--theme-text-dim)' }}>{activityTime(event.createdAt)}</span>
                <span className="min-w-[140px] text-[10px] font-bold uppercase" style={{ color: ACCENT }}>{event.eventType}</span>
                <span className="flex-1 text-sm" style={{ color: 'var(--theme-text-muted)' }}>{activitySummary(event)}</span>
              </li>
            ))}
          </ol>
        )}
      </section>

      <section>
        <div className="rounded-2xl border border-dashed p-6" style={{ borderColor: 'var(--panel-border)' }}>
          <div className="flex items-center gap-2"><PhoneCall className="h-4 w-4" /><Eyebrow>Call records</Eyebrow></div>
          <p className="mt-3 text-sm font-semibold">No call registry is connected to this workspace.</p>
          <p className="mt-1 text-xs" style={{ color: 'var(--theme-text-muted)' }}>Call briefs and call outcomes will appear here once a CRM or voice adapter writes them to a persistent call source.</p>
        </div>
      </section>
    </div>
  );
}
