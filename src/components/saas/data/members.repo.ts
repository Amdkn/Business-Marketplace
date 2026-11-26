// Human workspace roster. User identities remain canonical in identity.profiles;
// memberships and roles are resolved server-side by marketplace-api.
import { supabase, SUPABASE_READY } from '../lib/supabase';
import { getActiveOrgId, getActiveWorkspaceId } from '../lib/tenant';
import type { Agent } from '../lib/types';

const uiRole = (roleCode: unknown): Agent['role'] => {
  switch (roleCode) {
    case 'B1_CEO':
    case 'S0_SOVEREIGN': return 'owner';
    case 'B2_MANAGER': return 'manager';
    case 'B2.2': return 'operator';
    default: return 'viewer';
  }
};

export const membersRepo = {
  async list(): Promise<Agent[]> {
    if (!SUPABASE_READY) return [];
    const organizationId = getActiveOrgId();
    const workspaceId = getActiveWorkspaceId();
    if (!organizationId || !workspaceId) throw new Error('Active workspace context required.');

    const { data, error } = await supabase.functions.invoke('marketplace-api', {
      body: { action: 'list_workspace_members', organization_id: organizationId, workspace_id: workspaceId },
    });
    if (error) throw error;
    const rows = Array.isArray(data?.data) ? data.data : [];
    return rows.map((row: Record<string, unknown>) => ({
      id: String(row.id),
      name: String(row.name ?? 'Workspace member'),
      role: uiRole(row.role_code),
      email: null,
      status: row.membership_status === 'ACTIVE' ? 'active' : 'paused',
      createdAt: String(row.created_at ?? ''),
      updatedAt: String(row.updated_at ?? row.created_at ?? ''),
    }));
  },
};
