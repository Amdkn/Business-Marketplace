import { supabase, SUPABASE_READY } from '../lib/supabase';
import { getActiveOrgId, getActiveWorkspaceId } from '../lib/tenant';

export interface ClientActivityEvent {
  id: string;
  eventType: string;
  label: string;
  clientName: string | null;
  createdAt: string;
}

const EVENT_LABELS: Record<string, string> = {
  'client.created': 'Client created',
  'client.updated': 'Client details updated',
  'client.deleted': 'Client deleted',
};

export const activityRepo = {
  async listForClient(clientId: string): Promise<ClientActivityEvent[]> {
    if (!SUPABASE_READY) throw new Error('Marketplace Supabase is not configured.');
    const organizationId = getActiveOrgId();
    const workspaceId = getActiveWorkspaceId();
    if (!organizationId || !workspaceId) throw new Error('Active workspace context required.');

    const { data, error } = await supabase
      .schema('workspace_data')
      .from('activity_events')
      .select('id,event_type,event_payload,created_at')
      .eq('organization_id', organizationId)
      .eq('workspace_id', workspaceId)
      .like('event_type', 'client.%')
      .contains('event_payload', { client_id: clientId })
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw new Error(`[activity_events] ${error.message}`);
    return (data ?? []).map((row) => {
      const payload = row.event_payload && typeof row.event_payload === 'object'
        ? row.event_payload as Record<string, unknown>
        : {};
      const eventType = String(row.event_type ?? '');
      return {
        id: String(row.id),
        eventType,
        label: EVENT_LABELS[eventType] ?? 'Client activity',
        clientName: typeof payload.client_name === 'string' ? payload.client_name : null,
        createdAt: String(row.created_at ?? ''),
      };
    });
  },
};
