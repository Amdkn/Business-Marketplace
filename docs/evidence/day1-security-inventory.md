# Day 1 security inventory — Marketplace

**Snapshot:** 2026-11-26 · Supabase project `swegnrvaxxgfrnshdpxx`  
**Scope:** application schemas `identity`, `areas`, `enterprise`, `catalog`, `commerce`, `integration`, `finance`, `content`, `dashboard`, `workspace_data`, plus the public RLS event-trigger function.

## Table RLS inventory

- 117 application tables inspected; 117 have RLS enabled.
- 42 RLS-enabled tables have no direct policies. This is intentional deny-by-default for server-owned blueprint/engine tables, not a reason to add blanket policies.
- The 42 no-policy tables have no anon/authenticated table grants.
- No anon table grants were found in the inspected application schemas.
- Authenticated table grants are confined to:
  - `workspace_data`: 66 tables with CRUD grants, each protected by RLS policies.
  - `content`: 2 CMS tables with CRUD grants and tenant policies.
  - `dashboard`: 2 legacy compatibility tables with CRUD grants and RLS.
  - `identity`: scoped profile and read access (1 INSERT, 4 SELECT, 1 UPDATE grants).
- No authenticated table grants exist on the private `areas`, `enterprise`, `catalog`, `commerce`, `integration` or `finance` engine tables.

### RLS-enabled tables without policies

| Schema | Tables |
|---|---|
| areas | `domain_blueprints`, `domain_installations`, `holon_blueprints`, `holon_installations` |
| catalog | `capabilities`, `capability_installations`, `capability_versions`, `listings` |
| commerce | `capability_entitlements`, `order_events`, `orders` |
| enterprise | `department_blueprints`, `department_installations`, `installation_dependencies`, `installation_ownership_assignments`, `structure_installation_events`, `structure_installation_requests`, `workspace_memberships`, `workspaces` |
| finance | `chart_account_templates`, `disputes`, `fee_policies`, `journal_entries`, `journal_lines`, `ledger_accounts`, `order_fee_snapshots`, `payment_intents`, `payment_webhook_receipts`, `payout_batches`, `payout_items`, `refund_fee_allocations`, `refunds` |
| identity | `agent_delegations`, `agent_principals` |
| integration | `adapter_execution_events`, `adapter_execution_jobs`, `adapter_family_blueprints`, `adapter_oauth_transactions`, `adapter_webhook_receipts`, `provider_adapter_blueprints`, `provider_adapter_manifests`, `tenant_connections` |

These tables are private to the Edge Function/service-role boundary. Their RLS-without-policy state denies direct browser access; no browser grants were found.

## Function execution and search-path inventory

- All inspected SECURITY DEFINER functions have a pinned `search_path`.
- Intended authenticated helper RPCs: `identity.is_active_workspace_member(uuid,uuid)`, `identity.can_manage_workspace(uuid,uuid)`, `identity.get_current_workspace_context()`. They are not executable by anon.
- Server-only SECURITY DEFINER functions include capability/entitlement guards, installation/ownership/dependency guards, Finance posting/payment/refund/payout guards, agent delegation validation, RLS auto-enable and client activity trigger.
- `public.rls_auto_enable()` is not executable by PUBLIC, anon or authenticated.
- `workspace_data.record_client_activity_event()` is not executable by PUBLIC, anon or authenticated.
- Three Finance trigger functions were found with inherited direct EXECUTE grants even though each is only attached to one trigger:
  - `finance.guard_fee_policy_mutation()`
  - `finance.reject_order_fee_snapshot_mutation()`
  - `finance.reject_refund_fee_allocation_mutation()`
- Migration `20261126131444_revoke_finance_trigger_function_execute` revoked PUBLIC/anon/authenticated EXECUTE from those three functions. Each remains attached to its trigger; post-migration checks show anon=false and authenticated=false for all three.

## Tests

- `supabase/tests/marketplace_security_baseline.sql`: PASS after the Finance trigger ACL assertions were added.
- `supabase/tests/marketplace_finance_ledger.sql`: PASS after ACL hardening.
- Eleven structural SQL suites passed in one read-only batch.
- Three rollback-only integration suites passed: client activity lifecycle, Settings persistence targets and storage security. No client fixture, profile/org test mutation, activity event or storage object remains.

## Advisor findings and remaining risk

- Security advisor: 42 INFO `rls_enabled_no_policy`; one WARN `auth_leaked_password_protection`.
- Performance advisor: 63 INFO unindexed foreign keys; 272 INFO unused indexes.
- Health advisor: no findings.
- The leaked-password warning is an Auth provider configuration item; this session's Supabase management tools do not expose an Auth configuration update action.
- No backup/restore drill was run. RLS and function ACL correctness do not establish backup recoverability.
- No full production browser penetration/tenant-isolation acceptance was run because the latest Vercel build is rate-limited and the connected Amd-PC runner is offline.

**Security status:** structurally hardened and regression-tested; production acceptance remains open.
