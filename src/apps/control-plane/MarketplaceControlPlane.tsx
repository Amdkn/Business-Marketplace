import { useEffect, useMemo, useState } from 'react';
import { supabase, supabaseConfigured } from '../../lib/supabase';
import {
  Activity, ArrowRight, ArrowUpRight, Blocks, Box, BriefcaseBusiness, Cpu,
  Building2, ChevronDown, ChevronRight, CircleDot, Cloud, Command, Compass,
  CreditCard, Database, FileText, GitBranch, Globe2, Layers3, LockKeyhole, Menu,
  Network, Search, Settings2, ShieldCheck, Sparkles, Workflow, Zap,
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

type HolonBlueprint = {
  holon_code: string;
  area_code: string;
  holon_level: 1 | 2 | 3;
  holon_type: 'OWNER_BOOK' | 'TACTICAL_DC_MANAGER' | 'MARVEL_EXECUTION_SQUAD';
  display_name: string;
  mandate: string;
  parent_holon_code: string | null;
  specialist_count: number | null;
  runbook_required: boolean;
  source_path: string;
  sort_order: number;
};

const fallbackLd01Holons: HolonBlueprint[] = [
  { holon_code: 'B1', area_code: 'LD01', holon_level: 1, holon_type: 'OWNER_BOOK', display_name: 'B1-BOOK · OwnerBook', mandate: 'OwnerBook B1 · Carrière & Business.', parent_holon_code: null, specialist_count: null, runbook_required: false, source_path: 'local-fallback', sort_order: 1 },
  ...ld01DcManagers.map(([code, name], index) => ({ holon_code: code, area_code: 'LD01', holon_level: 2 as const, holon_type: 'TACTICAL_DC_MANAGER' as const, display_name: `${code} · ${name}`, mandate: `Playbook patrimonial DC — ${name}.`, parent_holon_code: 'B1', specialist_count: null, runbook_required: false, source_path: 'local-fallback', sort_order: index + 2 })),
  ...ld01MarvelSquads.map((code, index) => ({ holon_code: code.slice(0, 4), area_code: 'LD01', holon_level: 3 as const, holon_type: 'MARVEL_EXECUTION_SQUAD' as const, display_name: `${code.slice(0, 4)} · Marvel Squad`, mandate: '7 spécialistes + Runbook opérationnel.', parent_holon_code: 'B1', specialist_count: 7, runbook_required: true, source_path: 'local-fallback', sort_order: index + 10 })),
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
  const [ld01Holons, setLd01Holons] = useState<HolonBlueprint[]>(fallbackLd01Holons);
  const [holonSource, setHolonSource] = useState<'loading' | 'database' | 'fallback'>('loading');
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

  useEffect(() => {
    let activeRequest = true;
    if (!supabaseConfigured) {
      setHolonSource('fallback');
      return () => { activeRequest = false; };
    }
    void supabase.functions.invoke('marketplace-api', { body: { action: 'list_holon_blueprints', area_code: 'LD01' } })
      .then(({ data, error }) => {
        if (error) throw error;
        const rows = data?.data;
        if (!Array.isArray(rows) || rows.length !== 17) throw new Error('Expected 17 canonical LD01 holon blueprints');
        if (activeRequest) {
          setLd01Holons(rows as HolonBlueprint[]);
          setHolonSource('database');
        }
      })
      .catch(() => { if (activeRequest) setHolonSource('fallback'); });
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
          {active === 'domains' && <DomainsView domains={filteredDomains} query={query} setQuery={setQuery} onSelect={setSelectedDomain} selected={selected} axis={registryAxis} setAxis={setRegistryAxis} source={taxonomySource} holons={ld01Holons} holonSource={holonSource} />}
          {active === 'adapters' && <AdaptersView />}
          {active === 'marketplace' && <MarketplaceCatalogView />}
          {active === 'workspaces' && <WorkspacesView departments={departments} areas={areas} />}
          {active === 'agents' && <ComingSoon icon={Sparkles} title="Agent directory" text="Agents will be registered with versioned contracts, scoped tools, policy envelopes and auditable execution receipts." />}
          {active === 'workflows' && <ComingSoon icon={Workflow} title="Workflow orchestration" text="Compose adapters, agents and human approvals into idempotent, observable business processes." />}
          {active === 'governance' && <GovernanceView />}
        </div>
      </main>
    </div>
  );
}


type OrganizationRecord = { id: string; organization_key: string; name: string; organization_type: string; status: string };
type WorkspaceRecord = { id: string; organization_id: string; workspace_key: string; name: string; description: string; workspace_status: string };
type InstalledStructure = {
  domains: Array<{ id: string; domain_code: string; domain_name: string; installation_status: string }>;
  departments: Array<{ id: string; department_key: string; department_name: string; installation_status: string }>;
  holons: Array<{ id: string; holon_code: string; display_name: string; holon_level: number; installation_status: string }>;
};

function WorkspacesView({ departments, areas }: { departments: Domain[]; areas: Domain[] }) {
  const [organizations, setOrganizations] = useState<OrganizationRecord[]>([]);
  const [organizationId, setOrganizationId] = useState('');
  const [workspaces, setWorkspaces] = useState<WorkspaceRecord[]>([]);
  const [workspaceId, setWorkspaceId] = useState('');
  const [structure, setStructure] = useState<InstalledStructure>({ domains: [], departments: [], holons: [] });
  const [domainCodes, setDomainCodes] = useState<string[]>([]);
  const [departmentKeys, setDepartmentKeys] = useState<string[]>([]);
  const [includeLd01Holarchy, setIncludeLd01Holarchy] = useState(true);
  const [organizationName, setOrganizationName] = useState('');
  const [organizationKey, setOrganizationKey] = useState('');
  const [organizationType, setOrganizationType] = useState('INTERNAL_VENTURE');
  const [workspaceName, setWorkspaceName] = useState('');
  const [workspaceKey, setWorkspaceKey] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const loadStructure = async (orgId: string, wsId: string) => {
    if (!orgId || !wsId) { setStructure({ domains: [], departments: [], holons: [] }); return; }
    const { data, error: invokeError } = await supabase.functions.invoke('marketplace-api', { body: { action: 'list_workspace_structure', organization_id: orgId, workspace_id: wsId } });
    if (invokeError) throw invokeError;
    if (!data?.data || !Array.isArray(data.data.domains) || !Array.isArray(data.data.departments) || !Array.isArray(data.data.holons)) throw new Error('Invalid installed structure response');
    setStructure(data.data as InstalledStructure);
  };

  useEffect(() => {
    let alive = true;
    void (async () => {
      try {
        if (!supabaseConfigured) throw new Error('Marketplace backend is not configured in this preview.');
        const { data, error: invokeError } = await supabase.functions.invoke('marketplace-api', { body: { action: 'list_organizations' } });
        if (invokeError) throw invokeError;
        if (!Array.isArray(data?.data)) throw new Error('Invalid organization response');
        if (alive) {
          const rows = data.data as OrganizationRecord[];
          setOrganizations(rows);
          setOrganizationId(rows[0]?.id ?? '');
        }
      } catch (cause) {
        if (alive) setError(cause instanceof Error ? cause.message : 'Unable to load organizations.');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    if (!organizationId) { setWorkspaces([]); setWorkspaceId(''); setStructure({ domains: [], departments: [], holons: [] }); return; }
    let alive = true;
    void (async () => {
      try {
        const { data, error: invokeError } = await supabase.functions.invoke('marketplace-api', { body: { action: 'list_workspaces', organization_id: organizationId } });
        if (invokeError) throw invokeError;
        if (!Array.isArray(data?.data)) throw new Error('Invalid workspace response');
        if (alive) {
          const rows = data.data as WorkspaceRecord[];
          setWorkspaces(rows);
          setWorkspaceId(rows[0]?.id ?? '');
        }
      } catch (cause) { if (alive) setError(cause instanceof Error ? cause.message : 'Unable to load workspaces.'); }
    })();
    return () => { alive = false; };
  }, [organizationId]);

  useEffect(() => {
    if (!organizationId || !workspaceId) { setStructure({ domains: [], departments: [], holons: [] }); return; }
    let alive = true;
    void (async () => {
      try {
        const { data, error: invokeError } = await supabase.functions.invoke('marketplace-api', { body: { action: 'list_workspace_structure', organization_id: organizationId, workspace_id: workspaceId } });
        if (invokeError) throw invokeError;
        if (!data?.data) throw new Error('Invalid installed structure response');
        if (alive) setStructure(data.data as InstalledStructure);
      } catch (cause) { if (alive) setError(cause instanceof Error ? cause.message : 'Unable to load installed structure.'); }
    })();
    return () => { alive = false; };
  }, [organizationId, workspaceId]);

  const createOrganization = async () => {
    setSaving(true); setError(''); setNotice('');
    try {
      const key = organizationKey.trim().toUpperCase();
      const { data, error: invokeError } = await supabase.functions.invoke('marketplace-api', {
        body: { action: 'create_organization', name: organizationName.trim(), organization_key: key, organization_type: organizationType },
      });
      if (invokeError) throw invokeError;
      if (!data?.data?.id) throw new Error('Organization was not created.');
      const created = data.data as OrganizationRecord;
      setOrganizations(current => [...current, created]);
      setOrganizationId(created.id);
      setNotice('Organization created. Create its first workspace to continue.');
      setOrganizationName(''); setOrganizationKey('');
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Organization creation failed.'); }
    finally { setSaving(false); }
  };

  const createWorkspace = async () => {
    setSaving(true); setError(''); setNotice('');
    try {
      const { data, error: invokeError } = await supabase.functions.invoke('marketplace-api', {
        body: { action: 'create_workspace', organization_id: organizationId, workspace_key: workspaceKey.trim().toLowerCase(), name: workspaceName.trim() },
      });
      if (invokeError) throw invokeError;
      if (!data?.data?.id) throw new Error('Workspace was not created.');
      const created = data.data as WorkspaceRecord;
      setWorkspaces(current => [...current, created]);
      setWorkspaceId(created.id);
      setWorkspaceName(''); setWorkspaceKey('');
      setNotice('Workspace created. Choose the structure you want to install.');
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Workspace creation failed.'); }
    finally { setSaving(false); }
  };

  const install = async () => {
    setSaving(true); setError(''); setNotice('');
    try {
      const idempotencyKey = typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : 'install-' + Date.now();
      const { data, error: invokeError } = await supabase.functions.invoke('marketplace-api', {
        body: {
          action: 'install_structure', organization_id: organizationId, workspace_id: workspaceId,
          idempotency_key: idempotencyKey, domain_codes: domainCodes, department_keys: departmentKeys,
          include_ld01_holarchy: includeLd01Holarchy && domainCodes.includes('LD01'),
        },
      });
      if (invokeError) throw invokeError;
      const counts = data?.data?.counts;
      if (!counts) throw new Error('Installation returned an invalid result.');
      setNotice('Installation complete · ' + counts.domains + ' domains · ' + counts.departments + ' departments · ' + counts.holons + ' LD01 holons.');
      await loadStructure(organizationId, workspaceId);
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Structure installation failed.'); }
    finally { setSaving(false); }
  };

  const toggle = (values: string[], value: string, setter: (next: string[]) => void) =>
    setter(values.includes(value) ? values.filter(item => item !== value) : [...values, value]);

  if (loading) return <section className="bm-panel bm-workspace-state"><Activity size={22}/><strong>Loading organization context…</strong><span>Resolving authenticated memberships and workspace access.</span></section>;

  return <div className="bm-stack">
    <div className="bm-notice"><div className="bm-notice-icon"><Building2 size={17}/></div><div><strong>Tenant installation engine</strong><span>Global blueprints become organization-owned instances only after an authorized installation request. No organization or workspace is created automatically.</span></div><span className="bm-notice-tag">AUTHENTICATED CONTROL</span></div>
    {error && <div className="bm-workspace-alert error"><strong>Action blocked</strong><span>{error}</span></div>}
    {notice && <div className="bm-workspace-alert success"><strong>Confirmed</strong><span>{notice}</span></div>}

    {organizations.length === 0 ? <section className="bm-panel bm-workspace-panel">
      <span className="bm-eyebrow">STEP 01 / ORGANIZATION</span><h2>Create the tenant boundary</h2><p>An organization owns its workspaces, memberships, policies and installed business structures.</p>
      <div className="bm-workspace-form">
        <label>Organization name<input value={organizationName} onChange={e=>setOrganizationName(e.target.value)} placeholder="A’Space Marketplace" /></label>
        <label>Organization key<input value={organizationKey} onChange={e=>setOrganizationKey(e.target.value)} placeholder="ASPACE-MARKETPLACE" /></label>
        <label>Organization type<select value={organizationType} onChange={e=>setOrganizationType(e.target.value)}><option value="MARKETPLACE_OPERATOR">Marketplace operator</option><option value="INTERNAL_VENTURE">Internal venture</option><option value="EXTERNAL_ENTERPRISE">External enterprise</option><option value="SUPPLIER">Supplier</option><option value="CUSTOMER">Customer</option><option value="PARTNER">Partner</option></select></label>
        <button className="bm-primary" disabled={saving || !organizationName.trim() || !/^[A-Za-z0-9][A-Za-z0-9_-]{2,63}$/.test(organizationKey.trim())} onClick={()=>void createOrganization()}>{saving?'Creating…':'Create organization'} <ArrowRight size={15}/></button>
      </div>
    </section> : <>
      <section className="bm-panel bm-workspace-panel">
        <div className="bm-workspace-heading"><div><span className="bm-eyebrow">STEP 01 / ORGANIZATION</span><h2>Organization context</h2></div><span className="bm-source-pill database">{organizations.length} accessible organization(s)</span></div>
        <label className="bm-workspace-field">Active organization<select value={organizationId} onChange={e=>setOrganizationId(e.target.value)}>{organizations.map(org=><option key={org.id} value={org.id}>{org.name} · {org.organization_key}</option>)}</select></label>
      </section>
      <section className="bm-panel bm-workspace-panel">
        <div className="bm-workspace-heading"><div><span className="bm-eyebrow">STEP 02 / WORKSPACE</span><h2>Operating environments</h2></div><span className="bm-source-pill">{workspaces.length} workspace(s)</span></div>
        {workspaces.length>0 && <label className="bm-workspace-field">Active workspace<select value={workspaceId} onChange={e=>setWorkspaceId(e.target.value)}>{workspaces.map(ws=><option key={ws.id} value={ws.id}>{ws.name} · {ws.workspace_key}</option>)}</select></label>}
        <div className="bm-workspace-form compact">
          <label>Workspace name<input value={workspaceName} onChange={e=>setWorkspaceName(e.target.value)} placeholder="Headquarters" /></label>
          <label>Workspace key<input value={workspaceKey} onChange={e=>setWorkspaceKey(e.target.value)} placeholder="headquarters" /></label>
          <button className="bm-primary" disabled={saving || !organizationId || !workspaceName.trim() || !/^[a-z0-9][a-z0-9._-]{1,95}$/.test(workspaceKey.trim().toLowerCase())} onClick={()=>void createWorkspace()}>{saving?'Creating…':'Create workspace'} <ArrowRight size={15}/></button>
        </div>
      </section>
      {workspaceId && <section className="bm-panel bm-workspace-panel">
        <div className="bm-workspace-heading"><div><span className="bm-eyebrow">STEP 03 / STRUCTURE INSTALLATION</span><h2>Compose the operating structure</h2><p>Choose which reference blueprints become installed instances in this workspace.</p></div><span className="bm-source-pill database">TENANT-SCOPED</span></div>
        <div className="bm-install-columns">
          <div><h3>Areas OS · mission portfolios</h3>{areas.map(area=><label className="bm-install-option" key={area.id}><input type="checkbox" checked={domainCodes.includes(area.code)} onChange={()=>toggle(domainCodes,area.code,setDomainCodes)}/><span><strong>{area.code} · {area.name}</strong><small>{area.description}</small></span></label>)}</div>
          <div><h3>Marketplace · operating departments</h3>{departments.map(dept=><label className="bm-install-option" key={dept.id}><input type="checkbox" checked={departmentKeys.includes(dept.id)} onChange={()=>toggle(departmentKeys,dept.id,setDepartmentKeys)}/><span><strong>{dept.name}</strong><small>{dept.description}</small></span></label>)}</div>
        </div>
        {domainCodes.includes('LD01') && <label className="bm-install-holarchy"><input type="checkbox" checked={includeLd01Holarchy} onChange={e=>setIncludeLd01Holarchy(e.target.checked)}/><span><strong>Install LD01 internal holarchy</strong><small>B1 OwnerBook + 8 B2 tactical managers + 8 B3 Marvel squads. These are structural holon instances, not executable agents.</small></span></label>}
        <button className="bm-primary" disabled={saving || (!domainCodes.length && !departmentKeys.length)} onClick={()=>void install()}>{saving?'Installing…':'Install selected structure'} <ArrowRight size={15}/></button>
      </section>}
      {workspaceId && <section className="bm-panel bm-workspace-panel">
        <div className="bm-workspace-heading"><div><span className="bm-eyebrow">STEP 04 / INSTALLED INVENTORY</span><h2>Workspace structure</h2></div><span className="bm-source-pill database">LIVE TENANT READ</span></div>
        <div className="bm-installed-summary"><div><strong>{structure.domains.length}</strong><span>Areas OS</span></div><div><strong>{structure.departments.length}</strong><span>Departments</span></div><div><strong>{structure.holons.length}</strong><span>LD01 holons</span></div></div>
        <div className="bm-installed-list">
          {structure.domains.map(item=><div key={item.id}><span>{item.domain_code}</span><strong>{item.domain_name}</strong><em>{item.installation_status}</em></div>)}
          {structure.departments.map(item=><div key={item.id}><span>DEPT</span><strong>{item.department_name}</strong><em>{item.installation_status}</em></div>)}
          {structure.holons.map(item=><div key={item.id}><span>{item.holon_code}</span><strong>{item.display_name}</strong><em>{item.installation_status}</em></div>)}
          {!structure.domains.length && !structure.departments.length && !structure.holons.length && <p>No structure installed in this workspace yet.</p>}
        </div>
      </section>}
    </>}
  </div>;
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

function DomainsView({ domains: list, query, setQuery, onSelect, selected, axis, setAxis, source, holons, holonSource }: { domains: Domain[]; query: string; setQuery: (v:string)=>void; onSelect: (id:string|null)=>void; selected?: Domain; axis: 'departments' | 'areas'; setAxis: (v:'departments'|'areas')=>void; source: 'loading' | 'database' | 'fallback'; holons: HolonBlueprint[]; holonSource: 'loading' | 'database' | 'fallback' }) {
  const title = axis === 'departments' ? 'Business Departments' : 'Areas OS mission portfolios';
  const codeRange = axis === 'departments' ? '8 operating units' : 'LD01 – LD08';
  return <div className="bm-domains-layout">
    <section className="bm-panel bm-registry-panel"><div className="bm-registry-toolbar"><div><span className="bm-eyebrow">MARKETPLACE DEPARTMENTS ≠ LD01 HOLARCHY</span><h2>{title}</h2><span className={'bm-source-pill '+source}>{source==='database'?'SUPABASE REFERENCE DATA':source==='loading'?'LOADING REFERENCE DATA':'LOCAL REFERENCE FALLBACK'}</span><p>8 structural units · {codeRange}</p></div><div className="bm-registry-tools"><div className="bm-axis-switch"><button className={axis==='departments'?'active':''} onClick={()=>{setAxis('departments');onSelect(null);}}>8 Departments</button><button className={axis==='areas'?'active':''} onClick={()=>{setAxis('areas');onSelect(null);}}>8 Areas OS</button></div><div className="bm-search"><Search size={15}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Find a unit..." /></div></div></div>
      <div className="bm-domain-cards">{list.map(d=><button key={d.id} className={'bm-domain-card '+(selected?.id===d.id?'selected':'')} onClick={()=>onSelect(selected?.id===d.id?null:d.id)}><div className="bm-domain-card-top"><span className="bm-domain-chip" style={{color:d.color,borderColor:d.color+'55'}}>{d.code}</span><span className="bm-blueprint-mini">{axis==='departments'?'OPERATING DEPARTMENT':'MISSION PORTFOLIO'}</span></div><h3>{d.name}</h3><p>{d.description}</p><div className="bm-domain-card-foot"><span>{axis==='departments'?'Marketplace department blueprint':'Areas OS portfolio blueprint'}</span><ChevronRight size={15}/></div></button>)}</div>
      <div className="bm-panel-foot">Global reference architecture · tenant installation and ownership are separate lifecycle records</div>
    </section>
    <aside className="bm-panel bm-domain-detail">{selected ? <><div className="bm-detail-kicker">{selected.axis==='department'?'MARKETPLACE OPERATING DEPARTMENT':'AREAS OS PORTFOLIO'} / {selected.code}</div><h2>{selected.name}</h2><p>{selected.description}</p><div className="bm-detail-stat"><strong>{selected.code}</strong><span>{selected.axis==='department'?'Operating department':'Mission portfolio'}</span></div><h3>Operating responsibility</h3><p>{selected.role}</p>
      {selected.axis==='area' && selected.code==='LD01' && <div className="bm-ld01-holarchy"><div className="bm-holarchy-owner"><span>{holons.find(h=>h.holon_level===1)?.holon_code ?? 'B1'}</span><strong>{holons.find(h=>h.holon_level===1)?.display_name.replace('B1-BOOK · ','') ?? 'OwnerBook'}</strong><em>LD01 · B1 OwnerBook</em></div><div className="bm-source-pill" style={{marginBottom:10}}>{holonSource==='database'?'CANONICAL V5 HOLARCHY · SUPABASE':holonSource==='loading'?'LOADING LD01 HOLARCHY':'LOCAL SOURCE FALLBACK'}</div><div className="bm-holarchy-grid"><div className="bm-holarchy-group"><h4>B2 · {holons.filter(h=>h.holon_level===2).length} Managers tactiques DC</h4>{holons.filter(h=>h.holon_level===2).map(item=><div className="bm-holarchy-row" key={item.holon_code}><strong>{item.holon_code}</strong><span>{item.display_name.replace(item.holon_code+' · ','')}</span></div>)}</div><div className="bm-holarchy-group"><h4>B3 · {holons.filter(h=>h.holon_level===3).length} Squads d’exécution Marvel</h4>{holons.filter(h=>h.holon_level===3).map(item=><div className="bm-holarchy-row" key={item.holon_code}><strong>{item.holon_code}</strong><span>Marvel Squad</span></div>)}<p>Chaque squad : {holons.find(h=>h.holon_level===3)?.specialist_count ?? 7} spécialistes + {holons.find(h=>h.holon_level===3)?.runbook_required ? 'un Runbook opérationnel' : 'runbook à spécifier'}.</p></div></div><div className="bm-holarchy-note">B2/B3 are LD01 internal holons. They are not the eight Marketplace operating departments.</div></div>}
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

type AdapterFamilyBlueprint = {
  family_key: string;
  family_name: string;
  provider_examples: string[];
  icon_key: string;
  sort_order: number;
  taxonomy_version: string;
  implementation_status: 'PLANNED' | 'IN_PROGRESS' | 'AVAILABLE' | 'DEPRECATED';
};

type ProviderAdapterBlueprint = {
  provider_key: string;
  family_key: string;
  family_name: string;
  provider_name: string;
  manifest_version: string;
  implementation_status: 'PLANNED' | 'IN_PROGRESS' | 'AVAILABLE' | 'DEPRECATED';
  auth_contract_status: 'UNSPECIFIED' | 'SPECIFIED' | 'IMPLEMENTED' | 'VERIFIED';
  supported_operations: string[];
  documentation_uri: string | null;
};

const fallbackAdapterFamilies: AdapterFamilyBlueprint[] = adapterFamilies.map(([name, providers, icon], index) => ({
  family_key: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
  family_name: name,
  provider_examples: providers.split(' · '),
  icon_key: icon,
  sort_order: index + 1,
  taxonomy_version: 'local-fallback',
  implementation_status: 'PLANNED',
}));

function AdaptersView() {
  const [families, setFamilies] = useState<AdapterFamilyBlueprint[]>(fallbackAdapterFamilies);
  const [providers, setProviders] = useState<ProviderAdapterBlueprint[]>([]);
  const [selectedFamily, setSelectedFamily] = useState<string | null>(null);
  const [source, setSource] = useState<'loading' | 'database' | 'fallback'>('loading');

  useEffect(() => {
    let activeRequest = true;
    if (!supabaseConfigured) {
      setProviders(fallbackAdapterFamilies.flatMap(family => family.provider_examples.map(name => ({
        provider_key: family.family_key + '-' + name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        family_key: family.family_key,
        family_name: family.family_name,
        provider_name: name,
        manifest_version: 'local-fallback',
        implementation_status: 'PLANNED' as const,
        auth_contract_status: 'UNSPECIFIED' as const,
        supported_operations: [],
        documentation_uri: null,
      }))));
      setSource('fallback');
      return () => { activeRequest = false; };
    }

    void Promise.all([
      supabase.functions.invoke('marketplace-api', { body: { action: 'list_adapter_families' } }),
      supabase.functions.invoke('marketplace-api', { body: { action: 'list_provider_adapter_blueprints' } }),
    ]).then(([familyResult, providerResult]) => {
      if (familyResult.error) throw familyResult.error;
      if (providerResult.error) throw providerResult.error;
      if (!Array.isArray(familyResult.data?.data) || familyResult.data.data.length !== 20) throw new Error('Expected exactly 20 adapter family blueprints');
      if (!Array.isArray(providerResult.data?.data) || providerResult.data.data.length !== 73) throw new Error('Expected 73 provider adapter blueprints');
      if (activeRequest) {
        setFamilies(familyResult.data.data as AdapterFamilyBlueprint[]);
        setProviders(providerResult.data.data as ProviderAdapterBlueprint[]);
        setSource('database');
      }
    }).catch(() => {
      if (activeRequest) {
        setProviders(fallbackAdapterFamilies.flatMap(family => family.provider_examples.map(name => ({
          provider_key: family.family_key + '-' + name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          family_key: family.family_key,
          family_name: family.family_name,
          provider_name: name,
          manifest_version: 'local-fallback',
          implementation_status: 'PLANNED' as const,
          auth_contract_status: 'UNSPECIFIED' as const,
          supported_operations: [],
          documentation_uri: null,
        }))));
        setSource('fallback');
      }
    });
    return () => { activeRequest = false; };
  }, []);

  const visibleProviders = providers.filter(provider => provider.family_key === selectedFamily);
  const selectedFamilyName = families.find(family => family.family_key === selectedFamily)?.family_name;

  return <div className="bm-stack">
    <div className="bm-notice"><div className="bm-notice-icon"><Zap size={17}/></div><div><strong>20 adapter families · 73 provider blueprints.</strong><span>These records define integration design scope only. No provider adapter, credential, OAuth grant or tenant connection is live.</span></div><span className="bm-notice-tag">CATALOG BLUEPRINT</span></div>
    <div className={'bm-source-pill '+source}>{source==='database'?'SUPABASE REFERENCE DATA':source==='loading'?'LOADING ADAPTER REGISTRY':'LOCAL REFERENCE FALLBACK'}</div>
    <div className="bm-adapter-grid">{families.map((item,i)=><button type="button" className={'bm-adapter-card '+(selectedFamily===item.family_key?'selected':'')} key={item.family_key} onClick={()=>setSelectedFamily(selectedFamily===item.family_key?null:item.family_key)}><div className="bm-adapter-card-head"><span className="bm-adapter-icon">{adapterIcon(item.icon_key)}</span><span className="bm-adapter-number">A{i+1<10?'0':''}{i+1}</span></div><h3>{item.family_name}</h3><p>{item.provider_examples.join(' · ')}</p><div className="bm-adapter-card-foot"><span><i/> {item.implementation_status === 'AVAILABLE' ? 'Available' : item.implementation_status === 'IN_PROGRESS' ? 'In progress' : 'Not connected'}</span><span>{item.provider_examples.length} provider blueprints</span></div></button>)}</div>
    {selectedFamily && <section className="bm-panel bm-provider-panel"><div className="bm-panel-head"><div><span className="bm-eyebrow">PROVIDER BLUEPRINTS</span><h2>{selectedFamilyName}</h2></div><span className="bm-provider-count">{visibleProviders.length} providers</span></div><div className="bm-provider-list">{visibleProviders.map(provider=><article className="bm-provider-row" key={provider.provider_key}><div><strong>{provider.provider_name}</strong><span>{provider.provider_key}</span></div><span className="bm-provider-state">PLANNED</span><span className="bm-provider-auth">AUTH {provider.auth_contract_status}</span><span className="bm-provider-ops">{provider.supported_operations.length} operations specified</span></article>)}</div><div className="bm-panel-foot">Provider-specific auth, scopes, operations, credentials and execution contracts must be reviewed and implemented before a connection can be offered.</div></section>}
  </div>;
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
