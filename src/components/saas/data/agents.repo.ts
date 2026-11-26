// Canonical AI agent directory. Identity and delegation remain in identity.*;
// the browser consumes only the workspace-scoped Marketplace API projection.
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
      delegationId: row.delegation_id ? String(row.delegation_id) : undefined,
      name: String(row.display_name ?? row.agent_key ?? 'Unnamed agent'),
      role: 'operator' as const,
      email: null,
      status: row.principal_status === 'ACTIVE' ? 'active' : row.principal_status === 'PAUSED' ? 'paused' : 'archived',
      createdAt: String(row.created_at ?? ''),
      updatedAt: String(row.created_at ?? ''),
      agentKey: String(row.agent_key ?? ''),
      agentClass: String(row.agent_class ?? ''),
      runtime: String(row.runtime ?? ''),
      permissionCodes: Array.isArray(row.permission_codes) ? row.permission_codes.map(String) : [],
    } as Agent));
  },

  async register(input: {
    agentKey: string;
    displayName: string;
    agentClass: string;
    runtime: string;
    permissionCodes: string[];
  }): Promise<void> {
    if (!SUPABASE_READY) throw new Error('Marketplace API is not configured.');
    const organizationId = getActiveOrgId();
    const workspaceId = getActiveWorkspaceId();
    if (!organizationId || !workspaceId) throw new Error('Active workspace context required.');
    const { error } = await supabase.functions.invoke('marketplace-api', {
      body: {
        action: 'register_agent',
        organization_id: organizationId,
        agent_key: input.agentKey.trim().toUpperCase(),
        display_name: input.displayName.trim(),
        agent_class: input.agentClass,
        runtime: input.runtime.trim(),
        scope_type: 'WORKSPACE',
        scope_id: workspaceId,
        permission_codes: input.permissionCodes,
      },
    });
    if (error) throw error;
  },

  async revoke(delegationId: string): Promise<void> {
    if (!SUPABASE_READY) throw new Error('Marketplace API is not configured.');
    const organizationId = getActiveOrgId();
    const workspaceId = getActiveWorkspaceId();
    if (!organizationId || !workspaceId) throw new Error('Active workspace context required.');
    const { error } = await supabase.functions.invoke('marketplace-api', {
      body: {
        action: 'revoke_agent_delegation',
        organization_id: organizationId,
        workspace_id: workspaceId,
        delegation_id: delegationId,
      },
    });
    if (error) throw error;
  },
};
