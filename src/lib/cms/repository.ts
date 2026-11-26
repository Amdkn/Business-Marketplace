/** Marketplace CMS repository.
 *  Collection definitions are source-controlled; tenant records are persisted
 *  in dedicated workspace_data tables. Real tenants never fall back to demo
 *  records. Missing tenant context and failed writes are explicit errors. */
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
 *  - 'no-org'       : client works, but the user has no active organization membership
 *  - 'connected'    : client works and organization_id is resolved
 */
export function supabaseMode(): SupabaseMode {
  return _mode;
}

export function lastSupabaseError(): string | null {
  return _lastError;
}

function setMode(next: SupabaseMode, err?: unknown): void {
  const previous = _mode;
  _mode = next;
  _lastError = err instanceof Error ? err.message : err ? String(err) : null;
  if (_modeLogged && previous === next) return;
  if (!_modeLogged) {
    _modeLogged = true;
    // L'info-level est volontaire : en mode démo, c'est le comportement
    // attendu. On ne crie pas "warning" pour un comportement correct.
    // eslint-disable-next-line no-console
    console.info(
      `[cms] supabase mode: ${_mode}` +
        (_lastError ? ` (last error: ${_lastError})` : '') +
        '',
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

/* Collection definitions are source-controlled; tenant records are stored in dedicated tables. */

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

export interface CurrentWorkspaceContext {
  organizationId: string;
  workspaceId: string;
  userId: string;
  workspaceName: string;
}

let cachedWorkspaceContext: Promise<CurrentWorkspaceContext | null> | null = null;

// Auth transitions invalidate the resolved tenant context. Never retain one
// user's organization/workspace after logout or account switching.
supabase.auth.onAuthStateChange(() => {
  cachedWorkspaceContext = null;
});

function toWorkspaceRow(
  collectionId: string,
  item: CmsItem,
  context: CurrentWorkspaceContext,
): Record<string, unknown> {
  const shape = COLLECTION_FIELDS[collectionId];
  if (!shape) throw new Error(`[cms] no dedicated table for collection: ${collectionId}`);
  const row: Record<string, unknown> = {
    id: item.id,
    organization_id: context.organizationId,
    workspace_id: context.workspaceId,
    created_by_user_id: context.userId,
    title: item[shape.title] ?? null,
    extra_data: Object.fromEntries(Object.entries(item).filter(([key]) => key !== 'id')),
    updated_at: new Date().toISOString(),
  };
  for (const field of shape.fields) row[toSnake(field)] = item[field] ?? null;
  return row;
}

/**
 * Resolve the signed-in user's unique active workspace. The current UI has no
 * workspace switcher yet, so multiple active memberships fail closed instead
 * of silently mixing records from different workspaces.
 */
export async function getCurrentWorkspaceContext(): Promise<CurrentWorkspaceContext | null> {
  if (!supabaseConfigured) {
    setMode('unconfigured');
    return null;
  }
  if (cachedWorkspaceContext) return cachedWorkspaceContext;

  cachedWorkspaceContext = (async () => {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      if (!session?.user) {
        setMode('no-org');
        return null;
      }

      // enterprise is a private schema. Resolve only the caller's unique
      // active organization/workspace through the authenticated identity RPC.
      const { data: contexts, error: contextError } = await supabase
        .schema('identity')
        .rpc('get_current_workspace_context');
      if (contextError) throw contextError;
      const context = Array.isArray(contexts) ? contexts[0] : contexts;
      if (!context) {
        setMode('no-org', 'No unique active organization/workspace context');
        return null;
      }

      setMode('connected');
      return {
        organizationId: context.organization_id as string,
        workspaceId: context.workspace_id as string,
        userId: session.user.id,
        workspaceName: context.workspace_name as string,
      };
    } catch (err) {
      setMode('unreachable', err);
      return null;
    }
  })();

  const resolved = await cachedWorkspaceContext;
  if (!resolved) cachedWorkspaceContext = null;
  return resolved;
}

/** Compatibility helper for callers that only need the organization key. */
export async function getCurrentOrgId(): Promise<string | null> {
  const context = await getCurrentWorkspaceContext();
  return context?.organizationId ?? null;
}

/** Hydrate one dedicated tenant table. null means local-only or no auth session;
 *  database/API failures reject so callers cannot mistake an outage for an empty list. */
export async function hydrateCollection(collectionId: string): Promise<CmsItem[] | null> {
  if (!tableFor(collectionId)) return null;
  if (!supabaseConfigured) {
    setMode('unconfigured');
    return null;
  }
  const context = await getCurrentWorkspaceContext();
  if (!context) return null;
  const { data, error } = await supabase.schema('workspace_data').from(collectionId)
    .select('*')
    .eq('organization_id', context.organizationId)
    .eq('workspace_id', context.workspaceId)
    .order('created_at', { ascending: false });
  if (error) {
    setMode('unreachable', error);
    throw error;
  }
  setMode('connected');
  return (data ?? []).map((row) => fromWorkspaceRow(collectionId, row as Record<string, unknown>));
}

/** Collection metadata lives in source-controlled definitions, not tenant rows. */
export async function upsertCollectionDef(_def: CmsCollectionDef): Promise<void> { /* definitions are versioned with the app */ }

/** Persist one item. A configured production client must never silently drop a write. */
export async function upsertItem(collectionId: string, item: CmsItem): Promise<void> {
  if (!supabaseConfigured) {
    setMode('unconfigured');
    return; // local-only development/demo mode
  }
  const context = await getCurrentWorkspaceContext();
  if (!context) {
    const error = new Error('[cms] write refused: authenticated workspace context is unavailable');
    setMode('no-org', error);
    throw error;
  }
  if (!tableFor(collectionId)) {
    const error = new Error(`[cms] write refused: collection "${collectionId}" has no persistent Marketplace table`);
    setMode('unreachable', error);
    throw error;
  }
  try {
    const row = toWorkspaceRow(collectionId, item, context);
    const { error } = await supabase.schema('workspace_data').from(collectionId)
      .upsert(row, { onConflict: 'id' });
    if (error) throw error;
    setMode('connected');
  } catch (err) { setMode('unreachable', err); throw err; }
}

/** Delete only the matching row within the resolved tenant; never report a silent success. */
export async function removeItem(collectionId: string, id: string): Promise<void> {
  if (!supabaseConfigured) {
    setMode('unconfigured');
    return;
  }
  const context = await getCurrentWorkspaceContext();
  if (!context) {
    const error = new Error('[cms] delete refused: authenticated workspace context is unavailable');
    setMode('no-org', error);
    throw error;
  }
  if (!tableFor(collectionId)) {
    const error = new Error(`[cms] delete refused: collection "${collectionId}" has no persistent Marketplace table`);
    setMode('unreachable', error);
    throw error;
  }
  const { error } = await supabase.schema('workspace_data').from(collectionId)
    .delete()
    .eq('id', id)
    .eq('organization_id', context.organizationId)
    .eq('workspace_id', context.workspaceId);
  if (error) {
    setMode('unreachable', error);
    throw error;
  }
  setMode('connected');
}
