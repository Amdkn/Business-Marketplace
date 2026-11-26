# A’Space Marketplace — Session Handoff (Day 1–3)

> **Purpose:** durable restart point for a new session. Continue implementation and verification from the existing repository and Supabase project. This is a full-scope handoff, not a request to re-plan or reduce scope.
>
> **Snapshot date:** 2026-11-26 (UTC)
> **Canonical repository:** `Amdkn/Business-Marketplace` (backend source ported from V5 PR #63)
> **Supabase project:** `swegnrvaxxgfrnshdpxx` — `Aspace MarketPlace`
> **Current working PR:** [#1](https://github.com/Amdkn/Business-Marketplace/pull/1) (product + backend consolidation)
> **Working branch:** `foundation/marketplace-product-identity` → `main`
> **PR state:** OPEN, DRAFT, not merged. Keep it draft until the full scope and acceptance gates are met.

---

## 0. Operating instructions for the next session

1. **Continue the work; do not return a presentation or ask the user to fill a planning form.**
2. **Supabase native connector only.** The native linked account named `Aspace marketplace` is the authorized route. Do not use Composio for Supabase, do not create another Supabase project, and do not move to local infrastructure.
3. Reuse existing migrations, schemas, API functions, branches, PRs and cloud evidence. Do not rebuild what already exists.
4. Do not claim a Day is complete because a migration was applied, a PR exists, or a deployment is READY. Completion requires integrated behavior and evidence.
5. Do not shrink the product scope to an MVP. The three Days below are the complete delivery scope. Validation is a quality gate within that scope, not a substitute for it.
6. Do not seed fake production identities, organizations or workspaces merely to make E2E tests pass. Use a real authorized test identity/tenant when available; until then, label authenticated E2E as blocked.
7. Do not expose secrets, access tokens, service-role keys or raw provider credentials in Git, logs, API responses or this handoff. Persist references to managed secrets, not secret values.
8. Preserve PR #63 and its branch. Do not merge it or push unrelated work to `master`.
9. Keep the architecture coherent with A’Space OS V5: 3 OS / 578 Holons (13 Tech OS + 43 Life OS + 522 Areas OS). Marketplace is LD01 Business OS; its eight Business departments are not the same taxonomy as the eight Areas OS.
10. Next work begins with reconciliation of Day 1 evidence and then completes Day 2 and Day 3 end-to-end. No historical audit restart unless a concrete gap requires it.

## 1. Product target and architecture invariants

A’Space Marketplace is sovereign economic and operational infrastructure for creating, orchestrating, distributing and capturing value across people, agents, products, services, applications, compute, inference, memory, knowledge and IP. It is not merely an e-commerce storefront, SaaS dashboard or 30-agent agency.

### Platform topology

- **C0 — Sovereign Platform Campus**: the platform's central operating environment and Control Tower.
- **Core infrastructure**: Compute Core, Inference Core, Memory Core, CEL Security Core.
- **Marketplace / Enterprise Factory**: organization creation, catalog, capability and provider ecosystem, installation, operations, replication.
- **A’Space OS V5 alignment**: 13 Tech OS + 43 Life OS + 522 Areas OS = 578 Holons.
- **Areas OS**: LD01–LD08 are mission/domain portfolios. They are not the same thing as the eight Business departments.
- **Eight Business departments**:
  1. Product & IP
  2. Growth & Distribution
  3. People & Talent
  4. Legal & Trust
  5. Tech & Intelligence
  6. Operations & Delivery
  7. Finance & Capital
  8. Sales & Partnerships
- **Enterprise Creation Pipeline**: opportunity → design → blueprint → assembly → deployment → operations → replication.
- **Agent/holon organization**: B1 / B2 / B3 hierarchy, with explicit mandates, ownership, permissions, dependencies and runbooks.
- **Integration ambition**: 20+ adapter families and the provider ecosystem currently represented by 73 provider blueprints. Blueprints must not be represented as working integrations until authenticated operations are actually executable.

### End-state system behavior

A real tenant must be able to:
1. authenticate and establish a user identity;
2. create an organization and one or more workspaces;
3. manage organization and workspace memberships, roles and delegated authority;
4. install its Areas OS domains and Business departments;
5. install the relevant holons and B1/B2/B3 structure;
6. assign human and agent ownership, managers, technicians and stewards;
7. create and validate dependency graphs;
8. install versioned capabilities and enforce entitlements;
9. connect provider adapters using tenant-scoped managed credentials;
10. deploy and operate agents with explicit scopes and revocable delegations;
11. publish and discover products, services and capabilities;
12. create orders and execute the commercial lifecycle;
13. account for payments, ledger entries, payouts and reconciliation;
14. orchestrate compute, inference, memory and CEL security;
15. run workflows and monitor operations through one Control Tower;
16. reproduce the enterprise blueprint for another tenant without leaking tenant data.

---

## 2. Status vocabulary

Use these labels consistently:

- **IMPLEMENTED / CLOUD-APPLIED** — code or migration exists and its presence in the target cloud has been verified.
- **DEPLOYED** — a named runtime/function version is active in the target environment.
- **STRUCTURALLY VERIFIED** — schema, constraints, grants, RLS or negative tests were inspected.
- **PARTIAL** — a component exists but its lifecycle, integration or coverage is incomplete.
- **BLUEPRINT ONLY** — catalog metadata exists; no executable provider/runtime claim is allowed.
- **NOT VERIFIED** — evidence has not been collected in this handoff.
- **BLOCKED** — a concrete dependency prevents the test or delivery.
- **ACCEPTED** — only after the relevant end-to-end acceptance criteria pass.

No Day is currently accepted as complete.

---

## 3. DAY 1 — FOUNDATION (full scope)

**Objective:** a secure, coherent, tenant-safe BedRock for all Marketplace and Enterprise Factory behavior.

### D1.01 — Architecture and Platform Core
- Canonical platform architecture and component boundaries.
- C0 Sovereign Platform Campus and Control Tower responsibilities.
- Compute, Inference, Memory and CEL Security Core boundaries and contracts.
- Separation between platform control plane, tenant data plane, marketplace catalog and enterprise runtime.
- Alignment with A’Space OS V5 and 578-Holons topology.
- API/event contracts, versioning, ownership and dependency rules.
- Failure modes, lifecycle states, idempotency and compatibility strategy.

**Status:** architecture and schema artifacts exist across the repository and PR history; full contract reconciliation and acceptance evidence remain **NOT VERIFIED**.

### D1.02 — Governance and Control Tower
- Decision/architecture records and change governance.
- Platform operator versus tenant owner/admin authority.
- Organization, workspace, domain, department and holon ownership.
- Role/permission registry and explicit delegation model.
- Audit trail, append-only event ledgers and operational accountability.
- Control Tower views for platform health, tenant lifecycle, integrations, agents, workflows, commerce and security.
- No implicit authority inheritance across tenants or scopes.

**Status:** parts of the identity, workspace, role, delegation and installation governance are implemented; integrated Control Tower and complete governance acceptance are **PARTIAL / NOT VERIFIED**.

### D1.03 — Identity and Authentication
- Supabase Auth user identity and profile lifecycle.
- Signup, login, logout, session lifecycle, refresh and recovery.
- Verified identity/session handling in Edge Functions.
- Secure bootstrap and platform-operator provisioning path.
- Organization membership lifecycle and account status.
- Agent principals as distinct non-human identities.
- Human-to-agent delegation with explicit scopes, permissions, expiry and revocation.
- Authorization must not rely on user-editable JWT user metadata.
- Session revocation and token freshness behavior must be addressed for sensitive operations.

**Status:** identity schema and initial identity foundation are present; cloud currently reports zero Auth users. Full real-user lifecycle and authenticated API E2E are **NOT VERIFIED / BLOCKED by absence of a real authorized test identity**.

### D1.04 — Organizations, Tenants, Workspaces and Memberships
- Organization create/read/update lifecycle.
- Tenant isolation and organization ownership.
- Organization memberships and role bindings.
- Workspace create/list/read lifecycle.
- Explicit workspace membership, including OWNER / ADMIN / MEMBER / VIEWER.
- Membership invitation/acceptance/removal and role changes.
- Organization membership must not silently imply workspace membership.
- Cross-tenant and cross-workspace foreign-key integrity.
- Idempotent workspace and tenant provisioning.

**Status:** schemas and API paths exist; workspace creator OWNER membership and explicit workspace membership checks were added. Cloud currently has zero organizations and zero workspaces, so live tenant lifecycle is **NOT VERIFIED**.

### D1.05 — Data Foundation and Complete Data Model
- Reconcile all application schemas and migrations against the cloud database.
- Identity, enterprise, catalog, commerce, integration, areas and platform/core schemas.
- Stable identifiers, foreign keys, unique constraints, check constraints and indexes.
- Versioned blueprints, immutable/versioned capability contracts and lifecycle states.
- Tenant ownership on every tenant-scoped record.
- Referential integrity across organization, workspace, domain, department, holon, capability, order and integration records.
- Idempotency keys for retryable commands.
- Append-only event history where audit semantics require it.
- Migration history consistency between repository and cloud.
- Explicitly document schemas/tables that are reserved but not yet implemented.

**Status:** significant cloud schemas and relations exist. The current live catalog includes identity, enterprise, catalog, commerce, integration and areas objects; migration history and complete schema-to-repo reconciliation still need a systematic closeout. **PARTIAL**.

### D1.06 — Security Foundation
- RLS enabled on tenant/private application tables.
- Tenant isolation tests for read/write/update/delete.
- No browser role access to service-role-only data.
- Least-privilege grants, schema exposure and function execution rights.
- Secure SECURITY DEFINER functions with narrow ownership, search_path and execute grants.
- JWT validation at Edge Function boundary and server-side authorization.
- Secret management via Supabase Vault / secure provider secret storage; never return raw secrets.
- Webhook signature verification, timestamp tolerance and replay protection.
- Auditability, rate limiting, abuse controls and safe error responses.
- Backup/restore strategy and tested recovery procedures.
- Security advisor review and remediation.

**Status:** prior cloud checks documented RLS on selected tables, no direct anon/authenticated SELECT on sensitive engine tables, and revocation of PUBLIC/anon/authenticated execution on `public.rls_auto_enable()`. The current handoff did not rerun the complete security inventory, backup/restore test or all-tenant isolation matrix. **PARTIAL / NOT ACCEPTED**.

### D1.07 — API Foundation and Contracts
- Consistent Edge Function/API action envelope and versioning.
- JWT identity validation and centralized authorization helpers.
- Input validation, schema contracts, error taxonomy and safe error output.
- Idempotent mutation semantics.
- Pagination/filter/sort conventions.
- Tenant/workspace context resolution.
- Audit event emission for security-sensitive mutations.
- API tests for allow and deny paths.
- OpenAPI/contract documentation and compatibility policy.

**Status:** `marketplace-api` is deployed (see Day 2/3 evidence), but the entire API contract and route coverage are not yet accepted. **PARTIAL**.

### D1.08 — Auditability, Backups and Observability
- Append-only audit/event ledgers.
- Correlation IDs and request/job/tenant identifiers.
- Structured logs and metrics.
- Error tracking, traces, latency and throughput.
- Backup schedules, retention and point-in-time recovery configuration.
- Restore drill with documented RPO/RTO.
- Operational alerts and incident response.
- Control Tower health views.

**Status:** append-only installation event/request guards are cloud-applied and negative-tested. Complete audit coverage, backup/restore proof, observability dashboards and recovery drills are **NOT VERIFIED**.

### D1.09 — Identity/Tenant Foundation Migration
- Historical identity foundation and PR #57 evidence.
- Reconcile migration files, cloud migration registry and schema reality.
- Confirm all referenced migrations are represented in repository history.
- Confirm deployed functions are compatible with the current schema.
- Validate user → organization → membership → workspace → workspace membership.
- Validate rejection of unauthorized and cross-tenant operations.

**Status:** PR #57 is historical evidence for the initial identity/tenant foundation; the prior session recorded that the nine non-identity application schemas were initially empty after that milestone. Subsequent PR #58/#63 work expanded the database. Do not infer Day 1 closure from PR #57. Current cloud identity/tenant counts remain zero; full acceptance is **OPEN**.

### Day 1 acceptance gate
Day 1 is accepted only when:
- migration history and repository are reconciled;
- every application schema has an explicit implemented/reserved status;
- real user auth and organization/workspace lifecycle work;
- cross-tenant isolation and authorization negative tests pass;
- API contracts and security grants are verified;
- append-only/audit behavior is demonstrated;
- backup and restore are tested;
- operational telemetry and incident signals are usable.

---

## 4. DAY 2 — MARKETPLACE ENGINE (full scope)

**Objective:** make the platform's economic catalog, discovery, capability, delegation, integration and commercial lifecycle work for real tenants.

### D2.01 — Marketplace Catalog and Taxonomy
- Eight Areas OS blueprints and eight Business department blueprints.
- 20 adapter-family taxonomy entries.
- Provider catalog (73 provider blueprints recorded in prior PR evidence).
- Capability catalog and immutable/versioned capability definitions.
- Product/service/agent/tool/compute/inference/memory resource categories.
- Provider and capability lifecycle, ownership and versioning.
- Distinguish taxonomy metadata from executable implementations.

**Status:** five catalog/taxonomy migrations were recorded as applied in prior PR evidence; the current cloud exposes `integration.adapter_family_blueprints` and `integration.provider_adapter_blueprints`. Provider records are blueprints, not executable integrations. **PARTIAL**.

### D2.02 — Products, Services, Listings and Publication
- Product and service definitions.
- Listings linked to exact capability/version.
- Listing ownership, pricing, currency, acceptance criteria and publication lifecycle.
- Draft/review/published/suspended/retired states.
- Search, filters, categories, sorting and discovery.
- Listing validation and tenant visibility.
- Marketplace seller/buyer experience and API.

**Status:** catalog listing schema exists in cloud. Full publication/discovery and tenant-visible UX/API acceptance are **NOT VERIFIED**.

### D2.03 — Agents, Principals and Delegations
- Agent principals distinct from human users.
- Agent classes, runtime, status and organization ownership.
- Delegation from humans/roles to agents with scope, permission codes, starts_at, expires_at and revocation.
- Least-privilege scopes and explicit authority chain.
- Runtime identity propagation and audit attribution.
- Agent lifecycle and deactivation behavior.

**Status:** identity agent principal/delegation structures exist; runtime enforcement and E2E are **PARTIAL / NOT VERIFIED**.

### D2.04 — Discovery and Publication
- Search/discovery over products, services, capabilities, agents and providers.
- Listing publication and visibility rules.
- Catalog version compatibility.
- Tenant and public marketplace visibility boundaries.
- Ranking and filtering contracts.
- API/UI integration.

**Status:** schema groundwork exists; complete operational discovery is **NOT VERIFIED**.

### D2.05 — Orders and Transaction Lifecycle
- Order creation against a published listing and exact version.
- Buyer/seller/tenant authorization.
- Order state machine and transition validation.
- Append-only order events and actor attribution (human/agent/system).
- Acceptance, fulfillment, cancellation, dispute/refund and closure.
- Idempotency and duplicate-request safety.
- Commercial entitlement generated by accepted order.
- Reconciliation and audit.

**Status:** `commerce.orders` and `commerce.order_events` exist in the cloud schema. Full transactional lifecycle, entitlement coupling and E2E are **NOT VERIFIED**.

### D2.06 — Payments, Ledger, Payouts and Reconciliation
- Payment intent/authorization/capture/refund lifecycle.
- Provider payment adapters and webhook verification.
- Double-entry financial ledger with immutable postings.
- Seller balances, payout eligibility and payout lifecycle.
- Fees, commissions, taxes and currency handling.
- Reconciliation between orders, payment provider, ledger and payouts.
- Disputes, chargebacks and exception handling.
- Financial audit/reporting.
- Never mark payment integration live without real provider sandbox/production evidence.

**Status:** not demonstrated by the evidence in this handoff. **NOT VERIFIED / OPEN**.

### D2.07 — Ownership Engine
- Human and agent principals.
- OWNER / MANAGER / TECHNICIAN / STEWARD / OBSERVER assignment roles.
- Expiry, revocation and historical audit.
- Exactly one active OWNER per installed entity.
- Active membership/agent validation.
- Ownership across domain, department and holon installations.

**Status:** implemented and cloud-applied in `enterprise.installation_ownership_assignments`; API actions deployed. Structural and negative tests were recorded. Authenticated tenant E2E remains pending. **IMPLEMENTED / STRUCTURALLY VERIFIED / E2E BLOCKED**.

### D2.08 — Dependency Graph Engine
- Typed dependency edges between DOMAIN / DEPARTMENT / HOLON installations.
- Tenant/workspace boundary validation.
- Active-target validation.
- Cycle detection and rejection.
- Safe removal/revocation semantics.
- Dependency visibility in workspace structure.

**Status:** implemented and cloud-applied in `enterprise.installation_dependencies`; API actions deployed. Structural validation and cycle guards were implemented; tenant E2E remains pending. **IMPLEMENTED / STRUCTURALLY VERIFIED / E2E BLOCKED**.

### D2.09 — Capability Installation Engine
- Link exact capability and immutable version to installed domain/department/holon.
- Configuration validation against versioned input/output contracts.
- Permission checks and lifecycle states.
- Install/remove/revoke semantics.
- Organization ownership and marketplace entitlement checks.
- Cross-organization installs only after order/entitlement authorization is implemented.

**Status:** implemented and cloud-applied in `catalog.capability_installations`; API actions deployed. Current rule deliberately restricts installation to capabilities owned by the same organization; cross-organization entitlement integration remains OPEN. **IMPLEMENTED WITH DELIBERATE BOUNDARY**.

### D2.10 — Adapter Connection Lifecycle and Executable Integration Engine
- Adapter family/provider manifests with schema version and lifecycle.
- Exact authentication contract (OAuth2, API key, service account, signed webhook, etc.) grounded in provider documentation.
- Required scopes, endpoints, supported operations and JSON input/output schemas.
- Tenant-scoped connection records.
- Managed secret references only; never store or return raw credentials in normal application tables/API.
- OAuth authorization/callback/refresh/revoke where relevant.
- Connection status, provider account identity, last health check and last successful operation.
- Execution jobs, retries, idempotency, timeout and rate-limit handling.
- Invocation audit logs with redaction.
- Webhook subscription, signature validation, timestamp tolerance, replay protection and delivery receipts.
- Health checks, connection test and credential rotation.
- Adapter version pinning, deprecation and compatibility.
- Admin UI for connect/disconnect/re-authorize/test/inspect.
- At least a verified set of real executable adapters, then progressive coverage of all 20 families / 73 providers. Never label all providers operational based on blueprint rows.

**Status:** only `integration.adapter_family_blueprints` and `integration.provider_adapter_blueprints` are confirmed by the current live schema inspection. Their columns include provider/family keys, names, manifest version, implementation status, auth contract status, supported operations, docs URI and taxonomy version. The 20-family / 73-provider catalog is blueprint-level. No tenant connection, executable adapter runtime, invocation job, webhook receipt or secret-reference lifecycle was confirmed in the current schema inspection. **BLUEPRINT ONLY / MAJOR OPEN WORK**.

### Day 2 acceptance gate
Day 2 is accepted only when a real tenant can publish/discover a capability, purchase/order it, receive an authorized entitlement, install it, connect an adapter, execute a supported provider operation, process its webhook safely, and reconcile the commercial result. Ownership/dependency/capability engines must be part of that same lifecycle.

---

## 5. DAY 3 — ENTERPRISE FACTORY & LAUNCH (full scope)

**Objective:** turn a blueprint into a provisioned, secure, operational and replicable enterprise environment.

### D3.01 — Tenant Installation Engine
- Idempotent tenant/workspace provisioning.
- Domain, department and holon installation records.
- Installation requests, events and lifecycle states.
- Retry-safe operations and immutable audit.
- Ownership, dependencies and capability installation integrated.
- Parent/child structure and correct domain binding.
- Rollback/compensation for partial installation.
- Cross-tenant integrity and installation authorization.

**Status:** installation tables and API groundwork exist; workspace membership and holon integrity migrations were applied. Ownership/dependency/capability engines added. Append-only request/event guards added. No live tenant rows; authenticated full installation E2E remains **BLOCKED / NOT ACCEPTED**.

### D3.02 — Workspace Provisioning and Structure Installation
- Workspace creation and explicit OWNER membership.
- Install all eight Areas OS domains as appropriate to tenant plan.
- Install all eight Business departments.
- Link departments to the tenant organization/workspace and their owners.
- Provision domain/department/holon dependencies.
- Idempotent provisioning, retries, failure recovery and installation history.
- Workspace structure query includes assignments, dependencies and capability installations.

**Status:** API behavior and schemas have been extended; no live tenant fixture exists. **PARTIAL / E2E BLOCKED**.

### D3.03 — Eight Areas OS
- Install and configure LD01–LD08 as mission/domain portfolios.
- Preserve domain code, mission, parent relationships, taxonomy version and status.
- Link each domain to the tenant workspace.
- Respect that Marketplace belongs to LD01, not that all Marketplace departments are LDs.
- Domain-level ownership, dependencies, capabilities, policies and metrics.

**Status:** eight domain blueprints were recorded in prior PR evidence; tenant installations are not demonstrated. **BLUEPRINT / PARTIAL**.

### D3.04 — Eight Business Departments
- Product & IP.
- Growth & Distribution.
- People & Talent.
- Legal & Trust.
- Tech & Intelligence.
- Operations & Delivery.
- Finance & Capital.
- Sales & Partnerships.
- Department ownership, managers, responsibilities, dependencies, capability set and workflows.
- Distinguish this organization chart from LD01–LD08.

**Status:** eight department blueprints were recorded in prior PR evidence; full tenant deployment and workflows not demonstrated. **BLUEPRINT / PARTIAL**.

### D3.05 — Holarchy B1 / B2 / B3
- B1 strategic/department leadership.
- B2 domain/functional managers.
- B3 execution specialists/technicians.
- 17 LD01 holons previously recorded: 1 B1, 8 B2, 8 B3.
- Parent/child constraints, mandates, runbooks and specialist capacity.
- Human and agent assignment, ownership and delegated authority.
- Agent principals bound to installed holons and scopes.
- Monitoring, succession, deactivation and reassignment.

**Status:** holon blueprints and installation tables exist; previous PR evidence records 17 LD01 holons. Live installation and agent runtime integration are **PARTIAL / NOT VERIFIED**.

### D3.06 — Compute Core
- Tenant-aware compute resource catalog and provisioning.
- Resource classes, capacity, quotas, allocation, metering and billing.
- Execution environments/sandboxes and isolation.
- Scheduling, queues, retries and lifecycle.
- Resource usage attribution to tenant, workspace, agent, capability and order.
- Cost controls, utilization and availability telemetry.

**Status:** no integrated operational compute core demonstrated in this handoff. **NOT VERIFIED / OPEN**.

### D3.07 — Inference Core
- Provider/model registry and versioning.
- Model routing, policies, fallbacks and tenant BYOK/managed credentials.
- Inference request/response contracts and streaming.
- Budget, token/compute usage and cost attribution.
- Evaluation, quality, latency and failure telemetry.
- Policy enforcement, data handling and provider isolation.

**Status:** no integrated operational inference core demonstrated in this handoff. **NOT VERIFIED / OPEN**.

### D3.08 — Memory Core
- Tenant-scoped memory stores and namespaces.
- Knowledge, documents, vectors and structured memory.
- Provenance, access control, retention and deletion lifecycle.
- Retrieval, indexing, embeddings and re-ranking contracts.
- Memory ownership and agent-specific access scopes.
- Data isolation and audit.

**Status:** no integrated operational Memory Core demonstrated in this handoff. **NOT VERIFIED / OPEN**.

### D3.09 — CEL Security Core
- Centralized security policy and enforcement.
- Identity, authorization and delegation evaluation.
- Secrets and key references.
- Data classification, isolation and redaction.
- Tool/adapter/agent permission boundaries.
- Policy decision/audit trail and revocation propagation.
- Threat detection and incident workflows.

**Status:** selected database security controls exist; a unified CEL Security Core is not demonstrated. **PARTIAL / OPEN**.

### D3.10 — Agent Deployment Runtime
- Deploy, configure, activate, suspend, update and retire agents.
- Runtime adapters and execution environments.
- Human/agent principal identity and delegation enforcement.
- Agent tool/capability permissions and resource quotas.
- Task/job scheduling and durable state.
- Observability, logs, cost attribution and failure recovery.
- Agent-to-agent and human-to-agent orchestration with audit.
- Deployment tied to holon mandate and ownership.

**Status:** agent principal/delegation schemas exist; runtime deployment and orchestration are **NOT VERIFIED**.

### D3.11 — Workflows and Orchestration
- Workflow definitions, versioning and lifecycle.
- Triggers, conditions, tasks, approvals and human-in-the-loop.
- Durable execution, retries, timeouts, compensation and idempotency.
- Cross-department and cross-agent handoffs.
- Integration adapter invocation and event-driven execution.
- Workflow audit, SLA, cost and outcome metrics.

**Status:** not demonstrated as a complete integrated runtime. **NOT VERIFIED / OPEN**.

### D3.12 — Enterprise Creation Pipeline
- Opportunity intake and qualification.
- Design and enterprise blueprint.
- Blueprint validation and dependency resolution.
- Assembly/provisioning of organization, workspace, domains, departments, holons, capabilities, agents and adapters.
- Deployment and operational acceptance.
- Operations, optimization and replication.
- Versioned templates and reproducible enterprise instances.

**Status:** pipeline is the target process; end-to-end implementation is **NOT VERIFIED**.

### D3.13 — Control Tower
- Platform and tenant dashboards.
- Organization/workspace/domain/department/holon topology.
- Installation status and audit trail.
- Ownership/dependency/capability state.
- Adapter connection health and execution status.
- Agent deployments, workflows, compute/inference/memory usage.
- Orders, GMV, revenue, profit, ledger and payouts (keep these measures distinct).
- Security posture, alerts, incidents and operational actions.
- Role-aware views and control surfaces.

**Status:** integrated Control Tower is **NOT VERIFIED**.

### D3.14 — Observability, Tests and Launch
- Unit, integration, contract, RLS, security and E2E test suites.
- Real tenant journey tests.
- Load/performance and failure/recovery testing.
- Migration/deployment reproducibility.
- CI quality gates and release strategy.
- Monitoring, alerting and operational runbooks.
- Production backup/restore and incident drills.
- Deployment and rollback acceptance.
- Evidence-based launch readiness.

**Status:** selected SQL negative tests and cloud structural checks exist. Full test pyramid, real E2E and launch acceptance are **NOT VERIFIED**.

### Day 3 acceptance gate
Day 3 is accepted only when a real tenant can be provisioned from blueprint through domains, departments, holons, capabilities, agents and adapters; operate workflows; consume platform cores; view all activity in Control Tower; and replicate the enterprise with isolation, audit and rollback guarantees.

---

## 6. Verified repository / cloud snapshot at handoff

### Supabase connection and project
- Native Supabase connector account: **Aspace marketplace**.
- Project ID: `swegnrvaxxgfrnshdpxx`.
- Project name: `Aspace MarketPlace`.
- Region: `us-west-2`.
- Database engine: PostgreSQL 17.
- Current `get_project` response in this session: **ACTIVE_HEALTHY**.
- This is the existing Marketplace project. Do not create a replacement.

### Current cloud schema evidence
The live schema inspection confirmed application objects in:
- `identity`
- `enterprise`
- `catalog`
- `commerce`
- `integration`
- `areas`

Specific tables observed include:
- Identity: `profiles`, `organizations`, `organization_memberships`, `role_bindings`, `delegations`, `agent_principals`, `agent_delegations`.
- Enterprise: `workspaces`, `workspace_memberships`, `structure_installation_requests`, `structure_installation_events`, `installation_ownership_assignments`, `installation_dependencies`.
- Areas: `domain_blueprints`, `domain_installations`, `holon_blueprints`, `holon_installations`.
- Catalog: `capabilities`, `capability_versions`, `listings`, `capability_installations`.
- Commerce: `orders`, `order_events`.
- Integration: `adapter_family_blueprints`, `provider_adapter_blueprints`.

The exact live column inventory was queried from `information_schema.columns`; repeat a focused inventory if implementation requires a column-level contract. Do not infer unobserved tables from the target architecture.

### Tenant fixture state
Prior direct cloud queries and current schema inspection documented:
- `auth.users`: 0 rows.
- `enterprise.workspaces`: 0 rows.
- Current tenant, workspace and installation engine tables have no production tenant fixture rows.
- This is why authenticated end-to-end lifecycle tests are not yet demonstrated. Do not manufacture a fake tenant.

### Marketplace API deployment
Prior cloud verification recorded:
- Supabase Edge Function: `marketplace-api`.
- ACTIVE deployment version: **15**.
- JWT verification enabled.
- API version reported in source: **0.9.0**.
- API actions include:
  - `assign_installation_ownership`
  - `revoke_installation_ownership`
  - `add_installation_dependency`
  - `remove_installation_dependency`
  - `install_capability`
  - `remove_capability_installation`
  - `list_workspace_structure` includes ownership assignments, dependencies and capability installations.
- Workspace mutation requires OWNER/ADMIN.
- The API validates JWT identity and organization/workspace authority before service-role database operations.
- User email addresses were removed from workspace structure projections.
- Re-check the deployed function version and source before changing it.

### Enterprise Factory migrations and checks recorded in the preceding session
Migrations recorded as applied:
- `20261126042500_enterprise_ownership_dependency_capability_engines`
- `20261126042600_installation_engine_revocation_guards`
- `20261126042700_installation_engine_active_target_validation`
- `installation_request_ledger_append_only` (Git file: `20261126043100_installation_request_ledger_append_only.sql`)
- `installation_ledger_statement_level_guards` (Git file: `20261126043200_installation_ledger_statement_level_guards.sql`)

Recorded checks:
- RLS enabled on the three new engine tables.
- anon/authenticated have no direct SELECT on those engine tables; service_role has SELECT.
- Trigger functions are SECURITY DEFINER with browser-role execute revoked.
- Invalid/missing DOMAIN / DEPARTMENT / HOLON installation targets rejected.
- Dependency graph rejects cycles and cross-workspace edges.
- New assignments/dependencies/capability installs require active targets.
- Revocation/removal remains possible after principal/capability deactivation.
- Statement-level UPDATE and DELETE attempts against installation events and requests were rejected with SQLSTATE `55000`, including empty-predicate statements.
- Migration registry confirmed the recorded engine migrations.
- These are prior-session recorded tests; rerun the focused suite if the next implementation changes these areas.

### GitHub PR #63
- URL: https://github.com/Amdkn/Aspace_OS_V5/pull/63
- Title: tenant installation and Enterprise Factory engines.
- Head branch: `feat/marketplace-taxonomy-blueprints`.
- Base: `master`.
- State: OPEN, DRAFT, not merged.
- At the current repository read, PR #63 had 38 commits and 15 changed files.
- Keep this PR open/draft until integration and acceptance evidence are complete.

### Historical PR provenance (do not treat as fresh acceptance)
- PR #57: initial Day 1 identity foundation milestone.
- PR #58: Marketplace core/catalog/commerce/delegation milestone.
- PR #63: taxonomy, provider blueprints and Enterprise Factory installation work.
- Prior handoff records five catalog migrations, eight Areas OS, eight Business departments, 20 adapter families, 73 provider blueprints, and 17 LD01 holons (1 B1, 8 B2, 8 B3). Treat those as historical repository/PR evidence until reconciled against current cloud rows and source.
- A separate `Amdkn/Business-Marketplace` PR #1 was previously described as a frontend prototype with backend awaiting integration. Do not treat it as canonical backend or source of truth without inspecting it.

---

## 7. Immediate continuation sequence for the next session

### Step 1 — Preserve and verify this baseline
- Read this handoff first.
- Inspect PR #63 head and branch status.
- Confirm current Supabase project is still ACTIVE_HEALTHY using the native `Aspace marketplace` connection.
- Read migration registry and compare with files in the working branch.
- Inspect current `marketplace-api` source and active deployed version.
- Do not repeat broad historical audits; use targeted checks for gaps that block implementation.

### Step 2 — Day 1 recovery/closure matrix
Create a code-backed evidence matrix for D1.01–D1.09:
- requirement;
- repository artifact(s);
- cloud object(s);
- automated test/proof;
- missing acceptance evidence;
- status.
Then close the real gaps, especially:
- migration/repository reconciliation;
- full RLS/grant/function-execute inventory;
- identity and tenant lifecycle with a real authorized user;
- backup/restore and observability evidence;
- API contract and authorization tests.
Do not call Day 1 accepted until every acceptance gate passes.

### Step 3 — Day 2 integration engine
Inspect the existing `integration` schema and API before proposing DDL. The current confirmed blueprint tables are not enough for executable integrations. Design the complete runtime around:
- versioned adapter manifests and operation contracts;
- tenant-scoped connections and secret references;
- OAuth/API-key/service-account lifecycle;
- execution jobs, retries, idempotency and invocation audit;
- webhooks, signatures, replay protection and receipts;
- connection health and credential rotation;
- catalog entitlement checks for capability installation.
Choose initial real providers only where official API documentation, scopes and endpoints can be verified. Do not invent provider capabilities or mark all 73 as live.

### Step 4 — Day 2 commerce and entitlement integration
- Reconcile listings, orders, events, payment, ledger and payout schema.
- Define the order state machine and entitlement grant/revoke contract.
- Link cross-organization capability installation to an authorized entitlement/order.
- Add webhook/payment reconciliation only against documented provider contracts.
- Test duplicate requests, replay, cancellation, refund and failure recovery.

### Step 5 — Day 3 Enterprise Factory integration
- Complete tenant provisioning and installation pipeline.
- Integrate eight LDs, eight departments and B1/B2/B3 holons.
- Connect ownership/dependency/capability engines to provisioning.
- Implement agent deployment runtime and workflow orchestration.
- Implement Compute, Inference, Memory and CEL Security integration.
- Build Control Tower from actual persisted lifecycle/events/metrics.
- Add rollback/compensation and replication.

### Step 6 — Real end-to-end acceptance
With a real authorized test user and tenant:
`Auth → Organization → Membership → Workspace → Workspace Membership → Domains/Departments → Holons → Ownership/Dependencies → Capability Entitlement/Installation → Adapter Connection → Agent Deployment → Workflow Execution → Order/Commerce → Control Tower → Replication`.

Every stage must have a success test and an authorization-denial test. Capture correlation IDs and persisted event evidence. Only then mark the relevant Day accepted.

---

## 8. Non-negotiable rules for status reporting

- **A migration applied ≠ Day complete.**
- **A deployed Edge Function ≠ API acceptance.**
- **A catalog blueprint ≠ executable provider adapter.**
- **A frontend screen ≠ backend workflow.**
- **A PR merged ≠ production operation.**
- **A Preview READY ≠ system functional.**
- **A zero-row tenant schema ≠ tenant lifecycle validated.**
- Report implementation, cloud deployment, structural verification, authenticated E2E and production acceptance separately.
- Keep all three Days' full scope intact. The work is complete only when the integrated enterprise lifecycle functions.

## 9. First task statement for the next session

**Continue A’Space Marketplace implementation from this handoff in `Amdkn/Aspace_OS_V5`. Use the native Supabase connection `Aspace marketplace` and existing project `swegnrvaxxgfrnshdpxx` only. Start with targeted Day 1 closure evidence, then continue the full Day 2 Integration Engine and commerce/entitlement work, then Day 3 Enterprise Factory. Reuse the existing PR #63 branch and artifacts; do not create a parallel architecture, reduce scope, use Composio for Supabase, invent test tenants, or claim completion without integrated evidence. Produce code, migrations, tests and durable GitHub commits—not another presentation.**


---

## 10. Session continuation — cloud reconciliation evidence (2026-11-26 04:44 UTC)

This section records a fresh read-only audit performed after the original handoff commit. It supersedes any earlier assumptions where the live cloud evidence below differs.

### 10.1 Live project and migration registry

- Supabase project `swegnrvaxxgfrnshdpxx` remains `ACTIVE_HEALTHY`, PostgreSQL 17.12, region `us-west-2`.
- Cloud migration registry contains **18 entries**.
- One registry entry is named `coach_schema_adoption_20261124` (version `20261124024550`). Its migration file was not found at the expected path `supabase/migrations/20261124024550_coach_schema_adoption_20261124.sql` in the working branch or repository default path during this audit. **Do not reapply it or recreate its effects blindly.** Locate its canonical source / original commit and reconcile its SQL against the cloud schema before calling migration history fully aligned.
- The remaining migration registry entries include the identity/tenant foundation, marketplace catalog/commerce/order API, taxonomy/provider/holon blueprints, tenant structure installations, workspace membership integrity, and the installation ownership/dependency/capability and append-only guard migrations.

### 10.2 Identity and tenant state

Live row counts at audit time:

| Resource | Rows |
|---|---:|
| `auth.users` | 0 |
| `identity.organizations` | 0 |
| `identity.organization_memberships` | 0 |
| `enterprise.workspaces` | 0 |
| `enterprise.workspace_memberships` | 0 |

No non-internal trigger was found on the `auth` schema tables during the inspection. This is not, by itself, proof of an auth defect; inspect the actual signup/profile requirements before adding a trigger. The critical acceptance blocker remains the absence of an authorized real test identity and tenant. Do not seed a fabricated production identity.

### 10.3 RLS, schema exposure and function ACLs

- All **29 inspected application tables** in `identity`, `enterprise`, `catalog`, `commerce`, `integration`, `areas` and `content` have RLS enabled.
- The advisor reports 22 `rls_enabled_no_policy` INFO findings. The SQL inventory confirms that the affected tables in the private application schemas have no direct `anon` or `authenticated` table grants; `enterprise`, `catalog`, `commerce`, `integration`, `areas` and `api` have no browser-role schema USAGE. Access is intended to flow through the Edge Function's service-role transaction boundary.
- `identity` exposes schema USAGE to `authenticated`, but direct table grants are limited to SELECT on organizations, organization memberships, delegations and role bindings, each with scoped RLS policies; profile access is separately limited to self.
- `content` has its own policies and grants and must be audited separately from the Marketplace tenant core.
- Inspected SECURITY DEFINER functions in `enterprise`, `catalog` and `api` have hardened `search_path` settings where applicable and execution ACLs limited to `postgres` / `service_role`; no PUBLIC, anon or authenticated execution grant was observed.
- Preserve this private-schema/server-gateway model. Do not add blanket RLS policies simply to silence the advisor. Reassess policy needs if a schema is ever exposed directly through PostgREST.

### 10.4 Runtime parity and CI

- Supabase Vault extension is installed at version `0.3.2`; `vault.secrets` and `vault.decrypted_secrets` are present. No provider credentials or tenant connections were created by this audit.
- Edge Function `marketplace-api` is ACTIVE at version **15**, with `verify_jwt=true`.
- The deployed Edge Function `index.ts` content was compared byte-for-byte with `supabase/functions/marketplace-api/index.ts` on `feat/marketplace-taxonomy-blueprints`: **exact match (50,898 characters)**.
- The handoff commit `7b251ed12951c4adf447f62ad2e8f6aeb5a45d74` has three associated completed GitHub Actions runs, all with conclusion `success`: CI matrix run 604, Security Triage run 622, Gate & Security run 682. No PR review submissions or inline review threads were returned by the review audit.

### 10.5 Marketplace integration maturity

- `integration.adapter_family_blueprints`: **20** rows, all `PLANNED`.
- `integration.provider_adapter_blueprints`: **73** rows, all `PLANNED`.
- Provider auth contracts are not specified, supported operations are empty, and no tenant connections or credentials are present. These rows remain design blueprints, not integrations.
- Supabase Vault is available as the secret-storage primitive. Future adapter work must persist secret references only; never put raw credentials in provider manifests, tenant rows, logs, API responses or Git.

### 10.6 Performance advisor findings

- The current performance advisor reports **44 unindexed foreign-key findings** and **41 unused-index findings**.
- The database is effectively empty, so unused indexes are expected at this stage and are not evidence that the indexes should be dropped.
- Do not generate 44 indexes blindly: reconcile the advisor findings against existing composite/partial indexes and query patterns, then add only the justified supporting indexes in a reviewed migration before meaningful tenant scale.

### 10.7 Updated Day 1 gate

Day 1 remains **OPEN / NOT ACCEPTED**. The structural security posture is substantially evidenced, but acceptance still requires:
1. locating and reconciling the cloud-only Coach schema migration;
2. confirming the auth/signup/session/recovery lifecycle and its intended profile behavior;
3. using an authorized real test identity to create an organization and workspace;
4. proving organization/workspace membership, role enforcement and cross-tenant denial paths;
5. collecting backup/PITR configuration and a documented restore drill (not verified through the current connector audit);
6. validating telemetry, alerting and incident response beyond the existence of logs.

### 10.8 Next execution order

1. Resolve the cloud-only migration source and reconcile the full migration registry to Git.
2. Complete the Day 1 auth/tenant lifecycle tests as soon as an authorized real test identity is available; keep the E2E gate explicitly BLOCKED until then.
3. Continue Day 2 by implementing the versioned adapter manifest, tenant connection lifecycle, managed secret references, executable operation registry, job/attempt ledger, idempotency, retry policy, health checks and webhook verification. The 20/73 blueprint records must not be upgraded to AVAILABLE without provider-specific implementation and tests.
4. Complete Day 2 commercial entitlements, payment/ledger/payout/reconciliation and discovery/publication lifecycle.
5. Complete Day 3 tenant installation, Areas OS/departments/holarchy provisioning, agent runtime, workflows, four platform cores and Control Tower operations.
6. Keep PR #63 in Draft until all acceptance gates are met.



### 10.9 Security baseline regression test committed

- Added `supabase/tests/marketplace_security_baseline.sql` (commit `8e7141667fb5874df24434a58434881f404d721b`).
- The read-only DO-block asserts: RLS enabled across the inspected application schemas; private schemas have no browser-role USAGE; private tables have no anon/authenticated grants; SECURITY DEFINER functions have a configured search_path and no browser-role EXECUTE; and the four identity read-policy boundaries remain present.
- Executed the same SQL against the live cloud project through the native Supabase connection. It completed without an assertion exception and made no persistent changes.
- This is a structural security regression test, not an authenticated tenant-isolation E2E test. It does not close the real-user/tenant blocker in D1.03–D1.04.



### 10.10 Day 2 — adapter execution data foundation deployed

Three additional cloud migrations were applied to the existing Marketplace project and their source files committed to this branch:

| Cloud version | Migration | Repository file |
|---|---|---|
| `20261126044855` | `adapter_execution_engine_foundation` | `supabase/migrations/20261126044855_adapter_execution_engine_foundation.sql` |
| `20261126044914` | `adapter_execution_claim_result_shape_fix` | `supabase/migrations/20261126044914_adapter_execution_claim_result_shape_fix.sql` |
| `20261126044938` | `adapter_execution_integrity_guards` | `supabase/migrations/20261126044938_adapter_execution_integrity_guards.sql` |

New `integration` tables:
- `provider_adapter_manifests`: provider/version-specific manifest, endpoint host allowlist, auth method, safe auth configuration, scopes, operations and lifecycle.
- `tenant_connections`: organization/workspace-scoped connection, status, granted scopes and Vault secret UUID reference only.
- `adapter_oauth_transactions`: short-lived OAuth transaction ledger storing a SHA-256 state digest and Vault references, never raw state/code/token.
- `adapter_execution_jobs`: idempotent durable job queue, bounded attempts, schedule, worker lease, correlation ID and sanitized result/error fields.
- `adapter_execution_events`: append-only execution audit events.
- `adapter_webhook_receipts`: webhook deduplication by provider event ID and payload hash, with signature-verification state.

Security and integrity:
- RLS is enabled on all six new tables.
- No `anon` or `authenticated` schema/table grants were added; the integration schema remains service-role-only.
- `api.claim_adapter_execution_jobs(text, integer)` and `api.finish_adapter_execution_job(uuid,text,text,jsonb,text,text,integer)` are SECURITY DEFINER with fixed search_path and execute grants restricted to `service_role`.
- Claiming uses `FOR UPDATE SKIP LOCKED`, bounded worker leases, bounded attempt count and expired-lease recovery.
- Execution events reject UPDATE, DELETE and TRUNCATE.
- Manifest auth configuration rejects common raw-secret keys; secret material is not stored in provider manifests or tenant connection rows.
- The first claim-function implementation exposed a 26-vs-25 return-shape defect during the empty-queue test; the follow-up migration corrected the return shape before any jobs or connections existed.
- A further integrity migration corrected semantic-version validation, guarded NULL outcomes and added statement-level TRUNCATE protection.

Verification performed after the migrations:
- All six tables exist; all six have RLS enabled.
- Browser-role table grants across the six new tables: **0**.
- Both worker functions have ACLs limited to `postgres` and `service_role`.
- Empty queue claim returned zero jobs without error.
- Negative assertions for NULL execution outcome and event-ledger TRUNCATE were caught as expected.
- The read-only security baseline DO-block was rerun after the migration set and completed without assertion exceptions.

**Scope status: PARTIAL — database and queue foundation only.** No provider manifest has been activated, no tenant connection or credential exists, and no adapter worker / HTTP execution endpoint / OAuth callback / health-check runtime has yet been deployed. Do not label any provider executable. Next implementation slice is the authenticated connection-management API plus a private worker that reads Vault secrets only in memory, enforces manifest host/operation allowlists, executes provider calls, sanitizes outputs, records attempts and verifies webhook signatures/replay protection.



### 10.11 Reconciliation correction — Coach adoption source restored; adapter migrations included

- The earlier 10.1 note that the Coach adoption file was not found is now superseded. The repository now contains `supabase/migrations/20261124024550_coach_schema_adoption_20261124.sql` (commit `42733a34371e83c031fdb0326164675d8ed0300b`).
- Important provenance qualification: the original migration body was not recoverable from the repository branch or connector migration registry. The committed file is explicitly labelled **RECONSTRUCTED CANONICAL SOURCE**, based on the live Marketplace catalog: table columns, keys, foreign keys, RLS policies, grants, indexes and comments. It is not represented as the original byte-identical SQL.
- Reconstructed scope is limited to `identity.profiles`, `content.cms_collections`, and `content.cms_items`; no records were transferred. The source project was not modified, resumed or re-applied during this session. A live status check of the legacy Coach project returned a connector permission error; its current state must not be inferred from that failed read.
- Do not apply the reconstructed historical migration to the already-migrated Marketplace cloud. Its version `20261124024550` already exists in the cloud migration registry.

The live Marketplace cloud migration registry now contains **21 entries**, including the three adapter execution migrations at versions `20261126044855`, `20261126044914` and `20261126044938`.

The committed `supabase/tests/marketplace_security_baseline.sql` was expanded (commit `3c4c9b2ce5c7abfc7000029fa0516e8f6a995012`) to cover:
- identity profile self-read/self-insert/self-update policies;
- tenant-scoped Coach CMS collection/item policies;
- presence of all six adapter foundation tables;
- adapter event-ledger TRUNCATE guard;
- provider-manifest raw-secret-key guard.

The expanded test file was fetched from the branch and executed against the live Marketplace database after all three adapter migrations. It completed without assertion exceptions and made no persistent changes.

The security advisor now reports **28** `rls_enabled_no_policy` INFO findings. This count increased because the six new integration tables are also RLS-enabled and intentionally have no browser-role policies or grants. The test suite verifies the private-schema boundary; do not add blanket policies to reduce the INFO count.



### 10.12 Day 2 — authenticated adapter connection API deployed

- Added `supabase/functions/adapter-api/index.ts` and deployed Edge Function `adapter-api` to the existing Marketplace project.
- Cloud status: **ACTIVE**, version **1**, `verify_jwt=true`.
- Deployed source was fetched from Supabase and compared byte-for-byte with the GitHub branch source: **exact match, 14,595 characters**.
- Added contract documentation: `docs/api/adapter-api.md`.
- Actions implemented:
  - `list_manifests` — active manifests and operation keys only.
  - `list_connections` — workspace-member scoped listing; secret IDs/values omitted.
  - `create_connection` — OWNER/ADMIN only; requires an ACTIVE manifest; creates PENDING_AUTH.
  - `revoke_connection` — OWNER/ADMIN only; revokes and cancels queued/retry-wait jobs with append-only events.
  - `enqueue_execution` — OWNER/ADMIN/MEMBER; requires CONNECTED connection, ACTIVE manifest and declared operation; idempotent key per connection; request payload capped at 64 KB.
  - `list_executions` — workspace-member scoped job summaries.
- Every action authenticates the Supabase Auth access token and re-checks workspace membership/role server-side before using service_role. No user metadata role claims are trusted.
- No raw credentials are accepted by `create_connection`; new connections remain `PENDING_AUTH`. No API action can mark a connection CONNECTED without a future verified credential/health lifecycle.
- No provider manifest is ACTIVE, no connection exists, and no adapter worker is deployed. The execution queue is therefore not yet operational end-to-end.

**Scope status: PARTIAL — authenticated connection/queue control plane deployed; provider credential lifecycle and execution worker remain OPEN.**



### 10.13 Day 2 — private adapter worker and Vault credential lifecycle deployed

The adapter engine now includes the private execution worker and a credential lifecycle for non-OAuth provider types.

**Edge Functions**
- `adapter-api`: ACTIVE version **4**, `verify_jwt=true`.
- `adapter-worker`: ACTIVE version **3**, `verify_jwt=false` at the gateway, with a mandatory constant-time comparison of the Authorization bearer against the server-only `SUPABASE_SERVICE_ROLE_KEY` inside the function. The API dispatches the worker internally; the service key is never returned to clients.
- Both deployed `index.ts` files were fetched and compared byte-for-byte with the current GitHub branch source: exact matches (API 25,876 characters; worker 15,000 characters).

**Credential lifecycle**
- `create_connection` supports `NONE`, `BEARER`, `API_KEY_HEADER` and `BASIC` auth manifests.
- Credentials are written through `vault.create_secret`; only the returned UUID reference is stored on `integration.tenant_connections`. The API never returns the reference or secret.
- `rotate_connection_credentials` uses `vault.update_secret`, resets the connection to `PENDING_AUTH`, and requires a new health check.
- `revoke_connection` detaches the Vault reference and deletes the Vault secret when no other connection/OAuth transaction references it; queued/retry-wait jobs are cancelled with append-only events.
- `test_connection` queues the manifest-declared `health_check`; only a successful provider response promotes the connection to `CONNECTED`.
- OAuth2 authorization-code and client-credentials flows remain unsupported until callback/state/PKCE lifecycle endpoints are implemented.

**Worker execution controls**
- Claims jobs using the service-role-only `api.claim_adapter_execution_jobs` function and completes them through `api.finish_adapter_execution_job`.
- Supports manifest-declared HTTPS operations with strict host allowlists, fixed method/path contracts, no redirects, bounded timeouts, bounded response reads, bounded retry delays and database attempt limits.
- Supports NONE, BEARER, API_KEY_HEADER and BASIC auth. OAuth auth methods are rejected.
- Sensitive static headers are rejected; request payloads reject credential-like field names and are limited to 64 KB.
- Provider JSON results are recursively redacted for sensitive keys and known secret values. Non-JSON response bodies are not persisted.
- Webhook receipt table is present, but signed webhook ingress, replay checks and provider-specific verification remain open.

**Vault smoke evidence**
- Confirmed `service_role` has the required Vault access.
- A transaction-scoped create → update → decrypt/read → delete smoke test completed without error and was rolled back.
- A follow-up query confirmed **0** lingering smoke-test secrets.
- No real provider credentials, manifests, tenant connections or production jobs were created during this work.

**Current maturity: PARTIAL, but the runtime path is now implemented.** The API, Vault lifecycle, queue, worker and provider request executor are deployed. The system is not yet live against a provider because no provider-specific manifest has been activated and no authorized tenant connection exists. Do not mark any of the 73 provider blueprints AVAILABLE or claim provider E2E acceptance until a real provider account, manifest test and full health-check/operation round trip are completed.



### 10.14 Adapter runtime hardening — latest deployed revisions

The previous 10.13 deployment snapshot is superseded by these current revisions:

- `adapter-api`: ACTIVE **v4**, JWT required. Current source blob: `d8968b5903d3f1f66313c8292b1ef48d8f5b333d` (25,876 characters).
- `adapter-worker`: ACTIVE **v4**, gateway JWT disabled but the function enforces an exact service-role bearer check with constant-time comparison. Current source blob: `1868f7dd691a6b80aaf4915a0bb6efe02dd4ecf7` (15,383 characters).
- Both deployed sources were fetched again and compared byte-for-byte with the branch: exact matches.

Additional implementation:
- Credential provisioning writes only the selected BEARER/API_KEY_HEADER/BASIC credential fields into Vault; the tenant row stores the Vault UUID reference.
- Credential rotation updates the existing Vault secret and resets the connection to `PENDING_AUTH`.
- Revocation detaches the reference and deletes the Vault secret when no other tenant connection/OAuth transaction references it.
- `test_connection` queues a `health_check`; only a successful 2xx response promotes the connection to `CONNECTED`.
- Adapter execution payloads reject credential-like keys and are capped at 64 KB.
- Worker rejects sensitive static headers, encoded path traversal, redirects and non-HTTPS/unauthorized hosts; supports UTF-8 BASIC auth, known-secret value redaction, bounded response reads and up to 50 jobs per dispatch.
- API dispatches the worker after health-check or execution jobs are enqueued.

Vault lifecycle smoke test: create → update → decrypt/read → delete completed inside a transaction followed by ROLLBACK; a separate count query confirmed **0** residual smoke-test secrets.

No provider manifest, connection, credential or production execution job was created. Therefore the worker's actual provider HTTP round trip remains **NOT VERIFIED** until a provider manifest and authorized tenant account exist.



### 10.15 CI and PR evidence after adapter runtime work

The GitHub Actions runs associated with the adapter API code commit `21106f8b9a2ce8cdfed02b923034a227512f7755`, worker hardening commit `3461d4d5515cca47a1040ffce2ebe1efe582bb3b`, and latest handoff commit `d037e190ef7fd052a4499b75a95614ec29aeb47a` were checked. All returned `completed / success`:

| Commit scope | CI matrix | Gate & Security | Security Triage |
|---|---:|---:|---:|
| Adapter API | #626 | #704 | #644 |
| Adapter worker | #630 | #708 | #648 |
| Handoff/docs | #631 | #709 | #649 |

PR #63 currently reports **24 changed files** on `feat/marketplace-taxonomy-blueprints`. No merge was performed in this session. Preserve the PR's Draft / unmerged posture until all Day 1, Day 2 and Day 3 acceptance gates are satisfied.



### 10.16 Latest handoff commit CI state

For current handoff commit `0ef8637d58143020a4e9db8b704609e5a81603fe`:
- Gate & Security run **#711**: completed / success.
- Security Triage run **#651**: completed / success.
- Continuous Integration Matrix run **#633**: still **in_progress** at the last poll. Do not report the complete latest commit CI matrix as green until this run concludes.



---

## 12. Continuation audit — live reconciliation at 2026-11-26 05:08 UTC

This addendum supersedes earlier snapshot counts where they differ. It records a fresh read of the linked production project and the current PR branch; it does not imply that any Day is accepted.

### 12.1 Repository / PR
- Canonical repository: `Amdkn/Business-Marketplace`. V5 PR #63 is the historical source branch for the backend implementation.
- Working branch: `feat/marketplace-taxonomy-blueprints`.
- PR #63 remains OPEN, DRAFT, not merged, mergeable.
- Current PR snapshot: 68 commits, 24 changed files.
- Preserve Draft state until integrated acceptance gates pass.

### 12.2 Supabase project and migration history
- Project `swegnrvaxxgfrnshdpxx` remains `ACTIVE_HEALTHY`.
- PostgreSQL 17.12.0.000.
- Fresh cloud migration history contains **21 entries**, not 18. The latest three entries are:
  - `20261126044855_adapter_execution_engine_foundation`
  - `20261126044914_adapter_execution_claim_result_shape_fix`
  - `20261126044938_adapter_execution_integrity_guards`
- The cloud history includes `coach_schema_adoption_20261124` as its fourth entry. The PR contains the reconstructed source at `supabase/migrations/20261124024550_coach_schema_adoption_20261124.sql`; do not replay this migration against the live project.

### 12.3 Live Edge Function inventory
| Function | Active version | Gateway JWT |
|---|---:|---|
| `marketplace-api` | 15 | enabled |
| `adapter-api` | 4 | enabled |
| `adapter-worker` | 4 | disabled; function body enforces exact service-role bearer |

The deployed `adapter-api` and `adapter-worker` source files are retrievable from Supabase. Repository copies exist at `supabase/functions/adapter-api/index.ts` and `supabase/functions/adapter-worker/index.ts`.

### 12.4 Fresh schema / access-control inventory
A fresh read found 33 tables across the six application schemas:
- `areas`: 4/4 RLS enabled
- `catalog`: 4/4 RLS enabled
- `commerce`: 2/2 RLS enabled
- `enterprise`: 8/8 RLS enabled
- `identity`: 7/7 RLS enabled
- `integration`: 8/8 RLS enabled

Schema usage and direct table SELECT:
- `areas`, `catalog`, `commerce`, `enterprise`, `integration`: no schema USAGE for `anon` or `authenticated`; no direct SELECT for either browser role.
- `identity`: no schema USAGE for `anon`; `authenticated` has schema USAGE and one direct SELECT table grant. The exact granted table and its row policy must be explicitly reconciled before calling the identity boundary fully accepted.
- RLS policies currently exist on five identity tables; the remaining private tables intentionally have no direct browser policies/grants. The adapter/marketplace APIs use server-side service-role transactions and perform explicit authorization.

### 12.5 Supabase advisor snapshot
- Security advisor: 28 INFO findings named `rls_enabled_no_policy`. These are not automatically vulnerabilities because the affected application schemas are private to browser roles; retain the no-browser-access architecture and verify every server API path.
- Performance advisor: 58 INFO findings for unindexed foreign keys and 48 INFO findings for unused indexes. Do not mass-create or drop indexes. Reconcile actual FK column order against existing indexes and query patterns; the unused-index findings are expected to be noisy while the database is nearly empty.
- Earlier handoff references to 22 RLS findings / 44 FK findings are stale and must not be repeated as current counts.

### 12.6 OAuth / PKCE correction — data foundation exists; lifecycle does not
The adapter execution migration already created `integration.adapter_oauth_transactions` with:
- tenant/workspace/provider/manifest binding;
- initiating Auth user;
- SHA-256 state digest;
- optional Vault reference for PKCE verifier;
- HTTPS redirect URI;
- PENDING/COMPLETED/FAILED/EXPIRED/REVOKED state;
- ten-minute expiry and one-time consumption timestamp.

However, fresh source inspection confirms:
- `adapter-api` rejects OAuth credential provisioning and has no start-authorization or callback-completion action.
- `adapter-worker` explicitly rejects OAuth execution with `OAUTH_FLOW_NOT_IMPLEMENTED`.
- There is no deployed OAuth callback function.
- Therefore OAuth2 Authorization Code + PKCE is **SCHEMA-READY / RUNTIME-NOT-IMPLEMENTED**, not an absent schema and not an operational feature.
- `OAUTH2_CLIENT_CREDENTIALS` is also declared in the schema enum but not implemented. Do not treat it as supported.

### 12.7 Next implementation order
1. Resolve the exact authenticated SELECT grant in `identity` and verify it is constrained by the intended user-scoped policy.
2. Design and implement OAuth Authorization Code + PKCE as a separate public callback boundary, with:
   - authenticated, workspace OWNER/ADMIN initiation;
   - provider/manifest allowlisted authorization and token endpoints;
   - cryptographically random state and PKCE S256;
   - state digest only in the transaction row, verifier held in Vault;
   - strict redirect URI matching and one-time transaction consumption;
   - authorization-code exchange server-side;
   - access/refresh token storage only in Vault;
   - no tokens in URLs, logs, responses or Git;
   - provider token refresh and revocation lifecycle;
   - worker support only for manifests whose OAuth configuration has passed validation.
3. Implement Google Drive as the first provider only after the generic OAuth lifecycle is tested. Require configured Google OAuth client credentials and an authorized Google account; do not fabricate a provider connection.
4. Add integration tests for state mismatch, expired/replayed state, wrong workspace role, callback provider mismatch, invalid redirect URI, token endpoint failure, refresh rotation and secret redaction.
5. Re-run Supabase security/performance advisors after schema/runtime changes and update this handoff with evidence.

**Acceptance boundary:** the OAuth schema and adapter worker/API are present, but no OAuth provider is connected. Day 2 remains PARTIAL. Day 1 remains OPEN until a real authorized Auth identity can complete tenant and workspace lifecycle tests.


---

## 10.17 Continuation audit — OAuth / Google Drive readiness (2026-11-26 05:06 UTC)

This section supersedes older counts where the live project has since advanced. It is a fresh read of Supabase project `swegnrvaxxgfrnshdpxx` and GitHub branch `feat/marketplace-taxonomy-blueprints`.

### Live project and migration ledger

- Project status: `ACTIVE_HEALTHY`; PostgreSQL `17.12.0.000` (engine 17), region `us-west-2`.
- Migration ledger: **21 applied migrations**, latest three adapter-execution migrations:
  - `20261126044855_adapter_execution_engine_foundation`
  - `20261126044914_adapter_execution_claim_result_shape_fix`
  - `20261126044938_adapter_execution_integrity_guards`
- Live table inventory: 35 application tables returned by the inspected schemas; all returned tables have RLS enabled. The independent catalog query also found 35 RLS-enabled ordinary tables across the selected application schemas, including adopted Coach content objects.
- Current live counts:
  - `auth.users`: 0
  - `identity.organizations`: 0
  - `enterprise.workspaces`: 0
  - organization memberships: 0
  - workspace memberships: 0
  - active provider manifests: 0
  - tenant connections: 0
  - OAuth transactions: 0
  - execution jobs: 0
  - webhook receipts: 0

### Fresh Edge Function inventory

| Function | Version | Gateway JWT | Handler-level control |
|---|---:|---|---|
| `marketplace-api` | 15 | required | User JWT + workspace authorization |
| `adapter-api` | 4 | required | User JWT via Auth `getUser` + OWNER/ADMIN checks |
| `adapter-worker` | 4 | disabled | Exact service-role bearer secret, constant-time comparison |

The worker's `verify_jwt=false` is intentional for internal dispatch; its handler rejects requests unless the Authorization bearer equals the configured service-role key. Do not remove this check or expose the key. The deployed API and worker source files were fetched; their deployed SHA-256 fingerprints and repository source blobs match the branch's previously verified versions.

### OAuth implementation gap confirmed from deployed source

- `adapter-api` currently supports `list_manifests`, `list_connections`, `create_connection`, `test_connection`, `revoke_connection`, `rotate_connection_credentials`, `enqueue_execution`, and `list_executions`.
- `create_connection` supports NONE, BEARER, API_KEY_HEADER and BASIC only. OAuth creation is explicitly rejected pending the callback lifecycle.
- There is no `start_oauth` action and no public callback function.
- `adapter-worker` rejects OAuth in `buildHeaders` with `OAUTH_FLOW_NOT_IMPLEMENTED`. Token refresh is not implemented.
- Existing `integration.adapter_oauth_transactions` already stores only a unique SHA-256 state digest, Vault PKCE-secret reference, exact HTTPS redirect URI, expiry and transaction status. Its status constraint currently has no `EXCHANGING` state.
- Existing `integration.provider_adapter_manifests` forbids credential values in `auth_config`; this is correct and must remain. There is no provider OAuth client registry yet.

### Provider identity confirmed

Live registry row:
- provider key: `files-knowledge-google-drive`
- family: `files-knowledge`
- provider name: Google Drive
- blueprint version: `0.1.0`
- implementation: `PLANNED`
- auth contract: `UNSPECIFIED`

No Google Drive manifest, OAuth client, authorized tenant, credential or connection exists. Therefore Google Drive is not yet executable.

### Advisor snapshot and interpretation

- Security advisor: 28 `rls_enabled_no_policy` findings, all `INFO`. These correspond to private service-role-only schemas; no public browser access is intended for those tables. Identity profile and adopted CMS tables are a deliberate separate RLS-scoped access surface.
- Performance advisor: 58 unindexed foreign-key notices and 48 unused-index notices, all `INFO`. Do not bulk-create/drop indexes. The database has no tenant or workload rows yet, so unused-index observations are not sufficient evidence for deletion. Review FK coverage against expected joins, write cost and query plans before adding indexes.
- Health advisor: no findings.
- A live grant check found browser access only on the deliberately scoped identity profile and adopted CMS surfaces; it did not reveal grants on the private Marketplace data schemas. Preserve the regression test that distinguishes these surfaces.

### OAuth / Google Drive contract committed

New repository document:
`docs/integrations/google-drive-oauth-adapter-contract.md`

It specifies:
- OAuth Authorization Code + PKCE S256; 256-bit state; SHA-256-only state storage; Vault-only verifier and client secret.
- A private `integration.provider_oauth_clients` registry for non-secret endpoint/client metadata plus a Vault secret reference.
- Authenticated OWNER/ADMIN start action and unauthenticated-but-state-validated callback boundary.
- Atomic one-use state claim, exact redirect URI validation, bounded token exchange, secret redaction and refresh-token rotation.
- Google Drive manifest identity and initial operation set, plus a safe dynamic-path requirement.
- Separate scope profiles: restricted `drive.file`, read-only `drive.readonly`, and elevated full `drive`; never silently escalate.
- Unit, database, API, callback, worker and real-provider E2E acceptance gates.

**Status remains DESIGN LOCKED / IMPLEMENTATION NOT DEPLOYED.** No OAuth schema or Edge Function was changed in this continuation. The contract intentionally does not fabricate a Google OAuth client ID/secret or mark a provider as ready.

### Immediate execution sequence

1. Implement and migrate `provider_oauth_clients`; extend the OAuth transaction lifecycle with an atomic in-progress state and expiry/replay guards.
2. Extend `adapter-api` with OAuth connection initiation, keeping platform OAuth client provisioning separate from workspace OWNER/ADMIN permissions.
3. Add a dedicated callback Edge Function with gateway JWT disabled but strict one-use state + PKCE + redirect validation.
4. Extend the worker for OAuth bearer tokens, refresh and token rotation before activating any OAuth manifest.
5. Add the Google Drive v1.0.0 manifest, dynamic file-ID path binding, pagination, metadata operations and separate media/resumable transfer protocols.
6. Configure the actual Google Cloud OAuth Web client and exact callback URI in the owner's Google Cloud project; store the client secret in Vault, never Git or chat.
7. Obtain an authorized Auth user and tenant/workspace OWNER membership, then run the full Google consent → Drive API → refresh → revoke E2E.
8. Keep Day 1 OPEN and PR #63 Draft until the real identity/tenant and all Day 1–3 gates pass.


### 10.18 Repository and CI checkpoint after OAuth contract commit

- Branch head: `dad594135125fe203cbd7bc8bd00602966dc85e4`.
- New Google Drive contract commit: `e17470e5a3baecfec966090a6972d237948c89f4`.
- Latest handoff/audit commit: `dad594135125fe203cbd7bc8bd00602966dc85e4`.
- PR #63: OPEN, Draft, unmerged; 25 changed files, 71 commits; head matches the branch head above.
- Latest commit has 7 GitHub Actions check runs. At the last poll, the checks were still `in_progress`; the commit status endpoint reported `pending` with no legacy statuses. Do not report this commit's CI as green until all seven check runs complete successfully.
- No production Supabase schema or Edge Function was changed during this OAuth-readiness continuation.


### 12.8 Identity schema grant reconciliation — resolved
A follow-up catalog query identified the one direct browser SELECT grant:
- `authenticated` has schema USAGE on `identity`.
- The only identity table with direct `authenticated` SELECT is `identity.profiles`.
- `identity.profiles` has `profiles_read_self` for SELECT, plus self-scoped INSERT and UPDATE policies.
- `anon` has no schema USAGE and no SELECT grants in the six application schemas.
- The remaining identity tables have no direct SELECT grants to `anon` or `authenticated`; their RLS policies do not create access without table grants.
- `areas`, `catalog`, `commerce`, `enterprise` and `integration` remain inaccessible directly to browser roles at schema level.

This closes the ambiguity recorded in §12.4. It is a **STRUCTURAL ACCESS-CONTROL CHECK**, not a substitute for authenticated cross-tenant E2E testing.


### 12.9 Security baseline execution — PASS
- Fetched `supabase/tests/marketplace_security_baseline.sql` from the working branch (blob SHA `76a1cf637f559103562de5799b2b0df7866aafdc`).
- Executed the complete read-only DO-block test against project `swegnrvaxxgfrnshdpxx` using the native Supabase connection.
- Result: **PASS** — no exception; the test returned an empty result set as expected.
- Assertions covered RLS across application/content tables, private schema exposure, browser-role grants, SECURITY DEFINER search_path/EXECUTE ACLs, scoped identity read policies, Coach-adopted profile/CMS policies, all six adapter foundation tables, the append-only execution event TRUNCATE guard, and the provider-manifest no-secret-key constraint.
- This is structural security regression evidence. It does not establish authenticated tenant isolation or OAuth runtime acceptance.

### 12.10 Remaining advisor interpretation
- Security advisor's 28 no-policy findings remain INFO. The security baseline passes because the relevant private tables/schemas have no browser-role access; the five scoped identity SELECT policies and the profile self policies are present.
- Performance advisor currently reports 58 unindexed foreign keys and 48 unused indexes. These remain review items; no bulk index DDL was applied.


### 12.11 Foreign-key index reconciliation — classified, not yet changed
A catalog-level check compared every FK's referencing-column sequence against valid, non-partial indexes on the same table. It independently confirmed **58** missing covering indexes, matching the current performance advisor count. Distribution:
| Schema | Missing FK indexes | Affected tables |
|---|---:|---:|
| areas | 11 | 3 |
| catalog | 9 | 4 |
| commerce | 7 | 2 |
| enterprise | 12 | 7 |
| identity | 9 | 5 |
| integration | 14 | 5 |

No index DDL was applied during this audit. This avoids blind remediation. Before applying a dedicated migration, review the exact FK column order, existing unique/compound indexes, query paths and write amplification. The current database has almost no tenant data, so the advisor's unused-index count is not a valid basis for dropping useful indexes.


### 12.12 First provider selection — Google Drive registry record confirmed
The live provider blueprint registry contains:
- `provider_key = files-knowledge-google-drive`
- `provider_name = Google Drive`
- `family_key = files-knowledge`
- `implementation_status = PLANNED`
- `auth_contract_status = UNSPECIFIED`
- `supported_operations = []`

Google Drive remains the selected first OAuth provider because it is already represented in the canonical 73-provider inventory and is the Life OS document SSOT target. No provider manifest or tenant connection has been created. Next implementation must define the narrowest justified Drive scopes, exact API operations, OAuth endpoints, token refresh/revocation, and a real account-authorized test. Keep Google Drive PLANNED until that round-trip passes.


### 12.13 OAuth generic runtime — implemented, deployed, E2E pending (2026-11-26 05:19 UTC)

This addendum supersedes the earlier §12.6 and §12.7 statements that the OAuth runtime was not implemented. It does **not** change the Google Drive provider's PLANNED status or close any Day acceptance gate.

#### Repository changes

- Added migration `20261126050000_adapter_oauth_runtime_guards.sql`:
  - Adds `PROCESSING` as the atomic one-time callback claim state.
  - Enforces that `PROCESSING`, `COMPLETED` and `FAILED` transactions have a non-null `consumed_at`.
  - Enforces that `PENDING`, `EXPIRED` and `REVOKED` transactions have a null `consumed_at`.
  - Adds a partial index for pending transaction expiry.
- Extended `supabase/functions/adapter-api/index.ts`:
  - `create_connection` accepts `OAUTH2_AUTH_CODE` without accepting user-supplied token credentials.
  - New `start_oauth_authorization` action requires workspace OWNER/ADMIN.
  - Generates 256-bit state and PKCE verifier using Web Crypto; persists only the SHA-256 state digest and a Vault reference to the verifier.
  - Uses the manifest's HTTPS authorization endpoint and explicit host allowlist; callback URL and provider client credentials come from server environment configuration.
  - OAuth client credentials must exist before an authorization URL is issued.
  - OAuth revocation now attempts the provider's configured revocation endpoint before local credential detachment; response reports `REVOKED`, `FAILED`, `NOT_CONFIGURED` or `NOT_APPLICABLE`. Local revocation and queued-job cancellation remain enforced even if remote revocation is unavailable.
- Added `supabase/functions/adapter-oauth-callback/index.ts`:
  - Separate public GET callback; state digest is atomically changed from PENDING to PROCESSING before any external token exchange.
  - Rejects missing, malformed, expired, mismatched and replayed state.
  - Exchanges the authorization code server-side with the stored PKCE verifier and exact recorded redirect URI.
  - Enforces HTTPS and the manifest host allowlist for the token endpoint.
  - Checks Bearer token response shape, bounded token sizes, expiry bounds and returned scopes against the requested scopes.
  - Stores access/refresh tokens and expiry metadata only in Vault; deletes the PKCE verifier secret after completion/failure.
  - Does not echo provider errors, codes, tokens or raw state.
- Extended `supabase/functions/adapter-worker/index.ts`:
  - OAuth bearer execution uses the Vault access token.
  - Refresh occurs under a per-connection PostgreSQL advisory transaction lock, re-reads the current Vault value after acquiring the lock, and persists refresh-token rotation.
  - Missing/invalid refresh credentials transition the connection to ERROR with a reauthorization-required code.
  - OAuth secrets remain excluded from execution results and logs.

#### Cloud application and verification

- Applied migration `adapter_oauth_runtime_guards`; cloud migration registry now has **22 entries**.
- Added `supabase/tests/adapter_oauth_runtime.sql`; executed its structural regression DO block against the live project. Result: **PASS** (no exception).
- Structural assertions cover:
  - OAuth transaction table RLS remains enabled.
  - `anon` and `authenticated` cannot SELECT OAuth transaction rows.
  - PROCESSING/COMPLETED/FAILED and consumed_at invariants are present.
  - Pending-expiry index exists.
  - State digest uniqueness remains enforced.
- Deployed Edge Functions:
  | Function | Version | Gateway JWT | Status |
  |---|---:|---|---|
  | `adapter-api` | 6 | enabled | ACTIVE |
  | `adapter-worker` | 5 | disabled; exact service-role bearer check in handler | ACTIVE |
  | `adapter-oauth-callback` | 1 | disabled; state-capability validation in handler | ACTIVE |
- Fetched all three deployed function sources and compared their complete `index.ts` contents to the branch files. All three were **exact matches**.
- Live cloud counts after deployment: 0 OAuth transactions, 0 tenant connections, 0 active OAuth manifests, 0 pending transactions and 0 processing transactions. No fake tenant or provider connection was created.

#### Explicit limitations / remaining gates

- No Google OAuth client ID or client secret is configured in the project. The required environment keys for the first provider are:
  - `OAUTH_FILES_KNOWLEDGE_GOOGLE_DRIVE_CLIENT_ID`
  - `OAUTH_FILES_KNOWLEDGE_GOOGLE_DRIVE_CLIENT_SECRET`
  - `ADAPTER_OAUTH_CALLBACK_URL` = exact deployed callback URL.
- No Google Drive manifest is active, and no authorized Auth user/workspace exists. Therefore the consent → callback → Drive API → refresh → revoke round-trip is **NOT RUN**.
- `OAUTH2_CLIENT_CREDENTIALS` remains unsupported and must not be treated as implemented.
- The SQL regression test is structural. It is not a provider E2E, and no automated browser/API OAuth flow has yet been executed.
- Remote provider revocation is attempted only when the manifest declares a validated `revocation_url`; if absent or failing, local revocation still removes the credential reference, and the result reports that remote status.
- Full automated tests for callback state mismatch/replay, expiry, role denial, endpoint rejection, token endpoint failure, refresh rotation and redaction remain required before Google Drive activation.

#### Current PR / continuation checkpoint

- PR #63 remains OPEN, DRAFT and unmerged.
- At this checkpoint the PR head is `2c7f2cebfc1264d96f8224c123313e9eb92b7629`; 89 commits and 28 changed files were reported by GitHub.
- Do not claim CI green from the docs-only/PR-filtered workflow lookup; the latest lookup returned no PR-triggered workflow runs for that specific commit.
- Keep Google Drive `PLANNED`, keep PR #63 Draft, and keep Day 1/2/3 acceptance statuses open until the real authorized OAuth and tenant lifecycle gates pass.


### 12.14 OAuth runtime final checkpoint — latest API v7 and advisor review (2026-11-26 05:21 UTC)

- Extended `start_oauth_authorization` to accept only bounded manifest-provided authorization parameters from the explicit allowlist `access_type`, `prompt` and `include_granted_scopes`. This supports provider requirements such as Google's offline refresh-token request without permitting arbitrary parameter injection.
- Redeployed `adapter-api` as **ACTIVE v7** with gateway JWT enabled. `adapter-worker` remains ACTIVE v5; `adapter-oauth-callback` remains ACTIVE v1.
- Re-fetched deployed Edge Function source and confirmed exact complete-file matches against the working branch for all three functions.
- Latest code commit before this handoff update: `cf9dd37837187814b28f9223c180ad356cd13231`.
- PR #63 remained OPEN / DRAFT / unmerged at that code head. GitHub reported 91 commits and 28 changed files before this handoff update.
- GitHub Actions associated with the code head were still queued/in progress at the last poll (CI matrix #657, Gate & Security #735, Security Triage #675). Do not call CI green until all three complete successfully.
- Supabase advisors after the OAuth schema change:
  - Security: 28 INFO `rls_enabled_no_policy` findings; no new severity increase identified. These private application tables remain inaccessible to browser roles by grants/schema usage.
  - Performance: 58 INFO unindexed-FK findings and 47 INFO unused-index findings. The unused-index count has shifted from the prior snapshot; do not mass-drop indexes.
  - Health: 0 findings.
- OAuth structural SQL test remains PASS. Live OAuth and tenant counts remain zero; no provider credentials or OAuth manifest have been provisioned.
- Google Drive is still PLANNED. The runtime supports OAuth Authorization Code + PKCE only; `OAUTH2_CLIENT_CREDENTIALS` remains unsupported.


### 12.15 OAuth code commit CI result (2026-11-26 05:22 UTC)

The three PR-triggered GitHub Actions runs associated with OAuth implementation code commit `cf9dd37837187814b28f9223c180ad356cd13231` have now all completed successfully:

| Workflow | Run | Result |
|---|---:|---|
| Continuous Integration Matrix | #657 | **completed / success** |
| Gate & Security | #735 | **completed / success** |
| Security Triage | #675 | **completed / success** |

This validates the repository's configured CI gates for that code commit. The later handoff/PR-description updates are documentation-only and their commit-specific lookup returned no PR-triggered runs. This does not replace a real OAuth provider E2E or authenticated tenant lifecycle test.


### 12.16 Google Drive v1.0.0 draft contract — registry and worker support added (2026-11-26 05:24 UTC)

This is a provider contract milestone, not an activation or successful Google account connection.

#### Provider blueprint and manifest

- Added and applied `20261126052200_google_drive_adapter_manifest_draft.sql`.
- Added and applied `20261126052300_google_drive_blueprint_contract_status.sql`.
- The canonical provider blueprint now reads:
  - `implementation_status = PLANNED`
  - `auth_contract_status = SPECIFIED`
  - `supported_operations` contains six operations.
- Added `integration.provider_adapter_manifests` row:
  - `provider_key = files-knowledge-google-drive`
  - `manifest_version = 1.0.0`
  - `manifest_status = DRAFT`
  - `auth_method = OAUTH2_AUTH_CODE`
  - API host: `www.googleapis.com`
  - Authorization host: `accounts.google.com`
  - Token/revocation host: `oauth2.googleapis.com`
  - OAuth client ID/secret are not stored in this manifest.
- Declared scopes:
  - `https://www.googleapis.com/auth/drive.readonly`
  - `https://www.googleapis.com/auth/drive.file`
  This pair enables reading Drive metadata/content while write operations remain limited to files the app creates or the user explicitly opens/selects; it is not the unrestricted `drive` scope.
- Declared operations:
  1. `health_check`
  2. `list_files` (query allowlist + pagination inputs)
  3. `get_file` (validated dynamic fileId path parameter)
  4. `create_folder` (fixed folder MIME type enforced by manifest body defaults)
  5. `update_file_metadata` (allowlisted metadata fields)
  6. `delete_file` (validated fileId path parameter)
- Binary media upload/download, resumable upload and export conversion are **not** declared or implemented in v1.0.0.

#### Worker contract hardening

- Extended `adapter-worker` to support manifest-declared path parameters with strict identifier validation and URL encoding.
- Query operations now require an explicit `allowed_query_params` list; body operations require `allowed_body_fields`.
- Manifest query/body defaults are applied; body defaults take precedence over caller input, preserving fixed fields such as Google Drive folder MIME type.
- Unknown path, query or body fields fail closed.
- Deployed `adapter-worker` as ACTIVE v7. Its full deployed source matches the branch file exactly.
- `adapter-api` remains ACTIVE v7 and `adapter-oauth-callback` ACTIVE v1; all three deployed source files were re-fetched and exact-match verified.

#### Tests and current cloud state

- `supabase/tests/google_drive_adapter_manifest.sql`: executed against the live project — **PASS** (no exception). It checks DRAFT status, PLANNED blueprint status, SPECIFIED auth contract, six-operation contract, endpoint allowlists, scope pair and absence of credential fields.
- `supabase/tests/adapter_oauth_runtime.sql`: re-executed — **PASS**.
- `supabase/tests/marketplace_security_baseline.sql`: re-executed after both Google Drive migrations — **PASS**.
- Current cloud migration registry: **24 applied migrations**.
- Current Google Drive / tenant counts:
  - Draft Google Drive manifests: 1
  - Active Google Drive manifests: 0
  - Tenant connections: 0
  - OAuth transactions: 0
- Supabase advisors:
  - Security: 28 INFO `rls_enabled_no_policy`
  - Performance: 58 INFO unindexed foreign keys; 47 INFO unused indexes
  - Health: 0 findings
- No mass index changes were applied.

#### CI and branch state

- GitHub Actions for worker implementation commit `dfb47e64f6fd4bbefff2e08687c25d0621f0b206`: CI Matrix #662, Gate & Security #740, Security Triage #680 — all **completed / success**.
- At the last poll, checks for the later Google Drive SQL test commit `728bdd868cc54e0582535879442c1f3bba218db0` were still running: CI Matrix #668 and Gate & Security #746 in progress; Security Triage #686 succeeded.
- PR #63 remains OPEN, DRAFT, unmerged and mergeable. Latest branch head at this checkpoint: `728bdd868cc54e0582535879442c1f3bba218db0`; 99 commits and 31 changed files.
- Repository hygiene correction: a migration file was briefly created on `master` by omitting the branch argument, then deleted immediately. The final `master` tree has no such migration file; the corrected source exists on `feat/marketplace-taxonomy-blueprints`. The branch itself was not rebased or merged.

#### Remaining Google Drive activation gates

1. Configure the exact callback URL `https://swegnrvaxxgfrnshdpxx.supabase.co/functions/v1/adapter-oauth-callback` in the Google Cloud OAuth Web Client.
2. Supply/configure server-side Edge Function secrets:
   - `ADAPTER_OAUTH_CALLBACK_URL`
   - `OAUTH_FILES_KNOWLEDGE_GOOGLE_DRIVE_CLIENT_ID`
   - `OAUTH_FILES_KNOWLEDGE_GOOGLE_DRIVE_CLIENT_SECRET`
3. Obtain a real authenticated Supabase user with organization and workspace OWNER/ADMIN membership.
4. Run Google consent → callback → `about.get` health check → list/read/create-folder/update/delete tests → refresh-token rotation → provider revocation.
5. Review Google OAuth consent-screen verification requirements for the restricted `drive.readonly` scope.
6. Only after that evidence, promote the manifest to ACTIVE and update the provider blueprint implementation status. Until then, keep it DRAFT / PLANNED.


### 12.17 Adapter API contract documentation updated (2026-11-26 05:25 UTC)

- Updated `docs/api/adapter-api.md` to reflect the deployed runtime rather than the former OAuth-not-implemented boundary.
- Documented `start_oauth_authorization`, the public callback boundary, one-time state/PKCE handling, Vault token storage, refresh/rotation and provider revocation reporting.
- Documented Google Drive v1.0.0 DRAFT and its six metadata operations, scope profile, and explicit binary transfer limitations.
- Documented worker manifest path/query/body allowlists and fail-closed behavior.
- Latest documentation commit: `28f859b669cf821f73daf1ef939684a16a67f559`. This is documentation-only; the preceding Google Drive code/test commit `728bdd868cc54e0582535879442c1f3bba218db0` had all three CI workflows complete successfully.


---

## 13. Repository consolidation and live cloud recheck — 2026-11-26

This addendum supersedes the V5 repository ownership statements above. The product and its backend source now live together in **Amdkn/Business-Marketplace**. V5 remains the architectural parent/reference repository; it is no longer the Marketplace application/backend source of truth.

### 13.1 Canonical ownership

- Product repository: `Amdkn/Business-Marketplace`.
- Product PR: #1, branch `foundation/marketplace-product-identity` → `main`, OPEN / DRAFT.
- Backend implementation source: ported from V5 PR #63 at source commit `aea04cfbbcac296bea0eab5ea69395ac5b1deff8`.
- Supabase cloud project remains the existing project `swegnrvaxxgfrnshdpxx`; no replacement project was created.
- V5 PR #63 is retained as provenance/history. Do not deploy or develop the Marketplace backend from V5 going forward.

### 13.2 Current live Supabase state

Read directly through the linked **Aspace marketplace** Supabase account on 2026-11-26:

- Project: `Aspace MarketPlace`, `swegnrvaxxgfrnshdpxx`.
- Region: `us-west-2`; PostgreSQL `17.12.0.000`.
- Project status: `ACTIVE_HEALTHY`.
- Cloud migration registry: **25 entries**.
- The canonical source tree in Business-Marketplace now carries 25 migration source files: 24 ported historical files and one catalog-derived reconstruction for `revoke_public_execution_rls_auto_enable`. Its exact original SQL text was not recovered, so byte-for-byte historical parity is not claimed. The reconstruction reproduces the verified live ACL. Do not replay it.
- The applied Coach adoption migration is version `20261124024550` (`coach_schema_adoption_20261124`). The earlier V5 file `20261124024342_coach_schema_adoption.sql` is not the canonical applied source and must not be replayed. The committed `20261124024550_coach_schema_adoption_20261124.sql` is explicitly reconstructed from the live catalog; it is not claimed to be byte-identical to the original historical SQL.
- Active Edge Functions at the live recheck: `marketplace-api` v16 (JWT enabled), `adapter-api` v7 (JWT enabled), `adapter-worker` v7 (gateway JWT disabled; handler-level service-role bearer validation), and `adapter-oauth-callback` v1 (gateway JWT disabled; one-time OAuth state validation).
- Exact live tenant/business counts at recheck: Auth users 0; organizations 0; organization memberships 0; workspaces 0; domain installations 0; department installations 0; holon installations 0; tenant connections 0; OAuth transactions 0; ACTIVE provider manifests 0; published listings 0; orders 0.
- Therefore the cloud infrastructure is deployed and structurally populated, but authenticated tenant E2E and real provider E2E remain blocked. No fake tenants, users, OAuth credentials or provider connections were seeded.

### 13.3 Ported source inventory

The Business-Marketplace branch now contains the backend source inventory from V5 PR #63:

- 4 Edge Function source files: Marketplace API, adapter API, adapter worker, OAuth callback.
- 25 versioned migration source files: 24 ported migration files plus the catalog-derived event-trigger ACL reconstruction; identity/catalog/commerce foundation, Coach schema adoption, taxonomy, tenant installations, ownership/dependency/capability engines, adapter execution/OAuth, Google Drive draft contract and capability entitlements.
- 4 SQL regression suites: Marketplace security baseline, OAuth runtime, Google Drive manifest, capability entitlements.
- API and Google Drive provider contract documentation.
- This Day 1–3 handoff, updated with the repository consolidation and the current cloud snapshot.

The migration source files are historical records for the already-applied cloud state. **Do not apply them again to the current hosted project.** Future database changes must be additive migrations created and reviewed in the canonical Business-Marketplace repository, then applied once and verified against the cloud registry.

### 13.4 Next execution sequence

1. Preserve the catalog-derived reconstruction for `revoke_public_execution_rls_auto_enable`; exact original SQL recovery remains a provenance-only gap, not an active privilege-state gap.
2. Verify byte-for-byte equality between the four deployed Edge Function sources and the four canonical Business-Marketplace function files.
3. Run the committed structural SQL regression suites against the live project; retain the evidence and exact test outcomes.
4. Complete signup/email delivery and establish a real authorized Auth user; do not fabricate one.
5. Execute the authenticated journey: organization → membership/role → workspace → workspace membership → Areas OS / departments / LD01 holons → ownership/dependencies/capabilities.
6. Complete the Google Drive provider setup and real OAuth consent → callback → API operation → refresh rotation → revoke round trip. Keep its manifest DRAFT and provider PLANNED until this passes.
7. Continue Day 2 commercial lifecycle (publication, order, entitlement, payments, double-entry ledger, payouts, reconciliation) and Day 3 platform cores, agent runtime, workflows, Control Tower and enterprise replication.
8. Keep PR #1 Draft and all Day 1–3 acceptance gates OPEN until real integrated evidence exists.



### 13.5 Consolidation verification — 2026-11-26

- Port commit: `5de0251aad83982c238d626808920373e1233e8e` on `foundation/marketplace-product-identity`.
- PR #1 remains OPEN / DRAFT; 47 changed files are now included.
- All four live Edge Function sources were fetched from the cloud and compared byte-for-byte with the canonical files in this repository:
  - `marketplace-api` v16 — exact match.
  - `adapter-api` v7 — exact match.
  - `adapter-worker` v7 — exact match.
  - `adapter-oauth-callback` v1 — exact match.
- All four committed SQL regression suites were executed against the existing cloud project and returned no assertion exceptions:
  - `marketplace_security_baseline.sql`
  - `adapter_oauth_runtime.sql`
  - `google_drive_adapter_manifest.sql`
  - `marketplace_capability_entitlements.sql`
- The live inventory query returned 36 application tables; all 36 have RLS enabled.
- The 25-entry migration registry now has 25 tracked source files. Cloud version `20261126041718`, migration `revoke_public_execution_rls_auto_enable`, is represented by a catalog-derived reconstruction of the live ACL, not byte-identical original SQL.
- Vercel deployment for commit `5de0251` was observed in state `BUILDING` at the last check. No READY/build-success claim is made.
- GitHub PR-triggered workflow lookup returned no runs for this commit at the last poll; the combined commit status showed Vercel `pending`. Recheck after the deployment completes.

These checks establish deployed-source parity and structural SQL regression status. They do not establish authenticated tenant lifecycle, live OAuth provider operations, payments or Day 1–3 acceptance.


### 13.6 Security ACL reconstruction and advisor triage — 2026-11-26

The previously missing migration `20261126041718 / revoke_public_execution_rls_auto_enable` has been reconstructed from the live PostgreSQL catalog. The function `public.rls_auto_enable()` is SECURITY DEFINER, has a fixed `search_path=pg_catalog`, and its live ACL is `postgres=X/postgres,service_role=X/postgres`. PUBLIC, anon and authenticated have no EXECUTE privilege. The event trigger `ensure_rls` remains enabled. A canonical migration source file now reproduces this verified privilege end state; it is explicitly labelled as catalog-derived reconstruction, not byte-identical original SQL. It is already applied in the hosted project and must not be replayed.

Live advisors returned 29 INFO RLS-without-policy findings, 61 INFO unindexed-FK findings, 50 INFO unused-index findings and no health findings. The RLS findings were checked against schema usage and direct grants: private Marketplace schemas are not exposed to browser roles, and policy-less internal tables have no direct anon/authenticated table grants. Existing browser-facing policies inspected on identity/content are tenant- or self-scoped. We intentionally do not add broad RLS policies merely to silence the linter. The security baseline now checks the no-browser-grant invariant for policy-less internal tables and the event-trigger function ACL.

The 61 unindexed-FK notices need workload-aware prioritization; the 50 unused-index notices are expected before representative tenant traffic. Neither category should trigger blind index creation or deletion.


### 13.7 Continued execution checkpoint — 2026-11-26

- Canonical branch head before this checkpoint: `cb7541fea86834d74e0adfd9065a6ed34fbaf86d`.
- Added `supabase/migrations/20261126041718_revoke_public_execution_rls_auto_enable.sql` as a catalog-derived reconstruction of the live ACL. It revokes EXECUTE from PUBLIC, anon and authenticated; the hosted project already has this state. The original historical SQL body is not claimed to be recovered byte-for-byte.
- The security regression suite now checks effective privileges (including inherited grants) on policy-less internal tables, rather than only direct rows in `information_schema.role_table_grants`.
- Re-ran all four SQL regression suites against the existing hosted Marketplace project at this checkpoint: security baseline, adapter OAuth runtime, Google Drive manifest and capability entitlements — all returned without assertion exceptions.
- Rechecked the RLS advisor findings against effective privileges: zero policy-less internal tables had effective table privileges for anon or authenticated. Do not add permissive policies just to clear the INFO linter.
- The latest Vercel deployment for the code/documentation checkpoint was observed in state BUILDING; GitHub Vercel status remained pending. No READY claim is made.
- PR #1 remains OPEN / DRAFT. No Auth user or tenant fixture was created. The next Day 1 acceptance dependency is a real authorized signup/confirmation/sign-in journey; the project currently has no custom SMTP configured and no Auth users.

### 13.8 Continuation verification — 2026-11-26 06:10 UTC

- Re-read the full Day 1–3 handoff and reconciled it with the current live migration registry and repository inventory.
- Live migration registry: 25 entries. Repository: 25 corresponding source files. The 20261126041718 / revoke_public_execution_rls_auto_enable entry has a tracked catalog-derived ACL reconstruction; exact original historical SQL provenance remains unavailable. This is not an active privilege-state gap and the reconstruction must not be replayed.
- Re-executed the four canonical SQL regression suites against the existing swegnrvaxxgfrnshdpxx project using the linked Aspace marketplace account. All four completed without assertion exceptions: security baseline, adapter OAuth runtime, Google Drive draft manifest, and Marketplace capability entitlements.
- Rechecked Supabase Health advisor: no findings. Security advisor still reports 29 INFO RLS-without-policy notices, triaged against effective browser-role privileges in the security baseline. Performance advisor reports 61 INFO unindexed-FK and 50 INFO unused-index notices; no blind index changes were made.
- Vercel deployment for exact PR HEAD b4be9cae141031af638124c4c17a9baa013a16eb is READY: https://business-marketplace-orzyjv9b5-amd-lab.vercel.app. This is a successful deployment observation, not Day 1–3 acceptance.
- GitHub PR-triggered workflow lookup for this exact commit returned no workflow runs. No separate GitHub CI success is claimed.
- PR #1 remains OPEN / DRAFT. The current concrete Day 1 blocker remains real Auth signup/confirmation/sign-in: email/password and confirmation are enabled, but no custom SMTP is configured and there are no Auth users. No synthetic user or tenant was created.
- Next implementation sequence: inspect Auth/email configuration and application error handling; establish the real signup delivery path using owner-provided SMTP credentials or a supported provider connection; then run the authenticated organization → workspace → domain/department/holon installation journey. Continue Day 2 commercial lifecycle and Day 3 cores/runtime/workflows/Control Tower without reducing scope.

### 13.9 Auth setup documentation corrected — 2026-11-26

- Replaced the inherited Coach OS OAuth setup guide at src/apps/auth/FOURNISSEURS.md with a Marketplace-specific Auth runbook.
- Corrected the Supabase project URL and Auth provider callback URI, recorded the currently applied redirect allowlist, and documented the verified provider states.
- Added the missing email SMTP setup and signup-confirmation acceptance steps. SMTP remains unconfigured; no secrets were requested or committed.
- Explicitly separated Supabase Google Sign-In credentials from the tenant-scoped Google Drive adapter OAuth credentials. They are different OAuth clients and trust boundaries.
- Added the rule that user-editable user_metadata must never authorize roles, tenant access or delegated permissions.
- This is documentation and governance progress only. It does not enable SMTP or OAuth providers and does not unblock the real-user E2E gate until a real email confirmation/sign-in succeeds.


### 13.10 Day 2 Finance & Capital foundation — 2026-11-26

- Added the private `finance` schema to the existing Marketplace Supabase project through three additive migrations: `20261126061930 finance_double_entry_foundation`, `20261126062124 finance_integrity_guards`, and `20261126062317 finance_payment_fact_immutability`.
- Added nine tables: ledger_accounts, journal_entries, journal_lines, payment_intents, payment_webhook_receipts, refunds, payout_batches, payout_items and disputes.
- Applied RLS to all nine tables; revoked schema USAGE and table privileges from PUBLIC/anon/authenticated; granted service_role only.
- Added deferred posted-journal balance checks, immutable posted journal lines and entries, same-organization/same-currency account and line foreign keys, order-snapshot matching for payment intents, immutable payment identity/amount/currency/idempotency facts, constrained payment state transitions, webhook signature gate, cumulative refund cap and payout batch currency guard.
- Added `supabase/tests/marketplace_finance_ledger.sql`; executed it against the live project and it returned without assertion exceptions. The test verifies nine-table inventory, RLS and effective browser/service-role privileges, SECURITY DEFINER search_path/EXECUTE restrictions, and all expected integrity triggers.
- Added [docs/FINANCE_LEDGER_CONTRACT.md](../FINANCE_LEDGER_CONTRACT.md) with accounting semantics, sample journal shape, provider boundary and remaining E2E requirements.
- Updated Supabase README and Product Architecture to record the three applied migrations and 9 finance tables (45 application tables total).
- No organization, order, payment, webhook, refund, payout or journal fixture was created. No provider credentials were added. No provider is represented as connected.
- Day 2 Finance foundation is structurally implemented, but Day 2 remains OPEN: fee policy, posting API, payment adapter, signed webhook implementation, settlement/payout execution, reconciliation, tax handling, disputes and finance UI remain.
- Next: add a database-level ledger posting API with strict service-role boundary and idempotent balanced journal posting; then wire a provider-neutral payment API and test the lifecycle using controlled test-mode provider credentials only after a provider is explicitly configured.


### 13.11 Finance integrity and index hardening — 2026-11-26

- Added cloud migration `20261126062541 finance_foreign_key_indexes` and tracked source file. All 14 Finance foreign keys are now covered by matching indexes; a catalog query returned no unindexed Finance FKs.
- Extended `marketplace_finance_ledger.sql` to fail if any Finance foreign key lacks a covering index; reran successfully.
- Re-ran the five canonical SQL regression suites (security baseline, OAuth runtime, Google Drive manifest, capability entitlements, Finance ledger); each completed without assertion exceptions.
- Supabase Health advisor returned no findings. Security advisor now reports 38 INFO RLS-enabled/no-policy notices (nine are the new private Finance tables); these remain intentional because the finance schema has no browser USAGE and no anon/authenticated table grants. Finance privilege assertions pass.
- Performance advisor now reports 71 unindexed-FK and 56 unused-index INFO notices across the whole project. Finance FKs are all indexed; the remaining findings concern other schemas and should be triaged by workload, not mass-indexed. Newly added indexes are naturally unused before traffic.
- Finance foundation is structural only. No provider, payment, refund, payout, dispute or ledger transaction was simulated. Payment posting API, fee policy, provider webhook verification implementation, settlement and payout E2E, tax handling, financial read models and UI remain open.


### 13.12 Idempotent journal posting API — 2026-11-26

- Applied cloud migration `20261126062749 finance_journal_posting_api` and tracked its exact SQL source.
- Added `api.post_finance_journal_entry`: requires active organization membership plus S0/B1/B2 finance-capable role; validates at least two balanced debit/credit lines; validates every account is ACTIVE and belongs to the same organization and currency; posts atomically; enforces organization-scoped idempotency and rejects key reuse with a different payload.
- Granted EXECUTE only to service_role; SECURITY DEFINER function uses pinned search_path. Browser roles cannot execute it.
- Added authenticated `post_finance_journal_entry` action to `marketplace-api` and deployed the updated function to Supabase. Live deployment reports ACTIVE, version 17, verify_jwt=true.
- Extended and re-ran the Finance regression suite; it now checks the posting function's existence, SECURITY DEFINER/search_path and exact role grants. It completed without assertion exceptions.
- No production journal, account, payment or tenant fixture was created. This is an available guarded posting API, not a claim that production accounting has started.
- Current Finance source contract and README record the new migration and API.


### 13.13 Finance API deployment verification — 2026-11-26

- Added and applied `20261126062749 finance_journal_posting_api`; exact SQL source is tracked in the Marketplace repository.
- Added the authenticated `post_finance_journal_entry` action to the canonical Edge Function source. The request parser validates decimal strings (up to six fractional digits), line count and exactly-one-sided debit/credit semantics before calling the database function.
- Deployed the canonical `marketplace-api` source to the existing Supabase project. Live deployment reports **ACTIVE v18**, `verify_jwt=true`. This replaces v17; v18 includes the decimal parser correction.
- Finance regression suite passed after verifying the API function, pinned SECURITY DEFINER search_path, service_role-only EXECUTE grant and finance FK index coverage.
- The API is not exercised against a real organization because the hosted project still has no Auth users or tenant fixtures. No synthetic financial data was created.

### 13.14 Standard Chart of Accounts and tenant provisioning — 2026-11-26

- Added hosted migration finance_chart_of_accounts_provisioning and tracked source supabase/migrations/20261126070000_finance_chart_of_accounts_provisioning.sql.
- Added private finance.chart_account_templates, enabled RLS, revoked all browser-role access and granted service-role access only.
- Added 16 required standard account templates under version 2026.1: cash, PSP clearing, receivables, seller/refund/tax/chargeback payables, retained earnings, owner contributions, platform fee/subscription/service revenue, payment processing, refund/chargeback, compute/inference and platform operations expense.
- Added finance.ledger_accounts.chart_version.
- Added api.provision_finance_chart_of_accounts: active organization + active membership + Finance-capable role required; advisory transaction lock; idempotent organization/currency/version provisioning; conflict detection against existing account codes/system keys; returns the complete chart.
- Added provision_finance_chart_of_accounts authenticated action to canonical supabase/functions/marketplace-api/index.ts.
- Applied follow-up migration finance_chart_version_regex_fix, tracked as supabase/migrations/20261126070100_finance_chart_version_regex_fix.sql, to normalize version format checks.
- Deployed marketplace-api ACTIVE v20, verify_jwt=true.
- Structural SQL assertions verified 16 required templates, chart_version column, template normal-balance consistency, function SECURITY DEFINER/search_path, service-role-only EXECUTE and service-role-only template grants.
- Live organization count remains 0. No account instance or tenant fixture was created. Runtime provisioning idempotency/collision/authorization is implemented but not tenant-E2E verified.
- Next implementation: versioned fee policies and fee calculation, then order/payment/fee-to-ledger event mapping and settlement posting.


### 13.15 Finance role alignment and final deployment — 2026-11-26

- Reviewed the new chart provisioning action against the Marketplace role hierarchy and found the generic organization helper did not include the explicit B2.2 Treasury role.
- Added a dedicated requireFinanceRole API guard for S0_SOVEREIGN, B1_CEO, B2_MANAGER and B2.2; both chart provisioning and journal posting use it. SQL functions independently enforce active membership and the same Finance-capable role set.
- Corrected the chart-version parser to accept the intended YYYY.N format and applied the matching SQL constraint/function correction migration.
- Redeployed canonical marketplace-api: ACTIVE v20, verify_jwt=true.
- The five SQL regression suites were executed after the chart provisioning and test assertions were added; all completed without assertion exceptions. The role-helper-only Edge Function correction was then deployed; SQL schema and grants were unchanged.
- Health advisor: no findings. Security advisor: 39 INFO RLS-enabled/no-policy notices; private engine schemas intentionally have no browser grants. Performance advisor findings are informational (61 unindexed FKs elsewhere and 66 unused indexes); Finance foreign keys remain covered by indexes. No blind changes were made.
- Live Auth users and organizations remain zero. No chart instances, payments or financial transactions were fabricated. Real authenticated provisioning remains blocked until an authorized tenant exists.

### 13.16 Versioned Fee Policy Engine — 2026-11-26

- Added live migration `finance_fee_policy_engine`, source tracked at `supabase/migrations/20261126073000_finance_fee_policy_engine.sql`.
- Added private `finance.fee_policies` and `finance.order_fee_snapshots`; both have RLS enabled and no browser-role privileges.
- Fee policies support versioned policy keys, platform-wide or seller-specific scope, optional currency, basis-point percentage, fixed fee, optional floor/cap, explicit rounding scale and effective windows.
- Policy lifecycle is Draft → Active → Retired. Activated policy terms are immutable; activation rejects overlapping windows for the same owner/key/scope/currency.
- Added immutable one-per-order fee snapshots recording gross, policy/version, rate, fixed fee, platform fee, seller net, currency and calculation details. Reapplying the same policy is idempotent; a different policy cannot overwrite an existing snapshot.
- Calculation: round(gross × rate_bps / 10,000 + fixed, scale), apply floor/cap, cap fee at gross, seller net = gross − fee. Taxes and payment processing are explicitly excluded.
- No default commission percentage is seeded. No fee policy, order or snapshot is fabricated.
- Added authenticated Edge actions `create_fee_policy`, `activate_fee_policy`, `apply_order_fee_policy`; deployed `marketplace-api` ACTIVE v21 with `verify_jwt=true`.
- Structural and arithmetic SQL assertions passed: private grants, RLS, immutability triggers, fee cap, seller net and double-count conservation.
- Tenant E2E remains blocked: hosted project has zero organizations and zero Auth users. The new actions cannot be exercised with real tenant membership until identity onboarding is connected.
- Next: connect the fee snapshot to payment capture facts and journal posting; define the seller-payable/platform-revenue accounting event and then provider adapter/webhook settlement.

- Added `finance_fee_policy_fk_indexes` and `fee_policy_activation_serialization` follow-up migrations: both fee-policy foreign keys are indexed, and competing activations serialize on owner/key/scope/seller/currency before the overlap check.
- Re-ran all five SQL regression suites successfully after fee engine integration. The Finance suite includes fee table/RLS/grant/immutability checks, percentage/fixed calculation arithmetic, fee caps, seller-net conservation and SECURITY DEFINER/least-privilege assertions.
- Live Finance inventory is now 12 tables. All Finance foreign keys have covering indexes (0 unindexed Finance FKs). The broader project still reports 61 unindexed foreign keys across non-Finance schemas and informational unused-index notices; no speculative mass indexing was applied.
- Supabase Health Advisor has no findings. Security Advisor reports 41 INFO RLS-enabled/no-policy notices across intentionally private, service-role-gated schemas; these are not exposed browser tables.

### 13.17 Fee Engine follow-up hardening and verification — 2026-11-26

- The first full Finance regression run identified two unindexed fee-policy foreign keys (creator user and optional seller scope). Added `finance_fee_policy_fk_indexes`; the full Finance suite then passed.
- A concurrency review identified that locking activation by draft policy ID alone would not serialize two competing versions. Replaced it with a shared advisory lock on owner organization + policy key + scope + seller scope + currency, then rechecks overlap under lock. Source migration: `20261126073200_fee_policy_activation_serialization`.
- Re-ran the complete Finance SQL suite after the serialization fix; all assertions passed.
- Re-ran all five repository SQL regression suites successfully: security baseline, adapter OAuth runtime, Google Drive adapter manifest, capability entitlements and Finance ledger/fee engine.
- Live inventory: 12 Finance tables, 0 unindexed Finance foreign keys, 0 organizations and 0 Auth users. No fee policies, orders, snapshots or money movement were fabricated.
- Health Advisor: zero findings. Security Advisor: 41 INFO RLS-enabled/no-policy notices in private schemas. Performance Advisor: 61 unindexed foreign keys across the wider non-Finance project and informational unused indexes; Finance-specific FK coverage is complete.
- `marketplace-api` remains ACTIVE v21 with `verify_jwt=true`. Tenant-level API execution and end-to-end order→fee→payment→journal validation remain blocked by the empty identity tenant state.

### 13.18 Repository / Preview checkpoint — 2026-11-26

- PR #1 remains OPEN / DRAFT and mergeable; latest PR head is `dd3215abb309e4284af9034f4cab6b39af687e6d`.
- The Vercel deployment for the fee-engine implementation commit `1b2d79f8940ab2858c455cf49056599999bb3d05` reached **READY**: `https://business-marketplace-5culd1uru-amd-lab.vercel.app`.
- The current PR head is a later documentation/handoff commit. Its GitHub combined Vercel status currently reports a **build-rate-limit failure** (Vercel target: `upgradeToPro=build-rate-limit`). Do not conflate the READY app-code preview with a successful build for the latest PR HEAD.
- GitHub Actions returned no PR workflow runs for the current PR head. The live Supabase Edge Function deployment is independently ACTIVE v21 with `verify_jwt=true`.
- This checkpoint does not mark the overall Day 1–3 plan accepted or complete.

### 13.19 Captured payment → double-entry ledger posting — 2026-11-26

- Added migration `finance_captured_payment_posting` and source `supabase/migrations/20261126073300_finance_captured_payment_posting.sql`.
- Added follow-up migration `captured_payment_posting_retry_safety` and source `supabase/migrations/20261126073400_captured_payment_posting_retry_safety.sql`.
- Added `api.post_captured_order_finance_entry` and authenticated Edge action `post_captured_order_finance_entry`.
- Posting requires a captured payment with `captured_at` and provider payment ID, exact immutable order/payment facts, a matching immutable order fee snapshot, and active chart accounts for the payment currency.
- Accounting allocation: debit PSP clearing for gross; credit seller payable for net; credit platform fee revenue for commission. Zero-value lines are omitted while preserving at least two balanced journal lines.
- Delegates to the existing double-entry API using `payment-capture:<payment_intent_id>`; retries reuse the original journal after a later partial/full refund state rather than trying to post capture a second time.
- Role authorization is Finance-only (S0/B1/B2/B2.2), SQL function is SECURITY DEFINER with pinned search_path, and EXECUTE is service-role-only.
- Deployed `marketplace-api` ACTIVE v22 with `verify_jwt=true`.
- Expanded the Finance SQL regression suite to verify capture gates, provider-payment identity requirement, fee snapshot dependency, journal delegation, idempotency marker, API grants/search_path and zero unindexed Finance FKs. The Finance suite passed.
- No live capture or journal was fabricated. The hosted project still has zero Auth users and organizations, and no payment provider is configured. Real capture-to-ledger E2E remains pending an actual tenant and verified provider webhook.

### 13.20 Successful refund → ledger reversal — 2026-11-26

- Added migration `finance_refund_fee_allocation_posting`, tracked at `supabase/migrations/20261126073500_finance_refund_fee_allocation_posting.sql`.
- Added private `finance.refund_fee_allocations`, one immutable allocation per refund, with RLS and browser-role access revoked.
- Added `api.post_succeeded_refund_finance_entry` and authenticated Edge action `post_succeeded_refund_finance_entry`; deployed `marketplace-api` ACTIVE v23 with `verify_jwt=true`.
- Posting requires a provider-refund ID and SUCCEEDED refund, captured payment with provider payment ID, matching payment/order facts, original capture journal and matching immutable fee snapshot.
- Cumulative fee reversal uses `round(original fee × cumulative successful refunds / original gross, scale)`; each posted refund receives the residual after prior allocations. This prevents partial-refund cent drift.
- Journal allocation: debit seller payable (seller share), debit platform fee revenue (fee share), credit PSP clearing (refund gross). Zero lines are omitted. Refund journal is immutable/idempotent; original capture is never rewritten.
- Finance SQL suite passed with refund table/RLS/grant/immutability checks, API SECURITY DEFINER/search_path/EXECUTE checks, capture dependency/idempotency assertions and cumulative rounding examples.
- No real provider refund, refund allocation or journal has been created. Tenant/provider E2E remains blocked by zero Auth users, zero organizations and no connected provider.

### 13.21 Settled seller payout → ledger posting — 2026-11-26

- Added migration `finance_journal_account_locking`, tracked at `supabase/migrations/20261126073600_finance_journal_account_locking.sql`. The core journal posting function now locks all affected ledger accounts in sorted UUID order before validating and posting, serializing concurrent writes and protecting balance checks.
- Added migration `finance_paid_payout_ledger_posting`, tracked at `supabase/migrations/20261126073700_finance_paid_payout_ledger_posting.sql`.
- Added required `finance.payout_batches.owner_organization_id` and its FK/index. The live project had zero payout batches/items when the non-null ownership column was added.
- Added `api.post_paid_payout_item_finance_entry` and authenticated Edge action `post_paid_payout_item_finance_entry`; deployed `marketplace-api` ACTIVE v24 with `verify_jwt=true`.
- Posting requires batch and item PAID states, provider batch/payout IDs, `settled_at`, correct owner/currency, active seller-payable and PSP-clearing accounts, and sufficient posted balances in both accounts.
- Journal allocation: debit seller payable; credit PSP clearing. Payout journal is immutable/idempotent using `payout-settlement:<payout_item_id>`.
- Finance regression suite passed with payout owner, settlement gates, balance guards, API grants/search_path and account-lock ordering assertions.
- No payout batch/item or bank transfer was created. Provider submission, payout orchestration and return/reversal handling remain separate work.

### 13.22 Final live verification checkpoint — 2026-11-26

- Hosted migration history: **40** applied migrations.
- Finance schema: **13** private tables; all Finance foreign keys have covering indexes (**0** unindexed Finance FKs).
- `marketplace-api`: **ACTIVE v24**, `verify_jwt=true`.
- Regression: all five SQL suites pass after the capture, refund, payout and journal account-locking additions.
- Health Advisor: no findings. Security Advisor: 42 INFO RLS-enabled/no-policy notices across intentionally private schemas. Performance Advisor: 61 unindexed foreign keys across the wider project (none in Finance) and 75 informational unused-index notices.
- Live identity and Finance records remain empty: 0 Auth users, 0 organizations, 0 fee policies, 0 fee snapshots, 0 refund allocations, 0 payout batches and 0 payout items. No synthetic business/financial data was created.
- PR #1 remains OPEN / DRAFT at `82b7e02fe5d71d393a80ede14bd4eedee4862879`. Current Vercel status is **failure: build-rate-limit**; this is an account/build-quota status, not a verified application compile failure. GitHub Actions reports no PR workflow runs.
- The code paths are implemented and structurally tested; real tenant and provider E2E remains blocked until Auth onboarding, an organization, and a payment/payout provider are connected.


### 13.23 Dashboard tenant data foundation — 2026-11-26

- The first real tenant is organization `A'Space Digital Garden` (`47735c82-818d-4794-ac67-1e302173897b`), with one ACTIVE membership, B1_CEO role binding, and workspace `Garden` (`c987607d-1c53-42a4-84e5-cb070764dafa`).
- The Garden Dashboard reads tenant-scoped operational records from `dashboard.clients` and `dashboard.agents`. Both tables are empty until real records are created.
- Both tables have RLS enabled, four policies per table (member read; authorized operator writes), authenticated-only grants, and organization/time indexes. Tenant membership and role checks use the canonical `identity` schema.
- The frontend defaults to the `dashboard` schema. The organization display lookup reads from `identity.organizations`.
- The dashboard SQL regression verifies both tables, RLS, policies and grants. An authenticated insert/read probe succeeded in a rolled-back transaction; no test row remains.
- Fabricated Dashboard alert cards were removed. The empty state now reports no pending validations until real operational records exist.
- The earlier preview deployment was READY at commit `c5a2299`. Latest source changes require a new deployment; Vercel previously returned HTTP 402 `api-deployments-free-per-day` (retry after 24 hours).
- Remaining acceptance gates: deploy the latest branch, verify the real user's JWT and RLS reads in the browser, and implement durable Dashboard activity/tasks and profile-backed Sidebar identity.


### 13.24 Dashboard namespace correction — 2026-11-26

- Removed the temporary legacy namespace from the live database by renaming it to the canonical `dashboard` schema. No rows were dropped; both tables were empty at the time of the rename.
- Live catalog now contains `dashboard.clients` and `dashboard.agents`; no schema name containing the legacy product label remains.
- PostgREST schema exposure is now `public, dashboard, identity`.
- The Dashboard frontend defaults directly to `dashboard`; local development cache keys use `marketplace_dashboard_*`.
- The tenant organization lookup now reads `identity.organizations`, not a shadow organization table. Added authenticated SELECT grant protected by the existing `organizations_read_active_member` RLS policy.
- Removed legacy product branding from the login, signup and Sidebar surfaces; cleaned the data client, tenant guard, auth provider, shell components, Dashboard test, README and handoff.
- Live verification: no legacy schema found; both Dashboard tables remain empty; eight tenant policies remain in place; anon has no SELECT; authenticated insert/read probe for the real tenant succeeded inside a rolled-back transaction.
- Added source migrations `20261126080100_replace_legacy_namespace_with_dashboard.sql` and `20261126080200_expose_tenant_identity_context_for_dashboard.sql`.
- Deployment of the latest branch remains blocked by the Vercel 24-hour deployment quota. Browser E2E is therefore still pending.


### 13.25 Shared interface persistence foundation — 2026-11-26 03:26 ET

**Source audit**
- Audited both interface code paths in `src/components/saas` (Garden/Sidebar) and `src/apps` (Web Desktop), plus the central registry and CMS implementation in `src/lib/cms`.
- `src/lib/cms/seed.ts` registers 37 collections. 34 are operational collections; `demo_coach_apps`, `demo_coach_notes`, and `demo_coach_metrics` are showcase-only and intentionally remain local.
- Found that `src/lib/cms/repository.ts` documented 23 typed tables but actually read/wrote `cms_items` for every collection. The collection-to-table map was not active. The tenant resolver read legacy `public.memberships`.
- Found that `src/lib/cms/cms.store.ts` only replaced seed rows when live rows were non-empty, which meant a real empty tenant continued seeing fictional sample records.

**Implemented**
- Added `workspace_data` with 34 dedicated tables derived from the real collection field definitions: clients, articles, team, people_agents, runbooks, incidents, services, it_experiments, deploys, tasks, marketplace_listings, product_items, product_releases, growth_channels, growth_experiments, deals, invoices, contracts, policies, session_notes, legal_ai_act_checks, legal_frameworks, legal_controls, legal_compliance_policies, legal_evidence, legal_risks, legal_vendors, legal_gaps, personas, memory, codex, approval_decisions, squads and content.
- Added `workspace_data.activity_events`.
- Every collection table has typed declared fields, tenant organization FK, optional workspace FK, creator, timestamps, RLS, four policies, organization/workspace index and tenant-key immutability trigger. Reads require active membership; writes require S0_SOVEREIGN/B1_CEO/B2_MANAGER/B2.2. Anonymous schema/table access is revoked.
- Added source migration `supabase/migrations/20261126083638_marketplace_interface_persistence.sql`.
- Rewired `src/lib/cms/repository.ts` to use the matching `workspace_data.<collection>` table for hydrate/upsert/delete; collection definitions remain source-controlled. Organization lookup now uses `identity.organization_memberships`.
- Changed `src/lib/cms/cms.store.ts` so an empty live table replaces bundled demo rows. No fake rows are inserted into Supabase.
- Added `supabase/tests/marketplace_interface_persistence.sql`; executed against the hosted project successfully.

**Live verification**
- `workspace_data`: 35 tables (34 collection tables + activity_events).
- 138 RLS policies; 0 tables with RLS disabled; 0 anon table grants.
- PostgREST exposed schemas include `public, dashboard, identity, workspace_data`.
- Authenticated insert/read/update probe against the real Garden tenant succeeded inside a transaction and was rolled back; the table remains empty.
- Cloud migration ledger now records `20261126083638 / marketplace_interface_persistence`; source filename matches the hosted migration version.
- No demo business records or test rows were persisted.

**Not yet complete — next session must continue**
1. Reconcile the separate Sidebar repositories `src/components/saas/data/clients.repo.ts` and `agents.repo.ts` with the new shared tables and canonical Marketplace identity. Do not create a second human/agent identity: humans come from `identity.profiles` + `identity.organization_memberships`; AI principals come from `identity.agent_principals` and `identity.agent_delegations`. Runtime telemetry should be a projection/telemetry layer, not a competing principal registry.
2. Trace each Garden Sidebar view and each Web Desktop app to its actual data source. Identify app-local seeds, hardcoded arrays, local state, and independent repositories that bypass the central CMS. Migrate each real operational surface to the shared persistence or its canonical domain schema.
3. Resolve active workspace selection and enforce `workspace_id` scoping in repository queries/RLS. Current CMS table RLS is organization-scoped; `workspace_id` is nullable and not yet enforced.
4. Align CMS entities with existing core Marketplace schemas where appropriate (commerce listings/orders, integration connections/jobs, finance ledger/payment records, Areas/Enterprise installations). Avoid duplicating those entities in workspace_data when a canonical table already exists.
5. Run TypeScript/build/tests and deploy a new preview; Vercel had previously rate-limited deployment. Then perform browser E2E with the real user's JWT and verify both interfaces render empty states and persist a real record end-to-end.

**Branch:** `foundation/marketplace-product-identity`. **PR:** #1 OPEN / DRAFT. Latest commit must be refreshed from the branch before continuing. Day 1–3 remain OPEN; this tranche is a persistence foundation, not full interface acceptance.


### 13.26 Legacy product identifier cleanup — 2026-11-26 03:26 ET

- Removed remaining active-source references to the legacy product/schema label from `src/components/saas/lib/types.ts`, the central CMS service seed, and the Operations, IT/R&D and Tasks demo seeds.
- Replaced the old mock service identity with `Supabase — Marketplace`; updated the historical mock references to the current Marketplace runtime/schema labels.
- Rechecked those five source files: zero remaining matches.
- Live Supabase schema inventory had already confirmed no schema name containing the legacy label. Historical applied migration files and handoff provenance are retained; do not rewrite applied migration history merely to erase historical references.
- PR #1 remains OPEN / DRAFT. Re-fetch the branch HEAD before continuation; the handoff update itself advances the branch. Vercel status on the preceding code head: `failure` with description `Deployment rate limited — retry in 24 hours`; no GitHub Actions check runs.


### 13.27 Interface-wide legacy naming sweep — 2026-11-26 03:26 ET

- Extended the initial source cleanup across the Garden/Sidebar views, Sidebar data repositories, Mission Control, Web Desktop landing page registry, and all nine landing-page canvases.
- Removed remaining `omk_saas.*` UI labels, `ADR-OMK-001` comments, `OMK` product names, old `omknexus.io` demo domains, and legacy mock tenant/service labels.
- Updated product/landing branding to A’Space/Marketplace terminology; replaced legacy demo domains with local-only `*.aspace.local` labels rather than claiming a production domain.
- Scanned the primary app entrypoints and seed files under `src/apps`, the full Garden view set, Sidebar data repositories, and the Mission Control views. No active-source matches remained in the inspected paths at this checkpoint.
- `src/components/saas` and `src/apps` now use Marketplace identity in the inspected surfaces. Historical migration SQL and prior handoff text are retained only as provenance and are not active schemas or product UI.
- Important: this was a naming cleanup, not a completion of the remaining Sidebar persistence integration. `dashboard.clients` / `dashboard.agents`, CMS `workspace_data.*`, and canonical `identity.*` still need the planned consolidation described in §13.25.


### 13.28 Garden + Web Desktop persistence convergence — 2026-11-26

**Live identity/tenant facts rechecked**
- Supabase now contains 1 Auth user, 1 organization, 1 active organization membership, 1 workspace and 1 workspace membership. This is the first real tenant; it is not a seeded demo tenant.
- The active organization role binding is B1_CEO at ORGANIZATION scope.
- Do not publish the user's email, auth UUID, organization UUID or workspace UUID in docs or logs.

**Cloud database changes**
- Added and applied migration 20261126090124_workspace_document_records.sql.
- Added workspace_data.documents and workspace_data.legal_documents, with organization/workspace ownership, creator attribution, typed document metadata, RLS, least-privilege grants, organization indexes and four policies per table.
- Cloud inventory after apply: 37 tables in workspace_data, 146 RLS policies; 1 real user / org / membership / workspace / workspace membership.
- No tenant content rows were inserted by this work.

**Garden data-layer changes**
- src/components/saas/config/mode.ts: default Garden DB schema changed from dashboard to workspace_data.
- src/components/saas/data/repository.ts: replaced the old implicit dashboard.* table assumption with an explicit canonical table map:
  - clients → workspace_data.clients
  - agents → workspace_data.people_agents
  - documents → workspace_data.documents
  - invoices → workspace_data.invoices
  - legal_docs → workspace_data.legal_documents
  - missions → workspace_data.tasks
  - sales_leads → workspace_data.deals
  - sops → workspace_data.runbooks
- Added a typed mapping between Garden UI shapes and canonical workspace records, preserving non-column UI fields in extra_data.
- Reads/find/update/delete are scoped by organization_id; create injects the authenticated user ID and tenant ID; update preserves the existing extra_data payload before applying partial patches.
- The Web Desktop CMS already reads/writes the same workspace_data collections through src/lib/cms/repository.ts. Garden and Web Desktop now target the same tenant data plane at the repository layer.
- Historical dashboard.clients / dashboard.agents tables remain in the database as legacy compatibility artifacts; the Garden repository no longer maps to them. No live rows were copied or deleted.

**Validation / remaining gates**
- Supabase Health Advisor: 0 findings.
- Security Advisor: 42 INFO notices for RLS-enabled private tables with no policies (catalog/control-plane schemas), plus 1 WARN: leaked-password protection is disabled. No workspace_data no-policy finding was returned.
- Performance Advisor: 136 unindexed foreign keys across the wider project and unused-index notices. These are project-wide; the new workspace document tables have organization/workspace/created indexes.
- No browser-authenticated CRUD test has yet been run against the new Garden repository. The live tenant exists, but the current session tools cannot reuse the user's browser JWT. Do not claim E2E acceptance until browser sign-in, collection CRUD and cross-tenant denial tests pass.
- No local TypeScript/Vitest/build execution was available through the connected GitHub/Supabase actions in this session. CI/Vercel status must be refreshed on the latest branch head; previous Vercel rate-limit failure was on an older code head.
- The Garden table map is now explicit but should receive UI-by-UI contract tests for every field. Check special cases: invoice currency fallback currently defaults to USD if no currency metadata exists; upload/storage lifecycle is still not implemented; mission task status and SOP content use the existing tasks/runbooks storage contracts.
- Next: refresh PR checks, run typecheck + test + build in CI, perform browser CRUD on the real tenant, then complete remaining Sidebar app modules and Control Tower integrations. Keep PR #1 DRAFT until the full Day 1–3 acceptance gates pass.


### 13.29 Final checkpoint — 2026-11-26

- The new Garden repository mapping and two new tenant tables are committed on the working branch. The Web Desktop CMS and Garden now point to the same workspace_data tenant data plane.
- Verified database shape for the eight Garden collection targets: clients, people_agents, documents, invoices, legal_documents, tasks, deals and runbooks each have RLS enabled and four policies; authenticated table SELECT/INSERT grants exist. The actual policy predicates still require a browser-authenticated CRUD test.
- The live organization has one active B1_CEO organization role binding. No tenant content rows were created during this implementation.
- Repository CI workflow exists at .github/workflows/ci.yml and defines npm ci, app and API typechecks, Vitest, build and four runtime benches. No Actions workflow run/check-run was returned for the latest PR head in this session; do not treat the workflow definition as a passing run.
- PR #1 remains OPEN / DRAFT. Latest known branch head before this handoff update: 788d42d404106f34e9f416b675253b63f857404f. Vercel still reports the rate-limit failure on the immediately preceding verified head; refresh checks after the handoff commit.
- Explicit open issues: authenticated browser CRUD and cross-tenant denial; confirm JWT org_id hydration for the real account; validate Garden view field contracts and form flows; file upload/storage; invoice currency is currently defaulted to USD if no currency extra_data is present; mission/task and SOP/runbook mappings need UI-level acceptance; the legacy dashboard schema tables have not yet been dropped and remain compatibility artifacts.
- Continue implementation in this same branch and repository. Do not create another project, do not move Garden back to dashboard, do not add fake tenant records, and do not mark Day 1–3 accepted until their end-to-end gates pass.


### 13.30 Migration ledger filename reconciliation — final session closeout

- Supabase assigned the hosted migration version 20261126090124 to workspace_document_records. The source migration has been renamed to supabase/migrations/20261126090124_workspace_document_records.sql to match the cloud ledger.
- References in this handoff and supabase/README.md were updated. The old provisional 20261126090500 filename was removed from the active branch.
- Latest branch head must be fetched again after this handoff commit. The cloud table inventory remains 37 workspace_data tables / 146 policies; documents and legal_documents are both empty by design.


### 13.31 Garden/Web Desktop workspace-scoped CRUD hardening — 2026-11-26 04:19 ET

**Live database re-inventory**
- Rechecked the connected Marketplace Supabase project directly.
- `workspace_data`: 37 base tables, all 37 with RLS enabled, 146 policies.
- First real tenant remains intact: 1 Auth user, 1 profile, 1 organization, 1 active organization membership, 1 workspace, 1 active workspace membership.
- `workspace_data` currently contains 0 tenant rows. No test/demo/business rows were inserted.
- Inspected all eight Garden-targeted table contracts (clients, people_agents, documents, invoices, legal_documents, tasks, deals, runbooks): each has non-null `organization_id` and `workspace_id`. The active policies call `identity.is_active_workspace_member(organization_id, workspace_id)` for reads and `identity.can_manage_workspace(organization_id, workspace_id)` for writes.

**New code changes committed on the working branch**
- `src/components/saas/lib/tenant.ts`: added an active-workspace cache alongside the organization cache.
- `src/components/saas/auth/AuthProvider.tsx`: resolves the signed-in user's unique ACTIVE `enterprise.workspace_memberships` row, populates the workspace cache, fails closed if no unique active workspace exists, and clears both tenant caches when the session ends.
- `src/components/saas/data/repository.ts`: all Garden list/find/create/update/delete operations now scope by both `organization_id` and `workspace_id`; creates include `workspace_id`. This closes the previous mismatch where Garden filtered only by organization while Web Desktop CMS filtered by both.
- Garden invoice hydration no longer fabricates USD when currency metadata is absent; the UI receives an empty/unset currency instead.
- `src/lib/cms/repository.ts`: configured production writes now fail explicitly when authenticated workspace context is missing or a collection has no persistent table. Hydration database/API failures reject rather than masquerading as an empty collection. Supabase mode retains the latest error even when the mode label does not change.
- `src/lib/cms/cms.store.ts`: catches hydration/write/delete promise failures and reports the exact collection/item in the console instead of leaving unhandled promise rejections. Failed remote reads never populate a real tenant with demo seed records.

**Validation boundary**
- Database metadata, RLS predicates, table nullability and tenant counts were queried live and verified.
- No authenticated browser JWT was available to these remote repository/database tools. Garden and Web Desktop browser CRUD, cross-workspace denial, and UI smoke tests are NOT claimed as passed.
- No local Node runtime was available through the connected GitHub/Supabase tools, so TypeScript, Vitest, and Vite build have NOT been executed after these code edits.
- No deployment was triggered; previous Vercel rate-limit status must be refreshed against the latest branch head.

**Next implementation tranche**
1. Unify Garden People/Agents with canonical `identity.profiles`, `identity.agent_principals` and `identity.agent_delegations`; `workspace_data.team` and `workspace_data.people_agents` must not become competing identity registries. Preserve UI-only telemetry in a separate agent runtime projection if required.
2. Audit every Garden view and every Web Desktop app for local seed arrays, hardcoded data and independent stores; migrate each operational view to its canonical source (identity, enterprise, areas, catalog, commerce, integration, finance, or workspace_data only where it is genuinely workspace content).
3. Reconcile CMS and Garden field contracts for the eight shared collections, including invoice currency, IDs, date/status types and update semantics.
4. Add automated contract tests for mapper round-trips and repository query scoping; run typecheck, Vitest, build and CI.
5. Perform browser-authenticated CRUD and cross-workspace denial with the real tenant JWT; only then accept the shared interface persistence tranche.

**Branch:** `foundation/marketplace-product-identity`. **PR #1:** OPEN / DRAFT. Day 1–3 remain OPEN; no E2E or deployment acceptance is implied by this code tranche.


### 13.32 Auth hydration guard and CMS runtime contract cleanup — 2026-11-26

- Garden AuthProvider now catches workspace-membership hydration failures, clears the active workspace cache and releases the loading gate. The authenticated session does not silently gain a workspace; Garden repository access remains closed until exactly one active workspace is resolved.
- Garden auth cache is cleared on both explicit sign-out and observed session loss.
- Updated the CMS store header to reflect current Marketplace behavior: demo records belong only to the explicit local demo tenant; real tenants hydrate from workspace_data and remote failures are not demo-seeded.
- Re-ran `supabase/tests/marketplace_interface_persistence.sql` against the hosted project after the workspace-scoping code changes; the DO assertion suite returned no exceptions. This is structural SQL verification, not browser CRUD.
- Latest verified code changes are committed before this handoff. TypeScript/Vitest/build, live browser CRUD and deployment remain unverified and are explicitly not accepted.


### 13.33 People & Agents UI source audit — 2026-11-26

A deeper read of the actual People/Agents interfaces found additional non-persisted demo behavior that must be removed before calling the interface recycle complete:

- Web Desktop `src/apps/people/PeopleApp.tsx` imports `FLEET_AGENTS`, `SCHEDULE_GRID` and `SCHEDULE_TASKS` from `src/apps/people/fleet.ts`. The overview, agent bench, activity heatmap and schedule are driven by hardcoded fixture arrays, not the tenant CMS collections.
- `src/apps/people/seed.ts` defines synthetic personas, memory and codex records; real tenant seed guards prevent these sample rows from being inserted, but the UI must still be checked to ensure it does not render fixture arrays outside the CMS.
- Garden `AgentsView` and `AgentRootView` read through `agentsRepo`, which currently maps to `workspace_data.people_agents`, not canonical `identity.agent_principals`.
- Garden `AgentRootView` derives load, success rate, latency, task counts and default model from row index/status when telemetry is absent. These are synthetic metrics and must be replaced with explicit unknown/unavailable values, never displayed as live telemetry.
- Next identity architecture: `identity.agent_principals` is the canonical agent identity; `identity.agent_delegations` is the authority boundary. Workspace-specific assignments and telemetry belong in a linked workspace projection with a foreign key to the principal, not a second identity registry. Human team identity similarly comes from `identity.profiles` and organization/workspace memberships.
- No agent principals, runtime profiles, telemetry, tasks or synthetic agent rows were created during this audit.


### 13.34 People & Agents demo telemetry removal — 2026-11-26

**Code changes committed**
- `src/components/saas/views/AgentRootView.tsx` was replaced with a tenant-record directory. It no longer fabricates load, success rate, latency, tokens, task counts, task descriptions, channel, model routing, or fleet share from row index/status. Only fields returned by the current repository are displayed; runtime state/task/model/telemetry are explicitly marked unavailable.
- `src/apps/people/fleet.ts`: removed the five hardcoded FleetAgent fixtures; the active Web Desktop agent bench no longer presents demo agents as tenant runtime agents. Replaced the synthetic 7×24 heatmap values with an all-zero/unreported baseline and removed the hardcoded schedule tasks.
- `src/apps/people/PeopleApp.tsx`: updated People/Squads/Cadence copy to stop calling the fixture feed live; schedule activity labels now indicate that runtime activity is not reported, and peak/quietest/weekday metrics render unavailable when no schedule records exist. The task-submit control is disabled because it is not yet connected to persistent `workspace_data.tasks`.

**Live schema/security findings**
- `identity.agent_principals` is the canonical identity table with unique (organization_id, agent_key), class/runtime/status fields and creator FK.
- `identity.agent_delegations` references the canonical principal by composite (agent_principal_id, organization_id) FK and carries permission scope/status/time window.
- `workspace_data.people_agents` currently has no `agent_principal_id` column or FK to `identity.agent_principals`; it therefore remains a separate workspace record and is not yet a canonical agent assignment projection.
- `identity.agent_principals` and `identity.agent_delegations` both have RLS enabled but no authenticated table SELECT/INSERT/UPDATE grants were found in the current role privilege check. They cannot simply be queried by the browser client as-is.
- `workspace_data.people_agents` has authenticated SELECT/INSERT/UPDATE grants and policies scoped by active workspace membership / workspace management.
- No new agent principal, delegation, runtime profile, telemetry row, or fake tenant row was created. No schema migration was applied.

**Remaining architecture work (not yet complete)**
1. Define the secure browser-facing identity read/write boundary for agent principals and delegations. Do not expose these tables by granting broad authenticated access; implement narrowly scoped policies/RPC or an authorized server boundary after reviewing the existing identity functions.
2. Introduce a workspace assignment/runtime projection with a composite FK to the canonical principal and explicit organization/workspace scope. Decide whether to evolve `people_agents` or create a dedicated assignment table; current schema is insufficient to claim unification.
3. Refactor Garden `agentsRepo` and Web Desktop PeopleApp to join/use canonical principal identity through that boundary; the Garden repository still maps `agents` to `workspace_data.people_agents`.
4. Replace the temporary empty/unreported state with actual persisted task scheduling and runtime ingestion, then add contract tests.

**Validation boundary**
- The Supabase information_schema, pg_constraint, pg_policies and role privilege queries above were executed against the connected Marketplace project.
- No browser-authenticated CRUD or cross-workspace test was run. No TypeScript, Vitest, build, deployment or browser smoke test was run after these code changes.
- Latest branch head and PR checks must be refreshed before any acceptance decision. Day 1–3 remain OPEN / PR #1 remains DRAFT.


### 13.35 Shared tenant context, canonical People/Agents read models and typed Garden records — 2026-11-26

This section supersedes earlier checkpoints that reported 37 tables / 146 policies or stated that Garden still reads `dashboard.clients` / `dashboard.agents`. The current hosted state is 38 tables / 150 policies, and the Garden People/Agents reads now use canonical server-side identity projections.

**Live Supabase state**
- Project: `swegnrvaxxgfrnshdpxx`.
- `workspace_data`: 38 base tables; all 38 have `workspace_id NOT NULL`; 150 RLS policies; all tables have RLS enabled.
- First real tenant remains: 1 Auth user, 1 profile, 1 organization, 1 active organization membership, 1 workspace, 1 active workspace membership. No agent principals exist yet.
- First tenant: organization `47735c82-818d-4794-ac67-1e302173897b`; workspace `c987607d-1c53-42a4-84e5-cb070764dafa`; role `B1_CEO`.
- No demo business records, fake agent principals, mission rows, invoices, payments, refunds or payouts were created.
- The temporary task CRUD probe was run inside a transaction and rolled back; follow-up query confirmed 0 persisted probe rows.

**Critical private-schema correction**
- `enterprise` is a private schema and must not be queried directly from browser clients.
- Added `identity.get_current_workspace_context()`, an authenticated, caller-bound SECURITY DEFINER RPC with pinned `search_path`. It returns only the caller's unique active organization/workspace names and IDs plus the active organization role; it returns no context when the user has zero or multiple active memberships/workspaces.
- Tested under PostgreSQL role `authenticated` using the real user subject. It returned the expected organization, workspace and `B1_CEO` role.
- Garden AuthProvider, `useTenantStore.bootstrap()` and the Web Desktop CMS repository now use this RPC instead of querying `enterprise.workspace_memberships` / `enterprise.workspaces` from the browser.
- Garden and Web Desktop now import the same `src/lib/supabase.ts` client singleton. A real Supabase session overrides a stale local demo marker.
- RLS policy helpers `identity.is_active_workspace_member` and `identity.can_manage_workspace` remain fixed-search-path SECURITY DEFINER predicates, execute granted only to authenticated, denied to anon/PUBLIC. The mission delegation trigger function is SECURITY DEFINER with fixed search_path and no browser EXECUTE.

**Garden records and People/Agents**
- Garden repositories filter reads, updates and deletes by both `organization_id` and `workspace_id`; creates write both IDs.
- Garden `missions` now maps to a dedicated `workspace_data.missions` table, not the generic CMS `tasks` table. Mission rows have priority/status/position/notes and optional `agent_principal_id`; a trigger rejects assigning an agent without an active workspace delegation.
- `workspace_data.invoices` now has typed `client_id`, `currency`, `issued_at`, `due_at` and `paid_at` columns. Currency is checked as a three-letter uppercase code when supplied; there is no USD default. The client FK includes organization/workspace scope.
- Garden `membersRepo` and `agentsRepo` now use authenticated Marketplace API read actions `list_workspace_members` and `list_workspace_agents`. The former reads active workspace memberships and profile display names; the latter returns canonical `identity.agent_principals` only when an active delegation exists for the current workspace.
- Garden People and People/Agents views now render the distinct human-membership and delegated-agent read models. They no longer create a human row in the AI agent directory or infer humans from agent role values. The agent list is expected to be empty until real agents are registered and delegated.
- `marketplace-api` deployed ACTIVE v26 with `verify_jwt=true`; added `list_workspace_members` and `list_workspace_agents`.
- Garden invoice mapping no longer fabricates USD. Dashboard copy no longer references `dashboard.clients` / `dashboard.agents`.
- Repository code search returned no active `OMK`, `omk_internal` or `omk_saas` references. The retired `dashboard` namespace is documented as historical only; no new code may use it.

**Hosted migration ledger / exact source filenames**
- `20261126091538_workspace_scoped_data_access.sql`
- `20261126092009_workspace_data_access_hardening.sql`
- `20261126092033_workspace_policy_predicate_definer_boundary.sql`
- `20261126092835_garden_invoice_and_mission_records.sql`
- `20261126093031_current_workspace_context_rpc.sql`
- The source filenames were reconciled to the exact versions assigned by the hosted Supabase migration ledger; provisional filenames were removed.

**SQL verification**
All six SQL suites were executed against the connected hosted project after the current schema/code changes; all returned no exceptions:
1. `marketplace_security_baseline.sql`
2. `marketplace_interface_persistence.sql`
3. `adapter_oauth_runtime.sql`
4. `google_drive_adapter_manifest.sql`
5. `marketplace_capability_entitlements.sql`
6. `marketplace_finance_ledger.sql`

**Not accepted / remaining work**
- The new Edge actions are deployed but have not yet been invoked through a live browser JWT. The RPC context was tested under authenticated SQL role; this is not a full browser E2E.
- TypeScript, Vitest, Vite build and CI have not been executed from a local project checkout in this session.
- No new Vercel deployment or browser smoke test has been confirmed; refresh the latest PR check and deployment status before claiming UI delivery.
- Human invitation/acceptance and agent registration/configuration UI still need to be wired to authorized Marketplace API commands. People/Agents list views are now read-only canonical projections.
- Web Desktop PeopleApp still needs its hardcoded local fleet/schedule fixtures reconciled with the canonical read models. Continue auditing every app for local stores, synthetic metrics and unpersisted controls.
- Continue the remaining Garden/Web Desktop modules through real CRUD, contract tests, browser JWT validation and cross-workspace denial. Day 1–3 remain OPEN; PR #1 remains DRAFT until acceptance gates pass.

**Continuation rule:** continue in `Amdkn/Business-Marketplace`, branch `foundation/marketplace-product-identity`, linked Supabase project `swegnrvaxxgfrnshdpxx`. Do not return to V5 for Marketplace code, do not recreate OMK namespaces, do not seed fake tenants/agents/business data, and do not claim E2E acceptance from SQL-only tests.


### 13.36 Agent delegation scope and workspace FK index closure — 2026-11-26

- Hosted migration `20261126094200_agent_workspace_delegation_scope` permits canonical `WORKSPACE` agent delegations and validates that a delegation targets an active workspace in the same organization. Its source is tracked at `supabase/migrations/20261126094200_agent_workspace_delegation_scope.sql`.
- Hosted migration `20261126094206_workspace_data_fk_indexes` adds a supporting leading-column index for every `workspace_data` foreign key not already covered. Its source is tracked at `supabase/migrations/20261126094206_workspace_data_fk_indexes.sql`.
- Re-ran the foreign-key coverage query against `workspace_data`: **0 unindexed foreign keys** remain in that schema.
- Updated `marketplace_interface_persistence.sql` to enforce the zero-unindexed-FK contract.
- Re-executed all six hosted SQL suites after the new migrations and Edge Function changes; all six passed with no exceptions.
- The broader Supabase Performance Advisor still reports unindexed foreign keys outside `workspace_data`; these are not part of the Garden/Web Desktop persistence layer and remain a separate schema-by-schema review.



### 13.37 Agent and member read model deployment — 2026-11-26

- Garden People and AI Agents are now separate projections: human memberships are read through `list_workspace_members`; AI principals are read through `list_workspace_agents` and only when actively delegated to the selected workspace.
- Both actions are served by the JWT-verified `marketplace-api` Edge Function. Latest deployment: **ACTIVE v26**, `verify_jwt=true`. The v26 update adds the delegation ID to the agent projection.
- Garden `agentsRepo` no longer treats `workspace_data.people_agents` as the canonical agent identity source. It maps the canonical `identity.agent_principals` + `identity.agent_delegations` projection. `membersRepo` maps active human workspace memberships and profile display names.
- The People and People/Agents screens are now read-only canonical views; invitation acceptance and agent provisioning/configuration UI remain separate next work. No member or agent was created by this change.


### 13.35 People & Agents canonical identity, workspace delegation and persisted Cadence — 2026-11-26

**Canonical assignment model**
- Confirmed that `identity.agent_delegations` is already the correct workspace-assignment relation: `scope_type='WORKSPACE'` and `scope_id=enterprise.workspaces.id`. A second agent identity or assignment registry is not required.
- Found and corrected a schema/API mismatch: the hosted `agent_delegations` scope check rejected WORKSPACE even though the API, workspace-agent list and mission guard already expected it.
- Added `supabase/migrations/20261126094200_agent_workspace_delegation_scope.sql` (hosted migration ledger name `agent_workspace_delegation_scope`, version `20261126094200`). It permits WORKSPACE scope, enforces a non-null scope ID for workspace-level delegations, adds the active-workspace lookup index, and validates that a WORKSPACE delegation targets an ACTIVE workspace in the same organization.
- Migration is applied to the connected Marketplace Supabase project. The identity tables remain private: RLS is enabled and authenticated clients still have no direct SELECT grants.

**Marketplace API**
- Updated `register_agent`: validates agent key/class/runtime/scope/permission-code shape, requires an active organization role, and for WORKSPACE scope verifies the caller's active membership in the exact organization/workspace before inserting the canonical principal and delegation in one transaction.
- Updated `list_workspace_agents`: returns canonical principals only when an active, in-window WORKSPACE delegation exists; includes the delegation ID and permission codes. It does not query `workspace_data.people_agents`.
- Added `revoke_agent_delegation`: requires organization authority plus active workspace membership and revokes only the matching active workspace delegation. The principal remains in the organization identity registry.
- Cleaned a duplicate response alias in the workspace-agent query.
- Deployed `marketplace-api` to Supabase as **version 28**, status ACTIVE, `verify_jwt=true`. Retrieved the deployed source and verified the register/revoke handlers, workspace-membership guard and single delegation response alias are present.

**Garden and Mission Control**
- `src/components/saas/views/AgentRootView.tsx` now provides the canonical agent directory, registration form and workspace-delegation revocation control. It does not derive runtime metrics from status or row index.
- `AgentsView.tsx`, `PeopleAgentsView.tsx` and Mission Control `MissionAgentsView.tsx` now share this same directory implementation.
- Garden `agents.repo.ts` uses the authenticated Marketplace API projection; it no longer maps agent identity to `workspace_data.people_agents`.
- Garden `PeopleView.tsx` already resolves human identities through `identity.profiles` and workspace memberships via the API.
- Removed the generic Garden `agents → people_agents` repository mapping and the CMS `people_agents` / `team` mappings so the old workspace tables cannot silently become competing identity registries.

**Web Desktop People**
- `src/apps/people/people.repo.ts` now resolves the signed-in user's unique workspace context, lists canonical workspace members and delegated agents through Marketplace API, and reads/writes planned missions in `workspace_data.missions`.
- `PeopleApp.tsx` Team now displays canonical active human workspace memberships; Agents displays canonical principals and workspace delegations; Cadence loads persisted missions and supports create/delete. The schedule grid visualizes planned mission density, not runtime activity.
- A scheduled mission stores day/hour/kind metadata in `workspace_data.missions.extra_data` and uses `agent_principal_id` when assigned. The existing composite FK and active-delegation trigger enforce organization consistency and current authority.
- Mission Control `MissionScheduleView.tsx` now reads the same persisted schedule source; it no longer assigns day/hour buckets from `updated_at`.
- Mission Control `MissionAgentsView.tsx` now shares the canonical directory; the old synthetic Hermes load, latency, token, task, model and fleet-share calculations are no longer used by that route.
- Removed the fictional `people_agents` and `team` seed registries from `src/apps/people/seed.ts`. Their legacy database tables are retained untouched for compatibility; no rows were migrated or deleted.

**Validation performed**
- Applied hosted migration `20261126094200_agent_workspace_delegation_scope`; verified its constraints and trigger through PostgreSQL metadata.
- Added `supabase/tests/agent_workspace_delegation.sql` and executed its assertions against the hosted project. It passed without exceptions. Assertions cover WORKSPACE scope shape, active-workspace guard, mission-to-agent FK, mission delegation guard, missions RLS, private identity grants and authenticated mission CRUD grants.
- Ran a rollback-only SQL integration transaction that inserted a temporary canonical principal, a WORKSPACE delegation and an assigned mission, then rolled back. Follow-up counts confirmed 0 persisted test principals, delegations or missions.
- Verified `workspace_data.missions` RLS: active workspace members may read; `identity.can_manage_workspace` gates insert/update/delete; insert additionally binds `created_by_user_id=auth.uid()`.
- Verified `marketplace-api` deployed version 28 with JWT verification enabled.

**Not yet validated / acceptance boundary**
- No browser-authenticated session/JWT was available to run the real Garden or Web Desktop create/list/revoke mission CRUD flows or cross-workspace denial in the UI.
- No local TypeScript typecheck, Vitest suite, Vite production build, Playwright/browser smoke test or frontend deployment was run after these changes.
- Supabase Edge Function deployment succeeded; this does not by itself prove the authenticated browser workflows.
- Permission codes are currently shape-validated by the API and stored as delegation metadata; a centrally governed permission-code catalogue/semantic validator remains future hardening. Do not claim arbitrary permission codes are backed by executable capability policies.
- The old `workspace_data.people_agents` and `workspace_data.team` tables remain in the schema as compatibility artifacts. The active People UI and repositories no longer use them as identity sources.

**Current acceptance**
- Canonical identity + workspace delegation database contract: structurally verified.
- Persisted mission assignment contract: structurally and rollback-integration verified.
- Garden/Web Desktop UI wiring: implemented, not browser-E2E accepted.
- Day 1–3 remain OPEN; PR #1 remains DRAFT until frontend CI/build and authenticated browser CRUD/cross-workspace tests pass.


### 13.36 Preview deployment quota gate — 2026-11-26

- Inspected the Vercel project linked to `Amdkn/Business-Marketplace`: project `business-marketplace`, Vite, team `team_d3JjRK4fJUE9ACohbdlhv9Gc`, project ID `prj_82qsF3EPY75T4hpC19JFJ4ApZ6zL`.
- Queried the exact working branch and commit `058abafc1744d62c20d149aa0a070fc933cbc6d0`: no Vercel preview deployment exists for this commit.
- Attempted a preview deployment from that exact Git source and target project. Vercel rejected deployment creation with HTTP 402 `api-deployments-free-per-day`, message: resource limit exceeded (more than 100 deployments; retry after 86400 seconds). No deployment was created.
- GitHub combined status on this head still reports the Vercel context as failure with target `build-rate-limit`; this is a platform quota signal, not a verified application build failure. No GitHub Actions workflow run was returned for this commit.
- Do not retry the deployment API until the 24-hour quota window resets or the team resolves its Vercel deployment allowance. No plan, billing or team security settings were changed.
- PR #1 remains OPEN / DRAFT and mergeable. Do not mark frontend deployment or Day 1–3 E2E acceptance complete.


### 13.38 Canonical agent provisioning, active-delegation integrity and People UI closure — 2026-11-26

This checkpoint supersedes the earlier v28/read-only descriptions in sections 13.35–13.37.

**Canonical identity and provisioning**
- identity.agent_principals remains the single canonical AI-agent identity registry. A stable (organization_id, agent_key) identifies one principal across workspaces.
- register_agent is now idempotent for an existing ACTIVE principal: it upserts principal metadata, expires stale scope delegations, and updates an existing active delegation or creates one for the requested organization/workspace scope. It no longer attempts to create a second principal when the same agent key is assigned to another workspace.
- Added unique partial index identity.agent_delegations_one_active_scope_uidx to enforce at most one ACTIVE, non-revoked delegation per principal and scope. It includes organization/workspace/area/etc. scope identity and handles organization scope with a null-safe key.
- revoke_agent_delegation remains scoped to the exact workspace delegation; revocation does not delete the canonical principal.

**Hosted migration and mission integrity**
- Hosted migration ledger row is version 20261126101352, name 20261126103000_agent_assignment_integrity. The source file is reconciled to supabase/migrations/20261126101352_20261126103000_agent_assignment_integrity.sql. The migration was applied once; filename reconciliation did not replay it.
- The migration adds the unique active-scope delegation index and strengthens workspace_data.validate_mission_agent_delegation(): a mission assignment now requires both an ACTIVE canonical principal and an ACTIVE, in-window, non-revoked WORKSPACE delegation matching the mission's organization and workspace.
- The trigger function remains SECURITY DEFINER with a pinned search_path; direct EXECUTE is revoked from PUBLIC, anon and authenticated. The browser continues to use RLS-protected workspace_data.missions, not direct identity-table access.
- workspace_data.missions RLS remains: active workspace membership for read; identity.can_manage_workspace for writes; INSERT also binds created_by_user_id=auth.uid(). The assignment trigger adds the agent-authority check that the row policy alone does not express.

**Marketplace API deployment**
- Updated supabase/functions/marketplace-api/index.ts with idempotent canonical principal/delegation registration.
- Deployed marketplace-api as ACTIVE v29, verify_jwt=true. The deployed function inventory reports v29 after deployment.
- API action contracts present in source: list_workspace_members, list_workspace_agents, register_agent and revoke_agent_delegation. The list endpoints are workspace-scoped; identity tables remain private and are not granted broad browser access.

**Garden and Web Desktop People**
- Garden agents.repo.ts now fails closed when Supabase is unconfigured instead of returning an empty array that could be mistaken for a genuinely empty directory.
- Garden AgentRootView provides canonical workspace agent listing, registration/upsert, and delegation revocation. Registration/revocation buttons serialize submissions. Runtime metrics remain explicitly unavailable; no load, latency, success rate, token count or task count is fabricated.
- Web Desktop people.repo.ts reads human workspace memberships and canonical workspace-agent projections from the Marketplace API and performs workspace-scoped list/create/delete against workspace_data.missions.
- Web Desktop PeopleApp.tsx Team is sourced from active human workspace memberships; Agents/Squads use canonical workspace delegations; Cadence reads persisted missions and supports creation/deletion. The agent filter and assignment selector use principal IDs, and only ACTIVE principals can be newly assigned.
- Overview labels now describe workspace governance and planned missions, not live standup or runtime telemetry. The schedule grid represents persisted planned mission density only.
- ApprovalsView.tsx now populates agent options from ACTIVE canonical workspace delegations rather than the old hardcoded fleet/CMS people_agents fixtures. Its scenario/proposal drafts remain browser-local (Zustand/localStorage); approved/rejected decision records are written to the workspace approval_decisions collection. This is explicitly disclosed in the UI and is not yet a durable server-side proposal queue.

**Verification performed against the hosted project**
- Verified hosted ledger version 20261126101352 / name 20261126103000_agent_assignment_integrity. No second apply was performed during filename reconciliation.
- Re-executed supabase/tests/marketplace_interface_persistence.sql after the migration; the assertion block returned no exception.
- Ran a rollback-only authenticated SQL integration transaction using the real tenant's B1_CEO user: inserted a temporary ACTIVE principal + WORKSPACE delegation, switched to PostgreSQL role authenticated with the real JWT subject, inserted an assigned mission through workspace_data.missions, and observed it in the authenticated SELECT (1 row). Transaction rolled back.
- Ran a rollback-only negative test: a SUSPENDED principal with an otherwise active workspace delegation was rejected by the mission trigger.
- Ran a rollback-only uniqueness test: a second ACTIVE delegation for the same principal/scope was rejected by the unique index.
- Follow-up hosted counts remain 0 agent principals / 0 agent delegations / 0 missions. No tenant sample data was left behind.
- The deployed Edge Function inventory reports marketplace-api ACTIVE v29, JWT verification enabled.

**Acceptance boundary / unresolved**
- No authenticated browser session/JWT was available to invoke the Edge actions from Garden/Web Desktop. The SQL transaction validates the mission RLS/trigger path under the authenticated database role, but it is not a browser E2E.
- The Edge Function log query returned no matching invocation rows in the checked window; do not claim the new register/list/revoke HTTP flows were live-tested.
- TypeScript typecheck, Vitest, Vite production build, Playwright/browser smoke test and frontend deployment were not run in this session. The remote Desktop Commander device was offline, so there was no local checkout available for npm run verify.
- Latest code change commit: fd6c45673857b6d5d2e22b022087905a3ab34760 — migration source filename reconciliation after confirming hosted ledger version 20261126101352. The current handoff update is committed separately.
- GitHub combined status still reports Vercel failure with target build-rate-limit; this is the known deployment quota gate, not evidence of a source compilation error. No GitHub Actions workflow run was returned for this commit.
- PR #1 remains OPEN / DRAFT. Day 1–3 remain OPEN until frontend typecheck/build and authenticated browser CRUD plus cross-workspace denial are verified.
- The current SQL security advisor also reports RLS-enabled/no-policy INFO findings across private schemas and leaked-password protection disabled (WARN). Review those as a separate platform-hardening task; do not add broad authenticated grants merely to silence the private-schema INFO findings.

**Continuation rule:** stay in Amdkn/Business-Marketplace, branch foundation/marketplace-product-identity, Supabase project swegnrvaxxgfrnshdpxx. Next work is (1) complete browser-authenticated API and cross-workspace tests when a browser JWT is available, (2) execute frontend typecheck/Vitest/build when a local checkout or CI runner is available, (3) continue the same source-backed CRUD audit across the remaining Business departments. Do not seed fake agents or claim live runtime telemetry.

### 13.39 Workspace-backed Operations queue, strict CMS writes and Finance invoice path — 2026-11-26

**CMS persistence contract**
- Added strict repository operations upsertItemRequired and removeItemRequired. These reject when Supabase is not configured; they cannot silently report a local-only no-op as cloud persistence.
- Added updateItemPersisted, addItemPersisted and removeItemPersisted store actions. They publish the changed in-memory projection only after the repository confirms the cloud write/delete.
- Legacy local/demo CRUD no longer sends TENANT_DEMO_COACH records to the authenticated production workspace. Demo rows remain local to the demo tenant.
- This does not convert every legacy form in every app to strict persistence. Remaining direct updateItem / addItem call sites still require a domain-by-domain audit.

**Finance**
- Finance invoice creation now requires an existing client from the active workspace, a positive amount and an ISO 4217 currency code.
- Real-tenant invoice creation uses addItemPersisted; the UI only reports persistence after the write succeeds. Demo invoice creation remains local and is labeled as demo.
- Invoice mapping now includes client_id, currency, issued_at, due_at and paid_at; the hosted workspace_data.invoices columns were checked and match those fields.
- Amounts are displayed by currency. The UI does not sum mixed currencies or synthesize MRR, burn or cash runway.
- Payment settlement is explicitly unavailable until a real payment provider and finance-ledger workflow are connected. No payment, refund or payout was created.

**Operations domain — missing persistence source repaired**
- The existing Operations UI already used strict persistence actions for alerts and changes, but the CMS repository had no persistent mapping for either collection. Consequently, these forms could never persist in a real tenant.
- Added repository table aliases:
  - CMS alerts → workspace_data.incidents (typed incident columns plus JSONB extra data for alert metadata).
  - CMS changes → workspace_data.change_requests.
- tableFor, hydration, upsert and delete now honor collection-to-table aliases. Existing incidents and alerts views share the same incident source rather than creating duplicate alert registries.
- Operations alert creation now persists an incident with enrichment='raw', an explicit open status, no fabricated risk score and no fabricated trace. Starting triage updates the persisted status; it does not falsely claim that runtime enrichment happened.
- Change proposals are stored as workspace-scoped change_requests. Approval/rejection records the actor and timestamp through the database trigger; immutable ID, organization, workspace, creator and creation timestamp are protected by that trigger.

**Hosted migrations**
- Applied migration ledger version 20261126104549, name 20261126105000_operations_change_requests:
  - creates workspace_data.change_requests;
  - composite FK (workspace_id, organization_id) → enterprise.workspaces(id, organization_id);
  - status/risk/decision-state checks, JSON object constraint and workspace/status index;
  - RLS enabled with four policies: active workspace member read; can_manage_workspace insert/update/delete; insert binds created_by_user_id=auth.uid();
  - authenticated CRUD grants only; no anon grants;
  - update trigger pins tenant/creator identity and updates timestamps.
- Applied migration ledger version 20261126104707, name 20261126105500_change_request_decision_audit: approval/rejection transitions set decided_at and decided_by_user_id=auth.uid(); proposed/withdrawn states clear decision fields.
- Applied migration ledger version 20261126104811, name 20261126110000_change_request_fk_indexes: indexes for creator, decision actor and composite workspace/org FK.
- Source migrations committed:
  - supabase/migrations/20261126104549_20261126105000_operations_change_requests.sql
  - supabase/migrations/20261126104707_20261126105500_change_request_decision_audit.sql
  - supabase/migrations/20261126104811_20261126110000_change_request_fk_indexes.sql
- Added supabase/tests/operations_change_requests.sql. Executed against the hosted project; the structural assertion block returned no exception. It verifies RLS, four policies, authenticated CRUD grants, absence of anon grants, composite workspace/org FK, decision-state constraint, pinned trigger search_path, revoked direct trigger-function execution and required indexes.

**Verification performed**
- Hosted metadata confirms workspace_data.change_requests: RLS enabled, four policies, authenticated SELECT/INSERT/UPDATE/DELETE grants, no anonymous table grants, zero persisted rows.
- Ran a rollback-only authenticated SQL integration transaction using the real tenant OWNER identity: inserted a proposal, updated it to approved, and verified decided_by_user_id=auth.uid() plus non-null decided_at. A follow-up count confirmed zero persisted rollback-test rows.
- Rechecked the invoice schema: client_id, currency, issued_at, due_at and paid_at exist with compatible types. Workspace data counts for clients, deals, invoices, people_agents and missions were zero at the last check; no sample business data was created.
- Re-ran Supabase security/performance advisors. The new change_requests table did not introduce an RLS-without-policy finding. Advisor output still includes existing INFO findings for private schemas/tables intentionally closed by RLS with no browser policies, plus the existing leaked-password-protection WARN. Performance findings include many pre-existing unused/unindexed-FK indexes; the new change_requests FK indexes were added.
- The Operations table-alias path and Finance UI source were inspected after the edits. No authenticated browser CRUD test was available.

**Acceptance boundary**
- The SQL test verifies the hosted table contract and an authenticated database-role insert/update path. It does not prove the React UI, Supabase JS schema exposure or cross-workspace browser denial.
- TypeScript, Vitest, Vite build and browser E2E remain NOT RUN. The linked Desktop Commander device is offline, so no local checkout/test runner was available.
- Latest observed GitHub status for commit 21224c77d869d0726d18a614aa3b20ad4df9acf4 remains Vercel build-rate-limit; no GitHub Actions workflow run was returned. This quota signal is not a source build result. No new Vercel deployment attempt was made.
- PR #1 remains OPEN / DRAFT. Day 1–3 remain OPEN pending frontend CI/build and authenticated browser CRUD/cross-workspace acceptance.

**Next continuation**
1. Finish the source-backed CRUD conversion for remaining Operations screens and audit Sales, Product, Growth, Legal and all other Business departments for legacy best-effort mutations or collections without a canonical table.
2. Complete a CMS collection-to-workspace_data schema compatibility test for every mapped collection, including aliases.
3. Run frontend typecheck/Vitest/build and authenticated browser tests when a local runner and browser session are available; do not wait on Vercel quota to continue source/database work.

### 13.40 Sales client/deal/invoice integrity and currency-safe commercial flows — 2026-11-26

**Client records**
- Added nullable workspace_data.clients.currency with ISO 4217 format check. Existing records can remain currency-unknown; new ClientsApp entries require an explicit currency whenever a monthly ticket is entered.
- ClientsApp no longer pre-fills a USD 1,800 ticket or assumes USD. It no longer assigns a fabricated 100% health score to a newly created client; health remains unknown until measured.
- Client ticket values render with Intl.NumberFormat only when a valid currency code is present; otherwise the UI explicitly says currency not set.
- Migration ledger version 20261126110342, name 20261126112000_client_ticket_currency.
- Source: supabase/migrations/20261126110342_20261126112000_client_ticket_currency.sql.

**Sales deals**
- Added workspace_data.deals.client_id and currency.
- Composite FK (organization_id, workspace_id, client_id) → workspace_data.clients(organization_id, workspace_id, id) prevents linking a deal to a client from another organization/workspace.
- ISO 4217 check permits unknown legacy currency but rejects malformed supplied codes. Added client relation index.
- Sales Kanban creation now selects an existing workspace client, requires a positive amount and explicit ISO currency, and removes the prefilled USD 1,800 assumption.
- Sales Kanban and Today detail routes carry clientId, currency and numeric amount into the deal dossier. Amounts are formatted by their actual currency; no dollar symbol is assumed.
- SalesItemDetail no longer invents a stage-derived win probability. Probability and weighted forecast show Not reported unless a probability value is explicitly persisted.
- Migration ledger version 20261126105452, name 20261126110500_sales_deal_client_currency.
- Source: supabase/migrations/20261126105452_20261126110500_sales_deal_client_currency.sql.
- Test: supabase/tests/sales_deal_client_currency.sql executed against the hosted project without exception.

**Deal-linked invoices and idempotency**
- Added workspace_data.invoices.deal_id and source_key.
- Added composite deal FK (organization_id, workspace_id, deal_id) → workspace_data.deals(organization_id, workspace_id, id).
- Added unique partial index on (organization_id, workspace_id, source_key), plus deal lookup index. The source key used by the Sales UI is deal:<deal-id>:full, preventing duplicate full-deal invoice generation even if the action is submitted twice.
- Added BEFORE INSERT/UPDATE trigger enforcing that an invoice linked to a deal must use that deal's client_id. The trigger is search_path-pinned and not directly executable by client roles.
- Both Sales detail entry points now create invoices only for an existing linked workspace client, require a valid deal currency, use strict CMS persistence, and use the same idempotency key. They no longer create duplicate clients or describe invoice creation as payment capture / Mark Paid.
- Migration ledger version 20261126110128, name 20261126111500_invoice_deal_source_idempotency.
- Migration ledger version 20261126110518, name 20261126112500_invoice_deal_client_consistency.
- Sources:
  - supabase/migrations/20261126110128_20261126111500_invoice_deal_source_idempotency.sql
  - supabase/migrations/20261126110518_20261126112500_invoice_deal_client_consistency.sql
- Test: supabase/tests/sales_deal_invoice_link.sql executed against the hosted project without exception.

**Authenticated rollback integration checks**
- Using the actual active workspace OWNER identity under the authenticated database role, created a temporary client, deal and invoice in one transaction; verified the invoice linked to the same workspace client and deal.
- A second insert with the same source_key was rejected by the unique index; the transaction observed exactly one invoice for the deal.
- A separate transaction attempted to invoice a deal against a different client in the same workspace; the invoice/deal consistency trigger rejected it with check_violation.
- Both transactions were rolled back. Follow-up counts confirmed zero test clients, deals and invoices remain.
- After the rollback tests, the hosted workspace counts remain: clients=0, deals=0, invoices=0, incidents=0, change_requests=0. No fake business records were left behind.

**CMS mapping compatibility sweep**
- Parsed the active CMS repository map against information_schema.columns for workspace_data.
- All 34 mapped collections resolve to an existing workspace_data table (including aliases alerts → incidents and changes → change_requests); every mapped table has the generic title and extra_data columns needed by the mapper.
- The only app-specific fields without dedicated SQL columns are the alert enrichment/source/riskScore/hypothesis/trace/status fields (and the alerts extraFields bundle); these are intentionally preserved in extra_data. No mapped collection points at a missing table.
- documents, legal_documents, missions, people_agents, team and activity_events are handled through dedicated repositories rather than the generic CMS collection map.

**Verification and boundaries**
- Re-ran operations_change_requests.sql, sales_deal_client_currency.sql and sales_deal_invoice_link.sql; each structural assertion block returned no exception.
- Supabase security advisor produced no new finding for the touched clients/deals/invoices/incidents/change_requests tables. Performance advisor reported no missing new FK indexes for these additions; it reports unused indexes on empty workspace tables, expected while this tenant contains no business rows. Existing dashboard-schema findings and leaked-password-protection warning remain outside this change set.
- These are hosted SQL/schema and rollback integration checks, not React/browser E2E. TypeScript, Vitest and Vite build remain NOT RUN because the connected Desktop Commander device is offline and Vercel is still at build-rate-limit.
- Latest observed code commit: 2974097e95b69dc80fbaaee5e9109914c9aca424. Its only returned status is Vercel build-rate-limit; GitHub Actions returned no workflow run. No Vercel deployment attempt was made.
- PR #1 remains OPEN / DRAFT. Day 1–3 remain OPEN until frontend CI/build and authenticated browser CRUD/cross-workspace acceptance are completed.

**Next continuation**
1. Continue auditing and converting the remaining business app forms to strict persisted CRUD; specifically inspect any Garden or secondary entry point that can create/update deals, invoices or clients outside the primary Sales/Finance apps.
2. Add browser tests for the authenticated workspace flow: client → deal → invoice, duplicate source_key rejection, and cross-workspace FK/RLS denial.
3. Finish the full UI/TypeScript test run when a local runner is available. Continue source/database work independently of Vercel quota.


### 13.41 Business UI strict-write sweep, Garden mission board integrity and authenticated tenant-isolation checks — 2026-11-26

**Business UI write-path sweep**
- Converted the remaining high-value business UI mutations to the strict persisted CMS actions. These paths now wait for the workspace repository response before changing the visible Zustand projection or showing a success toast:
  - Tasks: create, completion toggle and delete.
  - Clients: create, with a required name and positive ticket value; no synthetic health score or default USD assumption.
  - Product: roadmap stage transitions and MVP creation.
  - Growth: acquisition-channel and partnership creation, acquisition verdict changes and partnership state changes.
  - Operations: incident/alert creation, triage-state update, change-request creation and approve/reject decisions.
  - Legal: AI Act check transitions and Legal document status updates.
  - Sales: both deal-detail invoice entry points use strict persistence, workspace client linkage, deal linkage and the shared idempotency source key.
  - Finance: production invoice creation uses strict persistence; the legacy local addItem path is gated to the explicit memory-only Coach demo tenant.
  - Existing strict paths were also reviewed in Settings, Audit, Marketplace, IT/R&D and Dashboard. Their mutations use persisted store actions; no production success path was intentionally left on the best-effort local mutation API in the files inspected.
- The generic CMS invoice mapper now round-trips clientId, currency, issuedAt, dueAt and paidAt through the dedicated typed invoice columns, rather than duplicating those values into extra_data. Legacy tenant/ownership/audit keys are stripped from extra_data hydration and excluded from writes.
- No seed agents, fake client records, fake deals, simulated invoice payments, invented runtime metrics or demo telemetry were added.

**Garden Mission Control**
- Repaired MissionTasksView drag-and-drop persistence. Same-column reordering now persists every affected position, not just the dragged mission. Cross-column moves persist both status and destination position.
- Removed swallowed persistence errors. The board updates only after successful writes; on failure it reloads the canonical workspace list and displays the failure instead of silently keeping a false local state.
- Reordering uses the complete persisted source column even when search/priority filters hide some cards, avoiding duplicate/colliding positions.
- The Garden MissionTasks board and Web Desktop People → Cadence both use workspace_data.missions. Garden's generic mission repository and People’s schedule projection are separate views over the same tenant-scoped table; schedule metadata remains in extra_data and agent assignment uses the canonical agent_principal_id FK.

**Hosted authenticated SQL verification**
- Re-ran these repository test files against the connected Marketplace project; each returned without exception:
  - supabase/tests/marketplace_interface_persistence.sql
  - supabase/tests/operations_change_requests.sql
  - supabase/tests/sales_deal_client_currency.sql
  - supabase/tests/sales_deal_invoice_link.sql
  - supabase/tests/agent_workspace_delegation.sql
- Ran an additional rollback-only integration transaction as the actual active workspace OWNER under PostgreSQL role authenticated (JWT subject set to the real signed-in user). It inserted, updated, asserted and deleted temporary records for tasks, deals, incidents/alerts, change_requests, product_items, product_mvps, growth_acquisition and growth_partenariats. All assertions passed; the transaction rolled back.
- Ran a rollback-only authenticated mission test: create, status update, read assertion and delete on workspace_data.missions. It passed and rolled back.
- Ran a rollback-only cross-workspace denial test inside the same organization: created a second workspace with no membership for the signed-in user, inserted one row as the database owner, then verified that the authenticated user could not SELECT that row and could not INSERT into that workspace. Both denial assertions passed.
- Ran the equivalent cross-organization isolation check using a temporary second organization/workspace with no membership. Authenticated SELECT returned no row and INSERT was denied.
- Follow-up counts for all temporary e2e-* rows in tasks, deals, incidents, change_requests, product_items, product_mvps, growth_acquisition, growth_partenariats and missions are zero. All test transactions rolled back; no test records remain.
- These checks exercise Postgres RLS, constraints and triggers with the authenticated role. They are not a browser/JWT E2E test of the React/Supabase-JS client.

**Deployed API and hosted migration state**
- marketplace-api remains ACTIVE v29 with verify_jwt=true.
- Retrieved the deployed Edge Function source and compared its index.ts byte-for-byte with supabase/functions/marketplace-api/index.ts on the working branch: exact match (70,468 characters). The deployed version includes list_workspace_agents, list_workspace_members, register_agent and revoke_agent_delegation.
- Hosted migration ledger remains through version 20261126112710 / remaining_workspace_cms_collections. The interface persistence structural test passes against that hosted schema; no additional migration was required for this tranche.
- Canonical agent identity and delegation remain in identity.agent_principals / identity.agent_delegations. The browser continues to use the narrow authenticated Marketplace API projection rather than direct grants on identity tables.

**CI, deployment and acceptance boundary**
- Latest code commit: f22846810c74fb62c973b8a5d73111d572f390d8 — Garden mission positions remain consistent when the board is filtered.
- GitHub Actions API reports 0 workflow runs for foundation/marketplace-product-identity. GitHub combined status still contains only the Vercel failure target build-rate-limit; this is the known deployment quota signal, not a verified source build failure.
- The linked Desktop Commander device Amd-PC remains OFFLINE. npm ci, npm run typecheck, npm test, npm run build and Playwright/browser E2E were not run. Do not claim TypeScript/build success.
- No new Vercel deployment was attempted. PR #1 remains OPEN / DRAFT and mergeable. Day 1–3 remain OPEN until frontend CI/typecheck/build and authenticated browser acceptance are complete.
- The remaining external blocker is a live authenticated browser session for UI CRUD and real API invocations. SQL-level RLS and cross-workspace denial have now been verified independently.

**Continuation**
1. Continue the source-backed collection/schema sweep for any newly added app surface; keep all production mutations on strict persisted actions.
2. Run the complete frontend verification (npm ci, npm run typecheck, npm test, npm run build) as soon as the local checkout/runner is available. Investigate actual compiler/test failures; do not conflate them with Vercel's build-rate-limit context.
3. Complete browser-authenticated CRUD against Garden and Web Desktop, including live Edge Function list/register/revoke calls and UI refresh behavior.
4. Keep PR #1 OPEN / DRAFT and Day 1–3 OPEN until those frontend/browser gates pass.


### 13.42 Garden client editing, honest execution boundaries and procedure lifecycle persistence — 2026-11-26

**Garden client detail CRUD**
- Replaced the inert Client Detail Edit toast with a real workspace-backed edit form for name, email, phone, service and status.
- Save calls clientsRepo.update and only updates the rendered detail after the repository confirms the write. Validation requires a non-empty name; failures remain visible through the error toast.
- Phone now displays the stored value rather than a placeholder.
- Removed the synthetic status-to-progress mapping (80/20/50/100%) and the resulting fake “percent complete” and “status weight” metrics. The detail now shows the actual persisted status and timestamps only.

**Garden procedure lifecycle**
- The Garden TasksView was actually a runbook/SOP queue, not a real task manager. Its old completion toggle changed React state only and was never persisted.
- Renamed the view copy to Procedure queue and changed the toggle to a real persisted SOP lifecycle transition: draft → archived and archived → draft, through sopsRepo.update.
- The procedure list updates only after the workspace write succeeds; errors leave the prior state intact and are reported. No fake task-completion metric is shown.
- SOPLibraryView still supports persisted SOP creation and editing. Its Execute affordance now explicitly reports that no runbook execution engine or agent runtime is connected; it no longer claims that a workflow run started or that agents were notified.

**Documents / e-sign boundary**
- DocumentsView previously displayed a success toast claiming a signature request had been sent despite having no e-sign provider integration.
- The confirmation now explicitly reports that no request was sent, the dialog identifies the unavailable integration, and the action no longer promises delivery. No fake signature request or signing event is recorded.

**Authenticated SQL checks**
- Ran a rollback-only authenticated transaction against the actual active workspace OWNER identity:
  - created and updated a client row, including typed title/status plus email, phone and service in extra_data;
  - created and archived a runbook by updating its extra_data status.
- Both assertions passed under the authenticated database role. The transaction rolled back; no e2e-client-edit or e2e-runbook row remains.
- These checks validate the workspace SQL path and mapper storage contract, not a browser interaction test.

**Acceptance boundary**
- Latest code commit: c7634a7a065fd88d1cc8b46f2d92e554e7e1bf42 — Garden SOP cards label the unavailable runtime affordance as Execution status, not Execute.
- PR #1 remains OPEN / DRAFT and mergeable. No new migration or Edge Function deployment was required.
- The Desktop Commander device remains OFFLINE; TypeScript, Vitest, Vite build and browser E2E remain NOT RUN. GitHub Actions still reports no workflow runs for the branch, and the Vercel status remains the external build-rate-limit failure.
- Day 1–3 remain OPEN. Do not mark frontend acceptance complete until the app is compiled and browser-authenticated CRUD is exercised.

**Continuation**
1. Keep auditing Garden detail and secondary entry points for inert buttons or success messages without a durable backend operation.
2. When the local runner is available, run the complete frontend verification and fix any actual compiler/test failures.
3. When an authenticated browser session is available, verify the Garden client edit, SOP archive/restore, document integration unavailable state, People cadence and agent API flows end to end.



### 13.43 Frontend build triage and Garden secondary-action integrity — 2026-11-26

**Vercel project and build evidence**
- Resolved the Vercel project directly: project `business-marketplace` (`prj_82qsF3EPY75T4hpC19JFJ4ApZ6zL`), linked to `Amdkn/Business-Marketplace` and the working branch. The earlier repository-filtered project lookup returned no rows, but the project exists under the connected team.
- Inspected the latest pre-fix deployment `b30ce6074fe68d674f9ea78ccb3d09b8c69fb852`. It failed with a real TypeScript parser error in `src/components/saas/views/SettingsView.tsx`: the company default used an unescaped apostrophe (`'A'Space Marketplace'`). Corrected to a double-quoted string in commit `639fc546f52f500c52b7d805514796c06a57d0de`.
- The subsequent deployment for `639fc54` passed the parser and reached `tsc -b`, which exposed eight compile errors:
  1. Three TS7053 computed-tenant-key errors in `src/lib/cms/cms.store.ts` (lines 290, 349, 413).
  2. TS2352 generic cast warning/error in the local repository create path (`src/components/saas/data/repository.ts:156`).
  3. TS2339: DashboardView referenced removed `Client.segment` instead of canonical `Client.service`.
  4. TS2322: the Sales Kanban "Other" stage projection omitted required `clientId`.
  5. TS6133: FinanceApp imported unused `CmsItem`.
  6. TS2322: Overview passed an optional navigation callback into DemoOverview's required prop.
- Fixed all eight source errors in commits `2f7bbc4`, `839e3c6`, `b776e6d`, `b84a541`, `e6f31ea` and `d4befe2`. The tenant map updates now have an explicit `Record<TenantId, Record<string, CmsItemTenant[]>>` type; the local fallback cast is explicitly double-cast through `unknown`; the remaining UI projections now match the canonical contracts.
- The Vercel deployment for `639fc54` is recorded as ERROR / `lint_or_type_error` because those eight errors were present at that commit. Subsequent source commits have not yet been built: the latest status check reports `build-rate-limit`, and no deployment was found for the newer checkpoint. Therefore the fixes are committed and source-verified, but TypeScript/build success is **NOT VERIFIED**. No Vitest or Playwright result is claimed.
- `.github/workflows/ci.yml` exists and configures push triggers for `main` and `foundation/marketplace-product-identity`, pull requests targeting `main`, and manual dispatch. `.nvmrc` exists with Node `24.12.0`. The available GitHub workflow-run lookup is limited to PR-triggered runs and returned no rows; do not infer from that response alone that no push-triggered run exists.

**Garden secondary actions and data truthfulness**
- Mission Control Content's `New Doc` control had no action handler. It is now explicitly disabled with the reason that file storage/document authoring is not connected. The misleading `Agents Writing` counter was actually counting distinct `uploadedBy` values; it is now labelled `Distinct uploaders`, and the page no longer queries the agent directory for that statistic.
- The Content empty state and header now describe a read-only workspace document register. No document, file, upload or agent activity was fabricated.
- Mission Control Docs was stale: it claimed missions were not persisted, described visual city windows as live agent work, and implied document authoring/agent writing was operational. The guide now reflects persisted workspace missions, canonical agent principals/delegations, read-only schedule projection, visual-only city representation, and the unconnected storage/runtime boundaries.
- MissionTasks had two position-integrity gaps beyond the previously recorded drag persistence: moving a mission between columns left a hole in the source column, and creating while search/priority filters were active derived the new position from the filtered list. Cross-column moves now compact both affected columns after successful writes; creation derives the next position from the complete persisted workspace column (maximum position + 1), independent of UI filters. On partial write failure, the existing error path reloads the canonical workspace list.
- These are source-level fixes. No browser-authenticated UI E2E was performed, and no test workspace or production business records were created.

**Latest source checkpoint**
- Latest code commit before this handoff update: `e19a5ebf055c2df898fefbf32a4cc4ad197b762f` — Garden mission creation allocates positions from the full workspace column.
- Additional Garden commits: `ed353c8` (Content action/counter honesty), `bc1010a` (Mission Control guide corrections), `cb26e41` (cross-column compaction).
- Supabase schema and Edge Functions were not changed in this tranche. `marketplace-api` remains ACTIVE v29 with JWT verification enabled.
- PR #1 remains OPEN / DRAFT. Day 1–3 remain OPEN. Do not accept frontend build, browser CRUD, runtime execution or the overall Days until the relevant evidence exists.

**Next continuation**
1. Re-run the branch Preview typecheck/build when Vercel build capacity is available; inspect the next compiler output rather than assuming the first eight errors were exhaustive.
2. Run `npm ci`, `npm run typecheck`, `npm run typecheck:api`, `npm test`, `npm run build` and runtime benches on an available local runner. The Amd-PC Desktop Commander device is confirmed OFFLINE (last seen 1096h ago), so these commands could not be run locally.
3. Complete authenticated browser CRUD for Client edit/delete, SOP archive/restore, mission create/reorder/status transitions, document-link behavior, and agent register/revoke. Verify UI refresh and visible failure behavior.
4. Keep PR #1 Draft and Day 1–3 OPEN until frontend CI/build and authenticated browser acceptance are demonstrated.


## 13.44 — 2026-11-26 closeout continuation: Garden, identity, activity and private files

### Repository and delivery chain
- Canonical repository: `Amdkn/Business-Marketplace`.
- Branch: `foundation/marketplace-product-identity`.
- The CI workflow now uses the canonical `bun.lock`: Bun 1.3.14, `bun install --frozen-lockfile`, app/API typechecks, Vitest, build and four runtime benches. The old `npm ci` path was removed because `package-lock.json` is stale relative to the current package dependencies.
- GitHub Actions returned no workflow runs for this branch; do not infer a passing CI result.
- Latest Vercel combined status remains **failure: build-rate-limit**. No current frontend build, preview or browser acceptance is certified.
- Amd-PC Desktop Commander remains OFFLINE (last seen approximately 1096 hours ago). No local npm/Bun/typecheck/build/browser execution was possible.

### Supabase source-of-truth reconciliation
- Live migration ledger: **68 applied entries**; repository executable migration directory: **68 matching SQL sources**.
- Twenty older/unapplied migration files (19 Coach OS-era plus one duplicate Finance foundation file) were moved out of `supabase/migrations/` and preserved in `supabase/archive/legacy-unapplied-migrations/`. The CLI migration directory now mirrors the applied Marketplace ledger; archive files are not pending migrations.
- Historical migration `20261126041718_revoke_public_execution_rls_auto_enable` remains a catalog-derived reconstruction, not a byte-identical recovery of the original SQL.
- Live application inventory: **117 tables, 117 RLS-enabled**.
- Edge Functions: `marketplace-api` v30 ACTIVE/JWT enabled; `adapter-api` v7 ACTIVE/JWT enabled; `adapter-worker` v7 ACTIVE/JWT disabled with its server-only bearer gate; `adapter-oauth-callback` v1 ACTIVE/JWT disabled with one-time OAuth state + PKCE. All four deployed sources were checked against repository source; parity passed.
- `marketplace-api` v30 now exposes authenticated `get_settings` and `update_settings`. Profile display-name writes are self-scoped; organization rename requires `requireOrgRole`; email remains Supabase Auth-managed/read-only.
- Advisor snapshot after migrations: 42 INFO RLS-enabled/no-policy notices; one WARN for leaked-password protection disabled; 63 INFO unindexed foreign keys; 272 INFO unused indexes; no Health Advisor findings. Do not add blanket policies or blindly remove/create indexes. The current Supabase management toolset does not expose the Auth configuration update needed to clear the leaked-password warning.

### Client activity timeline
- Added atomic `workspace_data.record_client_activity_event()` trigger on `workspace_data.clients` for create, update and delete.
- The trigger writes to append-only `workspace_data.activity_events`, uses `auth.uid()`, has a pinned `search_path=pg_catalog`, and is not executable directly by PUBLIC/anon/authenticated.
- Added the indexed client-event lookup and the Garden client-detail activity timeline.
- `supabase/tests/marketplace_client_activity.sql` passed under the authenticated tenant role. It exercised create → update → delete and asserted the three event types. The test transaction rolled back; no client fixture or activity event remains.

### Private document storage and Legal Data Room
- Applied `20261126130516_workspace_document_storage`.
- Created private bucket `marketplace-documents`, 10 MiB maximum, allowlist PDF/DOCX/XLSX/PPTX/PNG/JPEG/TXT/CSV.
- Object keys are tenant-scoped: `<organization UUID>/<workspace UUID>/<document UUID>/<filename>`.
- Storage RLS policies: read requires active workspace membership; upload and delete require `identity.can_manage_workspace`. The bucket is private; the UI requests five-minute signed URLs only after checking the active tenant prefix.
- Added shared storage helper, strict metadata-after-upload writes, storage cleanup on metadata failure, secure-link generation and the document-vault upload/download flow.
- Legal Data Room now supports private PDF/DOCX upload, secure file links and persisted archive/restore. It no longer shows a fabricated 100% compliance score; the assessment is explicitly “Not assessed” until evidence and an audit engine exist.
- `supabase/tests/marketplace_storage_security.sql` passed: bucket privacy/configuration, three storage policies, active workspace membership and manager authorization. No storage object was created by the test; live object count remains zero.
- E-signature remains unavailable because no e-sign provider is connected. The UI does not claim to send a signature request.

### Garden surfaces corrected
- Settings: display name and organization name now use the authenticated API; email is read-only; avatar upload remains disabled because no avatar workflow exists; Security/Integrations tabs make no false configuration claims.
- Marketplace: Garden now reads the live published-listings API. Current published listing count is zero; purchase is disabled until checkout/payment is connected.
- IT & Infrastructure: fabricated backup, database-size and API-request metrics were removed. The view now shows live Marketplace API/database health and labels unmeasured telemetry as unavailable.
- Growth: static sample leads and revenue are shown only in unauthenticated showcase mode; authenticated workspaces see an explicit empty state, not demo pipeline data.
- Operations & Knowledge: SOPs and document metadata load from their canonical repositories; “New Procedure” routes to SOP Library; document index routes to Document Vault.
- Client Detail: activity timeline reads the append-only event stream.
- Mission Chat: simulated deterministic replies and fake message history were removed. The directory remains readable; composer is disabled until a real inference/execution runtime is connected.
- Mission Docs and Sales copy now describe the actual absence of agent runtime/log ingestion.
- Audited the 31 Garden view files for enabled `<button>` elements lacking a handler or disabled state; no inert button candidate remains in that view set. Explicitly unavailable provider/runtime actions remain disabled.

### Live state and acceptance boundary
- One existing Auth user, one organization, one active organization membership, one workspace and one active workspace membership.
- 0 domain/department/holon installations; 0 agent principals/delegations; 0 tenant provider connections; 0 published listings; 0 orders.
- One Google Drive provider manifest remains DRAFT; 0 ACTIVE manifests. All 73 provider-level blueprints remain PLANNED.
- Storage buckets: 1 private Marketplace bucket; stored objects: 0. Activity events: 0 after rollback tests.
- PR #1 remains OPEN / DRAFT. Days 1–3 remain OPEN; this continuation is not a Day 1, Day 2 or Day 3 acceptance declaration.
- Still open: authenticated browser acceptance for settings/client/document flows; real signup/email confirmation and SMTP verification; browser cross-workspace denial; Google Drive OAuth round-trip and adapter runtime; provider credentials/secret references; payment checkout/capture/refund/payout E2E; e-sign provider; agent inference/execution runtime; full tenant installation and Control Tower acceptance; Vercel build/preview validation.
- Next session should first restore build-validation capacity (Vercel build quota or an enabled GitHub Actions runner), then run Bun install/typecheck/tests/build/benches and authenticated browser acceptance before closing any Day 1–3 gate.


## 13.45 — Settings persistence test and final Garden action sweep

- Added `supabase/tests/marketplace_settings_write.sql`, a rollback-only round-trip test for the exact profile upsert and organization rename targets used by `get_settings` / `update_settings`.
- The test passed. A follow-up read confirmed the pre-test profile and organization values remained unchanged; no synthetic identity or organization data was persisted.
- Re-ran the enabled-button audit after the private-storage UI changes across all 31 Garden view files. No enabled `<button>` without an `onClick`/submit handler remains in the audited set.
- Private storage and legal archive actions now have actual handlers; Marketplace purchase, e-signature and agent chat remain intentionally disabled until their external payment/e-sign/inference providers exist.
- No storage objects or client activity events were created by the SQL tests. The authenticated browser flows remain unverified because the latest Vercel build is still rate-limited and the connected Amd-PC runner is offline.


## 13.46 — Day 1 security inventory and Finance trigger ACL hardening

- Targeted RLS/grant/function inventory completed. All 117 application tables have RLS enabled. The 42 RLS-enabled/no-policy tables are confined to private blueprint/engine schemas and have no anon/authenticated table grants; no blanket policies were added.
- No anon table grants exist in the inspected application schemas. Authenticated CRUD grants are confined to workspace_data, content CMS, legacy dashboard compatibility and scoped identity profile/read access. No browser table grants exist on areas, enterprise, catalog, commerce, integration or finance engine tables.
- All inspected SECURITY DEFINER functions have pinned search_path. The intended authenticated identity helper RPCs remain the only authenticated-executable SECURITY DEFINER functions in the private engine inventory.
- Found three Finance trigger-only functions with inherited PUBLIC/anon/authenticated EXECUTE grants. Added and applied migration `20261126131444_revoke_finance_trigger_function_execute`; each function remains attached to its trigger and now reports anon=false/authenticated=false.
- Expanded `supabase/tests/marketplace_security_baseline.sql` with these ACL assertions. Security baseline and Finance ledger SQL suites passed after migration.
- Added `docs/evidence/day1-security-inventory.md` and `docs/evidence/day1-closure-matrix.md` to map the nine Day 1 scopes to concrete artifacts, tests and remaining acceptance.
- Live migration ledger/source parity is now **69/69**; legacy archive remains 20 files. Supabase advisor snapshot remains 42 INFO RLS/no-policy, one WARN leaked-password protection disabled, 63 INFO unindexed foreign keys, 272 INFO unused indexes and no Health findings.
- Day 1 remains OPEN: backup/restore drill, Auth configuration, full API/browser acceptance, complete observability and Control Tower lifecycle remain unverified. Days 2 and 3 remain OPEN.


## 13.47 — Day 2/3 engine regression, OAuth correction and frontend build recovery — 2026-11-26

### Day 2 / Day 3 closure evidence
- Added `docs/evidence/day2-closure-matrix.md` for D2.01–D2.10 and `docs/evidence/day3-closure-matrix.md` for D3.01–D3.14. Both matrices explicitly separate structural implementation from real tenant acceptance.
- Live blueprints: 8 Areas OS domains, 8 Business departments, 17 LD01 holons, 20 adapter families and 73 provider blueprints.
- Live operational counts: 0 active provider manifests, 0 tenant connections/OAuth transactions, 0 agent principals/delegations, 0 capabilities/listings, 0 orders/entitlements, 0 payment intents/refunds/payouts/journal entries, and 0 domain/department/holon/capability installations. Google Drive v1.0.0 remains DRAFT. Do not manufacture a fake tenant or provider connection.

### Installation and commerce regression suites
- Added `supabase/tests/marketplace_installation_engine.sql`: checks domain/department/holon installation idempotency, request replay key uniqueness, append-only request/event ledgers, unique active OWNER, dependency/capability validators, RLS and private browser grants. PASS.
- Added `supabase/tests/marketplace_commerce_lifecycle.sql`: checks order idempotency, buyer/seller separation, append-only order events, buyer-acceptance entitlement trigger, entitlement suspension propagation and service-role-only order API boundary. PASS.
- Re-ran 13 structural SQL suites in one batch, including both new suites. PASS. The three rollback-only integration suites (client activity, Settings persistence and Storage security) also passed separately; post-rollback counts remain zero.

### Edge Function and OAuth correction
- All four Edge Functions are ACTIVE and byte-identical to repository source: `marketplace-api` v30/JWT, `adapter-api` v8/JWT, `adapter-worker` v7/private bearer gate, `adapter-oauth-callback` v1/one-time state + PKCE.
- Found and fixed the Base64URL replacement regex in `adapter-api`: it now replaces `+` with `-`, `/` with `_` and removes padding. This affects OAuth state and PKCE challenge generation. `adapter-api` v8 is deployed with JWT verification enabled and exact source parity.
- Added Vitest vectors for special characters, padding, empty input and arbitrary byte sequences. Vitest itself remains unrun; the test is committed but awaits the full verify pipeline.

### Frontend and delivery chain
- Direct Vercel Preview deployment for commit `75a0bd09cfa76d737bd54c99d7212fd78dc4a92a` reached READY. `tsc -b` and `vite build` passed. It surfaced two additional source errors, fixed in commit `092b972`: LegalView passed `notes: null` where only string/undefined is valid; MissionTasksView dereferenced nullable `missions`.
- `bun.lock` workspace name now matches `package.json` (`@aspace/business-marketplace`).
- `vercel.json` now specifies `bun install --frozen-lockfile` and `bun run verify`, covering app/API typecheck, Vitest, Vite build and all four runtime benches.
- The READY Preview predates the latest branch commit and used the previous default build command; it is not evidence that Vitest/API typecheck/benches pass.
- New Vercel deployment creation is blocked by HTTP 402 `api-deployments-free-per-day`, retry after 24 hours. Do not retry during the quota window. The latest branch commit has no deployment.
- Vercel Preview SSO protection remains enabled. No protection weakening was performed. Authenticated browser E2E needs an authorized browser session. GitHub Actions currently shows no run for the branch; Amd-PC remains offline.

### Current acceptance status
- Day 1 remains OPEN: full browser CRUD, signup/recovery/SMTP, Auth leaked-password protection, backup/restore drill, complete observability and integrated Control Tower remain open.
- Day 2 remains OPEN: zero real provider connections, agent principals, capabilities/listings, orders, entitlements and payment-provider lifecycle.
- Day 3 remains OPEN: zero tenant structure installations; Compute, Inference, Memory and CEL are not integrated as operational cores; no live agent/workflow runtime or full Control Tower.
- PR #1 remains OPEN / DRAFT. Do not merge or accept any Day until the corresponding real tenant E2E and release gates pass.

### Next execution sequence
1. After Vercel's 24-hour deployment API quota window, deploy the latest branch commit using the new `vercel.json` full verification command; fix every Vitest/API/bench failure it exposes.
2. Use the protected preview with an authorized browser session to run authenticated identity, workspace, Garden CRUD, private Storage and cross-workspace denial tests.
3. Complete the Google OAuth callback round-trip once the real OAuth client ID/secret and callback URL are configured; then activate the reviewed Google Drive manifest and run a real provider operation.
4. Complete the PSP sandbox lifecycle with real credentials: checkout/authorization/capture/webhook/refund/payout and double-entry reconciliation.
5. Build and exercise the real tenant installation journey, ownership/dependency/capability installs, B1/B2/B3 agent runtime, Compute/Inference/Memory/CEL services, workflows and integrated Control Tower.
6. Run backup/restore, load/failure/recovery, security and release/rollback drills; only then evaluate Day 1, Day 2 and Day 3 acceptance gates.



## 13.48 — Full GitHub Actions verification passed — 2026-11-26

- Manually dispatched the repository's existing `ci.yml` workflow on branch `foundation/marketplace-product-identity` after correcting the Swarm Radar CSS tokens and the orphan CSS-variable audit.
- First run `45854165285` on commit `31e8ce1` failed in Vitest: 11 custom properties used by `.bm-shell` and `SwarmRadar` were not recognized as declarations by the audit, and SwarmRadar lacked scoped token/animation definitions.
- Corrected the audit to collect CSS declarations from local selector scopes, added `.swarm-radar` color/animation tokens and three keyframes, and attached the class to the radar SVG. Commit `155d0109b9f1416338778b55d17d232989cb6150`.
- Second run `45854802714` completed SUCCESS on `155d010`. Exact steps all passed: frozen Bun install; TypeScript app+Node; TypeScript API; Vitest (53 files / 548 tests); Vite build; kernel benchmark 27/27; bridge 20/20; adapters 39/39; RBAC 16/16. Total benchmark tests 102/102.
- This supersedes the earlier 13.47 note that Vitest was unrun. OAuth Base64URL vectors are now included in the passing Vitest suite.
- CI success does not replace authenticated browser acceptance, provider OAuth, PSP sandbox, backup/restore or real tenant lifecycle acceptance. Vercel Preview is still older than current branch because Vercel deployment creation returned HTTP 402 `api-deployments-free-per-day` (24-hour retry).
- PR #1 remains OPEN / DRAFT. No production alias was moved; the existing production domain still points at the old `main` deployment and is not being promoted from this unaccepted branch.



## 13.49 — Production-environment-safe unit tests and latest CI pass — 2026-11-26

- The first Vercel build using the new full `bun run verify` command correctly exposed a CI-vs-build environment difference: Vercel injects production Supabase environment variables during build. Six audit query tests therefore took the real Supabase read path instead of the in-memory test path (542/548 passed; two test files failed). This was a test isolation defect, not a reason to use production data in tests.
- Updated `src/lib/audit/queries.test.ts` to mock `../supabase` with `supabaseConfigured: false` and a null session. The audit query tests are now deterministic and cannot call a real tenant API merely because deployment environment variables exist.
- Also corrected the legacy Filiales matrix: the Coach OS row is now marked `Legacy · hors Marketplace`, all five rows are explicitly blueprints rather than Marketplace installations, and the page states that the live installation registry is authoritative. This removes the false `Live` / `Deployed Vercel` implication while the Marketplace has zero domain installations.
- Dispatched CI run [45855710702](https://github.com/Amdkn/Business-Marketplace/actions/runs/45855710702) on commit `a140c27ffacf94d00d315cdfa55e70803f0206c6`. It completed SUCCESS: frozen Bun install, app+Node TypeScript, API TypeScript, Vitest 53 files / 548 tests, Vite build, kernel 27/27, bridge 20/20, adapters 39/39 and RBAC 16/16 (102/102 benchmarks).
- Vercel full verify on `c60131d` failed only in the six audit query tests because of the environment mismatch above. The fix is now CI-green, but the latest branch has not been deployed: Vercel status remains HTTP 402 `build-rate-limit` / `api-deployments-free-per-day`. Do not weaken Preview SSO or promote production.
- PR #1 remains OPEN / DRAFT. Day 1, Day 2 and Day 3 acceptance remain open pending latest Preview, authenticated browser E2E, real provider/payment credentials and operational tenant lifecycle.


## 13.50 — Product portfolio truthfulness and latest full CI verification — 2026-11-26

### Latest branch verification
- Latest application commit at the start of this continuation: `dfc3554b6f35c782d23b8b7721da5a7c2264c9eb` (Product portfolio status correction).
- GitHub Actions run [45856152162](https://github.com/Amdkn/Business-Marketplace/actions/runs/45856152162) completed **SUCCESS** on that exact commit. All workflow steps passed: frozen Bun install; app + Node TypeScript; API TypeScript; Vitest (53 files / 548 tests); Vite build; kernel 27/27; bridge 20/20; adapters 39/39; RBAC 16/16. Total runtime benchmarks: **102/102**.
- The Product portfolio page now uses `legacy`, `reference` and `concept` states instead of implying that portfolio cards are live Marketplace listings. Nexus is legacy, Solaris is a reference, Orbiter is a concept; pricing is explicitly indicative and not a transaction/revenue record.
- Commit [dfc3554](https://github.com/Amdkn/Business-Marketplace/commit/dfc3554b6f35c782d23b8b7721da5a7c2264c9eb) is CI-green. This is stronger than the earlier run 45855710702 and supersedes any earlier statement that the latest branch CI was pending.

### Deployment status — separate from CI
- The combined GitHub commit status for `dfc3554` reports Vercel **failure** with target URL indicating `build-rate-limit`. This is a deployment quota failure, not a failed application build. No latest-commit Preview is verified.
- Do not retry direct Vercel deployment inside the quota window, weaken Preview SSO, change production aliases, or promote this branch to production. The existing production domain is not an acceptance environment for this branch.
- Authenticated browser acceptance remains blocked until a current protected Preview and an authorized browser session are both available.

### Evidence freshness and tenant reality
- The Day 3 matrix has been updated to reflect the full CI pass; the row remains **PARTIAL / ACCEPTANCE OPEN** because CI does not prove tenant lifecycle, browser authorization, provider execution, backup/restore or release readiness.
- The live tenant inventory documented in the current hosted README is one real Auth user, one profile, one organization, one active organization membership, one workspace and one active workspace membership. This supersedes older zero-identity snapshots elsewhere in this handoff. Do not create another identity or organization for testing.
- Operational counts remain zero for domain/department/holon installations, agent principals/delegations, provider connections/OAuth transactions, published listings/orders/payments/payouts and journal activity. The Google Drive manifest remains DRAFT; provider and agent blueprints are not executable runtime evidence.
- No fake tenant, agent, listing, order, payment, OAuth connection or production transaction was created.

### Next execution
1. Continue source audit for any remaining UI labels or static portfolio cards that imply live/deployed/connected state without a backing operational record.
2. Reconcile the current hosted tenant/auth counts against the older D1.03/D1.04 statements in this handoff and matrices; preserve the one real tenant, do not duplicate it.
3. Obtain a latest-commit Preview after Vercel's quota window, then run browser acceptance with the authorized session: identity/workspace, Garden CRUD, private document Storage and cross-workspace denial.
4. Configure real Google OAuth credentials and callback URL before activating the Google Drive manifest; execute a real provider operation.
5. Configure a real PSP sandbox and complete checkout/capture/webhook/refund/payout plus ledger reconciliation.
6. Continue tenant installation, agent runtime, Compute/Inference/Memory/CEL, durable workflows, Control Tower, backup/restore and failure/release drills. Days 1–3 remain OPEN until these acceptance gates pass.


## 13.51 — Day 1/2 matrix reconciliation — 2026-11-26

- Refreshed the Day 1 matrix to remove stale CI-blocker language: run [45856152162](https://github.com/Amdkn/Business-Marketplace/actions/runs/45856152162) is fully green on application commit `dfc3554` (548 Vitest tests, app/API typechecks, Vite build, 102/102 benchmarks). The latest Vercel Preview remains blocked separately by `build-rate-limit`.
- Corrected the deployed adapter version in D1.07 to `adapter-api` v8.
- Reconciled migration accounting conservatively: 69 cloud migration-ledger entries versus 68 exact executable repository migration sources. A catalog-derived reconstruction exists for the historical RLS ACL migration, but it is not byte-identical recovery of the original SQL. Do not claim 69/69 exact source parity until provenance is closed.
- Refreshed the Day 2 matrix with the same full CI evidence. OAuth Base64URL regression vectors are now confirmed in the passing Vitest suite; this does not constitute Google OAuth provider authorization or a real provider execution.
- Day 1, Day 2 and Day 3 remain OPEN. The one real user/org/workspace membership chain is preserved; no extra test tenant or provider activity was created.
