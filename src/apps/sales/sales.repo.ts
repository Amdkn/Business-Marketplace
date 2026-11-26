import { getCurrentWorkspaceContext } from '../../lib/cms/repository';
import { supabase, supabaseConfigured } from '../../lib/supabase';

export interface WorkspaceActivityEvent {
  id: string;
  eventType: string;
  eventPayload: Record<string, unknown>;
  createdAt: string;
}

export async function listWorkspaceActivity(limit = 12): Promise<WorkspaceActivityEvent[]> {
  if (!supabaseConfigured) return [];
  const context = await getCurrentWorkspaceContext();
  if (!context) throw new Error('An authenticated active workspace is required to read activity.');
  const { data, error } = await supabase.schema('workspace_data')
    .from('activity_events')
    .select('id,event_type,event_payload,created_at')
    .eq('organization_id', context.organizationId)
    .eq('workspace_id', context.workspaceId)
    .order('created_at', { ascending: false })
    .limit(Math.max(1, Math.min(50, limit)));
  if (error) throw error;
  return (data ?? []).map((row: Record<string, unknown>) => ({
    id: String(row.id),
    eventType: String(row.event_type),
    eventPayload: row.event_payload && typeof row.event_payload === 'object'
      ? row.event_payload as Record<string, unknown>
      : {},
    createdAt: String(row.created_at),
  }));
}
