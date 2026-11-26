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

The live project returned **30 applied migration entries**. Thirty source files are tracked in this repository, including the three new Finance & Capital migrations. The 20261126041718 historical event-trigger ACL migration remains a catalog-derived reconstruction, not byte-identical original SQL:

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
| 20261126053453 | marketplace_capability_entitlements | migrations/20261126053000_marketplace_capability_entitlements.sql |\n| 20261126061930 | finance_double_entry_foundation | migrations/20261126061930_finance_double_entry_foundation.sql |\n| 20261126062124 | finance_integrity_guards | migrations/20261126062124_finance_integrity_guards.sql |\n| 20261126062317 | finance_payment_fact_immutability | migrations/20261126062317_finance_payment_fact_immutability.sql |\n| 20261126062541 | finance_foreign_key_indexes | migrations/20261126062541_finance_foreign_key_indexes.sql |\n| 20261126062749 | finance_journal_posting_api | migrations/20261126062749_finance_journal_posting_api.sql |

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
| dashboard (tenant operational data) | 2 | 2/2 |

The reserved `operations`, `trust`, `finance` and `api` namespaces currently have no application tables in the inspected inventory. This does not mean their Day 1–3 target scope is complete.

## Active Edge Functions at the live recheck

| Function | Version | Gateway JWT | Boundary |
|---|---:|---|---|
| `marketplace-api` | 18 | enabled | Authenticated tenant API; public read-only catalog actions are explicitly scoped |
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

- `migrations/` — tracked source migrations for the applied Marketplace schema, including three Finance & Capital migrations.
- `functions/marketplace-api/` — tenant lifecycle, structure installation, ownership/dependency/capability engines, catalog and commerce API.
- `functions/adapter-api/` — connection lifecycle, OAuth initiation and execution control.
- `functions/adapter-worker/` — Vault-backed provider execution, retries, refresh and manifest validation.
- `functions/adapter-oauth-callback/` — one-time OAuth callback and PKCE exchange.
- `tests/` — security baseline, OAuth, Google Drive manifest, capability entitlement and Finance ledger regression SQL. The authenticated `post_finance_journal_entry` action is now deployed in `marketplace-api` v17.\n- `../docs/FINANCE_LEDGER_CONTRACT.md` — accounting, payment, refund, payout and dispute contract.
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

## Finance & Capital — Chart of Accounts continuation (2026-11-26)

The current live Finance foundation supersedes the earlier inventory snapshot above:
- 10 Finance tables (the original nine plus chart_account_templates), all with RLS enabled and browser-role access revoked.
- 16 required template accounts in version 2026.1.
- finance.ledger_accounts.chart_version marks tenant-installed template accounts.
- api.provision_finance_chart_of_accounts is service-role-only, SECURITY DEFINER, pinned search_path, tenant membership/role checked, collision-safe and advisory-lock serialized.
- Authenticated action provision_finance_chart_of_accounts is exposed by marketplace-api v20 (verify_jwt=true).
- The chart is a provider-neutral baseline; no tenant chart is installed because there are no live organizations.
- Two additive migrations: 20261126070000_finance_chart_of_accounts_provisioning and 20261126070100_finance_chart_version_regex_fix.

Do not interpret the presence of templates as tenant provisioning, financial activity or Day 2 acceptance. Continue with fee policy versioning and the order-to-fee-to-ledger posting contract.


### Finance authorization alignment — 2026-11-26
The Finance actions now use a dedicated API authorization helper for S0_SOVEREIGN, B1_CEO, B2_MANAGER and B2.2 Treasury roles. This matches the SQL authorization boundary. marketplace-api is ACTIVE v20 with verify_jwt=true.

## Fee Policy Engine — 2026-11-26

Two private Finance tables now define versioned fee policy terms and immutable order fee snapshots. The fee engine supports platform-wide or seller-scoped commissions, basis-point percentage rates, fixed fees, optional floors/caps, explicit currency rounding, effective windows and draft/active/retired policy lifecycle. Activated terms and applied order snapshots are immutable. There is no seeded commission rate; an authorized Finance operator must create and activate a policy. Edge actions: `create_fee_policy`, `activate_fee_policy`, `apply_order_fee_policy`. See `docs/FINANCE_LEDGER_CONTRACT.md`.

Fee activation concurrency is serialized by the logical policy identity (owner + key + scope + seller scope + currency), with an overlap check under the same advisory lock. Migration: `20261126073200_fee_policy_activation_serialization`. Fee-policy foreign keys are indexed; the Finance schema currently has no unindexed foreign keys.


Fee engine hardening: migrations `20261126073100_finance_fee_policy_fk_indexes` and `20261126073200_fee_policy_activation_serialization` add fee-policy FK indexes and serialize competing policy activations by logical policy identity. No unindexed Finance foreign keys remain.

## Captured Payment Journal Posting — 2026-11-26

Added `api.post_captured_order_finance_entry` and the authenticated `post_captured_order_finance_entry` Marketplace API action. It only posts after provider-confirmed capture facts match the immutable order and fee snapshot. It creates the balanced entry: debit PSP clearing, credit seller payable and platform fee revenue. Journal posting is idempotent, and retries continue to return the original capture journal after later refund-state transitions. Live Edge Function is ACTIVE v22 (`verify_jwt=true`). See `docs/FINANCE_LEDGER_CONTRACT.md`.

## Successful Refund Ledger Reversal — 2026-11-26

Added immutable `finance.refund_fee_allocations` and `api.post_succeeded_refund_finance_entry`. A provider-confirmed successful refund reverses seller payable and platform fee revenue, and credits PSP clearing for the refund gross. Platform-fee reversal is calculated cumulatively against the original fee snapshot so partial-refund rounding reconciles exactly. The original capture journal remains immutable. Authenticated action: `post_succeeded_refund_finance_entry`; `marketplace-api` ACTIVE v23 (`verify_jwt=true`). No provider refund or journal fixture is created.

## Settled Payout Ledger Posting — 2026-11-26

Payout batches now require an owning Finance organization. The new `post_paid_payout_item_finance_entry` action posts only provider-confirmed PAID batch/items with provider IDs and settlement timestamp. It checks available seller-payable and PSP-clearing balances, then debits seller payable and credits PSP clearing through the idempotent journal API. Journal posting now locks affected account rows in sorted order to serialize concurrent postings. Live Marketplace API v24; no payout or bank transfer was fabricated.


## Retired Garden dashboard namespace — 2026-11-26

The transitional `dashboard.clients` / `dashboard.agents` schema is not the active interface data source. Garden Sidebar and Web Desktop must use the shared `workspace_data` records, with identity resolved through `identity.get_current_workspace_context()`. Do not add new reads or writes to the legacy `dashboard` schema. Historical migrations remain in the migration ledger for audit; any physical schema cleanup must be a separate reviewed migration after dependency checks.

## Marketplace interface persistence — current hosted contract (2026-11-26)

The Garden Sidebar and Web Desktop share one persistence contract in `workspace_data`.

- 37 workspace-owned collection tables plus `workspace_data.activity_events` = **38 tables**.
- Every table has a required `workspace_id`; there are no organization-only records in this interface data layer.
- All 38 tables have RLS enabled. The current policy inventory is **150 policies**: four workspace-member/operator policies on each business collection table and two append-only policies on activity events.
- Read policies use `identity.is_active_workspace_member(organization_id, workspace_id)`; write policies use `identity.can_manage_workspace(organization_id, workspace_id)`.
- Tenant/workspace IDs and creator attribution are immutable after creation. Activity events remain append-only.
- `workspace_data.missions` is a real agent mission record, separate from the general CMS `workspace_data.tasks` collection. An assigned agent must have an active delegation to the target workspace.
- `workspace_data.invoices` has typed client, currency, issue, due and paid fields. Currency is ISO-4217-shaped when present; no USD default is fabricated. The client FK is composite with organization/workspace to prevent cross-workspace invoice references.
- Garden and Web Desktop share the single Supabase client. Both resolve tenant/workspace context through the authenticated `identity.get_current_workspace_context()` RPC; the browser does not query private `enterprise` tables directly.
- Garden human membership and AI agent read models are served by authenticated `marketplace-api` actions `list_workspace_members` and `list_workspace_agents`. Agent identity remains canonical in `identity.agent_principals` and `identity.agent_delegations`.
- Demo CMS fixtures are restricted to the explicit local demo tenant. Real Marketplace tenants start empty and hydrate from their own workspace rows.

Migrations are tracked under `supabase/migrations/` and match the hosted migration ledger:
- `20261126083638_marketplace_interface_persistence.sql`
- `20261126090124_workspace_document_records.sql`
- `20261126091538_workspace_scoped_data_access.sql`
- `20261126092009_workspace_data_access_hardening.sql`
- `20261126092033_workspace_policy_predicate_definer_boundary.sql`
- `20261126092835_garden_invoice_and_mission_records.sql`
- `20261126093031_current_workspace_context_rpc.sql`

`marketplace-api` is ACTIVE v25 with `verify_jwt=true`. The current authenticated tenant context resolves to the first real organization/workspace and role `B1_CEO`. No agent principal or fake business record has been created.

## Shared Garden / Web Desktop persistence — live checkpoint

Both user-facing interfaces use the same `workspace_data` schema and authenticated workspace context. Garden repositories filter reads, updates and deletes by both `organization_id` and `workspace_id`; creates write both IDs. The Web Desktop CMS uses the same dedicated collection tables and refuses to hydrate a real tenant from demo seeds.

The private `enterprise` schema is not queried directly by the browser. `identity.get_current_workspace_context()` is the authenticated, caller-bound RPC that resolves exactly one active organization and one active workspace. Garden AuthProvider, the tenant store and the CMS repository all use this RPC. The same Supabase client singleton is shared by both interfaces.

The Garden People view reads actual active workspace memberships through `marketplace-api:list_workspace_members`. The AI Agents view reads canonical agent principals with active workspace delegations through `marketplace-api:list_workspace_agents`. The two directories are no longer inferred from a mixed `people_agents` roster. No agent principal exists yet, so the AI Agent view correctly shows an empty state.

The Garden Mission Board maps to `workspace_data.missions`, not `workspace_data.tasks`. Finance invoice mapping uses typed `client_id`, `currency`, `issued_at`, `due_at` and `paid_at` fields. No default currency is inserted.

Latest SQL verification: `marketplace_security_baseline.sql`, `marketplace_interface_persistence.sql`, `adapter_oauth_runtime.sql`, `google_drive_adapter_manifest.sql`, `marketplace_capability_entitlements.sql` and `marketplace_finance_ledger.sql` all pass against the hosted project. The authenticated workspace-context RPC was also exercised under the `authenticated` database role and returned the expected first tenant context. A transaction-scoped CRUD probe was rolled back; no probe row remains.

Validation is not full browser acceptance: no live browser JWT E2E, cross-workspace browser denial, TypeScript/Vitest/Vite build, or new Vercel deployment has been verified in this tranche. Do not mark Day 1–3 accepted until those gates pass.
