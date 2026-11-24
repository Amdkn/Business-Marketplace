# Marketplace Supabase — Schema Audit

**Audited:** 2026-11-24 UTC  
**Project:** `swegnrvaxxgfrnshdpxx` — A’Space Marketplace  
**Scope:** Read-only schema inventory, column contracts and applied migration history. No database writes were performed.

## 1. Inventory

The project reports 15 schemas, 52 tables and 0 views. The 52-table total includes Supabase-managed `auth`, `storage` and migration metadata. The application-owned tables currently present are:

| Schema | Tables | Current role |
|---|---:|---|
| `identity` | 7 | Organizations, memberships, delegations, role bindings, agent principals, profiles |
| `catalog` | 3 | Capabilities, immutable capability versions, commercial listings |
| `commerce` | 2 | Orders and append-only order events |
| `content` | 2 | Tenant-scoped CMS collections and items |
| `areas` | 0 | Reserved namespace; no domain/area registry yet |
| `enterprise` | 0 | Reserved namespace; no enterprise structure yet |
| `operations` | 0 | Reserved namespace; no workflow/operations tables yet |
| `integration` | 0 | Reserved namespace; no adapter/connection tables yet |
| `api` | 0 | API functions are hosted here; no tables |
| `finance`, `trust` | 0 | Reserved namespaces |

The application-owned tables returned estimated row counts of **0**. No organization, membership, capability, listing, agent principal, order or CMS records are currently provisioned in this project.

## 2. Applied migrations

Four application migrations are recorded:

1. `20261124000100_identity_tenant_foundation` — creates `identity.organizations`, `organization_memberships`, `delegations`, `role_bindings`, and reserves business schemas.
2. `20261124000200_marketplace_catalog_commerce_agents` — creates `identity.agent_principals`, `agent_delegations`, `catalog.capabilities`, `capability_versions`, `listings`, `commerce.orders`, and `order_events`.
3. `20261124000300_transactional_marketplace_order_api` — creates `api.create_marketplace_order` and `api.transition_marketplace_order`.
4. `coach_schema_adoption_20261124` — adds `identity.profiles`, `content.cms_collections`, and `content.cms_items` additively.

The Coach adoption migration copied no rows and did not replace the Marketplace identity or catalog model.

## 3. Existing contracts that must be reused

### Organization identity

`identity.organizations` is the tenant/ownership root. It includes:

- `id` UUID primary key;
- unique `organization_key`;
- `name`;
- `organization_type` constrained to `MARKETPLACE_OPERATOR`, `INTERNAL_VENTURE`, `EXTERNAL_ENTERPRISE`, `SUPPLIER`, `CUSTOMER`, `PARTNER`;
- lifecycle `status` (`ACTIVE`, `SUSPENDED`, `CLOSED`);
- `created_by_user_id` referencing `auth.users`.

`identity.organization_memberships` is the authoritative human-to-organization relationship. It references `auth.users`, has membership status and a uniqueness constraint on organization/user.

`identity.role_bindings` holds scoped role appointments. Its scope vocabulary already includes `PLATFORM`, `ORGANIZATION`, `AREA`, `ENTERPRISE`, `DEPARTMENT`, `PROJECT`, and `RESOURCE`. Do not invent a second user/tenant/role system for the domain registry.

### Capability catalog

`catalog.capabilities` represents a stable capability identity owned by an organization. `catalog.capability_versions` stores immutable version contracts, including JSON input/output contracts and permission codes. `catalog.listings` is a commercial listing bound to an exact capability version.

These objects are not the same as business domains:

- a **domain** is an owned structural/operational boundary;
- a **capability** is a reusable function that can be installed or offered;
- a **listing** is a commercial offer for a versioned capability.

Keep those layers distinct and link them through explicit relations.

### Agent identity

`identity.agent_principals` models agents as service principals, not synthetic `auth.users`. `identity.agent_delegations` binds agent execution to an organization, scope and permission set. Reuse this contract for the Agent control plane.

## 4. Security and API boundary

The first migration revokes public/anon/authenticated access from business schemas by default and grants service-role access. Organization and membership tables have narrow authenticated SELECT policies; role/delegation reads are constrained to the subject/parties.

The second migration enables RLS on catalog, agent and commerce tables but defines no authenticated table policies or client grants for those schemas. The order API functions are explicitly executable by `service_role`, not directly by browser users.

The Coach adoption migration adds explicit authenticated policies to `identity.profiles` and `content` CMS tables.

**Implication:** the Marketplace frontend must not assume that direct browser Supabase queries can read `catalog` or other private business schemas. Follow the existing trusted API/service-role boundary or design a narrowly scoped API function. Never place service-role credentials in the Vite client bundle.

## 5. Domain Registry recommendation

The existing `areas` namespace and the existing role-binding scope vocabulary are the natural integration points to investigate first. No area/domain table currently exists.

Recommended additive model for a subsequent reviewed migration:

- `areas.domains`: tenant-owned domain identity and hierarchy, with stable key, parent reference, lifecycle, owner and metadata;
- `areas.domain_dependencies`: explicit directed dependency edges, distinct from parent/child hierarchy;
- `areas.domain_capabilities`: relation between a domain and existing `catalog.capabilities`;
- optionally `areas.domain_memberships` or ownership appointments only if the existing role-binding scope model cannot express the needed relationship.

Before writing DDL, validate:
1. whether `AREA` scope IDs in `identity.role_bindings` should reference `areas.domains.id`;
2. composite organization foreign keys to prevent cross-tenant parent/dependency/capability links;
3. private-schema API boundary and function execution rights;
4. RLS or trusted API authorization based on active `identity.organization_memberships` and role bindings;
5. immutable/audited domain key and lifecycle semantics;
6. migration tests for tenant isolation and dependency graph integrity.

Do not seed the 12 frontend reference domains into customer organizations automatically. They are a starter taxonomy/blueprint; installation into an organization must be an explicit, authorized operation.

## 6. What this audit does not prove

- It does not validate production login or OAuth callback URLs.
- It does not validate Edge Function behavior.
- It does not validate application-level tenant authorization end-to-end.
- It does not verify runtime health of any adapter.
- It does not provision demo or customer organizations.
- It does not change schema, data, RLS, grants or policies.
