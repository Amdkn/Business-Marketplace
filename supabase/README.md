# A’Space Marketplace — Supabase backend

**Canonical repository:** `Amdkn/Business-Marketplace`  
**Cloud project:** `swegnrvaxxgfrnshdpxx` — Aspace MarketPlace  
**Region / engine:** `us-west-2` / PostgreSQL `17.12.0.000`  
**Live status checked:** 2026-11-26 — `ACTIVE_HEALTHY`

This directory is the canonical source for Marketplace database migrations, Edge Functions and SQL regression tests. The implementation was consolidated from Aspace OS V5 PR #63. V5 remains the parent architecture/provenance repository; do not deploy the Marketplace backend from V5.

## Critical operating rules

1. The cloud project above is the existing Marketplace database. Do not create a replacement project.
2. The migration files in this repository describe migrations already applied to that cloud project. **Do not replay them against the current hosted project.**
3. Future schema changes must be additive, versioned and authored in this repository. Reconcile the cloud migration registry before applying anything.
4. The exact original SQL text for historical cloud migration `20261126041718 / revoke_public_execution_rls_auto_enable` was not recovered. A catalog-derived reconstruction is tracked at `migrations/20261126041718_revoke_public_execution_rls_auto_enable.sql`; it reproduces the verified live ACL but is not byte-identical historical source. This closes source-tree coverage of the 25-entry cloud registry, not byte-for-byte provenance. Do not replay it.
5. The older file `20261124024342_coach_schema_adoption.sql` in V5 was not the canonical applied migration. The applied entry is `20261124024550 / coach_schema_adoption_20261124`, represented here by the reconstructed canonical source file `20261124024550_coach_schema_adoption_20261124.sql`. It was reconstructed from the live catalog and is not claimed to be byte-identical to the historical original.
6. Never put service-role credentials, OAuth client secrets, provider tokens or Vault secret values in this repository. Commit only secret references/contracts and safe configuration.
7. Supabase CLI v3 is local-first. Any future hosted CLI command must explicitly target the remote project and follow the current confirmation semantics. Prefer the linked native Supabase connection for live verification.

## Live cloud migration registry

The live project returned **28 applied migration entries**. Twenty-eight source files are tracked in this repository, including the three new Finance & Capital migrations. The 20261126041718 historical event-trigger ACL migration remains a catalog-derived reconstruction, not byte-identical original SQL:

| Applied version | Cloud migration name | Canonical source file |
|---|---|---|
| 20261124014334 | 20261124000100_identity_tenant_foundation | migrations/20261124000100_identity_tenant_foundation.sql |
| 20261124014609 | 20261124000200_marketplace_catalog_commerce_agents | migrations/20261124000200_marketplace_catalog_commerce_agents.sql |
| 20261124014640 | 20261124000300_transactional_marketplace_order_api | migrations/20261124000300_transactional_marketplace_order_api.sql |
| 20261124024550 | coach_schema_adoption_20261124 | migrations/20261124024550_coach_schema_adoption_20261124.sql |
| 20261126024237 | 20261126024200_marketplace_taxonomy_blueprints | migrations/20261126024200_marketplace_taxonomy_blueprints.sql |
| 20261126024949 | 20261126024800_correct_marketplace_department_taxonomy | migrations/20261126024800_correct_marketplace_department_taxonomy.sql |
| 20261126025257 | 20261126025300_adapter_family_blueprints | migrations/20261126025300_adapter_family_blueprints.sql |
| 20261126025804 | 20261126030000_provider_adapter_blueprints | migrations/20261126030000_provider_adapter_blueprints.sql |
| 20261126030251 | 20261126030500_ld01_holon_blueprints | migrations/20261126030500_ld01_holon_blueprints.sql |
| 20261126041718 | revoke_public_execution_rls_auto_enable | migrations/20261126041718_revoke_public_execution_rls_auto_enable.sql (catalog-derived reconstruction; not byte-identical original) |
| 20261126041811 | tenant_structure_installations | migrations/20261126031500_tenant_structure_installations.sql |
| 20261126041835 | workspace_membership_and_holon_integrity | migrations/20261126041800_workspace_membership_and_holon_integrity.sql |
| 20261126042038 | tenant_installation_foreign_key_indexes | migrations/20261126041900_tenant_installation_foreign_key_indexes.sql |
| 20261126042926 | enterprise_ownership_dependency_capability_engines | migrations/20261126042500_enterprise_ownership_dependency_capability_engines.sql |
| 20261126043103 | installation_engine_revocation_guards | migrations/20261126042600_installation_engine_revocation_guards.sql |
| 20261126043148 | installation_engine_active_target_validation | migrations/20261126042700_installation_engine_active_target_validation.sql |
| 20261126043327 | installation_request_ledger_append_only | migrations/20261126043100_installation_request_ledger_append_only.sql |
| 20261126043337 | installation_ledger_statement_level_guards | migrations/20261126043200_installation_ledger_statement_level_guards.sql |
| 20261126044855 | adapter_execution_engine_foundation | migrations/20261126044855_adapter_execution_engine_foundation.sql |
| 20261126044914 | adapter_execution_claim_result_shape_fix | migrations/20261126044914_adapter_execution_claim_result_shape_fix.sql |
| 20261126044938 | adapter_execution_integrity_guards | migrations/20261126044938_adapter_execution_integrity_guards.sql |
| 20261126051720 | adapter_oauth_runtime_guards | migrations/20261126050000_adapter_oauth_runtime_guards.sql |
| 20261126052043 | google_drive_adapter_manifest_draft | migrations/20261126052200_google_drive_adapter_manifest_draft.sql |
| 20261126052132 | google_drive_blueprint_contract_status | migrations/20261126052300_google_drive_blueprint_contract_status.sql |
| 20261126053453 | marketplace_capability_entitlements | migrations/20261126053000_marketplace_capability_entitlements.sql |\n| 20261126061930 | finance_double_entry_foundation | migrations/20261126061930_finance_double_entry_foundation.sql |\n| 20261126062124 | finance_integrity_guards | migrations/20261126062124_finance_integrity_guards.sql |\n| 20261126062317 | finance_payment_fact_immutability | migrations/20261126062317_finance_payment_fact_immutability.sql |

The first column is the actual cloud migration registry version; the source filename is the versioned migration name authored in Git. These timestamps differ because the cloud migration runner recorded its own application timestamp. Preserve both values in future audits. The 20261126041718 source file reproduces the verified live ACL but is explicitly a reconstruction, not recovered original SQL.

## Current database inventory

Read-only live inspection returned 45 application tables, all with RLS enabled:

| Schema | Tables | RLS |
|---|---:|---:|
| identity | 7 | 7/7 |
| areas | 4 | 4/4 |
| enterprise | 8 | 8/8 |
| catalog | 4 | 4/4 |
| commerce | 3 | 3/3 |
| integration | 8 | 8/8 |
| content | 2 | 2/2 |

The reserved `operations`, `trust`, `finance` and `api` namespaces currently have no application tables in the inspected inventory. This does not mean their Day 1–3 target scope is complete.

## Active Edge Functions at the live recheck

| Function | Version | Gateway JWT | Boundary |
|---|---:|---|---|
| `marketplace-api` | 16 | enabled | Authenticated tenant API; public read-only catalog actions are explicitly scoped |
| `adapter-api` | 7 | enabled | Authenticated workspace connection and OAuth initiation API |
| `adapter-worker` | 7 | disabled | Handler enforces exact server-only service-role bearer validation |
| `adapter-oauth-callback` | 1 | disabled | Public provider callback validates one-time state and PKCE transaction |

The source files are under `functions/`. The deployed versions were listed live; byte-for-byte source parity against this repository is a separate verification gate and must not be assumed from version numbers alone.

## Current tenant and provider state

Live exact counts at the recheck:

- Auth users: 0
- Organizations / memberships: 0 / 0
- Workspaces: 0
- Domain / department / holon installations: 0 / 0 / 0
- Tenant connections: 0
- OAuth transactions: 0
- ACTIVE provider manifests: 0
- Published listings: 0
- Orders: 0

Google Drive has a version 1.0.0 manifest in **DRAFT**, with a specified OAuth Authorization Code + PKCE contract and six metadata operations. Its provider blueprint remains **PLANNED**; no client credentials, authorized user, connection or real provider round-trip exists. Keep it DRAFT / PLANNED.

The platform has deployed schema and runtime foundations. It has not passed authenticated tenant E2E, real provider E2E, commercial payment/ledger/payout E2E or full Day 1–3 acceptance.

## Source layout

- `migrations/` — 28 tracked source migrations for the applied Marketplace schema, including three Finance & Capital migrations.
- `functions/marketplace-api/` — tenant lifecycle, structure installation, ownership/dependency/capability engines, catalog and commerce API.
- `functions/adapter-api/` — connection lifecycle, OAuth initiation and execution control.
- `functions/adapter-worker/` — Vault-backed provider execution, retries, refresh and manifest validation.
- `functions/adapter-oauth-callback/` — one-time OAuth callback and PKCE exchange.
- `tests/` — security baseline, OAuth, Google Drive manifest, capability entitlement and Finance ledger regression SQL.\n- `../docs/FINANCE_LEDGER_CONTRACT.md` — accounting, payment, refund, payout and dispute contract.
- `config.toml` — project binding and Edge Function gateway JWT settings.

## Continuation

Use the [Day 1–3 handoff](../docs/handoffs/2026-11-26-marketplace-day1-day3-handoff.md) as the full scope and continuation contract. No Day is accepted complete until its end-to-end acceptance gate has evidence.


## Security and performance advisor recheck — 2026-11-26

The live Supabase advisors report:

- 29 INFO findings for RLS-enabled tables without policies.
- 61 INFO findings for foreign keys without covering indexes.
- 50 INFO findings for indexes not yet used (expected on an unseeded platform; do not drop solely from this signal).
- No health advisor findings.

The RLS-without-policy findings were triaged against live schema grants. The affected internal tables are not exposed through `anon` / `authenticated` schema usage and/or have no direct browser-role table grants. The browser-facing `identity` and `content` policies inspected are scoped to the authenticated user's own profile, active organization membership, or the user's own delegation/role binding. Do not add blanket policies to silence the advisor: the internal schema gateway is the intended model. The SQL security baseline now asserts the no-browser-grant rule for policy-less internal tables and verifies that `public.rls_auto_enable()` is not executable by PUBLIC, anon or authenticated.

The 61 unindexed-FK findings are performance INFO findings. Review query paths and existing composite indexes before adding any index; do not create 61 blind indexes. The 50 unused-index findings are not grounds for removal before representative workload exists.

### Historical migration source reconstruction

Cloud migration `20261126041718 / revoke_public_execution_rls_auto_enable` has now been reconstructed from the live function ACL. The function ACL is `postgres=X/postgres,service_role=X/postgres`; PUBLIC, anon and authenticated have no EXECUTE privilege. The event trigger `ensure_rls` remains enabled and invokes `public.rls_auto_enable()`. The canonical source tree includes `migrations/20261126041718_revoke_public_execution_rls_auto_enable.sql` to reproduce the verified end state. This is a **catalog-derived reconstruction**, not a byte-for-byte recovery of the original migration text. It is already applied in cloud; do not replay it.
