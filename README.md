# A’Space Business Marketplace

> **AI-native business platform** — discover, compose, provision and operate business capabilities, domains and agent-powered services from one control plane.

**Product:** A’Space Business Marketplace  
**Repository:** `Amdkn/Business-Marketplace`  
**Production:** https://business-marketplace-amd-lab.vercel.app  
**Foundation:** [Business Office 3 OS](https://github.com/Amdkn/Business-Office-3-OS)

---

## Product thesis

Business Marketplace is not a directory of SaaS listings. It is the composition and operations layer for businesses: a place where an organization can model its business domains, activate capabilities, connect providers, assign agents, govern access, and observe execution.

The platform substrate has four cross-cutting foundations: **Compute Core**, **Inference Core**, **Memory Core**, and **CEL Security Core**. These are not departments or Areas OS portfolios; they support every product plane.

The product has three cooperating planes:

1. **Marketplace Experience** — discover business capabilities, solution packs, templates, agents and adapters; compare, configure, install and manage them.
2. **Business Control Plane** — organization and workspace lifecycle, domain registry, capability graph, policies, adapter connections, deployments, usage and audit.
3. **Business Office Runtime** — the operational workspace in which installed capabilities become usable business applications, workflows and agent surfaces.

## Architecture: product planes × inherited surfaces

The Business Office 3 OS substrate is retained as a multi-surface runtime, not mistaken for the product itself.

| Surface | Role in Business Marketplace |
|---|---|
| Pro Web Desktop OS | Full operations cockpit: domain workspaces, application windows, orchestration and observability |
| Digital Garden SaaS OS | Calm executive overview: portfolio, health, priorities and organization-level signals |
| Mobile OS Edge Client | Field and executive companion: approvals, alerts, tasks and fast actions |

The three surfaces share one identity, organization context, capability model, event vocabulary and policy boundary.

## Core navigation (target information architecture)

- **Overview** — portfolio pulse, recently changed domains, pending approvals and operational signals.
- **Domains** — hierarchical registry of business domains, subdomains, capabilities, owners, maturity and dependencies.
- **Marketplace** — catalog of capabilities, solution packs, templates, agents and integrations.
- **Adapters** — provider connections, credentials references, scopes, health, sync and event mappings.
- **Workspaces** — organization spaces, teams, roles, projects and operational environments.
- **Agents** — agent directory, contracts, tools, permissions, runs and evaluations.
- **Workflows** — business processes, triggers, approvals, automations and run history.
- **Data & Knowledge** — business objects, schemas, documents, knowledge sources and lineage.
- **Governance** — policies, access reviews, audit trail, risk and compliance.
- **Settings** — organization profile, billing, environments and platform configuration.

Navigation is a target contract. Existing template applications are not automatically production-ready Marketplace modules.

## Domain model

The first-class hierarchy is:

`Organization → Workspace → Installed structure → (Business Department OR tenant Domain) → Capability → Installation`

Do not collapse the two distinct A’Space taxonomy axes:

- **8 Business Departments (B2.1–B2.8):** Product & IP; Growth & Distribution; People & Talent; Legal & Trust; Tech & Intelligence; Operations & Delivery; Finance & Capital; Sales & Partnerships. These are the Marketplace's value-producing and operating departments.
- **8 Areas OS portfolios (LD01–LD08):** Business; Finances; Blue Life; Meta Cognition; Sovereign Triangle; Solarpunk Habitat; MC Sandbox; Civilizer / ABC OS. These are A’Space mission portfolios, not Marketplace departments.

The department and Areas OS registries may be related through explicit ownership, project and capability links, but they are not parent/child versions of one another. LD01 is the Business mission portfolio; the B2.1–B2.8 taxonomy belongs to the Business department structure. The six Marketplace market surfaces identified in the V5 Day 1 core remain a third, independent dimension; this interface does not collapse them into either taxonomy.

Cross-cutting entities:

- **Adapter** — a typed connector to an external provider or internal system.
- **Connection** — a tenant-scoped configured instance of an adapter, with secret references and granted scopes.
- **Agent** — an executable identity with a versioned contract, allowed tools and policy envelope.
- **Workflow** — a versioned process composed from capabilities, adapters, agents and human approval steps.
- **Installation** — an organization's activated instance of a marketplace capability or solution pack.
- **Policy** — explicit rules for identity, data access, execution, approval and resource boundaries.
- **Event** — an auditable state transition with actor, tenant, correlation and causality metadata.

A domain is not just a navigation folder. It is an owned business boundary that can contain capabilities, workflows, data contracts, agents, integrations, controls and measurable outcomes.

## Adapter architecture

Adapters are capabilities behind a stable contract, not bespoke UI buttons. Every adapter should declare:

- provider and adapter identity, version and lifecycle state;
- supported capabilities and resource types;
- authentication method and required scopes;
- inbound/outbound operations and event subscriptions;
- rate limits, retry policy, idempotency behavior and health checks;
- data classification, residency and retention constraints;
- tenant isolation and audit requirements.

Initial adapter families to design for (availability is not implied):

1. Identity & access — Google Workspace, Microsoft 365, Auth0/Clerk.
2. Communication — Gmail, Outlook, Slack, Google Chat, Discord, Teams.
3. Calendar & scheduling — Google Calendar, Microsoft Calendar, Cal.com.
4. Files & knowledge — Google Drive, OneDrive, Notion, Confluence.
5. Work management — Linear, ClickUp, Jira, GitHub Projects.
6. Source control & delivery — GitHub, GitLab, Bitbucket, Vercel.
7. Data & backend — Supabase, PostgreSQL, Redis, object storage.
8. Automation & orchestration — n8n, Make, Zapier, Temporal.
9. AI model providers — OpenAI, Anthropic, Google Gemini, local OpenAI-compatible endpoints.
10. Agent protocols & tool runtimes — MCP, A2A, Composio, custom tool gateways.
11. Finance & commerce — Stripe, accounting platforms, payment and invoicing providers.
12. CRM & customer operations — HubSpot, Salesforce, Pipedrive.
13. Support & customer communication — Intercom, Zendesk, Help Scout.
14. Analytics & observability — PostHog, Sentry, OpenTelemetry.
15. Documents & signatures — DocuSign, Dropbox Sign, PDF/document services.
16. E-commerce & catalog — Shopify, WooCommerce, product feeds.
17. HR & people operations — HRIS, recruiting and payroll providers.
18. Maps & mobility — Google Maps, Mapbox, routing and fleet APIs.
19. IoT & physical operations — MQTT brokers, device gateways and telemetry.
20. Storage, backup & portability — S3-compatible providers, export and archive targets.

Provider-specific implementations must be validated independently before being marked available.

## Data and tenancy

The connected A’Space Marketplace Supabase project is the target backend. Existing database schemas and migrations must be inspected before adding new tables. The current inherited frontend contains legacy Coach OS seed assumptions; those assumptions are **not** the Marketplace tenancy contract.

Rules:

- organization membership and role bindings are authoritative; browser storage is never an authorization boundary;
- every tenant-owned row and operation must be scoped and enforced server-side;
- RLS policies are required for exposed tenant data;
- secrets are stored server-side or in a secret manager; never in browser-readable tables or client bundles;
- demo data must be explicitly labeled and isolated from real organizations;
- destructive migrations and legacy data removal require a reviewed migration plan.

## Current implementation status

- [x] Independent repository created from Business Office 3 OS foundation.
- [x] Vercel production project connected and baseline deployment verified.
- [x] Marketplace Supabase URL and public client key configured in Vercel environments.
- [x] Coach schema adoption migration applied additively to Marketplace Supabase (no source rows copied).
- [x] Independent Marketplace identity and Control Plane navigation; inherited Coach auth/session bridge remains explicitly isolated for the next refactor.
- [x] Global B2.1–B2.8 / LD01–LD08 blueprint registry persisted in Supabase and served through a read-only API.
- [x] Public published-listing read path connected; current catalogue correctly returns zero published offers.
- [x] Four platform-core foundations represented in the Control Plane.
- [ ] Tenant-owned domain/department installation, ownership and dependency graph.
- [ ] Adapter registry, connection lifecycle, secrets references and health model.
- [ ] Organization/workspace provisioning and authorization verified end-to-end.
- [ ] Marketplace capability installation and order lifecycle connected to the frontend.
- [ ] Production signup/email delivery and browser authentication verified.
- [ ] E2E tests for tenant isolation, adapter permissions and install lifecycle.

## Engineering principles

- Preserve the inherited Desktop / Garden / Mobile surfaces while replacing legacy product assumptions deliberately.
- Prefer contracts and registries over hard-coded provider-specific branches.
- Keep provider credentials out of client code.
- Make operations observable, idempotent and reversible where possible.
- Distinguish catalog availability, connection health and actual operational readiness.
- Never present seeded demo data as live customer data.
- Ship vertical slices with tests and deployment evidence; a green static build is not proof of a working business workflow.

## Development

```bash
bun install
bun run dev
bun run typecheck
bun run test
bun run build
```

See [PRODUCT_ARCHITECTURE.md](./docs/PRODUCT_ARCHITECTURE.md) for the initial control-plane contracts and implementation sequence. The read-only backend inventory is documented in [SUPABASE_SCHEMA_AUDIT_2026-11-24.md](./docs/SUPABASE_SCHEMA_AUDIT_2026-11-24.md). Production Auth URL and redirect configuration are recorded in [AUTH_CONFIGURATION_2026-11-26.md](./docs/AUTH_CONFIGURATION_2026-11-26.md).
