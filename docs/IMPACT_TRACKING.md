# Impact Tracking Architecture

## Objective
BayanFund-StellarX aims to go beyond simple token transfers by ensuring that funds are utilized effectively. The new Impact Tracking system introduces a formal workflow for organizations to prove the real-world results of the payouts they receive.

## Workflow

1. **Payout & Execution**: A service provider (e.g., NGO, School, Solar Installer) receives a requested payout via the smart contract.
2. **Proof Submission**: The provider accesses the Dashboard and submits an `ImpactReport` linked to the specific `PayoutRequest`. 
   - **Data Required**:
     - `reportText`: A narrative summary of the impact.
     - `photoUris`: IPFS or S3 URIs to photographic evidence.
     - `receiptUris`: Scanned invoices or receipts proving material purchases.
3. **Verification**: Admins review the `ImpactReport`. The status transitions from `pending` -> `verified` -> `completed`.
4. **Public Dashboard Integration**: Once verified, the impact report becomes part of the public `Fund` profile, increasing trust and potentially attracting more donors.

## Global Dashboard Metrics
The main dashboard has been conceptually structured to aggregate these reports into high-level KPIs:
- **Funds Raised**: Total historical balances (already implemented).
- **Funds Released**: Total sum of all `paid` payout requests.
- **Beneficiaries Served**: An aggregated count drawn from verified impact reports.
- **Projects Completed**: The number of fully finalized campaigns.

## Database Implementation
A new model `ImpactReport` has been introduced to the Prisma schema:
- Linked `1:N` to `Fund` and `1:1` to `PayoutRequest`.
- Contains JSON arrays for multiple URIs (`photoUris`, `receiptUris`).
- Includes a verification pipeline field (`status`).

This structural foundation sets up BayanFund for its next major milestone: displaying verifiable impact alongside financial transparency.
