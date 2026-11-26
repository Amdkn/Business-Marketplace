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
- Added and applied migration 20261126090500_workspace_document_records.sql.
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
