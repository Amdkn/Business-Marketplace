// Shared tenant repository for Garden views.
// All operational Garden collections persist in workspace_data, the same tenant
// data plane used by the Web Desktop CMS. No legacy dashboard schema fallback.
import { supabase, SUPABASE_READY } from '../lib/supabase';
import { IS_SAAS } from '../config/mode';
import { getActiveOrgId, getActiveWorkspaceId, assertOrgIdForWrite } from '../lib/tenant';

export interface Repository<T extends { id: string }> {
  list(): Promise<T[]>;
  findById(id: string): Promise<T | null>;
  create(item: Partial<T> & { id?: string }): Promise<T>;
  update(id: string, patch: Partial<T>): Promise<T>;
  remove(id: string): Promise<void>;
}
type Mapper<T> = { toDb: (ui: Partial<T>) => Record<string, unknown>; fromDb: (row: Record<string, unknown>) => T };
interface MakeRepositoryOptions<T> { mapper?: Mapper<T> }

const COLLECTIONS: Record<string, { table: string; title: string; columns?: Record<string,string> }> = {
  clients: { table: 'clients', title: 'name', columns: { segment:'segment', ticket:'ticket', openThreads:'open_threads', nextSession:'next_session', health:'health', onboardingStep:'onboarding_step', status:'status' } },
  agents: { table: 'people_agents', title: 'name', columns: { codename:'codename', role:'role', status:'status', task:'task', rank:'rank', domain:'domain', squad:'squad', cadence:'cadence' } },
  documents: { table: 'documents', title: 'title', columns: { clientId:'client_id', fileUrl:'file_url', mimeType:'mime_type' } },
  invoices: { table: 'invoices', title: 'title', columns: { clientId:'client_id', amount:'amount', currency:'currency', issuedAt:'issued_at', dueAt:'due_at', paidAt:'paid_at', status:'status' } },
  legal_docs: { table: 'legal_documents', title: 'title', columns: { clientId:'client_id', type:'document_type', category:'category', status:'document_status', fileUrl:'file_url', notes:'notes' } },
  missions: { table: 'missions', title: 'title', columns: { agentId:'agent_principal_id', priority:'priority', status:'status', position:'position', notes:'notes' } },
  sales_leads: { table: 'deals', title: 'name', columns: { offer:'offer', value:'value', stage:'stage' } },
  sops: { table: 'runbooks', title: 'title', columns: { category:'category', updated:'updated', content:'steps' } },
};

function makeWorkspaceMapper<T extends { id: string }>(collection: string): Mapper<T> {
  const shape = COLLECTIONS[collection];
  if (!shape) throw new Error(`[${collection}] no canonical workspace_data collection mapping`);
  const reverse = Object.fromEntries(Object.entries(shape.columns ?? {}).map(([ui,db]) => [db,ui]));
  return {
    toDb(ui) {
      const source = ui as Record<string, unknown>;
      const extra: Record<string, unknown> = {};
      for (const [key,value] of Object.entries(source)) {
        if (key === 'id' || key === shape.title || key === 'orgId' || key === 'createdAt' || key === 'updatedAt') continue;
        if (!(key in (shape.columns ?? {}))) extra[key] = value;
      }
      const row: Record<string, unknown> = { title: source[shape.title] ?? null, extra_data: extra };
      if (source.id) row.id = source.id;
      for (const [uiKey,dbKey] of Object.entries(shape.columns ?? {})) {
        if (source[uiKey] !== undefined) row[dbKey] = source[uiKey];
      }
      // UI invoice IDs and amounts remain strings; Postgres numeric accepts numeric strings.
      return row;
    },
    fromDb(row) {
      const extra = row.extra_data && typeof row.extra_data === 'object' ? row.extra_data as Record<string,unknown> : {};
      const result: Record<string,unknown> = { ...extra, id: row.id, createdAt: row.created_at, updatedAt: row.updated_at };
      if (row.title !== undefined && row.title !== null) result[shape.title] = row.title;
      for (const [dbKey,uiKey] of Object.entries(reverse)) if (row[dbKey] !== undefined && row[dbKey] !== null) result[uiKey] = row[dbKey];
      // Compatibility aliases expected by the existing Garden components.
      if (collection === 'agents' && result.currentTask === undefined && result.task !== undefined) result.currentTask = result.task;
      // An unset currency stays visibly unset; never fabricate USD for a tenant record.
      if (collection === 'invoices' && result.currency === undefined) result.currency = '';
      if (collection === 'documents' && result.uploadedBy === undefined) result.uploadedBy = null;
      return result as T;
    },
  };
}

export const identityMapper = <T>(): Mapper<T> => ({ toDb: (ui) => ui as Record<string,unknown>, fromDb: (row) => row as unknown as T });

export function makeRepository<T extends { id: string }>(collection: string, seed: T[], options: MakeRepositoryOptions<T> = {}): Repository<T> {
  const shape = COLLECTIONS[collection];
  if (!shape) throw new Error(`[${collection}] unmapped Garden collection; refusing to query a non-existent table`);
  const mapper = options.mapper ?? makeWorkspaceMapper<T>(collection);
  const lsKey = `marketplace_dashboard_${collection}`;

  if (SUPABASE_READY) {
    const table = () => supabase.schema('workspace_data').from(shape.table);
    const tenant = () => {
      const orgId = getActiveOrgId();
      const workspaceId = getActiveWorkspaceId();
      assertOrgIdForWrite(orgId, collection);
      if (!workspaceId) {
        throw new Error(`[${collection}] Cannot access tenant data without one active workspace membership.`);
      }
      return { orgId, workspaceId };
    };
    return {
      async list() {
        const { orgId, workspaceId } = tenant();
        const { data,error } = await table().select('*')
          .eq('organization_id',orgId)
          .eq('workspace_id',workspaceId)
          .order('created_at',{ascending:false});
        if (error) throw new Error(`[${collection}] ${error.message}`);
        return (data ?? []).map(row => mapper.fromDb(row as Record<string,unknown>));
      },
      async findById(id) {
        const { orgId, workspaceId } = tenant();
        const { data,error } = await table().select('*')
          .eq('organization_id',orgId)
          .eq('workspace_id',workspaceId)
          .eq('id',id)
          .maybeSingle();
        if (error) throw new Error(`[${collection}] ${error.message}`);
        return data ? mapper.fromDb(data as Record<string,unknown>) : null;
      },
      async create(item) {
        const { orgId, workspaceId } = tenant();
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) throw new Error(`[${collection}] authenticated user unavailable`);
        const row = mapper.toDb(item);
        row.organization_id = orgId;
        row.workspace_id = workspaceId;
        row.created_by_user_id = user.id;
        if (!item.id) delete row.id;
        const { data,error } = await table().insert(row).select().single();
        if (error) throw new Error(`[${collection}] ${error.message}`);
        return mapper.fromDb(data as Record<string,unknown>);
      },
      async update(id,patch) {
        const { orgId, workspaceId } = tenant();
        const { data: current,error: readError } = await table().select('*')
          .eq('organization_id',orgId)
          .eq('workspace_id',workspaceId)
          .eq('id',id)
          .maybeSingle();
        if (readError) throw new Error(`[${collection}] ${readError.message}`);
        if (!current) throw new Error(`[${collection}] not found: ${id}`);
        const merged = { ...mapper.fromDb(current as Record<string,unknown>), ...patch } as Partial<T>;
        const row = mapper.toDb(merged);
        delete row.id; delete row.organization_id; delete row.created_by_user_id;
        const { data,error } = await table().update({ ...row, updated_at:new Date().toISOString() })
          .eq('organization_id',orgId)
          .eq('workspace_id',workspaceId)
          .eq('id',id)
          .select()
          .single();
        if (error) throw new Error(`[${collection}] ${error.message}`);
        return mapper.fromDb(data as Record<string,unknown>);
      },
      async remove(id) {
        const { orgId, workspaceId } = tenant();
        const { error } = await table().delete()
          .eq('organization_id',orgId)
          .eq('workspace_id',workspaceId)
          .eq('id',id);
        if (error) throw new Error(`[${collection}] ${error.message}`);
      },
    };
  }

  // Local-only fallback is explicitly separate from production persistence.
  const read = (): T[] => {
    const raw = localStorage.getItem(lsKey);
    if (raw) { try { return JSON.parse(raw) as T[]; } catch { /* reseed below */ } }
    localStorage.setItem(lsKey,JSON.stringify(seed));
    return seed;
  };
  const write = (items:T[]) => localStorage.setItem(lsKey,JSON.stringify(items));
  return {
    async list() { const orgId=getActiveOrgId(); return IS_SAAS && orgId ? read().filter(x => (x as unknown as {orgId?:string}).orgId===orgId) : read(); },
    async findById(id) { return read().find(x=>x.id===id) ?? null; },
    async create(item) { const orgId=getActiveOrgId(); assertOrgIdForWrite(orgId,collection); const created={...item,id:item.id??crypto.randomUUID(),orgId} as T; write([...read(),created]); return created; },
    async update(id,patch) { const items=read(),i=items.findIndex(x=>x.id===id); if(i<0) throw new Error(`[${collection}] not found: ${id}`); const next=[...items]; next[i]={...next[i],...patch}; write(next); return next[i]; },
    async remove(id) { write(read().filter(x=>x.id!==id)); },
  };
}
