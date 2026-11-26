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

The connected Marketplace project reports **68 applied migration entries**, each with one canonical source file in `supabase/migrations/`. The cloud version is the database runner's application timestamp; the source filename is the authored migration identity.

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
| 20261126053453 | marketplace_capability_entitlements | migrations/20261126053000_marketplace_capability_entitlements.sql |
| 20261126061930 | finance_double_entry_foundation | migrations/20261126061930_finance_double_entry_foundation.sql |
| 20261126062124 | finance_integrity_guards | migrations/20261126062124_finance_integrity_guards.sql |
| 20261126062317 | finance_payment_fact_immutability | migrations/20261126062317_finance_payment_fact_immutability.sql |
| 20261126062541 | finance_foreign_key_indexes | migrations/20261126062541_finance_foreign_key_indexes.sql |
| 20261126062749 | finance_journal_posting_api | migrations/20261126062749_finance_journal_posting_api.sql |
| 20261126063639 | finance_chart_of_accounts_provisioning | migrations/20261126070000_finance_chart_of_accounts_provisioning.sql |
| 20261126063716 | finance_chart_version_regex_fix | migrations/20261126070100_finance_chart_version_regex_fix.sql |
| 20261126064613 | finance_fee_policy_engine | migrations/20261126073000_finance_fee_policy_engine.sql |
| 20261126065022 | finance_fee_policy_fk_indexes | migrations/20261126073100_finance_fee_policy_fk_indexes.sql |
| 20261126065146 | fee_policy_activation_serialization | migrations/20261126073200_fee_policy_activation_serialization.sql |
| 20261126065710 | finance_captured_payment_posting | migrations/20261126073300_finance_captured_payment_posting.sql |
| 20261126065755 | captured_payment_posting_retry_safety | migrations/20261126073400_captured_payment_posting_retry_safety.sql |
| 20261126070301 | finance_refund_fee_allocation_posting | migrations/20261126073500_finance_refund_fee_allocation_posting.sql |
| 20261126070818 | finance_journal_account_locking | migrations/20261126073600_finance_journal_account_locking.sql |
| 20261126070925 | finance_paid_payout_ledger_posting | migrations/20261126073700_finance_paid_payout_ledger_posting.sql |
| 20261126074321 | marketplace_garden_dashboard_tenant_data | migrations/20261126080000_marketplace_garden_dashboard_tenant_data.sql |
| 20261126080152 | replace_legacy_namespace_with_dashboard | migrations/20261126080100_replace_legacy_namespace_with_dashboard.sql |
| 20261126080700 | expose_tenant_identity_context_for_dashboard | migrations/20261126080200_expose_tenant_identity_context_for_dashboard.sql |
| 20261126083638 | marketplace_interface_persistence | migrations/20261126083638_marketplace_interface_persistence.sql |
| 20261126090124 | workspace_document_records | migrations/20261126090124_workspace_document_records.sql |
| 20261126091538 | workspace_scoped_data_access | migrations/20261126091538_workspace_scoped_data_access.sql |
| 20261126092009 | workspace_data_access_hardening | migrations/20261126092009_workspace_data_access_hardening.sql |
| 20261126092033 | workspace_policy_predicate_definer_boundary | migrations/20261126092033_workspace_policy_predicate_definer_boundary.sql |
| 20261126092835 | garden_invoice_and_mission_records | migrations/20261126092835_garden_invoice_and_mission_records.sql |
| 20261126093031 | current_workspace_context_rpc | migrations/20261126093031_current_workspace_context_rpc.sql |
| 20261126094200 | agent_workspace_delegation_scope | migrations/20261126094200_agent_workspace_delegation_scope.sql |
| 20261126094206 | workspace_data_fk_indexes | migrations/20261126094206_workspace_data_fk_indexes.sql |
| 20261126101352 | 20261126103000_agent_assignment_integrity | migrations/20261126101352_20261126103000_agent_assignment_integrity.sql |
| 20261126104549 | 20261126105000_operations_change_requests | migrations/20261126104549_20261126105000_operations_change_requests.sql |
| 20261126104707 | 20261126105500_change_request_decision_audit | migrations/20261126104707_20261126105500_change_request_decision_audit.sql |
| 20261126104811 | 20261126110000_change_request_fk_indexes | migrations/20261126104811_20261126110000_change_request_fk_indexes.sql |
| 20261126105452 | 20261126110500_sales_deal_client_currency | migrations/20261126105452_20261126110500_sales_deal_client_currency.sql |
| 20261126110128 | 20261126111500_invoice_deal_source_idempotency | migrations/20261126110128_20261126111500_invoice_deal_source_idempotency.sql |
| 20261126110342 | 20261126112000_client_ticket_currency | migrations/20261126110342_20261126112000_client_ticket_currency.sql |
| 20261126110518 | 20261126112500_invoice_deal_client_consistency | migrations/20261126110518_20261126112500_invoice_deal_client_consistency.sql |
| 20261126111329 | growth_and_product_workspace_collections | migrations/20261126113000_growth_and_product_workspace_collections.sql |
| 20261126111556 | growth_product_fk_indexes | migrations/20261126113200_growth_product_fk_indexes.sql |
| 20261126111628 | growth_product_created_by_fk_indexes | migrations/20261126113300_growth_product_created_by_fk_indexes.sql |
| 20261126112056 | growth_product_extended_collections | migrations/20261126113500_growth_product_extended_collections.sql |
| 20261126112710 | remaining_workspace_cms_collections | migrations/20261126114000_remaining_workspace_cms_collections.sql |
| 20261126124742 | client_activity_event_triggers | migrations/20261126120000_client_activity_event_triggers.sql |
| 20261126124853 | client_activity_event_id | migrations/20261126120100_client_activity_event_id.sql |
| 20261126130516 | workspace_document_storage | migrations/20261126130000_workspace_document_storage.sql |

The source `20261126041718_revoke_public_execution_rls_auto_enable.sql` is a catalog-derived reconstruction of the live ACL, not a byte-identical recovery of the original SQL. It is already applied in cloud and must not be replayed.

Twenty older/unapplied SQL files are preserved under `supabase/archive/legacy-unapplied-migrations/` (19 Coach OS-era files plus one duplicate Finance foundation file). They are provenance/archive material, not pending Marketplace migrations. The executable migration directory contains exactly the 68 applied Marketplace sources.

## Current live database inventory

Read-only inspection reports **117 application tables, all 117 with RLS enabled**:

| Schema | Tables | RLS |
|---|---:|---:|
| identity | 7 | 7/7 |
| areas | 4 | 4/4 |
| enterprise | 8 | 8/8 |
| catalog | 4 | 4/4 |
| commerce | 3 | 3/3 |
| integration | 8 | 8/8 |
| finance | 13 | 13/13 |
| content | 2 | 2/2 |
| dashboard (legacy compatibility) | 2 | 2/2 |
| workspace_data | 66 | 66/66 |

The `dashboard` tables remain legacy compatibility artifacts; Garden and Web Desktop use `workspace_data`. The workspace data layer is not interchangeable with the Marketplace's private `enterprise` and `identity` schemas.

## Active Edge Functions and source parity

| Function | Live version | Gateway JWT | Repository source parity |
|---|---:|---|---|
| `marketplace-api` | 30 | enabled | byte-identical |
| `adapter-api` | 7 | enabled | byte-identical |
| `adapter-worker` | 7 | disabled | byte-identical; server-only service-role bearer gate |
| `adapter-oauth-callback` | 1 | disabled | byte-identical; one-time OAuth state + PKCE transaction gate |

All four deployed `index.ts` files were compared with their corresponding repository files. The equality check passed for all four. `marketplace-api` v30 adds authenticated `get_settings` and `update_settings` actions while retaining the existing public catalogue read and tenant-scoped operations.

## Private workspace document storage

- Private Supabase Storage bucket: `marketplace-documents`.
- Maximum file size: 10 MiB.
- Allowed types: PDF, DOCX, XLSX, PPTX, PNG, JPEG, TXT and CSV.
- Object key convention: `<organization UUID>/<workspace UUID>/<document UUID>/<filename>`.
- `storage.objects` has separate SELECT, INSERT and DELETE policies. Reads require active workspace membership; uploads and deletes require `identity.can_manage_workspace`.
- The bucket is private; signed URLs are generated for five minutes after verifying the active workspace prefix.
- Current stored object count: 0. Storage configuration and tenant-policy test passed; browser upload/download acceptance is still pending.

## Client activity and Settings

- Client create/update/delete operations now append atomic events to `workspace_data.activity_events` through a SECURITY DEFINER trigger with a pinned search path. The trigger records client ID, title and operation; the client detail timeline reads those events.
- The authenticated rollback integration test exercised create → update → delete and verified all three event types. The transaction left no test client or activity event.
- Settings profile display name and organization name now use authenticated `marketplace-api` actions. Profile updates are self-scoped; organization renames require `requireOrgRole`. Email remains Supabase Auth-managed and read-only.
- `supabase/tests/marketplace_settings_write.sql` passed a rollback-only profile upsert + organization rename round-trip; the post-rollback profile and organization values were unchanged. Authenticated browser acceptance for these UI flows has not yet been run.

## Current tenant and provider state

Live counts show one real Auth user, one profile, one organization, one active organization membership, one workspace and one active workspace membership. Do not create another identity or organization to manufacture test data.

- Domain / department / holon installations: 0 / 0 / 0.
- Canonical agent principals / delegations: 0 / 0.
- Tenant provider connections / OAuth transactions: 0 / 0.
- Provider manifests: one Google Drive v1.0.0 manifest in DRAFT; zero ACTIVE manifests.
- Published listings / orders: 0 / 0.
- Storage objects / activity events: 0 / 0 after rollback tests.
- The 73 provider-level blueprints remain PLANNED. They are not executable integrations.

## Current Supabase advisor snapshot

- Security: 42 INFO findings for RLS-enabled tables without policies; one WARN for Auth leaked-password protection being disabled.
- Performance: 63 INFO unindexed-foreign-key findings and 272 INFO unused-index findings.
- Health: no findings.

Do not silence the RLS advisor with blanket policies. Review each schema's actual grants and access boundary. Do not add or remove indexes blindly without workload evidence. The leaked-password-protection warning is an Auth configuration item, not a SQL migration; this session's Supabase management tools do not expose an Auth configuration update action.

## Delivery and acceptance boundary

The backend sources, 68 live migrations, tenant-scoped document bucket and four deployed Edge Function sources are reconciled. Garden's formerly inert actions were audited; no enabled button without a handler remains in the audited Garden view set. The Growth showcase is hidden for authenticated workspaces; the Marketplace view reads the live published-listings API; IT infrastructure displays live API/database connectivity rather than fabricated telemetry; simulated agent chat replies were removed.

This does **not** certify Day 1–3 acceptance. Authenticated browser CRUD, document upload/download through the UI, cross-workspace browser denial, provider OAuth round-trip, payment-provider lifecycle, live agent inference/execution, tenant installation and the complete Control Tower remain separate end-to-end gates.

The GitHub Actions workflow now installs from canonical `bun.lock` using Bun 1.3.14; `npm ci` was removed because the legacy `package-lock.json` does not describe the current dependencies. No GitHub Actions run is currently visible for the branch. The latest Vercel status is **build-rate-limit failure**; the latest frontend source has not been build-validated. The connected Amd-PC Desktop Commander remains offline, so no local typecheck/build/browser suite could be run.

## Historical implementation log


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
- `20261126094200_agent_workspace_delegation_scope.sql`
- `20261126094206_workspace_data_fk_indexes.sql`

Workspace data foreign-key audit: **0 unindexed foreign keys** remain in `workspace_data`. The broader Supabase project still has unindexed-FK findings in other schemas; do not conflate those with the interface data layer.

`marketplace-api` is ACTIVE v26 with `verify_jwt=true`. The current authenticated tenant context resolves to the first real organization/workspace and role `B1_CEO`. No agent principal or fake business record has been created.

## Shared Garden / Web Desktop persistence — live checkpoint

Both user-facing interfaces use the same `workspace_data` schema and authenticated workspace context. Garden repositories filter reads, updates and deletes by both `organization_id` and `workspace_id`; creates write both IDs. The Web Desktop CMS uses the same dedicated collection tables and refuses to hydrate a real tenant from demo seeds.

The private `enterprise` schema is not queried directly by the browser. `identity.get_current_workspace_context()` is the authenticated, caller-bound RPC that resolves exactly one active organization and one active workspace. Garden AuthProvider, the tenant store and the CMS repository all use this RPC. The same Supabase client singleton is shared by both interfaces.

The Garden People view reads actual active workspace memberships through `marketplace-api:list_workspace_members`. The AI Agents view reads canonical agent principals with active workspace delegations through `marketplace-api:list_workspace_agents`. The two directories are no longer inferred from a mixed `people_agents` roster. No agent principal exists yet, so the AI Agent view correctly shows an empty state.

The Garden Mission Board maps to `workspace_data.missions`, not `workspace_data.tasks`. Finance invoice mapping uses typed `client_id`, `currency`, `issued_at`, `due_at` and `paid_at` fields. No default currency is inserted.

Latest SQL verification: `marketplace_security_baseline.sql`, `marketplace_interface_persistence.sql`, `adapter_oauth_runtime.sql`, `google_drive_adapter_manifest.sql`, `marketplace_capability_entitlements.sql` and `marketplace_finance_ledger.sql` all pass against the hosted project. The authenticated workspace-context RPC was also exercised under the `authenticated` database role and returned the expected first tenant context. A transaction-scoped CRUD probe was rolled back; no probe row remains.

Validation is not full browser acceptance: no live browser JWT E2E, cross-workspace browser denial, TypeScript/Vitest/Vite build, or new Vercel deployment has been verified in this tranche. Do not mark Day 1–3 accepted until those gates pass.
