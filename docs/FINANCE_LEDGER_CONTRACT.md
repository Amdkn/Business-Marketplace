# Finance & Capital — ledger and payment contract

**Status:** schema foundation applied; provider-neutral; not yet payment-provider enabled.  
**Cloud project:** `swegnrvaxxgfrnshdpxx` (Aspace MarketPlace).  
**Canonical repository:** `Amdkn/Business-Marketplace`.

## Product boundary

Finance & Capital is Marketplace Department 07. It is not LD02 (the separate Areas OS financial mission portfolio). It owns the platform's commercial accounting, settlement, treasury, fee, payout and reconciliation capabilities.

The commerce order lifecycle and capability entitlement lifecycle remain separate from money movement:
- An order is a commercial commitment.
- Buyer acceptance can grant an entitlement.
- A payment intent is a request to collect funds; it is not proof of capture.
- A provider-confirmed capture is a payment event.
- A journal entry is the accounting record and must balance.
- A payout is a settlement instruction; it is not proof of bank settlement.

## Persisted schema

All objects are in the private `finance` schema. RLS is enabled on all current Finance tables (12 at this checkpoint). Browser roles have neither schema USAGE nor table privileges; the service role is the only database gateway.

| Table | Responsibility |
|---|---|
| `ledger_accounts` | Organization-scoped chart of accounts, typed and currency-specific |
| `journal_entries` | Idempotent accounting header, source reference and posting state |
| `journal_lines` | Debit/credit lines constrained to the same organization and currency |
| `payment_intents` | Provider-neutral collection attempt linked to immutable order facts |
| `payment_webhook_receipts` | Idempotent provider event inbox with signature-verification gate |
| `refunds` | Refund requests and provider outcomes, with cumulative amount guard |
| `payout_batches` | Currency-specific seller settlement batches |
| `payout_items` | Seller-level payout instructions constrained to batch currency |
| `disputes` | Chargeback/dispute lifecycle linked to an order and optional payment |

## Ledger invariants

1. Every posted entry has at least two lines.
2. Total debit equals total credit exactly within the entry currency.
3. A line has either a positive debit or a positive credit, never both.
4. Account, journal entry and line must share the same organization and currency.
5. Posted journal lines and posted journal entries are immutable. Corrections require a new reversing entry; never edit history.
6. Idempotency is unique per organization for journal entries.
7. Service-role functions use a pinned search_path and are not executable by browser roles.

Example accounting shape for a captured buyer payment of 100.00 with 10.00 platform fee (illustrative only; not a posted record):
- Debit PSP clearing asset 100.00
- Credit seller payable liability 90.00
- Credit platform fee revenue 10.00

The seller payout later debits seller payable and credits PSP clearing/cash. A refund or chargeback is a separate, traceable event and journal entry; do not rewrite the original capture.

## Payment and settlement guards

- A payment intent's order, parties, amount, currency, provider key and idempotency key are immutable.
- Payment intent facts must exactly match the order snapshot.
- Payment state transitions are constrained; captured payments can only move to partial/full refund states.
- A webhook cannot enter PROCESSING or PROCESSED until its signature is verified.
- Provider event IDs are unique per provider.
- Refunds must match the source payment/order/currency and cumulative active/successful refunds cannot exceed the payment amount.
- Payout item currency must match its batch currency.

## Provider boundary and launch status

No provider is assumed connected. Do not create a fake successful payment, seed a live order, or mark a payment captured without a verified provider event. Provider-specific API credentials belong in Supabase secrets/Vault and must never enter Git.

Still required:
- Provider adapter manifest and signed webhook implementation (signature verification must occur before the receipt is marked verified).
- Payment intent create/capture/cancel/refund server actions.
- Fee policy versioning, fee calculation and seller payable posting.
- Payout eligibility, approval, submission, settlement reconciliation and returns.
- Double-entry posting functions and read models (trial balance, journal, seller statement, platform take-rate, GMV vs revenue vs cash).
- Tax/VAT/sales-tax treatment and jurisdictional policy; do not infer tax treatment from a fee rate.
- Dispute evidence and chargeback workflow.
- Concurrency, idempotency, reversal, refund-overrun and webhook replay tests.
- UI for Finance & Capital, treasury and seller statements.

## Applied migration versions

| Cloud version | Migration |
|---|---|
| `20261126061930` | `finance_double_entry_foundation` |
| `20261126062124` | `finance_integrity_guards` |
| `20261126062317` | `finance_payment_fact_immutability` |\n| `20261126062541` | `finance_foreign_key_indexes` |\n| `20261126062749` | `finance_journal_posting_api` |

## Verification

The SQL regression suite `supabase/tests/marketplace_finance_ledger.sql` checks all nine tables, RLS, browser privilege isolation, service-role access, ledger balance/immutability triggers, payment/webhook/refund/payout guards, SECURITY DEFINER search_path/EXECUTE restrictions and full finance foreign-key index coverage.

Passing this structural suite does not mean payment-provider, capture, payout or accounting E2E has passed.

## Standard Chart of Accounts — version 2026.1

The hosted project now contains a versioned global template catalogue in finance.chart_account_templates and an optional chart_version marker on tenant ledger accounts. Version 2026.1 defines 16 required accounts across assets, liabilities, equity, revenue and expenses. Each tenant receives its own currency-specific account instances; the global templates are reference definitions only.

System keys and account codes are stable within a chart version. The template set includes operating cash, PSP clearing, receivables, seller/refund/tax/chargeback payables, retained earnings, owner contributions, platform fee/subscription/service revenue, payment processing and refund/chargeback expenses, compute/inference cost of service and platform operations expense.

api.provision_finance_chart_of_accounts(actor, organization, currency, chart_version) is the guarded provisioning boundary. It requires an active organization, active membership and an active Finance-capable role; takes an organization/currency/version advisory lock; rejects collisions with existing custom or differently defined accounts; inserts missing accounts and returns the complete chart. Repeated calls for the same tenant/currency/version reuse the same accounts. The SQL function is SECURITY DEFINER with a pinned search_path and EXECUTE is granted only to service_role.

The authenticated marketplace-api action is provision_finance_chart_of_accounts, with organization_id, currency and optional chart_version (default 2026.1). The Edge Function rechecks organization role before invoking SQL. The live deployment is marketplace-api v20 with verify_jwt=true.

The provisioning path is structurally verified only. The live project currently has zero organizations and zero Auth users, so no tenant chart was provisioned and no account fixture was fabricated. Real-tenant idempotency, collision and authorization tests remain blocked until an authorized tenant exists. The chart is a practical Marketplace baseline, not a jurisdiction-specific statutory chart or tax determination.


Finance authorization alignment: the live Edge Function uses a dedicated Finance role gate that accepts S0_SOVEREIGN, B1_CEO, B2_MANAGER and B2.2 (Treasury), matching the database function. This avoids relying on the broader non-finance organization role helper.

## Versioned Fee Policy Engine

The hosted Finance schema now includes `finance.fee_policies` and `finance.order_fee_snapshots`.

A fee policy is owned by a Marketplace operator organization and supports:
- `PLATFORM` scope or a seller-organization-specific scope.
- Versioned policy keys, optional currency binding and effective time windows.
- Percentage commission in basis points (0–10,000), fixed fee, optional minimum/maximum and explicit currency rounding scale (0–6).
- Draft → Active → Retired lifecycle. Once activated, terms are immutable; a new version is required for a change.
- Activation rejects overlapping effective windows for the same owner, policy key, scope and currency.

The order fee snapshot is one-per-order and immutable. It records the exact policy/version, gross amount, rate, fixed fee, calculated platform fee, seller net, currency, rounding scale and calculation metadata. Repeated application of the same policy is idempotent; a different policy cannot overwrite an existing snapshot.

Calculation contract:
1. `round(gross × rate_bps / 10,000 + fixed_fee, rounding_scale)`
2. Apply configured minimum and maximum fee.
3. Cap the final fee at gross so seller net never becomes negative.
4. Seller net = gross − platform fee.

Taxes and payment processing costs are explicitly excluded from this fee snapshot. This is a commission allocation, not tax advice or payment-provider pricing. No default commission rate is seeded: an authorized Finance role must deliberately create and activate a policy. No policy or order snapshot has been fabricated in the empty live tenant environment.

Authenticated Edge actions:
- `create_fee_policy`
- `activate_fee_policy`
- `apply_order_fee_policy`

The SQL boundary rechecks active membership and Finance roles (S0, B1, B2, B2.2), uses SECURITY DEFINER with a pinned search_path, and grants EXECUTE only to `service_role`. The Edge Function uses `requireFinanceRole` and remains JWT-verified.

### Fee policy activation concurrency hardening

A follow-up migration serializes activations on the logical policy identity (owner organization + policy key + scope + scope organization + currency), rather than locking only by policy row ID. This closes the race where two different draft versions could otherwise be activated concurrently with overlapping effective windows. The active-window overlap check runs inside that shared advisory lock.


Fee-policy FK indexes and concurrency: migration `finance_fee_policy_fk_indexes` adds covering indexes for the policy creator and optional seller-scope foreign keys. Migration `fee_policy_activation_serialization` locks on owner organization + policy key + scope + seller scope + currency before checking effective-window overlap. Finance now has zero unindexed foreign keys.

## Captured Payment → Ledger Posting

A captured payment can now be converted into a double-entry journal entry through `api.post_captured_order_finance_entry(actor, owner_organization, payment_intent)`.

The function requires an active Finance role, a payment intent in `CAPTURED` state with `captured_at` and provider payment ID, immutable order facts matching the payment, and an immutable order fee snapshot matching gross and currency. It resolves active tenant ledger accounts by stable system keys:
- Debit `PSP_CLEARING` for captured gross.
- Credit `SELLER_PAYABLE` for seller net (when non-zero).
- Credit `PLATFORM_FEE_REVENUE` for platform fee (when non-zero).

It delegates to the existing balanced, immutable, idempotent journal-posting API using `payment-capture:<payment_intent_id>`. A retry returns the existing capture journal even if the payment later transitions to partial/full refund; refunds must post as separate events and never rewrite capture history. Missing chart accounts, missing fee snapshot, mismatched order/payment facts or an unconfirmed capture are hard failures.

Authenticated Edge action: `post_captured_order_finance_entry`. Live `marketplace-api` v22 is ACTIVE with `verify_jwt=true`.

This is the accounting boundary for a trusted provider-confirmed capture, not a provider integration. No live payment intent, capture or journal was created in the empty tenant project.
