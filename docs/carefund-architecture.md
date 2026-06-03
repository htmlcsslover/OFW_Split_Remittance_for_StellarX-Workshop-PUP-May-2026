# CareFund Stellar Architecture

## Product Architecture

CareFund Stellar is one modular platform, not four separate apps. Every use case
uses the same core primitives:

- fund
- contribution
- payout request
- approval
- public activity event
- verification status
- optional module metadata

Category-specific flows sit on top of the shared fund model:

- **Mental Health Access:** provider requests, private beneficiary aliases,
  transparent pool movement.
- **Community Solar for Schools:** investor participation shares, school USDC
  payments, projected return tracking.
- **Senior Care Stipend:** recurring payment schedules to senior wallet aliases.
- **Free School Lunch Fund:** supplier invoices, school delivery verification,
  public payout traceability.

## Backend

The MVP uses Next.js API routes:

- `GET /api/funds`
- `POST /api/funds`
- `POST /api/contributions`
- `GET /api/payout-requests`
- `POST /api/payout-requests`
- `POST /api/approvals`
- `GET /api/activity`

The current store is seeded and in-process for reliable demos. The SQL contract
for SQLite lives at `web/src/lib/db/schema.sql` and is PostgreSQL-ready with
minor enum and timestamp migrations.

## Database Schema

Core tables:

- `users`
- `funds`
- `contributions`
- `payout_requests`
- `approvals`
- `recurring_schedules`
- `solar_shares`
- `supplier_invoices`
- `activity`

Privacy rule: public tables and activity records carry aliases, roles, amounts,
fund IDs, and transaction hashes. Sensitive beneficiary, therapy, invoice, or
family details belong in encrypted off-chain storage referenced by URI or
ciphertext columns.

## Soroban Contract

The `FundPoolContract` in `contracts/fund-pool/src/lib.rs` intentionally
keeps the on-chain surface small:

- fund state and balance
- per-wallet contribution totals
- payout request status
- approval workflow
- recurring stipend schedule metadata
- solar investor share metadata
- basic account verification status

Next production step: integrate the Stellar Asset Contract for USDC transfers in
`contribute` and add `execute_payout` for approved requests.

## MVP User Flow

1. User connects Freighter.
2. User opens the marketplace and chooses a fund.
3. Donor or investor contributes USDC or XLM on testnet.
4. Provider, NGO, school, or supplier opens the module page and requests payout.
5. Admin verifies the request and approves it.
6. Public activity updates with amount, role, fund, and status.
7. Private beneficiary details remain hidden from public fund views.
