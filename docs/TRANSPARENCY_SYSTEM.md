# Transparency System & Audit Architecture

## Objective
BayanFund-StellarX is built on the principle of immutable transparency. Donors must be able to trace exactly where their funds go, and beneficiaries must be able to prove receipt independently of our database.

## System Features

### 1. Activity Feed
- Located on both the global `Dashboard` and individual `Fund Pages`.
- Displays every major event: `contribution`, `request`, `approval`, and `investment`.
- Exposes **Actor Addresses**, **Amounts**, and **Timestamps**.

### 2. On-Chain Verification
- The `ActivityTable.tsx` component has been upgraded to display the **Stellar Transaction Hash** (`txHash`) for recorded contributions.
- Each `txHash` is a clickable link pointing directly to [Stellar Expert (Testnet)](https://stellar.expert/explorer/testnet/), allowing any user to verify the physical transfer of USDC/XLM on the ledger.
- This creates a cryptographic audit trail that cannot be forged by altering the BayanFund database.

### 3. Payout Transparency vs. Privacy
- **Public**: Payout requests show a `publicMemo` (e.g., "School Solar Installation Phase 1"). The amount and status (`pending`, `approved`, `paid`) are visible to all.
- **Private**: To protect vulnerable beneficiaries (e.g., in Mental Health funds), sensitive data (`privateMemoCiphertext`) is stored off-chain or encrypted, and is intentionally excluded from the Activity Feed. Only Admin verifiers with appropriate decryption access can view it.

## Future Dashboard Expansion
- **Milestone History**: A dedicated section to show campaign progress graphs.
- **Contribution History**: Paginating through all donors.
- **Zero-Knowledge Proofs**: To allow verification of credentials (e.g., medical provider license) without exposing the identity of the provider to the public feed.
