# Day 2 closure matrix — Marketplace Engine

**Snapshot:** 2026-11-26 · Supabase project `swegnrvaxxgfrnshdpxx`  
**Gate: OPEN — not accepted**

| Scope | Implemented evidence | Live / test evidence | Remaining acceptance | Status |
|---|---|---|---|---|
| D2.01 Catalog & taxonomy | Eight Areas OS blueprints, eight Business departments, 17 LD01 holons, 20 adapter families and 73 provider blueprints. | Live counts reconciled; taxonomy API reads canonical blueprints. | Taxonomy governance/version lifecycle and complete product/capability catalogue acceptance. | PARTIAL |
| D2.02 Products, services, listings & publication | Capability/version and listing schema; authenticated create/publish actions; public browse action; exact capability-version links and publication states. | Structural schema checks pass; 0 capabilities and 0 listings. | Real seller capability/listing lifecycle and published listing discovery acceptance. | PARTIAL |
| D2.03 Agent principals & delegations | Canonical organization-scoped agent principals; workspace/organization delegation, permission codes, expiry/revocation; mission assignment guard. | Structural delegation suite passes; 0 principals and 0 delegations. | Register/revoke browser E2E and runtime identity/permission enforcement with a real agent executor. | PARTIAL |
| D2.04 Discovery & publication | Public read-only browse listings and provider/taxonomy read APIs; publication visibility boundary. | API source and schema verified; no published listing exists. | Ranking/filter/search acceptance over real published products, services, agents and capabilities. | PARTIAL |
| D2.05 Orders & transaction lifecycle | Idempotent order creation; guarded state transitions; actor-attributed append-only order events; buyer/seller separation; acceptance-triggered entitlement. | `marketplace_commerce_lifecycle.sql` and entitlement regression pass; 0 orders and 0 entitlements. | Real buyer/seller tenants, listing purchase, fulfillment, cancellation/dispute/refund and browser E2E. | STRUCTURAL PASS / E2E OPEN |
| D2.06 Payments, ledger, payouts & reconciliation | Payment intent/refund/payout schema; provider idempotency; double-entry ledger, fee policy snapshots, balanced posting and immutable posted journals. | Finance ledger regression passes; 0 payment intents, refunds, payout batches or journal entries. | Real PSP sandbox credentials, verified webhooks, capture/refund/payout lifecycle and provider-to-ledger reconciliation. | PARTIAL / PROVIDER BLOCKED |
| D2.07 Ownership engine | OWNER/MANAGER/TECHNICIAN/STEWARD/OBSERVER assignments; unique active OWNER index; scope/principal validation; revocation history. | Installation engine regression passes; no live installations. | Authenticated owner assignment/revocation on real installed entities and succession/expiry behavior. | STRUCTURAL PASS / E2E OPEN |
| D2.08 Dependency graph engine | Typed workspace-scoped edges, uniqueness, active target validation and cycle guards; add/remove API actions. | Installation engine regression passes; no live dependency edges. | Browser E2E and graph lifecycle on installed tenant structure. | STRUCTURAL PASS / E2E OPEN |
| D2.09 Capability installation engine | Version-pinned installs, owner/entitlement constraints, idempotent target/version key, install/remove actions; entitlement suspension propagation. | Installation and entitlement regression suites pass; 0 capability installations. | Real listing/order-backed entitlement and capability installation lifecycle across tenant workspaces. | STRUCTURAL PASS / E2E OPEN |
| D2.10 Adapter connection & execution engine | 20 families/73 providers as blueprints; tenant connection/OAuth PKCE schema; API, worker and callback; Vault secret references; allowlisted endpoint execution and redaction. | Four deployed Edge Functions have repository source parity; `adapter-api` v8 fixes Base64URL encoding. OAuth Base64URL vectors pass in Vitest. One Google Drive manifest remains DRAFT; 0 active manifests, connections, OAuth transactions or executions. | Google OAuth client credentials/callback URL, provider authorization round-trip, active reviewed manifest, first real provider execution, retries/webhooks and health UI. | ENGINE PARTIAL / CREDENTIALS BLOCKED |

## Live inventory

| Resource | Count |
|---|---:|
| Area domain blueprints | 8 |
| Business department blueprints | 8 |
| LD01 holon blueprints | 17 |
| Adapter families | 20 |
| Provider blueprints | 73 |
| Active provider manifests | 0 |
| Draft provider manifests | 1 |
| Tenant provider connections / OAuth transactions | 0 / 0 |
| Agent principals / delegations | 0 / 0 |
| Capabilities / listings | 0 / 0 |
| Orders / entitlements | 0 / 0 |
| Payment intents / refunds / payout batches / journal entries | 0 / 0 / 0 / 0 |

Zero rows are the actual tenant state, not synthetic placeholders. Do not activate a provider or create test sellers/buyers merely to make the matrix look complete.

## Day 2 acceptance gate

Day 2 remains OPEN until a real buyer and seller can publish/discover a capability, order it, receive a valid entitlement, install it, connect and execute a real provider operation, process its webhook, and reconcile payment/fees/ledger/payout — with authorization and audit intact.
