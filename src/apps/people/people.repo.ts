import { supabase, supabaseConfigured } from '../../lib/supabase';
import { getCurrentWorkspaceContext } from '../../lib/cms/repository';

export type ScheduleDay = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';
export type ScheduleKind = 'sync' | 'run' | 'audit' | 'review' | 'sync-up';

export interface WorkspaceMember {
  id: string;
  name: string;
  roleCode: string | null;
  membershipStatus: string;
  workspaceRole: string;
  createdAt: string;
  updatedAt: string;
}

export async function listWorkspaceMembers(): Promise<WorkspaceMember[]> {
  const current = await context();
  const { data, error } = await supabase.functions.invoke('marketplace-api', {
    body: {
      action: 'list_workspace_members',
      organization_id: current.organizationId,
      workspace_id: current.workspaceId,
    },
  });
  if (error) throw error;
  const rows = Array.isArray(data?.data) ? data.data : [];
  return rows.map((row: Record<string, unknown>) => ({
    id: String(row.id),
    name: String(row.name ?? 'Workspace member'),
    roleCode: row.role_code ? String(row.role_code) : null,
    membershipStatus: String(row.membership_status ?? 'UNKNOWN'),
    workspaceRole: String(row.workspace_role ?? 'MEMBER'),
    createdAt: String(row.created_at ?? ''),
    updatedAt: String(row.updated_at ?? ''),
  }));
}

export interface WorkspaceAgent {
  id: string;
  agentKey: string;
  displayName: string;
  agentClass: string;
  runtime: string;
  principalStatus: 'ACTIVE' | 'SUSPENDED' | 'REVOKED';
  delegationId: string;
  permissionCodes: string[];
}

export interface ScheduledMission {
  id: string;
  day: ScheduleDay;
  startHour: number;
  endHour: number;
  agentPrincipalId: string | null;
  agent: string;
  label: string;
  kind: ScheduleKind;
  status: 'todo' | 'doing' | 'done' | 'cancelled';
}

async function context() {
  if (!supabaseConfigured) throw new Error('Marketplace Supabase is not configured.');
  const current = await getCurrentWorkspaceContext();
  if (!current) throw new Error('An authenticated active workspace is required.');
  return current;
}

export async function listWorkspaceAgents(): Promise<WorkspaceAgent[]> {
  const current = await context();
  const { data, error } = await supabase.functions.invoke('marketplace-api', {
    body: {
      action: 'list_workspace_agents',
      organization_id: current.organizationId,
      workspace_id: current.workspaceId,
    },
  });
  if (error) throw error;
  const rows = Array.isArray(data?.data) ? data.data : [];
  return rows.map((row: Record<string, unknown>) => ({
    id: String(row.id),
    agentKey: String(row.agent_key ?? ''),
    displayName: String(row.display_name ?? row.agent_key ?? 'Unnamed agent'),
    agentClass: String(row.agent_class ?? ''),
    runtime: String(row.runtime ?? ''),
    principalStatus: String(row.principal_status ?? 'SUSPENDED') as WorkspaceAgent['principalStatus'],
    delegationId: String(row.delegation_id ?? ''),
    permissionCodes: Array.isArray(row.permission_codes) ? row.permission_codes.map(String) : [],
  }));
}

export async function registerWorkspaceAgent(input: {
  agentKey: string;
  displayName: string;
  agentClass: string;
  runtime: string;
  permissionCodes: string[];
}): Promise<void> {
  const current = await context();
  const { error } = await supabase.functions.invoke('marketplace-api', {
    body: {
      action: 'register_agent',
      organization_id: current.organizationId,
      agent_key: input.agentKey.trim().toUpperCase(),
      display_name: input.displayName.trim(),
      agent_class: input.agentClass,
      runtime: input.runtime.trim(),
      scope_type: 'WORKSPACE',
      scope_id: current.workspaceId,
      permission_codes: input.permissionCodes,
    },
  });
  if (error) throw error;
}

export async function revokeWorkspaceAgent(delegationId: string): Promise<void> {
  const current = await context();
  const { error } = await supabase.functions.invoke('marketplace-api', {
    body: {
      action: 'revoke_agent_delegation',
      organization_id: current.organizationId,
      workspace_id: current.workspaceId,
      delegation_id: delegationId,
    },
  });
  if (error) throw error;
}

export async function listScheduledMissions(agents: WorkspaceAgent[]): Promise<ScheduledMission[]> {
  const current = await context();
  const { data, error } = await supabase.schema('workspace_data').from('missions')
    .select('id,title,agent_principal_id,status,extra_data')
    .eq('organization_id', current.organizationId)
    .eq('workspace_id', current.workspaceId)
    .order('position', { ascending: true });
  if (error) throw error;
  const agentNames = new Map(agents.map((agent) => [agent.id, agent.displayName]));
  return (data ?? []).flatMap((row: Record<string, unknown>) => {
    const extra = row.extra_data && typeof row.extra_data === 'object'
      ? row.extra_data as Record<string, unknown>
      : {};
    const day = extra.schedule_day;
    const startHour = Number(extra.start_hour);
    const endHour = Number(extra.end_hour);
    const kind = extra.schedule_kind;
    if (!['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].includes(String(day)) ||
        !Number.isInteger(startHour) || startHour < 0 || startHour > 23 ||
        !Number.isInteger(endHour) || endHour <= startHour || endHour > 24 ||
        !['sync','run','audit','review','sync-up'].includes(String(kind))) return [];
    const agentPrincipalId = row.agent_principal_id ? String(row.agent_principal_id) : null;
    return [{
      id: String(row.id),
      day: day as ScheduleDay,
      startHour,
      endHour,
      agentPrincipalId,
      agent: agentPrincipalId ? (agentNames.get(agentPrincipalId) ?? 'Assigned agent') : 'Unassigned',
      label: String(row.title ?? 'Untitled mission'),
      kind: kind as ScheduleKind,
      status: String(row.status ?? 'todo') as ScheduledMission['status'],
    }];
  });
}

export async function createScheduledMission(input: {
  day: ScheduleDay;
  startHour: number;
  endHour: number;
  agentPrincipalId: string | null;
  label: string;
  kind: ScheduleKind;
}): Promise<ScheduledMission> {
  const current = await context();
  if (!input.label.trim()) throw new Error('Mission title is required.');
  if (!Number.isInteger(input.startHour) || !Number.isInteger(input.endHour) ||
      input.startHour < 0 || input.startHour > 23 ||
      input.endHour <= input.startHour || input.endHour > 24) {
    throw new Error('Invalid mission time window.');
  }
  const { data, error } = await supabase.schema('workspace_data').from('missions').insert({
    organization_id: current.organizationId,
    workspace_id: current.workspaceId,
    created_by_user_id: current.userId,
    agent_principal_id: input.agentPrincipalId,
    title: input.label.trim(),
    priority: 'P2',
    status: 'todo',
    position: 0,
    extra_data: {
      schedule_day: input.day,
      start_hour: input.startHour,
      end_hour: input.endHour,
      schedule_kind: input.kind,
    },
  }).select('id,title,agent_principal_id,status,extra_data').single();
  if (error) throw error;
  return {
    id: String(data.id),
    day: input.day,
    startHour: input.startHour,
    endHour: input.endHour,
    agentPrincipalId: data.agent_principal_id ? String(data.agent_principal_id) : null,
    agent: 'Assigned agent',
    label: String(data.title),
    kind: input.kind,
    status: String(data.status) as ScheduledMission['status'],
  };
}

export async function deleteScheduledMission(id: string): Promise<void> {
  const current = await context();
  const { error } = await supabase.schema('workspace_data').from('missions').delete()
    .eq('organization_id', current.organizationId)
    .eq('workspace_id', current.workspaceId)
    .eq('id', id);
  if (error) throw error;
}
