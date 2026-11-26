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

All objects are in the private `finance` schema. RLS is enabled on all nine tables. Browser roles have neither schema USAGE nor table privileges; the service role is the only database gateway.

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
