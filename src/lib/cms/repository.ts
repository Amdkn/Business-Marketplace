/** CmsRepository — Supabase-backed persistence for CMS collections, Phase 1.
 *  Mirrors the exact dual-write pattern already proven in the Life OS `DomainDB`
 *  (idb.ts): try Supabase, fall back silently on any failure or missing auth.
 *  There is no sign-in UI yet, so `getCurrentOrgId()` simply returns null when
 *  no session exists — every caller already handles that as "use the seed".
 *
 *  Brief-B (2026-08-11) — extension. Le repli local doit être EXPLICITE :
 *  on ne simule rien. `supabaseMode()` retourne l'état observé, et chaque
 *  fallback loggue un message d'info (pas warn — c'est attendu en démo).
 *  Le mapping `tableFor()` ouvre la voie au nouveau schéma typé (23 tables)
 *  sans casser le chemin générique existant. */
import { supabase, supabaseConfigured } from '../supabase';
import type { CmsCollectionDef, CmsItem } from './types';

/* ─────────────────────────────────────────────────────────────────────
 * Mode observability — Brief-B §4
 * Le but : un dev qui ouvre la console voit immédiatement si l'app
 * parle à Supabase ou si elle tourne sur le seed local. Pas de
 * silence trompeur, jamais.
 * ──────────────────────────────────────────────────────────────────── */

export type SupabaseMode = 'connected' | 'unconfigured' | 'unreachable' | 'no-org';

let _mode: SupabaseMode = supabaseConfigured ? 'unreachable' : 'unconfigured';
let _modeLogged = false;
let _lastError: string | null = null;

/** Returns the last observed state of the Supabase backend.
 *  - 'unconfigured' : no VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in env
 *  - 'unreachable'  : client exists but every call so far has failed
 *  - 'no-org'       : client works, but the user has no membership row
 *  - 'connected'    : client works and org_id is resolved
 */
export function supabaseMode(): SupabaseMode {
  return _mode;
}

export function lastSupabaseError(): string | null {
  return _lastError;
}

function setMode(next: SupabaseMode, err?: unknown): void {
  if (_modeLogged && _mode === next) return;
  _mode = next;
  _lastError = err instanceof Error ? err.message : err ? String(err) : null;
  if (!_modeLogged) {
    _modeLogged = true;
    // L'info-level est volontaire : en mode démo, c'est le comportement
    // attendu. On ne crie pas "warning" pour un comportement correct.
    // eslint-disable-next-line no-console
    console.info(
      `[cms] supabase mode: ${_mode}` +
        (_lastError ? ` (last error: ${_lastError})` : '') +
        ` — falling back to bundled seed is the documented contract.`,
    );
  } else if (next === 'unreachable' || next === 'no-org') {
    // Mode change after first success — useful when DNS comes back or a
    // session is logged out. Bumped to warn to make the regression visible.
    // eslint-disable-next-line no-console
    console.warn(
      `[cms] supabase mode changed → ${next}` +
        (_lastError ? ` (last error: ${_lastError})` : ''),
    );
  }
}

/* ─────────────────────────────────────────────────────────────────────
 * Collection → table mapping — Brief-B §1
 * Le nouveau schéma a une table par collection. Le repository historique
 * utilise `cms_items` (générique) pour rester compatible avec ce qui
 * tourne en prod aujourd'hui. `tableFor()` est l'aiguillage : si la
 * collection a une table typée, on l'utilise ; sinon, on retombe sur
 * `cms_items` (events append-only).
 * ──────────────────────────────────────────────────────────────────── */

// Each persistent CMS collection has a dedicated typed table in workspace_data.
const COLLECTION_FIELDS: Record<string, { title: string; fields: string[] }> = {
  "clients": {
    "title": "name",
    "fields": [
      "segment",
      "ticket",
      "openThreads",
      "nextSession",
      "health",
      "onboardingStep",
      "status"
    ]
  },
  "articles": {
    "title": "title",
    "fields": [
      "category",
      "reads",
      "updated",
      "body"
    ]
  },
  "team": {
    "title": "name",
    "fields": [
      "role",
      "focus",
      "status",
      "bio"
    ]
  },
  "people_agents": {
    "title": "name",
    "fields": [
      "codename",
      "role",
      "status",
      "task",
      "rank",
      "domain",
      "squad",
      "cadence"
    ]
  },
  "runbooks": {
    "title": "title",
    "fields": [
      "category",
      "updated",
      "steps"
    ]
  },
  "incidents": {
    "title": "title",
    "fields": [
      "when",
      "severity",
      "resolution"
    ]
  },
  "services": {
    "title": "name",
    "fields": [
      "note",
      "status",
      "detail"
    ]
  },
  "it_experiments": {
    "title": "title",
    "fields": [
      "stage",
      "meta",
      "notes"
    ]
  },
  "deploys": {
    "title": "commit",
    "fields": [
      "target",
      "when",
      "status"
    ]
  },
  "tasks": {
    "title": "label",
    "fields": [
      "when",
      "group",
      "done"
    ]
  },
  "marketplace_listings": {
    "title": "name",
    "fields": [
      "tag",
      "blurb",
      "installed",
      "featured"
    ]
  },
  "product_items": {
    "title": "title",
    "fields": [
      "stage",
      "meta",
      "priority"
    ]
  },
  "product_releases": {
    "title": "name",
    "fields": [
      "version",
      "when",
      "notes"
    ]
  },
  "growth_channels": {
    "title": "name",
    "fields": [
      "leads",
      "cac",
      "trend"
    ]
  },
  "growth_experiments": {
    "title": "title",
    "fields": [
      "lift",
      "notes"
    ]
  },
  "deals": {
    "title": "client",
    "fields": [
      "offer",
      "value",
      "stage"
    ]
  },
  "invoices": {
    "title": "client",
    "fields": [
      "amount",
      "due",
      "status"
    ]
  },
  "contracts": {
    "title": "document",
    "fields": [
      "client",
      "signed",
      "status"
    ]
  },
  "policies": {
    "title": "name",
    "fields": [
      "updated",
      "body"
    ]
  },
  "session_notes": {
    "title": "topic",
    "fields": [
      "clientName",
      "date",
      "duration",
      "sentiment",
      "body"
    ]
  },
  "legal_ai_act_checks": {
    "title": "label",
    "fields": [
      "category",
      "done",
      "description",
      "clearedAt"
    ]
  },
  "legal_frameworks": {
    "title": "name",
    "fields": [
      "family",
      "short",
      "scope",
      "owner",
      "appliesFrom",
      "status"
    ]
  },
  "legal_controls": {
    "title": "code",
    "fields": [
      "title",
      "framework",
      "severity",
      "owner",
      "evidenceCount",
      "lastTested",
      "status"
    ]
  },
  "legal_compliance_policies": {
    "title": "name",
    "fields": [
      "version",
      "owner",
      "updated",
      "reviewBy",
      "body"
    ]
  },
  "legal_evidence": {
    "title": "title",
    "fields": [
      "control",
      "kind",
      "location",
      "collectedAt",
      "expiresAt"
    ]
  },
  "legal_risks": {
    "title": "title",
    "fields": [
      "area",
      "likelihood",
      "impact",
      "rating",
      "mitigation",
      "owner",
      "status"
    ]
  },
  "legal_vendors": {
    "title": "name",
    "fields": [
      "category",
      "dataAccess",
      "dpaSigned",
      "dpaDate",
      "lastReview",
      "risk"
    ]
  },
  "legal_gaps": {
    "title": "title",
    "fields": [
      "control",
      "framework",
      "severity",
      "openedOn",
      "owner",
      "status"
    ]
  },
  "personas": {
    "title": "name",
    "fields": [
      "pronouns",
      "wants",
      "blockers",
      "vocabulary",
      "anchor",
      "anchorKind",
      "anchorDate",
      "domain"
    ]
  },
  "memory": {
    "title": "fact",
    "fields": [
      "fact",
      "provenance",
      "retainedOn",
      "verification",
      "verifiedBy",
      "recheckOn",
      "domain",
      "notes"
    ]
  },
  "codex": {
    "title": "situation",
    "fields": [
      "situation",
      "recipe",
      "why",
      "appliedCount",
      "lastApplied",
      "domain",
      "owners",
      "caveats"
    ]
  },
  "approval_decisions": {
    "title": "scenarioName",
    "fields": [
      "scenarioId",
      "scenarioName",
      "verdict",
      "decidedBy",
      "proposalCount",
      "rationale",
      "decidedAt"
    ]
  },
  "squads": {
    "title": "name",
    "fields": [
      "mission",
      "lead",
      "members",
      "rank",
      "status",
      "lastSprint"
    ]
  },
  "content": {
    "title": "title",
    "fields": [
      "channel",
      "audience",
      "status",
      "readTime",
      "hook",
      "cta"
    ]
  }
};

export function tableFor(collectionId: string): string | null {
  return COLLECTION_FIELDS[collectionId] ? collectionId : null;
}

function toSnake(key: string): string {
  return key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

function fromWorkspaceRow(collectionId: string, row: Record<string, unknown>): CmsItem {
  const shape = COLLECTION_FIELDS[collectionId];
  const extra = (row.extra_data && typeof row.extra_data === 'object' ? row.extra_data : {}) as Record<string, unknown>;
  const item: Record<string, unknown> = { ...extra, id: row.id };
  if (shape && row.title != null) item[shape.title] = row.title;
  for (const field of shape?.fields ?? []) {
    const value = row[toSnake(field)];
    if (value !== null && value !== undefined) item[field] = value;
  }
  return item as CmsItem;
}

function toWorkspaceRow(collectionId: string, item: CmsItem, orgId: string, userId: string): Record<string, unknown> {
  const shape = COLLECTION_FIELDS[collectionId];
  if (!shape) throw new Error(`[cms] no dedicated table for collection: ${collectionId}`);
  const row: Record<string, unknown> = {
    id: item.id,
    organization_id: orgId,
    created_by_user_id: userId,
    title: item[shape.title] ?? null,
    extra_data: Object.fromEntries(Object.entries(item).filter(([key]) => key !== 'id')),
    updated_at: new Date().toISOString(),
  };
  for (const field of shape.fields) row[toSnake(field)] = item[field] ?? null;
  return row;
}

export async function getCurrentOrgId(): Promise<string | null> {
  if (!supabaseConfigured) { setMode('unconfigured'); return null; }
  if (cachedOrgId !== undefined) return cachedOrgId;
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) { setMode('no-org'); cachedOrgId = null; return null; }
    const { data, error } = await supabase.schema('identity')
      .from('organization_memberships').select('organization_id')
      .eq('user_id', session.user.id).eq('membership_status', 'ACTIVE')
      .limit(1).maybeSingle();
    if (error || !data) { setMode('no-org', error ?? 'no active membership'); cachedOrgId = null; return null; }
    cachedOrgId = data.organization_id as string; setMode('connected'); return cachedOrgId;
  } catch (err) { setMode('unreachable', err); cachedOrgId = null; return null; }
}

/** Hydrate one dedicated tenant table; demo-only collections deliberately stay local. */
export async function hydrateCollection(collectionId: string): Promise<CmsItem[] | null> {
  const orgId = await getCurrentOrgId();
  if (!orgId || !tableFor(collectionId)) return null;
  try {
    const { data, error } = await supabase.schema('workspace_data').from(collectionId)
      .select('*').eq('organization_id', orgId).order('created_at', { ascending: false });
    if (error || !data) { setMode('unreachable', error); return null; }
    setMode('connected');
    return data.map((row) => fromWorkspaceRow(collectionId, row as Record<string, unknown>));
  } catch (err) { setMode('unreachable', err); return null; }
}

/** Collection metadata lives in source-controlled definitions, not tenant rows. */
export async function upsertCollectionDef(_def: CmsCollectionDef): Promise<void> { /* definitions are versioned with the app */ }

/** Persist one item in its dedicated typed collection table. */
export async function upsertItem(collectionId: string, item: CmsItem): Promise<void> {
  const orgId = await getCurrentOrgId();
  if (!orgId || !tableFor(collectionId)) return;
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;
    const row = toWorkspaceRow(collectionId, item, orgId, session.user.id);
    const { error } = await supabase.schema('workspace_data').from(collectionId).upsert(row, { onConflict: 'id' });
    if (error) throw error;
    setMode('connected');
  } catch (err) { setMode('unreachable', err); throw err; }
}

/** Delete only the matching row within the resolved tenant. */
export async function removeItem(collectionId: string, id: string): Promise<void> {
  const orgId = await getCurrentOrgId();
  if (!orgId || !tableFor(collectionId)) return;
  const { error } = await supabase.schema('workspace_data').from(collectionId)
    .delete().eq('id', id).eq('organization_id', orgId);
  if (error) throw error;
}


