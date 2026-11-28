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

## 2. Sovereign platform core

Four foundational cores sit beneath the Marketplace departments, capabilities, adapters, agents and workflows:

| Core | Responsibility | Boundary |
|---|---|---|
| Compute Core | Execution capacity, runtimes, scheduling and resource governance | Provider capacity is not assumed connected |
| Inference Core | Model routing, inference endpoints, context budgets, fallbacks and evaluation | Model providers and inference policies require explicit configuration |
| Memory Core | Persistent memory, knowledge retrieval, provenance, retention and portability | No tenant memory store is implied by the platform blueprint |
| CEL Security Core | Identity, authorization, policy enforcement, secret boundaries, sandboxing and audit | Policy contracts must be enforced server-side, not only in the UI |

These are platform foundations, not Business Departments and not Areas OS mission portfolios. The Tech & Intelligence department (B2.5) is the operating department responsible for building and stewarding technical/intelligence capabilities; it is not a replacement for the four cross-cutting cores.

## 3. Control-plane objects

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

## 4. Structural taxonomy and domain hierarchy

Canonical tenant hierarchy:

`Organization → Workspace → Installed structure → (Business Department OR tenant Domain) → Capability → Installation`

The Marketplace UI must preserve two separate taxonomic axes:

### 4.1 Business Departments — eight Marketplace operating units

1. Product & IP
2. Growth & Distribution
3. People & Talent
4. Legal & Trust
5. Tech & Intelligence
6. Operations & Delivery
7. Finance & Capital
8. Sales & Partnerships

These eight departments describe the Marketplace business operating model and its value-producing functions. Their stable database identifiers are slugs (for example `product-ip`), not B2 holon codes.

### 4.2 Areas OS mission portfolios — LD01 to LD08

1. LD01 Business
2. LD02 Finances
3. LD03 Blue Life
4. LD04 Meta Cognition
5. LD05 Sovereign Triangle
6. LD06 Solarpunk Habitat
7. LD07 MC Sandbox
8. LD08 Civilizer / ABC OS

These eight Areas OS portfolios describe the A’Space mission/portfolio layer. They are not Marketplace departments.

### 4.3 LD01 internal holarchy — B1 / B2 / B3

LD01 Business has its own delegation structure, which must not be mistaken for the Marketplace department list:

- **B1 Book:** OwnerBook for LD01.
- **B2 — 8 tactical DC Managers:** B2.1 Operations; B2.2 Tresorerie; B2.3 Legal; B2.4 R&D; B2.5 Alliances; B2.6 Infra; B2.7 IT; B2.8 Gouvernance.
- **B3 — 8 Marvel execution squads:** B3.1 through B3.8, each composed of 7 specialists plus an operational runbook.

This B1/B2/B3 hierarchy is internal to LD01. It does not label, number or replace the eight Marketplace operating departments.

The canonical LD01 hierarchy is persisted in `areas.holon_blueprints` (17 reference records) and exposed through the public read-only `list_holon_blueprints` API action. The Control Plane loads the B1/B2/B3 detail from that API instead of treating the hard-coded UI arrays as the source of truth. Each B3 record carries the source-grounded invariant of seven specialists plus a required operational runbook. The individual specialist identities are not invented or stored by this registry.

The six Marketplace market surfaces identified by the V5 Day 1 core are another separate dimension; this Control Plane does not reinterpret them as departments, Areas OS portfolios or LD01 holons.

The Marketplace department registry, Areas OS portfolio registry and LD01 holarchy may connect through explicit project, ownership, capability and reporting relationships, but must retain independent identities and lifecycle semantics.

Domains can also depend on other domains and capabilities. Dependencies form a directed graph; parent/child hierarchy and dependency edges are different relations and must not be conflated.

A domain record should eventually expose:

- identity: `id`, `key`, `name`, `description`;
- structure: `parent_domain_id`, `path`, `depth`;
- ownership: `organization_id`, `workspace_id`, `owner_membership_id`;
- operation: `status`, `maturity`, `criticality`;
- composition: capabilities, workflows, agents, adapters and installations;
- governance: policies, data classification and audit references;
- measurement: outcomes, KPIs and health signals.

## 5. Relationship to the V5 Day 1 Marketplace core

The V5 [PR #56](https://github.com/Amdkn/Aspace_OS_V5/pull/56) contributes an in-memory domain engine for versioned capabilities, listings, order snapshots, guarded state transitions and idempotent order creation. Its own README explicitly marks it as non-production: no persistence, authentication, production authorization, durable audit, concurrency control, payments, escrow, payouts, refunds, tax/accounting, disputes or agent dispatch.

Treat that package as a behavioral/domain reference, not as a second persistence layer. The connected Marketplace database already has the authoritative persisted contracts in `catalog.capabilities`, `catalog.capability_versions`, `catalog.listings`, `commerce.orders` and `commerce.order_events`, with server-side API functions. Future integration should reconcile the PR #56 invariants with those contracts rather than create a parallel in-memory or duplicate SQL marketplace.

PR #56 also names **six market surfaces**. This Control Plane does not reinterpret or collapse those surfaces into the B2 department axis or the LD Areas OS axis. Their definitions remain a separate architectural dimension to be incorporated from the V5 source specification.

## 6. Adapter family registry versus provider implementation

The platform persists 20 global adapter-family blueprints in `integration.adapter_family_blueprints`. They group provider examples into integration families and are exposed through the public read-only `list_adapter_families` API action.

All 20 records currently have `implementation_status = PLANNED`. A provider example (for example Slack, GitHub or Stripe) is not proof of a provider-specific adapter, OAuth flow, granted scope, connection, sync job or healthy integration.

Keep these lifecycle layers distinct:

1. **Family blueprint:** the integration category and provider examples.
2. **Provider adapter manifest:** a concrete provider implementation, version, supported operations and auth contract.
3. **Tenant connection:** authorized provider account, encrypted secret reference, scopes and connection state.
4. **Runtime execution:** sync/webhook/job, idempotency, audit, health and error recovery.

The first layer is persisted, and the provider-example inventory has now been normalized into 73 provider-level blueprint records in `integration.provider_adapter_blueprints`. Each record is linked to one of the 20 families and has a stable key and manifest version.

These provider records are deliberately not treated as executable manifests:
- All 73 are `PLANNED`.
- All 73 have `auth_contract_status = UNSPECIFIED`.
- All 73 have an empty supported-operations list.
- No authentication method, OAuth scope, endpoint, webhook, or provider permission is inferred from a provider name.
- The public read-only `list_provider_adapter_blueprints` API can return all records or filter by `family_key`.

The provider inventory is now persisted and browseable. Concrete auth/scope contracts, executable provider manifests, tenant connections, secret references and runtime execution remain to be implemented and verified.

## 7. Adapter contract

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

## 8. Agent and workflow governance

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

## 9. Tenancy and security

- Supabase Auth identifies the principal; organization membership and role bindings determine tenant access.
- RLS protects tenant-owned records in exposed schemas.
- Private schemas remain private unless a reviewed API boundary is introduced.
- Service-role credentials are server-only.
- Adapter secrets are never persisted in localStorage or returned to client components.
- Browser tenant selectors are context, not authorization.
- All cross-tenant operations require an explicit privileged policy path and audit record.
- Demo mode is an explicit environment/product mode, never an implicit fallback that resembles a live customer workspace.

## 10. Existing implementation caveats

The inherited frontend currently includes Coach OS concepts such as `demo-coach`, `coach-os:*` local-storage keys, Coach onboarding copy and Coach-oriented seed collections. Those are legacy implementation details, not canonical Marketplace entities.

Before routing real users into the inherited Desktop:

- replace the implicit `demo-coach` tenant with an explicit demo workspace or authenticated organization context;
- remove any ambiguity between demo and production identities;
- map existing CMS collections to the Marketplace domain model only where semantics match;
- preserve old Coach behavior only behind an explicit legacy boundary until migration and tests exist.

Existing Marketplace UI is an integration catalog with local install toggles. It is not yet the provider adapter control plane described here.

## 11. Implementation sequence

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

## 12. Acceptance gates

A feature is not complete because it renders. For every vertical slice:

- schema and API contract are documented;
- server-side tenant authorization is tested;
- UI loading, empty, error and permission-denied states exist;
- mutations have idempotency and audit behavior where relevant;
- automated tests cover the critical path;
- production deployment is checked against the actual route and backend;
- demo fixtures are visibly labeled and cannot be mistaken for live data.


## 13. Tenant installation tranche — draft implementation status

The next vertical slice separates global blueprints from organization-owned instances.

### Implemented in the current draft branches

- `enterprise.workspaces`: organization-owned workspace records with stable keys and lifecycle state.
- `areas.domain_installations`: workspace-scoped instances of Areas OS domain blueprints.
- `enterprise.department_installations`: workspace-scoped instances of Marketplace operating department blueprints.
- `areas.holon_installations`: optional LD01 B1/B2/B3 structural instances, attached to an installed LD01 domain. B2 and B3 preserve the canonical direct-to-B1 parent relation.
- `enterprise.structure_installation_requests`: workspace-scoped idempotency ledger and immutable result snapshot.
- `enterprise.structure_installation_events`: append-only event trail for workspace creation and structure installation.
- Authenticated API actions: `list_workspaces`, `create_workspace`, `list_workspace_structure`, and `install_structure`.
- Control Plane Workspaces view: organization selection/creation, workspace creation, separate Areas OS and department selection, optional LD01 holarchy installation, and tenant-installed inventory.

### Invariants

1. A workspace belongs to one organization.
2. A domain, department or holon installation belongs to one workspace and one organization.
3. A holon installation requires an installed LD01 domain; all 17 canonical holons are installed as one optional structural pack.
4. Replaying an idempotency key with the same payload returns the original result; reusing it with a different payload is rejected.
5. Installation events are append-only.
6. All tenant operations require a verified Supabase Auth user and active organization membership; write operations additionally require an active organization role.
7. Global blueprints are not auto-installed into any tenant.

### Not yet verified / intentionally deferred

- Hosted migration application and migration-history verification.
- Live browser execution against the connected Marketplace Supabase project.
- Automated tests for cross-tenant access denial, duplicate/concurrent installation and idempotency replay.
- Per-installation owner assignment and explicit dependency-edge management.
- Capability linking and executable agent/runtime provisioning.

The schema/API/UI changes are committed to the open draft PRs only. They have not been applied to the hosted database, and no production deployment has been promoted.


## 14. Current backend execution status — 2026-11-26

This section supersedes the historical "not yet applied" status in §13. The tenant installation, workspace membership/holon integrity, ownership/dependency/capability engines, adapter execution engine, OAuth runtime, Google Drive draft manifest and capability entitlement migrations have since been applied to the existing Marketplace cloud project. The corresponding four Edge Functions are ACTIVE and their source is now tracked in this repository under `supabase/functions/`.

This is infrastructure and structural implementation evidence, not end-to-end acceptance. The live project currently has zero Auth users, organizations, memberships, workspaces, tenant installations, tenant connections, active provider manifests, published listings or orders. Google Drive remains DRAFT / PLANNED until a real authorized OAuth and provider operation round-trip passes. Day 1, Day 2 and Day 3 remain OPEN.

See [`supabase/README.md`](../supabase/README.md) and the [Day 1–3 handoff](./handoffs/2026-11-26-marketplace-day1-day3-handoff.md).


## 15. Finance & Capital — Day 2 foundation

Finance & Capital is Marketplace Department 07; it is distinct from the LD02 Areas OS portfolio. The provider-neutral private `finance` schema now contains nine tables: ledger accounts, journal entries/lines, payment intents, verified-webhook receipts, refunds, payout batches/items and disputes.

The foundation is applied through cloud migrations `20261126061930`, `20261126062124`, `20261126062317` and `20261126062541`. All nine tables have RLS enabled, browser schema/table access is revoked, and service_role is the only database gateway. All finance foreign keys now have matching covering indexes. Journal entries must balance before commit and become immutable once posted. Payment intent pricing/party facts are tied to immutable order snapshots; webhook processing requires signature verification; refunds cannot exceed the payment amount; payout items must match batch currency.

This is structural infrastructure, not payment acceptance. No payment processor is configured, no provider event is being treated as a capture, and no payout or journal has been fabricated. The full contract is in [FINANCE_LEDGER_CONTRACT.md](./FINANCE_LEDGER_CONTRACT.md), with regression assertions in `supabase/tests/marketplace_finance_ledger.sql`.

An authenticated, idempotent `api.post_finance_journal_entry` function and `post_finance_journal_entry` action are now implemented and deployed in `marketplace-api` v17. Posting validates role, same-tenant/currency active accounts, balanced debit/credit lines and payload-stable idempotency. No production journal is fabricated. Still open: provider-specific payment adapter, signed webhook verification implementation, fee policies, capture/refund/payout actions, settlement reconciliation, tax policy, dispute workflow, financial read models and UI.

## Finance & Capital — standard chart of accounts

The Finance schema now has a versioned global template catalogue (finance.chart_account_templates) and tenant-specific account provisioning. Chart version 2026.1 defines 16 accounts spanning ASSET, LIABILITY, EQUITY, REVENUE and EXPENSE. Each account is instantiated per organization and currency; templates themselves are not tenant financial records.

The guarded SQL function api.provision_finance_chart_of_accounts checks active organization, membership and Finance-capable role, serializes concurrent provisioning with an advisory transaction lock, rejects code/system-key collisions and is idempotent for the same organization/currency/version. It is callable only by service_role and has a pinned SECURITY DEFINER search_path. The authenticated marketplace-api action is provision_finance_chart_of_accounts; live deployment v19 has verify_jwt=true.

No organization exists in the current hosted project, so no chart instance was seeded. This is a structural capability only. The baseline is not a substitute for jurisdiction-specific statutory or tax configuration. See docs/FINANCE_LEDGER_CONTRACT.md.


Finance action authorization is separated from the general organization-role helper. The dedicated Finance gate accepts S0 Sovereign, B1 CEO, B2 Manager and B2.2 Treasury roles, and the SQL functions repeat the membership/role check. The active Marketplace API deployment is v20.

### Finance & Capital — versioned fee calculation

Finance now provides a versioned fee policy catalogue and immutable per-order fee snapshots. Policies support platform or seller scope, percentage basis points, fixed fees, optional minimum/maximum, currency-specific policies, explicit rounding scale and effective windows. The snapshot fixes gross, policy version, fee and seller net for the order; policy terms and snapshots cannot be rewritten after activation/application. Taxes and payment processing are kept outside the commission calculation. No default rate or fictitious order is seeded.

Fee policy activation uses a logical-identity advisory lock across competing versions and rejects overlapping active effective windows. All fee-policy foreign keys have covering indexes; Finance currently has no unindexed foreign keys.


Fee policy activation is serialized by owner/key/scope/seller/currency, so concurrent draft-version activations cannot race past the effective-window overlap check. Fee-policy foreign keys are indexed.

Captured payment accounting now bridges provider-confirmed capture → immutable fee snapshot → double-entry journal. The posting action allocates gross to PSP clearing, seller payable and platform fee revenue and delegates to the journal's idempotent immutable posting boundary. Refunds remain separate accounting events.

Finance now has a refund accounting path that reverses seller payable and platform fee revenue proportionally, credits PSP clearing for refund gross, preserves the original capture journal and uses cumulative fee allocation to avoid partial-refund rounding drift.

Finance now supports the ledger side of seller payout settlement. The platform records the owning organization on each payout batch, verifies provider-confirmed paid status and available seller-payable/PSP-clearing balances, and posts an idempotent debit-to-seller-payable / credit-to-PSP-clearing journal. Journal account rows are locked in deterministic order to prevent concurrent balance races.


## 16. Shared persistence for Garden and Web Desktop interfaces — 2026-11-26

The interface audit found 37 registered CMS collections in `src/lib/cms/seed.ts`: 34 operational collections and three demo-only `demo_coach_*` showcase collections. The CMS repository had a dormant typed-table map but continued reading/writing the generic `cms_items` store. Its tenant lookup also used the legacy public `memberships` relation.

The new `workspace_data` schema now provides 34 dedicated tenant tables with typed columns derived from the collection definitions. Every table is organization-owned, optionally workspace-scoped, RLS-protected and restricted to active tenant members for reads and S0/B1/B2 roles for writes. A trigger prevents organization/primary-key reassignment and preserves original creator identity. The event sink is `workspace_data.activity_events`.

The CMS repository now maps each collection ID to its dedicated table, stores declared fields in typed columns and preserves unmodeled fields in `extra_data`. It resolves the organization through `identity.organization_memberships`. The store now treats an empty live collection as authoritative, replacing fictional sample rows instead of leaving demo data visible to a real tenant.

The source migration is `supabase/migrations/20261126083638_marketplace_interface_persistence.sql`; the regression suite is `supabase/tests/marketplace_interface_persistence.sql`. Hosted verification passed: 35 tables including the event sink, 138 RLS policies, no RLS-disabled tables, no anon table grants, and a rolled-back authenticated insert/read/update probe.

This does not complete the interface conversion. The Sidebar-specific repositories still use `dashboard.clients` and `dashboard.agents`; the People/Agent screens need projection from canonical `identity.profiles`, `identity.organization_memberships` and `identity.agent_principals`. Workspace-scoped query enforcement and app-local stores outside the shared CMS also remain. The preview deployment and browser E2E must be rerun against the new branch head before acceptance.


## 17. Legacy OMK naming removal — 2026-11-26

The active Garden/Sidebar views, Mission Control surfaces, Web Desktop app entrypoints/seeds and Welcome landing/canvas copy were audited and the legacy OMK product/schema naming was removed or replaced with current Marketplace/A’Space terminology. This includes obsolete `omk_saas.*` UI labels, `ADR-OMK-*` comments, old product names, old demo service identifiers, and `omknexus.io` demo domains. The active source paths inspected now have no remaining OMK matches. The live Supabase catalog also has no schema with that name. Historical migration files and handoff records retain legacy references only as provenance; do not rewrite already-applied migrations to erase history.


## 18. Shared interface persistence — Garden + Web Desktop

The Garden Sidebar and Web Desktop CMS must use one tenant data plane: Supabase schema workspace_data. The Garden default schema is workspace_data; the CMS repository already resolves tenant membership through identity.organization_memberships and reads/writes workspace_data collections.

Garden's repository table map is explicit and must not query an implicit dashboard schema:
- clients → workspace_data.clients
- agents → workspace_data.people_agents
- documents → workspace_data.documents
- invoices → workspace_data.invoices
- legal_docs → workspace_data.legal_documents
- missions → workspace_data.tasks
- sales_leads → workspace_data.deals
- sops → workspace_data.runbooks

UI-only attributes are retained in each row's extra_data JSONB while stable, queried attributes remain typed columns. Every Garden repository operation is organization-scoped; create also attributes the authenticated creator. Database RLS remains authoritative. The first real Marketplace tenant is now present in Supabase (one user, organization, organization membership, workspace and workspace membership); no synthetic tenant data was created by the persistence work.

The older dashboard.clients and dashboard.agents tables are legacy compatibility artifacts only. Do not add new Garden features to that schema or silently fall back to it. Documents and Legal Data Room now have dedicated tenant tables. Storage upload/download, cross-workspace selector behavior and authenticated browser CRUD still require integration and acceptance tests.
