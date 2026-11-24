import { useMemo, useState } from 'react';
import {
  Activity, ArrowDownRight, ArrowRight, ArrowUpRight, Blocks, Box, BriefcaseBusiness,
  Building2, Check, ChevronDown, ChevronRight, CircleDot, Cloud, Command, Compass,
  CreditCard, Database, FileText, GitBranch, Globe2, Layers3, LockKeyhole, Menu,
  Network, Plus, Search, Settings2, ShieldCheck, Sparkles, Workflow, Zap,
} from 'lucide-react';
import './marketplace.css';

type Section = 'overview' | 'domains' | 'marketplace' | 'adapters' | 'workspaces' | 'agents' | 'workflows' | 'governance';
type Domain = { id: string; name: string; code: string; description: string; capabilities: number; color: string; children: string[] };

const domains: Domain[] = [
  { id: 'strategy', name: 'Strategy & Leadership', code: 'D01', description: 'Direction, governance, planning and performance.', capabilities: 8, color: '#c3e88d', children: ['Strategic planning', 'OKRs & scorecards', 'Decision records'] },
  { id: 'product', name: 'Product & Innovation', code: 'D02', description: 'Portfolio, discovery, design and delivery.', capabilities: 12, color: '#e6b879', children: ['Product portfolio', 'Research & discovery', 'Roadmap & delivery'] },
  { id: 'growth', name: 'Growth & Marketing', code: 'D03', description: 'Demand generation, brand, content and experiments.', capabilities: 10, color: '#d4a5ed', children: ['Brand & content', 'Campaign operations', 'Analytics & experiments'] },
  { id: 'sales', name: 'Sales & Revenue', code: 'D04', description: 'Pipeline, proposals, contracts and revenue operations.', capabilities: 9, color: '#f2a17d', children: ['CRM & pipeline', 'Proposals & pricing', 'Revenue operations'] },
  { id: 'customer', name: 'Customer Experience', code: 'D05', description: 'Onboarding, support, success and retention.', capabilities: 8, color: '#8fc9d7', children: ['Customer onboarding', 'Support operations', 'Success & retention'] },
  { id: 'operations', name: 'Operations & Delivery', code: 'D06', description: 'Service delivery, quality, logistics and continuous improvement.', capabilities: 14, color: '#a8c5a1', children: ['Service operations', 'Quality & SOPs', 'Supply chain'] },
  { id: 'finance', name: 'Finance & Administration', code: 'D07', description: 'Accounting, cash, procurement and business administration.', capabilities: 11, color: '#e4cf82', children: ['Financial planning', 'Accounting & billing', 'Procurement'] },
  { id: 'people', name: 'People & Culture', code: 'D08', description: 'Talent, organization, learning and people operations.', capabilities: 7, color: '#e6a9b9', children: ['Talent & recruiting', 'People operations', 'Learning & development'] },
  { id: 'legal', name: 'Legal & Compliance', code: 'D09', description: 'Contracts, risk, privacy and regulatory controls.', capabilities: 6, color: '#b5b9c8', children: ['Contract lifecycle', 'Privacy & compliance', 'Risk register'] },
  { id: 'technology', name: 'Technology & Data', code: 'D10', description: 'Infrastructure, software, data and cybersecurity.', capabilities: 13, color: '#92b5e8', children: ['Engineering & delivery', 'Data platform', 'Security & infrastructure'] },
  { id: 'knowledge', name: 'Knowledge & Intelligence', code: 'D11', description: 'Knowledge systems, research, documentation and AI enablement.', capabilities: 8, color: '#a9c9bd', children: ['Knowledge graph', 'Research operations', 'AI enablement'] },
  { id: 'ecosystem', name: 'Ecosystem & Partnerships', code: 'D12', description: 'Partners, suppliers, channels and external ecosystems.', capabilities: 6, color: '#d6b7a0', children: ['Partner network', 'Supplier relations', 'Ecosystem programs'] },
];

const adapterFamilies = [
  ['Identity & access', 'Google Workspace · Microsoft 365 · Auth0 · Clerk', 'ShieldCheck'],
  ['Communication', 'Gmail · Outlook · Slack · Google Chat · Teams · Discord', 'Zap'],
  ['Calendar & scheduling', 'Google Calendar · Microsoft Calendar · Cal.com', 'Activity'],
  ['Files & knowledge', 'Google Drive · OneDrive · Notion · Confluence', 'FileText'],
  ['Work management', 'Linear · ClickUp · Jira · GitHub Projects', 'Workflow'],
  ['Source control & delivery', 'GitHub · GitLab · Bitbucket · Vercel', 'GitBranch'],
  ['Data & backend', 'Supabase · PostgreSQL · Redis · Object Storage', 'Database'],
  ['Automation', 'n8n · Make · Zapier · Temporal', 'Blocks'],
  ['AI model providers', 'OpenAI · Anthropic · Gemini · Local endpoints', 'Sparkles'],
  ['Agent protocols', 'MCP · A2A · Composio · Custom tool gateways', 'Network'],
  ['Finance & commerce', 'Stripe · Billing · Accounting · Invoicing', 'CreditCard'],
  ['CRM & revenue', 'HubSpot · Salesforce · Pipedrive', 'BriefcaseBusiness'],
  ['Customer support', 'Intercom · Zendesk · Help Scout', 'Compass'],
  ['Analytics & observability', 'PostHog · Sentry · OpenTelemetry', 'Activity'],
  ['Documents & signatures', 'DocuSign · Dropbox Sign · PDF services', 'FileText'],
  ['Commerce & catalog', 'Shopify · WooCommerce · Product feeds', 'Layers3'],
  ['People operations', 'HRIS · Recruiting · Payroll providers', 'Building2'],
  ['Maps & mobility', 'Google Maps · Mapbox · Routing APIs', 'Globe2'],
  ['IoT & physical systems', 'MQTT · Device gateways · Telemetry', 'Zap'],
  ['Storage & portability', 'S3-compatible · Backup · Export · Archive', 'Cloud'],
] as const;

const nav: { id: Section; label: string; icon: typeof Activity; group: string }[] = [
  { id: 'overview', label: 'Overview', icon: Activity, group: 'PLATFORM' },
  { id: 'domains', label: 'Domain registry', icon: Network, group: 'PLATFORM' },
  { id: 'marketplace', label: 'Marketplace', icon: Blocks, group: 'PLATFORM' },
  { id: 'adapters', label: 'Adapters', icon: Zap, group: 'PLATFORM' },
  { id: 'workspaces', label: 'Workspaces', icon: Building2, group: 'OPERATIONS' },
  { id: 'agents', label: 'Agents', icon: Sparkles, group: 'OPERATIONS' },
  { id: 'workflows', label: 'Workflows', icon: Workflow, group: 'OPERATIONS' },
  { id: 'governance', label: 'Governance', icon: ShieldCheck, group: 'SYSTEM' },
];

const sectionCopy: Record<Section, { eyebrow: string; title: string; description: string }> = {
  overview: { eyebrow: 'CONTROL PLANE / OVERVIEW', title: 'The business, orchestrated.', description: 'One operating layer for domains, capabilities, integrations and intelligent execution.' },
  domains: { eyebrow: 'CONTROL PLANE / DOMAINS', title: 'Map the business.', description: 'A living registry of business domains, ownership, capabilities and dependencies.' },
  marketplace: { eyebrow: 'CATALOG / DISCOVERY', title: 'Compose your stack.', description: 'Business capabilities, solution packs and agent services — designed to work together.' },
  adapters: { eyebrow: 'CONNECTIVITY / ADAPTERS', title: 'Connect the ecosystem.', description: 'A provider-neutral adapter layer for tools, data, models and external systems.' },
  workspaces: { eyebrow: 'OPERATIONS / WORKSPACES', title: 'Spaces with boundaries.', description: 'Organization-aware environments for teams, projects and operating contexts.' },
  agents: { eyebrow: 'OPERATIONS / AGENTS', title: 'Delegate with control.', description: 'Agent identities, contracts, tools, permissions and execution receipts.' },
  workflows: { eyebrow: 'OPERATIONS / WORKFLOWS', title: 'Make work flow.', description: 'Compose human and agent steps into observable, reversible business processes.' },
  governance: { eyebrow: 'SYSTEM / GOVERNANCE', title: 'Trust is infrastructure.', description: 'Identity, policies, approvals, audit and tenant boundaries.' },
};

export function MarketplaceControlPlane({ onOpenOffice }: { onOpenOffice: () => void }) {
  const [active, setActive] = useState<Section>('overview');
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [mobileNav, setMobileNav] = useState(false);
  const copy = sectionCopy[active];
  const filteredDomains = useMemo(() => domains.filter(d => `${d.name} ${d.code} ${d.description}`.toLowerCase().includes(query.toLowerCase())), [query]);
  const selected = domains.find(d => d.id === selectedDomain);

  return (
    <div className="bm-shell">
      <aside className={`bm-sidebar ${mobileNav ? 'bm-sidebar-open' : ''}`}>
        <div className="bm-brand">
          <div className="bm-brand-mark"><Command size={20} strokeWidth={1.8} /></div>
          <div><div className="bm-brand-name">A’SPACE</div><div className="bm-brand-sub">BUSINESS MARKETPLACE</div></div>
        </div>
        <div className="bm-org-switch">
          <div className="bm-org-avatar">A</div>
          <div className="bm-org-copy"><strong>Platform blueprint</strong><span>Preview environment</span></div>
          <ChevronDown size={15} />
        </div>
        {['PLATFORM', 'OPERATIONS', 'SYSTEM'].map(group => (
          <div className="bm-nav-group" key={group}>
            <div className="bm-nav-label">{group}</div>
            {nav.filter(item => item.group === group).map(item => {
              const Icon = item.icon;
              return <button key={item.id} className={`bm-nav-item ${active === item.id ? 'active' : ''}`} onClick={() => { setActive(item.id); setSelectedDomain(null); setMobileNav(false); }}>
                <Icon size={17} strokeWidth={1.8} /><span>{item.label}</span>{item.id === 'domains' && <span className="bm-nav-count">12</span>}
              </button>;
            })}
          </div>
        ))}
        <div className="bm-sidebar-bottom">
          <div className="bm-runtime-card">
            <div className="bm-runtime-orb"><Activity size={15} /></div>
            <div><strong>Business Office</strong><span>3-surface runtime</span></div>
            <button aria-label="Open Business Office" onClick={onOpenOffice}><ArrowUpRight size={15} /></button>
          </div>
          <button className="bm-nav-item bm-settings" onClick={() => setActive('governance')}><Settings2 size={17} /><span>Platform settings</span></button>
          <div className="bm-user"><div className="bm-user-avatar">A0</div><div><strong>Amadeus / Admin</strong><span>Platform operator · preview</span></div><ChevronDown size={14} /></div>
        </div>
      </aside>

      <main className="bm-main">
        <header className="bm-topbar">
          <button className="bm-mobile-menu" onClick={() => setMobileNav(v => !v)} aria-label="Toggle navigation"><Menu size={19} /></button>
          <div className="bm-breadcrumb"><span>Business Marketplace</span><ChevronRight size={14} /><strong>{nav.find(n => n.id === active)?.label}</strong></div>
          <div className="bm-top-actions"><span className="bm-env"><i /> PREVIEW</span><button className="bm-icon-button" aria-label="Search"><Search size={17} /></button><button className="bm-avatar">A0</button></div>
        </header>

        <div className="bm-content">
          <div className="bm-page-head">
            <div><div className="bm-eyebrow">{copy.eyebrow}</div><h1>{copy.title}</h1><p>{copy.description}</p></div>
            <div className="bm-page-actions"><span className="bm-blueprint-pill"><CircleDot size={12} /> FOUNDATION MODE</span></div>
          </div>

          {active === 'overview' && <Overview onNavigate={setActive} />}
          {active === 'domains' && <DomainsView domains={filteredDomains} query={query} setQuery={setQuery} onSelect={setSelectedDomain} selected={selected} />}
          {active === 'adapters' && <AdaptersView />}
          {active === 'marketplace' && <ComingSoon icon={Blocks} title="Capability marketplace" text="The catalog will install versioned business capabilities and solution packs into a workspace. The inherited integration gallery is preserved as runtime material while this lifecycle is built." />}
          {active === 'workspaces' && <ComingSoon icon={Building2} title="Organization workspaces" text="Organization provisioning, membership and workspace isolation are being connected to the Marketplace identity model." />}
          {active === 'agents' && <ComingSoon icon={Sparkles} title="Agent directory" text="Agents will be registered with versioned contracts, scoped tools, policy envelopes and auditable execution receipts." />}
          {active === 'workflows' && <ComingSoon icon={Workflow} title="Workflow orchestration" text="Compose adapters, agents and human approvals into idempotent, observable business processes." />}
          {active === 'governance' && <GovernanceView />}
        </div>
      </main>
    </div>
  );
}

function Overview({ onNavigate }: { onNavigate: (section: Section) => void }) {
  return <div className="bm-stack">
    <div className="bm-notice"><div className="bm-notice-icon"><Sparkles size={17} /></div><div><strong>Control plane foundation is online.</strong><span>This preview establishes the product shell. Operational metrics and tenant records are intentionally not fabricated or connected yet.</span></div><span className="bm-notice-tag">NO LIVE TENANT DATA</span></div>
    <div className="bm-metric-grid">
      {[['12','Business domains','Reference blueprint'],['20','Adapter families','Integration design scope'],['3','Runtime surfaces','Desktop · Garden · Mobile'],['0','Verified connections','Awaiting adapter implementation']].map(([value,label,sub],i) => <div className="bm-metric" key={label}><div className="bm-metric-top"><span>{label}</span><span className="bm-metric-icon">{[<Network size={16}/>,<Zap size={16}/>,<Layers3 size={16}/>,<Activity size={16}/>][i]}</span></div><strong>{value}</strong><small>{sub}</small></div>)}
    </div>
    <div className="bm-section-grid">
      <section className="bm-panel bm-domain-panel"><div className="bm-panel-head"><div><span className="bm-eyebrow">BUSINESS ONTOLOGY</span><h2>Domain landscape</h2></div><button className="bm-text-link" onClick={() => onNavigate('domains')}>Open registry <ArrowRight size={14}/></button></div>
        <div className="bm-domain-list">{domains.slice(0,6).map(d=><button key={d.id} className="bm-domain-row" onClick={() => onNavigate('domains')}><span className="bm-domain-dot" style={{background:d.color}}/><span className="bm-domain-code">{d.code}</span><span className="bm-domain-name">{d.name}</span><span className="bm-domain-cap">{d.capabilities} caps</span><ChevronRight size={14}/></button>)}</div>
        <div className="bm-panel-foot">Reference taxonomy · illustrative blueprint, not provisioned tenant data</div>
      </section>
      <section className="bm-panel bm-stack-panel"><div className="bm-panel-head"><div><span className="bm-eyebrow">COMPOSITION LAYER</span><h2>Platform building blocks</h2></div><Layers3 size={18}/></div>
        {[['Domains','Business structure & ownership',Network],['Capabilities','Reusable business functions',Blocks],['Adapters','Provider connectivity layer',Zap],['Agents','Delegated execution identities',Sparkles],['Workflows','Human + agent orchestration',Workflow]].map(([name,desc,Icon]: any)=><div className="bm-building-row" key={name}><span className="bm-building-icon"><Icon size={16}/></span><div><strong>{name}</strong><small>{desc}</small></div><span className="bm-building-state">SPECIFIED</span></div>)}
      </section>
    </div>
    <section className="bm-panel bm-bottom-panel"><div><span className="bm-eyebrow">NEXT IMPLEMENTATION GATE</span><h2>Turn the domain map into a governed registry.</h2><p>Define the domain contract, connect the database read/write path, enforce organization scope and prove the first end-to-end lifecycle.</p></div><button className="bm-primary" onClick={() => onNavigate('domains')}>Explore domains <ArrowRight size={15}/></button></section>
  </div>;
}

function DomainsView({ domains: list, query, setQuery, onSelect, selected }: { domains: Domain[]; query: string; setQuery: (v:string)=>void; onSelect: (id:string|null)=>void; selected?: Domain }) {
  return <div className="bm-domains-layout">
    <section className="bm-panel bm-registry-panel"><div className="bm-registry-toolbar"><div><span className="bm-eyebrow">REFERENCE TAXONOMY</span><h2>Business domain registry</h2><p>12 top-level domains · expandable capability map</p></div><div className="bm-search"><Search size={15}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Find a domain..." /></div></div>
      <div className="bm-domain-cards">{list.map(d=><button key={d.id} className={`bm-domain-card ${selected?.id===d.id?'selected':''}`} onClick={()=>onSelect(selected?.id===d.id?null:d.id)}><div className="bm-domain-card-top"><span className="bm-domain-chip" style={{color:d.color,borderColor:d.color+'55'}}>{d.code}</span><span className="bm-blueprint-mini">BLUEPRINT</span></div><h3>{d.name}</h3><p>{d.description}</p><div className="bm-domain-card-foot"><span>{d.capabilities} capability patterns</span><ChevronRight size={15}/></div></button>)}</div>
      <div className="bm-panel-foot">These are starter domain patterns. No customer organization has been provisioned in this preview.</div>
    </section>
    <aside className="bm-panel bm-domain-detail">{selected ? <><div className="bm-detail-kicker">DOMAIN / {selected.code}</div><h2>{selected.name}</h2><p>{selected.description}</p><div className="bm-detail-stat"><strong>{selected.capabilities}</strong><span>capability patterns in blueprint</span></div><h3>Subdomain patterns</h3>{selected.children.map((child,i)=><div className="bm-child-row" key={child}><span>{selected.code}.{i+1}</span><strong>{child}</strong><ChevronRight size={14}/></div>)}<div className="bm-detail-warning"><LockKeyhole size={15}/> Registry is read-only until the domain schema and organization policies are wired.</div></> : <div className="bm-empty-detail"><Network size={26}/><strong>Select a domain</strong><span>Inspect its ownership boundary, subdomain patterns and capability map.</span></div>}</aside>
  </div>;
}

function AdaptersView() {
  return <div className="bm-stack"><div className="bm-notice"><div className="bm-notice-icon"><Zap size={17}/></div><div><strong>20 adapter families mapped.</strong><span>These are planned integration families, not claims that 20 production connectors are already implemented.</span></div><span className="bm-notice-tag">CATALOG BLUEPRINT</span></div><div className="bm-adapter-grid">{adapterFamilies.map(([name,providers,icon],i)=><div className="bm-adapter-card" key={name}><div className="bm-adapter-card-head"><span className="bm-adapter-icon">{adapterIcon(icon)}</span><span className="bm-adapter-number">A{i+1<10?'0':''}{i+1}</span></div><h3>{name}</h3><p>{providers}</p><div className="bm-adapter-card-foot"><span><i/> Not connected</span><span>Manifest pending</span></div></div>)}</div></div>;
}

function adapterIcon(name: string) {
  const icons: Record<string, typeof Activity> = { ShieldCheck, Zap, Activity, FileText, Workflow, GitBranch, Database, Blocks, Sparkles, Network, CreditCard, BriefcaseBusiness, Compass, Layers3, Building2, Globe2, Cloud };
  const Icon = icons[name] ?? Box;
  return <Icon size={18}/>;
}

function GovernanceView() {
  return <div className="bm-governance-grid">{[['Identity boundary','Supabase Auth + organization membership','Pending verification',LockKeyhole],['Tenant isolation','RLS and server-side organization scope','Schema exists · policy review required',ShieldCheck],['Audit trail','Actor, tenant, correlation and causality','Contract defined',FileText],['Secrets management','Server-side secret references only','Adapter layer not wired',Database]].map(([title,desc,status,Icon]:any)=><div className="bm-panel bm-governance-card" key={title}><Icon size={20}/><h3>{title}</h3><p>{desc}</p><span>{status}</span></div>)}</div>;
}

function ComingSoon({ icon: Icon, title, text }: { icon: typeof Activity; title: string; text: string }) {
  return <section className="bm-panel bm-coming"><div className="bm-coming-icon"><Icon size={24}/></div><span className="bm-eyebrow">NEXT CONTROL PLANE MODULE</span><h2>{title}</h2><p>{text}</p><div className="bm-coming-line"><span/> Contract-first implementation queue</div></section>;
}
