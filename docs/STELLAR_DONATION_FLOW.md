# Stellar Donation Flow

## Overview
The application now supports real testnet contributions using the Stellar SDK and Freighter wallet integration. The mock flow has been replaced with a complete end-to-end on-chain transaction lifecycle.

## User Flow
1. **Connect Freighter**: The user connects their wallet via the `useWallet` hook, which requests access from the Freighter extension.
2. **Choose Fund**: On any Fund Details page (`/funds/[id]`), the `ContributeForm` is presented.
3. **Enter Amount & Asset**: The user specifies the amount in XLM or USDC (Testnet).
4. **Build Transaction**: `buildPaymentXDR` creates a standard Stellar `Payment` operation targeting the fund's treasury address (currently a testnet placeholder for the MVP until Soroban factory deployment is fully operational).
5. **Sign & Submit**: The `signTransaction` API opens the Freighter prompt. The resulting signed XDR is submitted via `submitSignedXDR` to the Horizon API.
6. **Confirmation**: The app polls `getTransaction` until network finality.
7. **Database Storage**: The transaction hash, amount, and contributor's public key are sent to `/api/contributions` which saves them to the database (Prisma) and emits an Activity log.
8. **UI Refresh**: The page automatically refreshes to display the updated Fund Balance and the new transaction in the Transparency Dashboard.

## Key Improvements over MVP
- Uses actual `stellar-sdk` XDR building instead of mocked array updates.
- Links `txHash` to both `Contribution` and `Activity` records, making every donation independently verifiable via stellar.expert.
- Enforces strict network passphrase validation for Testnet.

## Next Phase (Task 4)
Migrate the `Payment` operation to a Soroban `InvokeContract` operation where the smart contract naturally handles escrow rather than a plain native Stellar payment to a treasury account.
