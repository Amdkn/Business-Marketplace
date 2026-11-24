# Business Marketplace — Product Architecture

**Status:** Foundation contract / implementation target  
**Scope:** Marketplace product plane, Business Control Plane and Business Office Runtime.

## 1. Product boundary

The Business Marketplace is the customer-facing product and control plane. Business Office 3 OS is its inherited multi-surface runtime substrate. A’Space OS remains the higher-level federation and system-of-systems context.

Do not collapse these boundaries:

- A’Space: federation, platform governance and cross-product orchestration.
- Business Marketplace: organization-facing business capability marketplace and control plane.
- Business Office runtime: desktop, executive garden and mobile operational surfaces.
- Installed business: tenant-scoped domain model, applications, workflows, agents, data and policies.

## 2. Control-plane objects

| Object | Responsibility | Required invariants |
|---|---|---|
| Organization | Commercial/legal customer boundary | Stable ID; lifecycle; owner; plan; policy |
| Workspace | Operational environment inside an organization | Belongs to one organization; scoped membership |
| Domain | Owned business boundary | Stable key; parent; owner; lifecycle; dependencies |
| Capability | Atomic business function | Contract; inputs/outputs; permissions; version |
| Adapter | Provider integration implementation | Version; supported operations; auth and scope contract |
| Connection | Tenant's configured provider instance | Tenant-bound; secret reference; granted scopes; health |
| Agent | Executable worker identity | Versioned contract; tools; policy; audit |
| Workflow | Versioned process graph | Trigger; steps; approvals; retry and compensation rules |
| Installation | Activated capability or solution pack | Tenant-bound; version pinned; config; status |
| Policy | Authorization and execution constraints | Server-enforced; explicit; auditable |
| Event | State transition record | Actor; tenant; correlation ID; timestamp; causality |

## 3. Domain hierarchy

Canonical hierarchy:

`Organization → Workspace → Domain → Subdomain → Capability → Installation`

Domains can also depend on other domains and capabilities. Dependencies form a directed graph; parent/child hierarchy and dependency edges are different relations and must not be conflated.

A domain record should eventually expose:

- identity: `id`, `key`, `name`, `description`;
- structure: `parent_domain_id`, `path`, `depth`;
- ownership: `organization_id`, `workspace_id`, `owner_membership_id`;
- operation: `status`, `maturity`, `criticality`;
- composition: capabilities, workflows, agents, adapters and installations;
- governance: policies, data classification and audit references;
- measurement: outcomes, KPIs and health signals.

## 4. Adapter contract

An adapter definition is a reusable platform capability. A connection is a tenant-specific configured instance.

Minimum adapter manifest:

```ts
type AdapterManifest = {
  id: string;
  provider: string;
  name: string;
  version: string;
  category: string;
  capabilities: string[];
  auth: {
    methods: string[];
    requiredScopes: string[];
    secretFields: string[];
  };
  operations: Array<{
    id: string;
    direction: "inbound" | "outbound" | "bidirectional";
    resource: string;
    idempotent: boolean;
    approvalRequired?: boolean;
  }>;
  events: string[];
  healthcheck: { strategy: string; intervalSeconds: number };
  data: {
    classifications: string[];
    residency?: string[];
    retention?: string;
  };
};
```

Connection state machine:

`draft → awaiting_authorization → connected → degraded → disconnected`

Additional terminal/administrative states: `revoked`, `error`. A successful OAuth callback alone does not mean the adapter is healthy; run a scoped health check.

## 5. Agent and workflow governance

An agent is not granted ambient access because it exists in a workspace. Every run resolves:

1. authenticated human or service principal;
2. organization and workspace context;
3. agent contract and version;
4. permitted tools and resource scopes;
5. policy decision and approval requirements;
6. execution budget and timeout;
7. event/audit correlation;
8. output validation and side-effect receipt.

Workflow steps must support human approval, retries, idempotency keys, cancellation and compensation where a provider supports it.

## 6. Tenancy and security

- Supabase Auth identifies the principal; organization membership and role bindings determine tenant access.
- RLS protects tenant-owned records in exposed schemas.
- Private schemas remain private unless a reviewed API boundary is introduced.
- Service-role credentials are server-only.
- Adapter secrets are never persisted in localStorage or returned to client components.
- Browser tenant selectors are context, not authorization.
- All cross-tenant operations require an explicit privileged policy path and audit record.
- Demo mode is an explicit environment/product mode, never an implicit fallback that resembles a live customer workspace.

## 7. Existing implementation caveats

The inherited frontend currently includes Coach OS concepts such as `demo-coach`, `coach-os:*` local-storage keys, Coach onboarding copy and Coach-oriented seed collections. Those are legacy implementation details, not canonical Marketplace entities.

Before routing real users into the inherited Desktop:

- replace the implicit `demo-coach` tenant with an explicit demo workspace or authenticated organization context;
- remove any ambiguity between demo and production identities;
- map existing CMS collections to the Marketplace domain model only where semantics match;
- preserve old Coach behavior only behind an explicit legacy boundary until migration and tests exist.

Existing Marketplace UI is an integration catalog with local install toggles. It is not yet the provider adapter control plane described here.

## 8. Implementation sequence

### Wave 0 — identity and safety
- Product naming, metadata, README and deployment identity.
- Explicit demo vs authenticated organization context.
- Verify Supabase auth redirect/callback URLs and production sign-in.

### Wave 1 — control-plane shell
- Sidebar navigation and route contracts for Overview, Domains, Marketplace, Adapters, Workspaces, Agents, Workflows, Governance and Settings.
- Domain registry read model and hierarchy explorer.
- Organization/workspace context selector with permission-aware navigation.

### Wave 2 — domain and capability registry
- Schema/API contract, validation, migrations and RLS.
- CRUD lifecycle, ownership, parent-child and dependency graph.
- Capability contract and versioning.

### Wave 3 — adapters
- Adapter catalog and manifests.
- Connection lifecycle, OAuth/secret references, scopes and health.
- First verified adapters end-to-end; never show unimplemented providers as connected.

### Wave 4 — installation and orchestration
- Install capability/solution pack into a workspace.
- Resolve dependencies and policy checks.
- Agent/workflow execution, approvals, audit and observability.

### Wave 5 — multi-surface runtime
- Desktop: full control and operations.
- Digital Garden: executive portfolio and outcomes.
- Mobile Edge: approvals, field actions and alerts.

## 9. Acceptance gates

A feature is not complete because it renders. For every vertical slice:

- schema and API contract are documented;
- server-side tenant authorization is tested;
- UI loading, empty, error and permission-denied states exist;
- mutations have idempotency and audit behavior where relevant;
- automated tests cover the critical path;
- production deployment is checked against the actual route and backend;
- demo fixtures are visibly labeled and cannot be mistaken for live data.
