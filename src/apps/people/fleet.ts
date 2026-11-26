/** People/Agents — fleet data (5 AI specialists) + content library + schedule.
 *  Pattern forked from KomputerMechanic Hermes Mission Control template:
 *  - Fleet: 5 specialist agents (Orchestrator / Scout / Scribe / Reach / Dev)
 *    with state, load, latency, tokens, model (template: route-agents + AGENTS)
 *  - Content: per-agent docs (template: route-content + DEMO_CONTENT_DOCS)
 *  - Schedule: 7-day activity heatmap (template: route-schedule + HEAT) */

export interface FleetAgent {
  code: string;
  initials: string;
  name: string;
  role: string;
  channel: string;
  state: 'EXECUTING' | 'IDLE' | 'AWAITING' | 'RETRY' | 'BLOCKED';
  task: string;
  load: number;          // 0-100
  tokens: string;        // e.g. "1.24M"
  latency: string;       // e.g. "14ms" or "—"
  success: number;       // 0-100
  tasksToday: number;
  share: number;         // % of total cycles
  defaultModel: string;
  accent: string;        // hex
  // Detail-page extras
  bio: string;           // 1-paragraph agent description
  capabilities: string[]; // 3-5 capability tags
  recentRuns: { ts: string; task: string; status: 'ok' | 'warn' | 'err' }[];
  peers: string[];       // agent codes it talks to (Manager→Worker pattern)
}

// Live tenant records are loaded through the workspace-scoped People repository.
// No demo agents are presented as running agents in a real tenant.
export const FLEET_AGENTS: FleetAgent[] = [];


/** State meta — used by the Fleet subpage to color the state pill. */
export const STATE_META: Record<FleetAgent['state'], { label: string; color: string; bg: string; pulse: boolean }> = {
  EXECUTING: { label: 'Executing', color: '#15803d', bg: '#dcfce7', pulse: true },
  IDLE:      { label: 'Idle',      color: '#78716c', bg: '#f5f5f4', pulse: false },
  AWAITING:  { label: 'Awaiting',  color: '#b45309', bg: '#fef3c7', pulse: false },
  RETRY:     { label: 'Retry',     color: '#b91c1c', bg: '#fee2e2', pulse: true },
  BLOCKED:   { label: 'Blocked',   color: '#1d4ed8', bg: '#dbeafe', pulse: false },
};

/* ════════════════════════════════════════════════════════════════════════
 *  Content Library (template: route-content + DEMO_CONTENT_DOCS)
 * ════════════════════════════════════════════════════════════════════════ */

export interface ContentDoc {
  id: string;
  agentKey: 'orchestrator' | 'scout' | 'scribe' | 'reach' | 'dev';
  filename: string;
  title: string;
  modifiedAt: string;     // ISO
  size: number;           // bytes
  excerpt: string;
  tags: string[];
}

export const CONTENT_DOCS: ContentDoc[] = [
  {
    id: 'doc-001',
    agentKey: 'dev',
    filename: '2026-07-23_mission-control-build-notes.md',
    title: 'Mission Control — Build Notes',
    modifiedAt: '2026-07-23T08:56:46Z',
    size: 1845,
    excerpt: 'Stack: Python stdlib server, read-only on Hermes DBs. SSE live stream + agent drawer + content library.',
    tags: ['build', 'infra'],
  },
  {
    id: 'doc-002',
    agentKey: 'scribe',
    filename: '2026-07-22_building-ai-agents-on-budget.md',
    title: 'Building AI Agents on a Budget',
    modifiedAt: '2026-07-22T15:18:02Z',
    size: 2540,
    excerpt: 'A short intro draft. You do not need a huge API bill to run a real multi-agent system. With a cheap VPS and a subscription model, you can route simple work to a fast model and keep the premium one for the hard stuff.',
    tags: ['content', 'budget'],
  },
  {
    id: 'doc-003',
    agentKey: 'scout',
    filename: '2026-07-22_multi-agent-trends.md',
    title: 'Multi-Agent Systems Are Trending',
    modifiedAt: '2026-07-22T11:32:18Z',
    size: 2920,
    excerpt: 'Research summary. Why now: orchestrator + specialist pattern is winning. Cheap models make routing viable. gemma-4-free + gpt-5.5 complexity routing cuts load. Sources: Hermes docs.',
    tags: ['research', 'trends'],
  },
  {
    id: 'doc-004',
    agentKey: 'reach',
    filename: '2026-07-21_outreach-cadence-playbook.md',
    title: 'Outreach Cadence Playbook',
    modifiedAt: '2026-07-21T09:14:55Z',
    size: 1670,
    excerpt: 'Day 0 → Day 2 → Day 5 → Day 10 → Day 21. Each touch has a single purpose: warm, qualify, book, close, retain. Never send the same angle twice.',
    tags: ['outreach', 'playbook'],
  },
  {
    id: 'doc-005',
    agentKey: 'orchestrator',
    filename: '2026-07-20_routing-policy.md',
    title: 'Complexity Routing Policy',
    modifiedAt: '2026-07-20T17:42:09Z',
    size: 1230,
    excerpt: 'Default: gemma-4-free. Escalate to gpt-5.5 when: plan steps > 3, code edit length > 200, or tool calls > 5. Demote to gpt-5-mini when: pure classification, single-file refactor < 50 LOC.',
    tags: ['routing', 'policy'],
  },
  {
    id: 'doc-006',
    agentKey: 'scribe',
    filename: '2026-07-19_voice-style-guide.md',
    title: 'Voice & Style Guide',
    modifiedAt: '2026-07-19T14:08:33Z',
    size: 980,
    excerpt: 'Direct, never breathless. Active voice. Concrete numbers over hand-wavy qualifiers. One idea per paragraph. Read aloud — if it sounds like marketing, rewrite.',
    tags: ['voice', 'style'],
  },
];

/* ════════════════════════════════════════════════════════════════════════
 *  Schedule (template: route-schedule + HEAT)
 *  7-day × 24-hour activity heatmap (Mon-Sun, 0h-23h)
 *  Values are normalized 0-100 per (agent, hour)
 * ════════════════════════════════════════════════════════════════════════ */

export const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;
export const HOURS = Array.from({ length: 24 }, (_, i) => i);

/** Schedule grid: 7 days × 24 hours, value = activity 0-100 (rendered as opacity). */
// No runtime activity history has been ingested yet. Zero means unavailable,
// not measured inactivity; the UI must label this as unreported telemetry.
export const SCHEDULE_GRID: number[][] = Array.from({ length: 7 }, () => Array(24).fill(0));

export interface ScheduleTask {
  id: string;
  day: typeof DAYS[number];
  startHour: number;
  endHour: number;
  agent: string;
  label: string;
  kind: 'sync' | 'run' | 'audit' | 'review' | 'sync-up';
}

// Planned tasks are sourced from persisted workspace tasks, never static fixtures.
export const SCHEDULE_TASKS: ScheduleTask[] = [];
