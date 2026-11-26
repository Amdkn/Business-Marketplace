// Canonical AI agent directory. Identity and delegation remain in identity.*;
// this repository reads only the workspace-scoped, permission-filtered API model.
import { supabase, SUPABASE_READY } from '../lib/supabase';
import { getActiveOrgId, getActiveWorkspaceId } from '../lib/tenant';
import type { Agent } from '../lib/types';

export const agentsRepo = {
  async list(): Promise<Agent[]> {
    if (!SUPABASE_READY) return [];
    const organizationId = getActiveOrgId();
    const workspaceId = getActiveWorkspaceId();
    if (!organizationId || !workspaceId) throw new Error('Active workspace context required.');

    const { data, error } = await supabase.functions.invoke('marketplace-api', {
      body: { action: 'list_workspace_agents', organization_id: organizationId, workspace_id: workspaceId },
    });
    if (error) throw error;
    const rows = Array.isArray(data?.data) ? data.data : [];
    return rows.map((row: Record<string, unknown>) => ({
      id: String(row.id),
      name: String(row.display_name ?? row.agent_key ?? 'Unnamed agent'),
      role: 'operator',
      email: null,
      status: row.principal_status === 'ACTIVE' ? 'active' : row.principal_status === 'PAUSED' ? 'paused' : 'archived',
      createdAt: String(row.created_at ?? ''),
      updatedAt: String(row.created_at ?? ''),
      agentKey: String(row.agent_key ?? ''),
      agentClass: String(row.agent_class ?? ''),
      runtime: String(row.runtime ?? ''),
      permissionCodes: Array.isArray(row.permission_codes) ? row.permission_codes.map(String) : [],
    }));
  },
};
