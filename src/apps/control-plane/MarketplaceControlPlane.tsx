import { useEffect, useMemo, useState } from 'react';
import { supabase, supabaseConfigured } from '../../lib/supabase';
import {
  Activity, ArrowDownRight, ArrowRight, ArrowUpRight, Blocks, Box, BriefcaseBusiness, Cpu,
  Building2, Check, ChevronDown, ChevronRight, CircleDot, Cloud, Command, Compass,
  CreditCard, Database, FileText, GitBranch, Globe2, Layers3, LockKeyhole, Menu,
  Network, Plus, Search, Settings2, ShieldCheck, Sparkles, Workflow, Zap,
} from 'lucide-react';
import './marketplace.css';

type Section = 'overview' | 'core' | 'domains' | 'marketplace' | 'adapters' | 'workspaces' | 'agents' | 'workflows' | 'governance';
type Domain = { id: string; name: string; code: string; description: string; color: string; axis: 'department' | 'area'; role: string };

const businessDepartments: Domain[] = [
  { id: 'product-ip', name: 'Product & IP', code: 'DEPT 01', axis: 'department', description: 'Product portfolios, intellectual property, research and offer design.', role: 'Create and steward the assets and capabilities the Marketplace brings to market.', color: '#e6a04b' },
  { id: 'growth-distribution', name: 'Growth & Distribution', code: 'DEPT 02', axis: 'department', description: 'Brand, demand generation, audience, channels and distribution systems.', role: 'Create reach, discoverability and repeatable demand across the ecosystem.', color: '#b58ae0' },
  { id: 'people-talent', name: 'People & Talent', code: 'DEPT 03', axis: 'department', description: 'Talent, people operations, roles, learning and human-agent collaboration.', role: 'Compose the human and agent capabilities required to operate the business.', color: '#79ad76' },
  { id: 'legal-trust', name: 'Legal & Trust', code: 'DEPT 04', axis: 'department', description: 'Legal structure, contracts, privacy, trust, risk and compliance.', role: 'Establish the rules, protections and legitimacy under which value is exchanged.', color: '#c7c9c1' },
  { id: 'tech-intelligence', name: 'Tech & Intelligence', code: 'DEPT 05', axis: 'department', description: 'Platform engineering, data, compute, inference, memory and intelligence systems.', role: 'Build and operate the technical and intelligence substrate.', color: '#555b57' },
  { id: 'operations-delivery', name: 'Operations & Delivery', code: 'DEPT 06', axis: 'department', description: 'Service operations, production, fulfillment, quality and continuous improvement.', role: 'Turn offers and commitments into reliable delivered outcomes.', color: '#78a9d8' },
  { id: 'finance-capital', name: 'Finance & Capital', code: 'DEPT 07', axis: 'department', description: 'Financial operations, capital allocation, accounting, treasury and unit economics.', role: 'Measure, allocate and steward the economic resources of the Marketplace.', color: '#d6bd59' },
  { id: 'sales-partnerships', name: 'Sales & Partnerships', code: 'DEPT 08', axis: 'department', description: 'Sales, commercial relationships, alliances, suppliers and strategic partnerships.', role: 'Convert qualified demand into durable commercial relationships.', color: '#d56e64' },
];

const areasPortfolios: Domain[] = [
  { id: 'ld01-business', name: 'Business', code: 'LD01', axis: 'area', description: 'Career, enterprise creation, business systems and value production.', role: 'Mission portfolio for building and operating ventures and business capabilities.', color: '#e6a04b' },
  { id: 'ld02-finances', name: 'Finances', code: 'LD02', axis: 'area', description: 'Financial sovereignty, capital, resources and long-term stewardship.', role: 'Mission portfolio for financial resilience and capital allocation.', color: '#d6bd59' },
  { id: 'ld03-blue-life', name: 'Blue Life', code: 'LD03', axis: 'area', description: 'Life, vitality and the conditions that sustain human flourishing.', role: 'Life portfolio; detailed substructure remains governed by the Life OS specification.', color: '#78a9d8' },
  { id: 'ld04-meta-cognition', name: 'Meta Cognition', code: 'LD04', axis: 'area', description: 'Learning, reflection, cognition, knowledge and personal evolution.', role: 'Mission portfolio for improving the quality of thinking and learning.', color: '#b58ae0' },
  { id: 'ld05-sovereign-triangle', name: 'Sovereign Triangle', code: 'LD05', axis: 'area', description: 'Sovereignty, autonomy and the systems that protect independent agency.', role: 'Mission portfolio for personal and systemic sovereignty.', color: '#c7c9c1' },
  { id: 'ld06-solarpunk-habitat', name: 'Solarpunk Habitat', code: 'LD06', axis: 'area', description: 'Habitat, ecology, circularity and regenerative living systems.', role: 'Mission portfolio for regenerative environments and infrastructure.', color: '#79ad76' },
  { id: 'ld07-mc-sandbox', name: 'MC Sandbox', code: 'LD07', axis: 'area', description: 'Experimental space for prototypes, exploration and controlled simulations.', role: 'Mission portfolio for experimentation without contaminating operational systems.', color: '#d56e64' },
  { id: 'ld08-civilizer', name: 'Civilizer / ABC OS', code: 'LD08', axis: 'area', description: 'Civilizational systems, collective coordination and ABC OS initiatives.', role: 'Meta-project portfolio for long-horizon civilizational design and coordination.', color: '#555b57' },
];

const ld01DcManagers = [
  ['B2.1', 'Operations'], ['B2.2', 'Trésorerie'], ['B2.3', 'Legal'], ['B2.4', 'R&D'],
  ['B2.5', 'Alliances'], ['B2.6', 'Infra'], ['B2.7', 'IT'], ['B2.8', 'Gouvernance'],
] as const;

const ld01MarvelSquads = [
  'B3.1_Marvel_Squad', 'B3.2_Marvel_Squad', 'B3.3_Marvel_Squad', 'B3.4_Marvel_Squad',
  'B3.5_Marvel_Squad', 'B3.6_Marvel_Squad', 'B3.7_Marvel_Squad', 'B3.8_Marvel_Squad',
] as const;

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
  { id: 'core', label: 'Platform Core', icon: Cpu, group: 'PLATFORM' },
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
  core: { eyebrow: 'PLATFORM / FOUR FOUNDATIONS', title: 'The sovereign platform core.', description: 'Compute, inference, memory and CEL security form the substrate beneath every Marketplace capability.' },
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
  const [registryAxis, setRegistryAxis] = useState<'departments' | 'areas'>('departments');
  const [query, setQuery] = useState('');
  const [mobileNav, setMobileNav] = useState(false);
  const [taxonomy, setTaxonomy] = useState({ businessDepartments, areasPortfolios });
  const [taxonomySource, setTaxonomySource] = useState<'loading' | 'database' | 'fallback'>('loading');
  const copy = sectionCopy[active];
  const departments = taxonomy.businessDepartments;
  const areas = taxonomy.areasPortfolios;
  const axisDomains = registryAxis === 'departments' ? departments : areas;
  const filteredDomains = useMemo(() => axisDomains.filter(d => `${d.name} ${d.code} ${d.description}`.toLowerCase().includes(query.toLowerCase())), [axisDomains, query]);
  const selected = [...departments, ...areas].find(d => d.id === selectedDomain);

  useEffect(() => {
    let activeRequest = true;
    if (!supabaseConfigured) {
      setTaxonomySource('fallback');
      return () => { activeRequest = false; };
    }
    void supabase.functions.invoke('marketplace-api', { body: { action: 'list_taxonomy_blueprints' } })
      .then(({ data, error }) => {
        if (error) throw error;
        const payload = data?.data;
        if (!payload || !Array.isArray(payload.business_departments) || !Array.isArray(payload.areas_domains)) {
          throw new Error('Marketplace taxonomy response has an invalid shape');
        }
        const mapRows = (rows: Array<{ code?: string; key?: string; name: string; description: string; responsibility: string; sort_order: number }>, axis: 'department' | 'area', palette: Domain[]): Domain[] =>
          rows.map(row => {
            const stableKey = row.key ?? row.code ?? `entry-${row.sort_order}`;
            const displayCode = axis === 'department' ? `DEPT ${String(row.sort_order).padStart(2, '0')}` : row.code ?? stableKey;
            return {
              id: stableKey,
              code: displayCode,
              name: row.name,
              description: row.description,
              role: row.responsibility,
              axis,
              color: palette.find(item => item.id === stableKey || item.code === row.code)?.color ?? '#8b9887',
            };
          });
        const nextTaxonomy = {
          businessDepartments: mapRows(payload.business_departments, 'department', businessDepartments),
          areasPortfolios: mapRows(payload.areas_domains, 'area', areasPortfolios),
        };
        if (activeRequest) {
          if (nextTaxonomy.businessDepartments.length !== 8 || nextTaxonomy.areasPortfolios.length !== 8) {
            throw new Error('Marketplace taxonomy must contain exactly eight entries per axis');
          }
          setTaxonomy(nextTaxonomy);
          setTaxonomySource('database');
        }
      })
      .catch(() => {
        if (activeRequest) setTaxonomySource('fallback');
      });
    return () => { activeRequest = false; };
  }, []);

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
                <Icon size={17} strokeWidth={1.8} /><span>{item.label}</span>{item.id === 'domains' && <span className="bm-nav-count">8 + 8</span>}
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

          {active === 'overview' && <Overview onNavigate={setActive} departments={departments} areas={areas} />}
          {active === 'core' && <CoreView />}
          {active === 'domains' && <DomainsView domains={filteredDomains} query={query} setQuery={setQuery} onSelect={setSelectedDomain} selected={selected} axis={registryAxis} setAxis={setRegistryAxis} source={taxonomySource} />}
          {active === 'adapters' && <AdaptersView />}
          {active === 'marketplace' && <MarketplaceCatalogView />}
          {active === 'workspaces' && <ComingSoon icon={Building2} title="Organization workspaces" text="Organization provisioning, membership and workspace isolation are being connected to the Marketplace identity model." />}
          {active === 'agents' && <ComingSoon icon={Sparkles} title="Agent directory" text="Agents will be registered with versioned contracts, scoped tools, policy envelopes and auditable execution receipts." />}
          {active === 'workflows' && <ComingSoon icon={Workflow} title="Workflow orchestration" text="Compose adapters, agents and human approvals into idempotent, observable business processes." />}
          {active === 'governance' && <GovernanceView />}
        </div>
      </main>
    </div>
  );
}


function CoreView() {
  const cores = [
    { code: 'CORE 01', name: 'Compute Core', icon: Cpu, purpose: 'Execution capacity, runtimes, scheduling and resource governance.', boundary: 'Compute providers and execution environments are not connected yet.' },
    { code: 'CORE 02', name: 'Inference Core', icon: Sparkles, purpose: 'Model routing, inference endpoints, context budgets, fallbacks and evaluation.', boundary: 'Model providers and inference policies remain unconfigured.' },
    { code: 'CORE 03', name: 'Memory Core', icon: Database, purpose: 'Persistent memory, knowledge retrieval, provenance, retention and portability.', boundary: 'No tenant memory stores or knowledge sources are provisioned.' },
    { code: 'CORE 04', name: 'CEL Security Core', icon: LockKeyhole, purpose: 'Identity, authorization, policy enforcement, secret boundaries, sandboxing and audit.', boundary: 'Security contracts are specified; tenant policy and runtime enforcement are not yet wired.' },
  ];
  return <div className="bm-stack">
    <div className="bm-notice"><div className="bm-notice-icon"><Cpu size={17}/></div><div><strong>Four foundations. One governed execution fabric.</strong><span>Every department, capability, adapter, agent and workflow depends on these platform cores.</span></div><span className="bm-notice-tag">CORE BLUEPRINT</span></div>
    <div className="bm-core-grid">{cores.map(({code,name,icon:Icon,purpose,boundary})=><section className="bm-panel bm-core-card" key={code}><div className="bm-core-card-head"><span className="bm-core-icon"><Icon size={21}/></span><span className="bm-core-code">{code}</span></div><h2>{name}</h2><p>{purpose}</p><div className="bm-core-boundary"><LockKeyhole size={13}/>{boundary}</div><div className="bm-core-foot"><span>FOUNDATION SPECIFICATION</span><span>NOT PROVISIONED</span></div></section>)}</div>
  </div>;
}

function Overview({ onNavigate, departments, areas }: { onNavigate: (section: Section) => void; departments: Domain[]; areas: Domain[] }) {
  return <div className="bm-stack">
    <div className="bm-notice"><div className="bm-notice-icon"><Sparkles size={17} /></div><div><strong>Control plane foundation is online.</strong><span>This preview establishes the product shell. Operational metrics and tenant records are intentionally not fabricated or connected yet.</span></div><span className="bm-notice-tag">NO LIVE TENANT DATA</span></div>
    <div className="bm-metric-grid">
      {[['8','Business departments','Marketplace operating units'],['8','Areas OS portfolios','LD01 – LD08'],['20','Adapter families','Integration design scope'],['3','Runtime surfaces','Desktop · Garden · Mobile']].map(([value,label,sub],i) => <div className="bm-metric" key={label}><div className="bm-metric-top"><span>{label}</span><span className="bm-metric-icon">{[<Network size={16}/>,<Zap size={16}/>,<Layers3 size={16}/>,<Activity size={16}/>][i]}</span></div><strong>{value}</strong><small>{sub}</small></div>)}
    </div>
    <div className="bm-section-grid">
      <section className="bm-panel bm-domain-panel"><div className="bm-panel-head"><div><span className="bm-eyebrow">TWO DISTINCT TAXONOMY AXES</span><h2>Business structure × Areas OS</h2></div><button className="bm-text-link" onClick={() => onNavigate('domains')}>Open registry <ArrowRight size={14}/></button></div>
        <div className="bm-mini-axis-label">BUSINESS DEPARTMENTS · OPERATING UNITS</div><div className="bm-domain-list">{departments.map(d=><button key={d.id} className="bm-domain-row" onClick={() => onNavigate('domains')}><span className="bm-domain-dot" style={{background:d.color}}/><span className="bm-domain-code">{d.code}</span><span className="bm-domain-name">{d.name}</span><ChevronRight size={14}/></button>)}</div><div className="bm-mini-axis-label bm-mini-axis-second">AREAS OS · LD01–LD08</div><div className="bm-domain-list">{areas.map(d=><button key={d.id} className="bm-domain-row" onClick={() => onNavigate('domains')}><span className="bm-domain-dot" style={{background:d.color}}/><span className="bm-domain-code">{d.code}</span><span className="bm-domain-name">{d.name}</span><ChevronRight size={14}/></button>)}</div>
        <div className="bm-panel-foot">Two separate architectural axes · reference blueprint, not provisioned tenant data</div>
      </section>
      <section className="bm-panel bm-stack-panel"><div className="bm-panel-head"><div><span className="bm-eyebrow">COMPOSITION LAYER</span><h2>Platform building blocks</h2></div><Layers3 size={18}/></div>
        {[['Domains','Business structure & ownership',Network],['Capabilities','Reusable business functions',Blocks],['Adapters','Provider connectivity layer',Zap],['Agents','Delegated execution identities',Sparkles],['Workflows','Human + agent orchestration',Workflow]].map(([name,desc,Icon]: any)=><div className="bm-building-row" key={name}><span className="bm-building-icon"><Icon size={16}/></span><div><strong>{name}</strong><small>{desc}</small></div><span className="bm-building-state">SPECIFIED</span></div>)}
      </section>
    </div>
    <section className="bm-panel bm-bottom-panel"><div><span className="bm-eyebrow">NEXT IMPLEMENTATION GATE</span><h2>Turn the domain map into a governed registry.</h2><p>Define the domain contract, connect the database read/write path, enforce organization scope and prove the first end-to-end lifecycle.</p></div><button className="bm-primary" onClick={() => onNavigate('domains')}>Explore domains <ArrowRight size={15}/></button></section>
  </div>;
}

function DomainsView({ domains: list, query, setQuery, onSelect, selected, axis, setAxis, source }: { domains: Domain[]; query: string; setQuery: (v:string)=>void; onSelect: (id:string|null)=>void; selected?: Domain; axis: 'departments' | 'areas'; setAxis: (v:'departments'|'areas')=>void; source: 'loading' | 'database' | 'fallback' }) {
  const title = axis === 'departments' ? 'Business Departments' : 'Areas OS mission portfolios';
  const codeRange = axis === 'departments' ? '8 operating units' : 'LD01 – LD08';
  return <div className="bm-domains-layout">
    <section className="bm-panel bm-registry-panel"><div className="bm-registry-toolbar"><div><span className="bm-eyebrow">MARKETPLACE DEPARTMENTS ≠ LD01 HOLARCHY</span><h2>{title}</h2><span className={'bm-source-pill '+source}>{source==='database'?'SUPABASE REFERENCE DATA':source==='loading'?'LOADING REFERENCE DATA':'LOCAL REFERENCE FALLBACK'}</span><p>8 structural units · {codeRange}</p></div><div className="bm-registry-tools"><div className="bm-axis-switch"><button className={axis==='departments'?'active':''} onClick={()=>{setAxis('departments');onSelect(null);}}>8 Departments</button><button className={axis==='areas'?'active':''} onClick={()=>{setAxis('areas');onSelect(null);}}>8 Areas OS</button></div><div className="bm-search"><Search size={15}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Find a unit..." /></div></div></div>
      <div className="bm-domain-cards">{list.map(d=><button key={d.id} className={'bm-domain-card '+(selected?.id===d.id?'selected':'')} onClick={()=>onSelect(selected?.id===d.id?null:d.id)}><div className="bm-domain-card-top"><span className="bm-domain-chip" style={{color:d.color,borderColor:d.color+'55'}}>{d.code}</span><span className="bm-blueprint-mini">{axis==='departments'?'OPERATING DEPARTMENT':'MISSION PORTFOLIO'}</span></div><h3>{d.name}</h3><p>{d.description}</p><div className="bm-domain-card-foot"><span>{axis==='departments'?'Marketplace department blueprint':'Areas OS portfolio blueprint'}</span><ChevronRight size={15}/></div></button>)}</div>
      <div className="bm-panel-foot">Global reference architecture · tenant installation and ownership are separate lifecycle records</div>
    </section>
    <aside className="bm-panel bm-domain-detail">{selected ? <><div className="bm-detail-kicker">{selected.axis==='department'?'MARKETPLACE OPERATING DEPARTMENT':'AREAS OS PORTFOLIO'} / {selected.code}</div><h2>{selected.name}</h2><p>{selected.description}</p><div className="bm-detail-stat"><strong>{selected.code}</strong><span>{selected.axis==='department'?'Operating department':'Mission portfolio'}</span></div><h3>Operating responsibility</h3><p>{selected.role}</p>
      {selected.axis==='area' && selected.code==='LD01' && <div className="bm-ld01-holarchy"><div className="bm-holarchy-owner"><span>B1</span><strong>Book</strong><em>OwnerBook · LD01 Business</em></div><div className="bm-holarchy-grid"><div className="bm-holarchy-group"><h4>B2 · 8 Managers tactiques DC</h4>{ld01DcManagers.map(([code,name])=><div className="bm-holarchy-row" key={code}><strong>{code}</strong><span>{name}</span></div>)}</div><div className="bm-holarchy-group"><h4>B3 · 8 Squads d’exécution Marvel</h4>{ld01MarvelSquads.map(code=><div className="bm-holarchy-row" key={code}><strong>{code.slice(0,4)}</strong><span>Marvel Squad</span></div>)}<p>Chaque squad : 7 spécialistes + un Runbook opérationnel.</p></div></div><div className="bm-holarchy-note">B2/B3 are the LD01 internal delegation hierarchy. They are not the eight Marketplace operating departments.</div></div>}
      <div className="bm-detail-warning"><LockKeyhole size={15}/> Blueprint only. Tenant ownership, dependencies and installations are not implied by this global reference.</div></> : <div className="bm-empty-detail"><Network size={26}/><strong>Select a structural unit</strong><span>Inspect the Marketplace department or Areas OS portfolio without merging their identities.</span></div>}</aside>
  </div>;
}


type MarketplaceListing = {
  id: string;
  listing_key: string;
  title: string;
  description: string;
  price_amount: number | string;
  currency: string;
  acceptance_criteria: string[];
  created_at: string;
  seller_name: string;
  capability_key: string;
  capability_version: number;
  capability_name: string;
};

function MarketplaceCatalogView() {
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [state, setState] = useState<'loading' | 'ready' | 'error' | 'unconfigured'>('loading');

  useEffect(() => {
    let activeRequest = true;
    if (!supabaseConfigured) {
      setState('unconfigured');
      return () => { activeRequest = false; };
    }
    void supabase.functions.invoke('marketplace-api', { body: { action: 'browse_listings' } })
      .then(({ data, error }) => {
        if (error) throw error;
        if (!Array.isArray(data?.data)) throw new Error('Marketplace catalog response has an invalid shape');
        if (activeRequest) {
          setListings(data.data as MarketplaceListing[]);
          setState('ready');
        }
      })
      .catch(() => {
        if (activeRequest) setState('error');
      });
    return () => { activeRequest = false; };
  }, []);

  return <div className="bm-stack">
    <div className="bm-notice"><div className="bm-notice-icon"><Blocks size={17}/></div><div><strong>Capability catalogue · live read path</strong><span>Published offers are retrieved from the Marketplace API. Drafts and tenant-private capabilities are not exposed here.</span></div><span className="bm-notice-tag">PUBLIC CATALOG</span></div>
    {state === 'loading' && <section className="bm-panel bm-catalog-state"><Activity size={22}/><strong>Loading published offers…</strong><span>Reading the public Marketplace catalogue.</span></section>}
    {state === 'unconfigured' && <section className="bm-panel bm-catalog-state"><Database size={22}/><strong>Backend not configured</strong><span>Connect the Marketplace Supabase project to load published offers.</span></section>}
    {state === 'error' && <section className="bm-panel bm-catalog-state"><Activity size={22}/><strong>Catalogue unavailable</strong><span>The Marketplace API did not return a valid response. No sample offers are substituted.</span></section>}
    {state === 'ready' && listings.length === 0 && <section className="bm-panel bm-catalog-empty"><div className="bm-catalog-empty-icon"><Blocks size={25}/></div><span className="bm-eyebrow">LIVE DATABASE RESPONSE</span><h2>No published offers yet.</h2><p>The public catalogue is connected and returned zero published listings. The next lifecycle is provider capability → versioned offer → publish → discover → order.</p><div className="bm-catalog-count"><strong>0</strong><span>published listings</span></div></section>}
    {state === 'ready' && listings.length > 0 && <><div className="bm-catalog-summary"><strong>{listings.length}</strong><span>published offers returned by the Marketplace API</span></div><div className="bm-listing-grid">{listings.map(item=><article className="bm-panel bm-listing-card" key={item.id}><div className="bm-listing-top"><span>{item.capability_key}</span><span>v{item.capability_version}</span></div><h2>{item.title}</h2><p>{item.description}</p><div className="bm-listing-seller">Provided by <strong>{item.seller_name}</strong></div><div className="bm-listing-bottom"><strong>{new Intl.NumberFormat(undefined,{style:'currency',currency:item.currency}).format(Number(item.price_amount))}</strong><span>{item.capability_name}</span></div></article>)}</div></>}
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
