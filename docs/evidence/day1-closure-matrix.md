# Day 1 closure matrix — A’Space Marketplace

**Snapshot:** 2026-11-26 · Repository: `Amdkn/Business-Marketplace` · Branch: `foundation/marketplace-product-identity`  
**Gate: OPEN — not accepted**

This matrix maps D1.01–D1.09 to code, cloud evidence, automated proof and the remaining acceptance boundary. A migration or deployed function is implementation evidence, not Day 1 acceptance by itself.

| Scope | Repository / cloud evidence | Automated proof available | Remaining acceptance | Current status |
|---|---|---|---|---|
| D1.01 Architecture & Platform Core | Marketplace schemas across identity, enterprise, areas, catalog, commerce, integration, finance and workspace_data; four deployed Edge Functions; versioned manifests and installation engines. | Migration/source parity; Edge Function source parity. | Integrated platform lifecycle, operational runtime, replication and Control Tower are not yet demonstrated end-to-end. | PARTIAL |
| D1.02 Governance & Control Tower | Role bindings, membership boundaries, installation ownership/dependencies, append-only event stream, strict Garden writes. | Security baseline; tenant-scoped CRUD and negative authorization checks from prior session; client activity trigger test. | Control Tower must be built from persisted lifecycle/events/metrics; full governance workflow and audit coverage are incomplete. | PARTIAL |
| D1.03 Identity & Authentication | One real Auth user/profile, one active organization membership; authenticated Settings API for self display-name update; Auth email is read-only. | Settings write round-trip rollback test; identity RLS baseline. | Signup, email confirmation/SMTP, password reset, session lifecycle and authenticated browser E2E are not verified. | PARTIAL |
| D1.04 Organizations, Tenants, Workspaces & Memberships | One organization, one active organization membership, one workspace and one active workspace membership; workspace-scoped repositories and storage path policy. | RLS/tenant isolation checks; authenticated storage membership/manager predicate test. | Full tenant provisioning/installation, a second real tenant and browser-level cross-tenant denial remain open. | PARTIAL |
| D1.05 Data Foundation & Complete Data Model | 69 live migration-ledger entries; 68 exact executable repository migration sources plus one catalog-derived reconstruction whose original SQL is not byte-identically recovered; 20 legacy files archived outside the migration path; 117 application tables with RLS. | Migration ledger reconciliation with one documented source-reconstruction exception; 16 SQL regression suites (13 structural + 3 rollback-only integration); schema/persistence contracts. | Full data dictionary/ERD and every business workflow's contract coverage are not yet accepted. | RECONCILED BASELINE / PARTIAL |
| D1.06 Security Foundation | 117/117 RLS; no anon table grants; private engine schemas have no browser table grants; 42 no-policy tables are deny-by-default and have no browser grants; SECURITY DEFINER search paths pinned; trigger-only Finance EXECUTE grants revoked. | Expanded security baseline; Finance ledger suite; tenant-scoped CRUD/negative checks. | Auth leaked-password protection remains disabled and is plan-gated on the current Free tier; project Dashboard reports no backups. Backup/restore drill and complete production security acceptance remain open. | STRUCTURALLY VERIFIED / PARTIAL |
| D1.07 API Foundation & Contracts | `marketplace-api` v30, `adapter-api` v8, `adapter-worker` v7 and OAuth callback v1; deployed Edge Function sources match the tracked runtime source. | Structural API/adapter tests; Edge Function source parity; JWT boundary checks. | Full authenticated route contract tests, OpenAPI compatibility policy and browser E2E across every API family remain open. | PARTIAL |
| D1.08 Auditability, Backups & Observability | Append-only `workspace_data.activity_events`; atomic client lifecycle trigger; storage access logs remain platform-managed. | Client create/update/delete rollback test; security and storage policy tests. | Audit events across all important entity families, backup/restore evidence, metrics/logs/cost attribution and failure alerting remain open. | PARTIAL |
| D1.09 Identity/Tenant Foundation Migration | 69 live migration-ledger entries; 68 exact executable repository sources plus one catalog-derived reconstruction (not byte-identical); one real user/org/workspace membership chain. | Ledger reconciliation; identity/settings tests; RLS baseline. | Full signup-to-tenant-installation journey and browser acceptance remain open. | PARTIAL |

## Security interpretation

The 42 RLS-enabled tables without policies are not a reason to add broad policies. They are private blueprint/engine tables with no direct anon/authenticated table grants; access is routed through server-side Edge Function contracts. The complete table list and grants/function ACL evidence are in [day1-security-inventory.md](day1-security-inventory.md).

## Next closure order

1. Latest branch head `b7c2b29` is Vercel Preview READY with full `bun run verify`: 548/548 Vitest tests, app/API typechecks, Vite build and 102/102 runtime benchmarks, including the IT Software Kernel correction `2fe574f`.
2. Run authenticated browser acceptance for identity, tenant isolation, Garden CRUD and private storage with the authorized session; the protected Preview is READY but no authenticated browser E2E has yet been completed.
3. Complete backup/restore; the project currently reports no backups. Leaked-password protection is disabled and requires a Pro-or-higher plan per Supabase's current Auth documentation.
4. Complete full API contract/authorization tests and extend audit events/observability.
5. Only then evaluate the Day 1 acceptance gate. Day 2 and Day 3 remain separate full-scope gates.


## Verification refresh — 2026-11-26

GitHub Actions run [45856152162](https://github.com/Amdkn/Business-Marketplace/actions/runs/45856152162) passed on application commit [dfc3554](https://github.com/Amdkn/Business-Marketplace/commit/dfc3554b6f35c782d23b8b7721da5a7c2264c9eb): frozen Bun install, app/Node/API TypeScript, 53 Vitest files / 548 tests, Vite build and 102/102 runtime benchmarks. The OAuth Base64URL vectors are included in this passing suite.

Latest branch head `b7c2b29` now has a READY Vercel Preview with full hosted verify (548/548 tests, app/API typechecks, Vite build, 102/102 runtime benchmarks). Do not interpret Preview readiness or CI success as authenticated browser acceptance. The current hosted tenant remains one real user/org/workspace membership chain; do not create another tenant for test convenience.

Migration source accounting is intentionally conservative: 69 cloud migration-ledger entries versus 68 exact executable repository migration sources. A catalog-derived reconstruction exists for the historical RLS ACL migration, but it is not represented as byte-identical recovery of the original SQL. Preserve that exception until exact provenance is available.
