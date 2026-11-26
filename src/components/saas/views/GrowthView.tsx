import React from 'react';
import { Card } from '../components/Card';
import { ViewShell } from '../components/ViewShell';
import { MoreHorizontal, Plus, TrendingUp } from 'lucide-react';
import { useOrg } from '../lib/tenant';

// These records are deliberately restricted to the unauthenticated showcase.
// Authenticated workspaces must never see this fixture as live pipeline data.
interface Lead {
  id: string;
  name: string;
  value: string;
  status: 'Lead' | 'In Discussion' | 'Won';
}

const DEMO_LEADS: ReadonlyArray<Lead> = [
  { id: 'GL1', name: 'TechFlow Industries', value: '€18k', status: 'Lead' },
  { id: 'GL2', name: 'Crimson Creative', value: '€12k', status: 'Lead' },
  { id: 'GL3', name: 'GreenScale Co-op', value: '€32k', status: 'In Discussion' },
  { id: 'GL4', name: 'Zenith SEO', value: '€8k', status: 'In Discussion' },
  { id: 'GL5', name: 'Alaric Chen LLC', value: '€24k', status: 'Won' },
];

interface ColumnProps {
  title: string;
  status: Lead['status'];
  leads: ReadonlyArray<Lead>;
  color: string;
}

const Column: React.FC<ColumnProps> = ({ title, status, leads, color }) => {
  const columnLeads = leads.filter((lead) => lead.status === status);
  const probability = status === 'Lead' ? '20%' : status === 'In Discussion' ? '60%' : '100%';
  return (
    <div className="flex-1 bg-white rounded-2xl border border-stone-200 flex flex-col">
      <div className={`p-4 border-b border-stone-200 flex justify-between items-center rounded-t-2xl ${color}`}>
        <h3 className="font-semibold text-sm tracking-wide text-slate-800">{title}</h3>
        <span className="text-xs bg-white px-2 py-0.5 rounded-lg text-slate-500 font-mono shadow-sm border border-stone-200">{columnLeads.length}</span>
      </div>
      <div className="p-3 space-y-3 flex-1">
        {columnLeads.map((lead) => (
          <div key={lead.id} className="bg-white border border-stone-200 p-4 rounded-xl shadow-sm group">
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-semibold text-slate-800 text-sm">{lead.name}</h4>
              <button type="button" disabled title="Showcase record; actions are not connected." className="text-slate-300 cursor-not-allowed">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>
            <div className="flex justify-between items-end">
              <span className="text-xs text-slate-500">Illustrative probability {probability}</span>
              <span className="text-sm font-bold text-emerald-700 font-mono">{lead.value}</span>
            </div>
          </div>
        ))}
        {columnLeads.length === 0 && <div className="h-24 flex items-center justify-center border-2 border-dashed border-stone-200 rounded-xl text-slate-400 text-sm">Empty</div>}
      </div>
    </div>
  );
};

export const GrowthView: React.FC = () => {
  const { isAuthenticated } = useOrg();

  if (isAuthenticated) {
    return (
      <ViewShell
        title="Growth Pipeline"
        subtitle="Authenticated workspace"
        loading={false}
        error={null}
        isEmpty
        emptyTitle="No persisted growth pipeline"
        emptyDescription="This Garden pipeline is a showcase-only view and is not connected to a canonical lead repository. Demo leads and estimated revenue are hidden for authenticated workspaces."
      >
        <></>
      </ViewShell>
    );
  }

  return (
    <ViewShell
      title="Growth Pipeline"
      subtitle="Illustrative showcase — sample records only, not persisted"
      loading={false}
      error={null}
      isEmpty={DEMO_LEADS.length === 0}
      emptyTitle="No showcase leads"
      actions={
        <button type="button" disabled title="Lead creation is not connected to a persisted Growth repository." className="flex items-center gap-2 bg-stone-100 text-slate-400 px-4 py-2 rounded-lg text-sm font-medium cursor-not-allowed">
          <Plus className="w-4 h-4" /> New Lead unavailable
        </button>
      }
    >
      <div className="space-y-6">
        <Card className="p-4 border-amber-200 bg-amber-50 text-sm text-amber-900">
          Demo fixture only. Names, values, stage probabilities and counts below are illustrative and do not represent a real tenant or live business performance.
        </Card>
        <div className="flex flex-col md:flex-row gap-4 pb-2">
          <Column title="Leads (Inbound)" status="Lead" leads={DEMO_LEADS} color="bg-stone-50" />
          <Column title="In Discussion" status="In Discussion" leads={DEMO_LEADS} color="bg-amber-50" />
          <Column title="Won (Signed)" status="Won" leads={DEMO_LEADS} color="bg-emerald-50" />
        </div>
        <Card className="p-5 flex items-center gap-3 text-sm text-slate-600">
          <TrendingUp className="w-5 h-5 text-emerald-600" />
          <span>Conversion and deal-size metrics are intentionally omitted until a persisted Growth pipeline exists.</span>
        </Card>
      </div>
    </ViewShell>
  );
};

export default GrowthView;
