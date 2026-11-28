// IT Software Kernel — architectural target register.
// Operational connectivity and security evidence must come from live probes,
// provider connection records, and auditable control evidence — never constants.

import React from 'react';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { Server, Shield, Database, Lock, CircleHelp } from 'lucide-react';
import { BackButton } from '../components/BackButton';

const TARGET_STACK = [
  { name: 'Supabase Cloud', type: 'Database', scope: 'Marketplace persistence and tenant data', evidence: 'Connectivity is measured separately in IT & Infrastructure.' },
  { name: 'Hermes Agent Runtime', type: 'AI runtime', scope: 'Sovereign agent execution', evidence: 'No active runtime registration or heartbeat is currently evidenced.' },
  { name: 'Ollama / local inference', type: 'Inference', scope: 'Local model serving and sensitive workloads', evidence: 'No connected inference node or health probe is currently evidenced.' },
  { name: 'Claude API', type: 'External inference', scope: 'Optional governed fallback', evidence: 'No provider connection is currently evidenced.' },
  { name: 'Vercel', type: 'Hosting', scope: 'Marketplace web application', evidence: 'Preview deployment is verified; this is not a latency or uptime SLO measurement.' },
  { name: 'Stripe / payment provider', type: 'Payments', scope: 'Checkout, payment and payout lifecycle', evidence: 'No active PSP connection or completed payment lifecycle is evidenced.' },
] as const;

const TARGET_CONTROLS = [
  { code: 'P10', title: 'Sovereign runtime', target: 'Sensitive workloads execute on an approved local or sovereign runtime.' },
  { code: 'P11', title: 'Data minimization', target: 'PII exposure, retention and outbound telemetry are minimized and evidenced.' },
  { code: 'P12', title: 'AI governance', target: 'Risk classification, human oversight and applicable compliance evidence are maintained.' },
  { code: 'P13', title: 'Network isolation', target: 'Runtime network egress is deny-by-default with an explicit allowlist.' },
  { code: 'P14', title: 'Execution sandbox', target: 'Untrusted workloads execute in an isolated, disposable boundary.' },
  { code: 'P15', title: 'Secrets and encryption', target: 'Secrets are centrally managed, access-controlled and rotated; data is encrypted at rest.' },
  { code: 'P16', title: 'Network policy', target: 'Network policy is enforced and independently tested.' },
  { code: 'P17', title: 'Workload isolation', target: 'Agent workloads have bounded filesystem, process and resource access.' },
  { code: 'P18', title: 'Telemetry sovereignty', target: 'Telemetry destinations, retention and access are explicitly governed.' },
] as const;

export const ItSoftwareKernelView: React.FC = () => (
  <div className="space-y-8 animate-in fade-in duration-300">
    <BackButton />

    <div>
      <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">IT Software Kernel</h1>
      <p className="text-slate-500 text-sm mt-1">Architecture register · target stack and control objectives</p>
    </div>

    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
      <div className="flex items-start gap-3">
        <CircleHelp className="w-5 h-5 text-amber-700 mt-0.5 shrink-0" />
        <div>
          <h2 className="font-semibold text-amber-900">Design target — not a live operations dashboard</h2>
          <p className="text-sm text-amber-800 mt-1">
            The stack and controls below describe the intended architecture. They are not connection checks,
            uptime measurements, compliance attestations or validated security controls. No sovereignty score
            is calculated until evidence is connected to each control.
          </p>
        </div>
      </div>
    </div>

    <section className="space-y-4">
      <h2 className="text-lg font-medium text-slate-900 flex items-center gap-2">
        <Server className="w-5 h-5 text-slate-500" /> Target stack
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {TARGET_STACK.map((item) => (
          <Card key={item.name} className="p-4">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-2 min-w-0">
                <Database className="w-4 h-4 text-slate-500 shrink-0" />
                <h3 className="font-semibold text-slate-900 text-sm">{item.name}</h3>
              </div>
              <Badge variant="default">Evidence required</Badge>
            </div>
            <p className="text-xs text-slate-500 uppercase tracking-wide">{item.type}</p>
            <p className="text-sm text-slate-700 mt-2">{item.scope}</p>
            <p className="text-xs text-slate-500 mt-2 pt-2 border-t border-stone-100">{item.evidence}</p>
          </Card>
        ))}
      </div>
    </section>

    <section className="space-y-4">
      <h2 className="text-lg font-medium text-slate-900 flex items-center gap-2">
        <Shield className="w-5 h-5 text-slate-500" /> Sovereignty and security control objectives
      </h2>
      <p className="text-sm text-slate-500">
        P10–P18 are architectural requirements. Each remains unverified until a test result, configuration
        snapshot or auditable operational record is attached.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {TARGET_CONTROLS.map((control) => (
          <Card key={control.code} className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-slate-500" />
                <span className="font-mono text-sm font-bold text-slate-700">{control.code}</span>
              </div>
              <Badge variant="default">Not verified</Badge>
            </div>
            <h3 className="text-sm font-semibold text-slate-900 mb-1">{control.title}</h3>
            <p className="text-xs text-slate-500 leading-relaxed">{control.target}</p>
          </Card>
        ))}
      </div>
    </section>
  </div>
);

export default ItSoftwareKernelView;
